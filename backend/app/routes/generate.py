from fastapi import APIRouter
from pydantic import BaseModel
from uuid import uuid4

from app.services.file_service import download_csv_from_url
from app.services.schema_service import detect_schema
from app.services.generator_service import generate_synthetic_dataframe
from app.services.output_service import upload_csv

router = APIRouter()

# ✅ Request model (must match frontend)
class Request(BaseModel):
    url: str

@router.post("/generate")
async def generate(req: Request):
    try:
        # ✅ Step 1: Download CSV (FIXED: await)
        df = await download_csv_from_url(req.url)

        # ✅ Step 2: Detect schema
        schema = detect_schema(df)

        # ✅ Step 3: Generate synthetic data
        synthetic_df = generate_synthetic_dataframe(schema, rows=len(df))

        # ✅ Step 4: Save + upload
        filename = f"{uuid4()}.csv"
        download_url = upload_csv(synthetic_df, filename)

        # ✅ Step 5: Return response
        return {
            "download_url": download_url,
            "schema": schema,
            "preview": synthetic_df.head(20).to_dict(orient="records")
        }

    except Exception as e:
        # ✅ Debug fallback (VERY IMPORTANT)
        print("🔥 ERROR:", str(e))
        return {
            "error": str(e)
        }