"""
Privacy Scan route.

POST /api/scan  — scan text for PII entities

Bug 6 fix: was maintaining its own _scan_history list (split-brain with history_service).
           Now calls scan_service.scan_text() and history_service.add_scan() so that
           the Dashboard and History pages see scan results immediately.

Bug 10 fix: was reimplementing regex detection inline instead of using scan_service.
            Now delegates entirely to scan_service (Presidio + regex fallback).

Duplicate GET /scans/history and GET /scans/{scan_id} endpoints removed —
they live in history.py which is registered in main.py.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from models.schemas import ScanTextRequest, ScanResult
from services import scan_service, history_service

router = APIRouter(tags=["scan"])


@router.post("/scan", response_model=ScanResult)
async def scan_text(req: ScanTextRequest):
    """
    Scan free-form text for PII entities.

    Returns detected entities, a risk score (0-100), risk level, and recommendations.
    The scan is automatically saved to the shared history store so the Dashboard
    and History pages reflect it immediately.
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
