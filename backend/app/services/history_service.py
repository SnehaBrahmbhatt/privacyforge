"""
In-memory scan history store.

For production, replace the _store list with a Supabase/PostgreSQL table.
The interface (add_scan / get_history / get_by_id) stays identical.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from app.models.schemas import ScanHistory, ScanResult

# ── In-memory store ───────────────────────────────────────────────────────────

_store: list[ScanHistory] = []
_MAX_HISTORY = 500       # cap to avoid memory bloat during long sessions


def add_scan(
    result: ScanResult,
    text: str,
) -> ScanHistory:
    """Persist a completed scan and return the ScanHistory record."""
    preview = text[:120].replace("\n", " ").strip()
    if len(text) > 120:
        preview += "…"

    record = ScanHistory(
        id=str(uuid.uuid4()),
        timestamp=datetime.now(timezone.utc).isoformat(),
        preview=preview,
        risk_level=result.risk_level,
        entity_count=result.entity_count,
        scan_result=result,
    )

    _store.insert(0, record)          # newest first
    if len(_store) > _MAX_HISTORY:
        _store.pop()

    return record


def get_history(limit: int = 50) -> list[ScanHistory]:
    return _store[:limit]


def get_by_id(scan_id: str) -> Optional[ScanHistory]:
    for record in _store:
        if record.id == scan_id:
            return record
    return None


def get_stats() -> dict:
    """Aggregate stats for the dashboard."""
    total = len(_store)
    if total == 0:
        return {
            "total_scans": 0,
            "pii_detected": 0,
            "risk_score": 0,
            "compliance_rate": 100,
            "recent_scans": [],
            "compliance_score": 100,
            "records_anonymised": 0,
            "avg_process_time": "—",
            "compliance_breakdown": {"GDPR": 100, "CCPA": 100, "HIPAA": 100},
        }

    total_entities = sum(r.entity_count for r in _store)
    avg_risk = sum(
        {"low": 20, "medium": 55, "high": 85}[r.risk_level]
        for r in _store
    ) // max(total, 1)
    low_risk_count = sum(1 for r in _store if r.risk_level == "low")
    compliance_rate = round((low_risk_count / total) * 100)

    recent = [
        {
            "id": r.id,
            "timestamp": r.timestamp,
            "risk_level": r.risk_level,
            "entity_count": r.entity_count,
            "preview": r.preview,
        }
        for r in _store[:8]
    ]

    return {
        "total_scans": total,
        "pii_detected": total_entities,
        "risk_score": avg_risk,
        "compliance_rate": compliance_rate,
        "recent_scans": recent,
        "compliance_score": compliance_rate,
        "records_anonymised": total_entities,
        "avg_process_time": "< 1s",
        "compliance_breakdown": {
            "GDPR":  max(0, compliance_rate - 5),
            "CCPA":  max(0, compliance_rate - 2),
            "HIPAA": max(0, compliance_rate - 8),
        },
    }