"""
File download service.

Bug fixed: the original code closed the httpx.AsyncClient before reading
the response body because the `async with` block exited before `pd.read_csv`.
The response is now read *inside* the context manager.
"""
from __future__ import annotations

from io import StringIO

import httpx
import pandas as pd


async def download_csv_from_url(url: str) -> pd.DataFrame:
    """
    Download a CSV from a public URL and return it as a DataFrame.

    Fix: response.text is consumed INSIDE the async context manager to
    prevent 'Response already closed' errors that occurred in the original
    code where pd.read_csv was called after the `async with` block ended.
    """
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        response = await client.get(url)
        response.raise_for_status()
        # ← Read text INSIDE the context so the connection is still open
        text = response.text

    return pd.read_csv(StringIO(text))
