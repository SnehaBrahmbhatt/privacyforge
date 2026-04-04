"""
Privacy scan routes.

POST /scan           — multipart file upload
POST /scan/text      — JSON body with raw text
"""
from __future__ import annotations

import io

from fastapi import APIRouter, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse

from app.models.schemas import ScanTextRequest, ScanResult
from app.services import scan_service, history_service

router = APIRouter(tags=["scan"])


@router.post("/scan", response_model=ScanResult)
async def scan_file(file: UploadFile = File(...)):
    """
    Scan an uploaded file (CSV / JSON / TXT) for PII.
    The file is read as UTF-8 text and scanned as plain text.
    """
    try:
        content_bytes = await file.read()
        try:
            text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            text = content_bytes.decode("latin-1", errors="replace")

        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Uploaded file is empty.",
            )

        result = scan_service.scan_text(text)
        history_service.add_scan(result, text)
        return result

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {exc}",
        )


@router.post("/scan/text", response_model=ScanResult)
async def scan_text(req: ScanTextRequest):
    """
    Scan raw pasted text for PII.
    """
    try:
        result = scan_service.scan_text(req.text)
        history_service.add_scan(result, req.text)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {exc}",
        )