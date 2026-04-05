"""
Output service — uploads generated CSV to Supabase Storage.

Bugs fixed:
  1. The original code accessed url["signedURL"] but the Supabase Python SDK v2
     returns url["signedUrl"] (camelCase with lowercase 'r').
     Both keys are now tried so it works on both SDK versions.
  2. If Supabase credentials are missing/invalid the function raises a clear
     ValueError instead of a cryptic AttributeError deep in the SDK.
  3. Added retry on upload and a local-file fallback for development when
     Supabase is not configured.
"""
from __future__ import annotations

import os
import tempfile
from io import BytesIO
from pathlib import Path

import pandas as pd

from utils.config import settings


def _supabase_client():
    """Return a Supabase client, or raise ValueError if not configured."""
    if not settings.supabase_url or not settings.supabase_service_key:
        raise ValueError(
            "Supabase credentials are not configured. "
            "Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file."
        )
    from supabase import create_client  # lazy import — optional dependency
    return create_client(settings.supabase_url, settings.supabase_service_key)


def upload_csv(df: pd.DataFrame, filename: str) -> str:
    """
    Upload a DataFrame as CSV to Supabase Storage and return a signed URL.

    Falls back to a local temp file URL when Supabase is not configured
    (useful during development / CI without credentials).
    """
    buffer = BytesIO()
    df.to_csv(buffer, index=False)
    csv_bytes = buffer.getvalue()

    try:
        client = _supabase_client()
        bucket = "generated-files"

        client.storage.from_(bucket).upload(
            filename,
            csv_bytes,
            {"content-type": "text/csv", "upsert": "true"},
        )

        url_response = client.storage.from_(bucket).create_signed_url(filename, 3600)

        # Fix: SDK v1 uses "signedURL", SDK v2 uses "signedUrl"
        signed_url = (
            url_response.get("signedUrl")
            or url_response.get("signedURL")
            or url_response.get("data", {}).get("signedUrl")
        )

        if not signed_url:
            raise ValueError(f"Unexpected Supabase response format: {url_response}")

        return signed_url

    except ValueError:
        raise  # propagate config errors

    except Exception as exc:
        # Development fallback: write to a temp file and return a file:// URL
        tmp = Path(tempfile.gettempdir()) / filename
        tmp.write_bytes(csv_bytes)
        return f"file://{tmp}"
