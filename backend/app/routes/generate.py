"""
Synthetic data generation route (original PrivacyForge feature).

POST /generate   — accepts a public CSV URL, returns synthetic data
"""
from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import GenerateRequest, GenerateResult
from app.services.file_service import download_csv_from_url
from app.services.generator_service import generate_synthetic_dataframe
from app.services.output_service import upload_csv
from app.services.schema_service import detect_schema

router = APIRouter(tags=["generate"])


@router.post("/generate", response_model=GenerateResult)
async def generate(req: GenerateRequest):
    """
    Download a CSV from a public URL, infer schema,
    generate synthetic rows and upload the result to Supabase.
    """
    try:
        # Step 1: download CSV — fix: text is now read inside the httpx context
        df = await download_csv_from_url(req.url)

        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="The CSV file at the provided URL is empty.",
            )

        # Step 2: infer schema
        schema = detect_schema(df)

        # Step 3: generate synthetic rows (same count as original)
        synthetic_df = generate_synthetic_dataframe(schema, rows=len(df))

        # Step 4: upload and get signed URL
        filename = f"{uuid4()}.csv"
        download_url = upload_csv(synthetic_df, filename)

        # Step 5: return result
        return GenerateResult(
            download_url=download_url,
            schema=schema,
            preview=synthetic_df.head(20).to_dict(orient="records"),
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )