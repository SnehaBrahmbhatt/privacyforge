from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from uuid import uuid4
from io import StringIO

import pandas as pd

from app.services.file_service import download_csv_from_url
from app.services.schema_service import detect_schema
from app.services.generator_service import generate_synthetic_dataframe
from app.services.output_service import upload_csv

router = APIRouter()


# ── URL-based generate (kept for backward compat) ─────────────────────────────
class URLRequest(BaseModel):
    url: str


@router.post("/generate")
async def generate_from_url(req: URLRequest):
    try:
        df = await download_csv_from_url(req.url)
        schema = detect_schema(df)
        synthetic_df = generate_synthetic_dataframe(schema, rows=len(df))
        filename = f"{uuid4()}.csv"
        download_url = upload_csv(synthetic_df, filename)
        return {
            "download_url": download_url,
            "schema": schema,
            "preview": synthetic_df.head(20).to_dict(orient="records"),
            "row_count": len(synthetic_df),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── File-upload based generate ─────────────────────────────────────────────────
@router.post("/upload")
async def generate_from_upload(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    try:
        contents = await file.read()
        df = pd.read_csv(StringIO(contents.decode("utf-8")))
        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded CSV is empty.")
        schema = detect_schema(df)
        synthetic_df = generate_synthetic_dataframe(schema, rows=len(df))
        filename = f"{uuid4()}.csv"
        download_url = upload_csv(synthetic_df, filename)
        return {
            "download_url": download_url,
            "schema": schema,
            "preview": synthetic_df.head(20).to_dict(orient="records"),
            "row_count": len(synthetic_df),
            "original_columns": list(df.columns),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Anonymize uploaded file ────────────────────────────────────────────────────
class AnonymizeRequest(BaseModel):
    text: str
    strategy: str = "mask"
    entities: list[str] = []


@router.post("/anonymize")
async def anonymize(req: AnonymizeRequest):
    """
    Anonymize free-form text. Strategy: 'mask', 'suppress', 'generalize', 'synthetic'.
    Entities: list of entity types to target e.g. ['name', 'email', 'phone'].
    """
    try:
        from app.services.anonymize_service import anonymize_text
        result = anonymize_text(req.text, req.strategy, req.entities)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))