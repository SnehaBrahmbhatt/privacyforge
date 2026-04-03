
from fastapi import APIRouter
from pydantic import BaseModel
from uuid import uuid4

from app.services.file_service import download_csv_from_url
from app.services.schema_service import detect_schema
from app.services.generator_service import generate_synthetic_dataframe
from app.services.output_service import upload_csv

router = APIRouter()

class Request(BaseModel):
    file_url: str

@router.post("/generate")
async def generate(req: Request):
    df = await download_csv_from_url(req.file_url)

    schema = detect_schema(df)

    synthetic_df = generate_synthetic_dataframe(schema, rows=len(df))

    filename = f"{uuid4()}.csv"

    download_url = upload_csv(synthetic_df, filename)

    return {
        "download_url": download_url,
        "schema": schema
    }