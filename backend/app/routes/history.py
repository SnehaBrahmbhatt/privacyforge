"""
History routes.

GET /scans/history     — paginated scan log
GET /scans/{scan_id}   — single scan detail
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import ScanHistory
from app.services import history_service

router = APIRouter(tags=["history"])


@router.get("/scans/history", response_model=list[ScanHistory])
async def scan_history(limit: int = Query(default=50, ge=1, le=500)):
    """Return the most recent scan records, newest first."""
    return history_service.get_history(limit=limit)


@router.get("/scans/{scan_id}", response_model=ScanHistory)
async def scan_detail(scan_id: str):
    """Return a single scan record by ID."""
    record = history_service.get_by_id(scan_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan '{scan_id}' not found.",
        )
    return record