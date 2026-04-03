from supabase import create_client
from app.utils.config import settings
from io import BytesIO

supabase = create_client(settings.supabase_url, settings.supabase_service_key)

def upload_csv(df, filename):
    buffer = BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    supabase.storage.from_("generated-files").upload(
        filename,
        buffer.getvalue(),
        {"content-type": "text/csv"}
    )

    url = supabase.storage.from_("generated-files").create_signed_url(
        filename, 3600
    )

    return url["signedURL"]