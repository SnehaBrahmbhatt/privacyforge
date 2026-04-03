
import httpx
import pandas as pd
from io import StringIO

async def download_csv_from_url(url: str) -> pd.DataFrame:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
    return pd.read_csv(StringIO(response.text))