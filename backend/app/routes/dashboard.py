"""
Dashboard routes.

GET /api/health           — health check
GET /api/dashboard/stats  — aggregated stats for the dashboard card
GET /api/scans/recent     — last 10 scans (used by dashboard activity feed)

Bug 6 fix: was importing _scan_history directly from app.routes.scan, creating a
           split-brain where dashboard and history_service tracked different lists.
           Now uses history_service exclusively, which is the single source of truth.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.services import history_service
from app.models.schemas import DashboardStats

router = APIRouter(tags=["dashboard"])


@router.get("/scans/recent")
def recent_scans():
    """Returns the 10 most recent scans — used by the Dashboard activity feed."""
    return history_service.get_history(limit=10)


@router.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats():
    """Aggregate stats for the dashboard stat cards."""
    return history_service.get_stats()