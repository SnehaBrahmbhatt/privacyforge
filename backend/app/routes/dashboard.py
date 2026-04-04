"""
Dashboard routes.

GET /dashboard/stats   — aggregate stats for the stats cards
GET /scans/recent      — recent scan activity list (alias for history[:8])
"""
from __future__ import annotations

from fastapi import APIRouter

from app.services import history_service

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/stats")
async def dashboard_stats():
    """
    Return aggregate statistics for the dashboard stat cards.
    """
    return history_service.get_stats()


@router.get("/scans/recent")
async def recent_scans():
    """
    Return the 8 most recent scans for the dashboard activity feed.
    This is a thin alias over the history endpoint.
    """
    history = history_service.get_history(limit=8)
    return [
        {
            "id": h.id,
            "timestamp": h.timestamp,
            "risk_level": h.risk_level,
            "entity_count": h.entity_count,
            "preview": h.preview,
            # Fields the old Dashboard page also reads
            "filename": h.preview[:40],
            "name": h.preview[:40],
            "created_at": h.timestamp,
        }
        for h in history
    ]