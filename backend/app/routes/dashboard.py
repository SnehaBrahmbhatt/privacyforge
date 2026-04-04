from fastapi import APIRouter
from app.routes.scan import _scan_history

router = APIRouter()


@router.get("/scans/recent")
def recent_scans():
    """Returns the 10 most recent scans — used by the Dashboard."""
    return _scan_history[:10]


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/dashboard/stats")
def dashboard_stats():
    total = len(_scan_history)
    if total == 0:
        return {
            "total_scans": 0,
            "risk_score": 0,
            "pii_detected": 0,
            "compliance_rate": 100,
            "recent_scans": [],
        }

    pii_total = sum(r["entity_count"] for r in _scan_history)
    avg_risk = sum(
        {"low": 0.1, "medium": 0.5, "high": 0.9}[r["risk_level"]]
        for r in _scan_history
    ) / total
    compliant = sum(1 for r in _scan_history if r["risk_level"] == "low")
    compliance_rate = round(compliant / total * 100, 1)

    recent = [
        {
            "id": r["id"],
            "timestamp": r["timestamp"],
            "risk_level": r["risk_level"],
            "entity_count": r["entity_count"],
        }
        for r in _scan_history[:5]
    ]

    return {
        "total_scans": total,
        "risk_score": round(avg_risk, 2),
        "pii_detected": pii_total,
        "compliance_rate": compliance_rate,
        "recent_scans": recent,
    }