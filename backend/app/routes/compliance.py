"""
Compliance routes.

GET  /compliance          — fetch last compliance overview (dashboard widget)
POST /compliance/check    — run compliance check on provided text
POST /compliance/run      — re-run compliance on last stored text
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import ComplianceCheckRequest, ComplianceResult
from app.services import compliance_service, history_service

router = APIRouter(tags=["compliance"])

# Cache the most recent compliance result for the dashboard GET endpoint
_last_result: dict | None = None
_last_text: str = ""


@router.post("/compliance/check", response_model=ComplianceResult)
async def compliance_check(req: ComplianceCheckRequest):
    """
    Run compliance check for one or more frameworks against provided text.
    """
    global _last_result, _last_text
    try:
        result = compliance_service.check_compliance(req)
        _last_text = req.text
        _last_result = result.model_dump()
        _last_result["generated_at"] = datetime.now(timezone.utc).isoformat()
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Compliance check failed: {exc}",
        )


@router.post("/compliance/run")
async def compliance_run():
    """
    Re-run compliance check using the last submitted text.
    Called by the Dashboard 'Run Check' button.
    """
    global _last_result, _last_text
    if not _last_text:
        # No prior text: return a neutral result so the dashboard doesn't error
        return {
            "overall_compliant": True,
            "frameworks": [],
            "overall_score": 100,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    req = ComplianceCheckRequest(text=_last_text, frameworks=["GDPR", "CCPA", "HIPAA"])
    result = compliance_service.check_compliance(req)
    _last_result = result.model_dump()
    _last_result["generated_at"] = datetime.now(timezone.utc).isoformat()
    return _last_result


@router.get("/compliance")
async def compliance_overview():
    """
    Return the last compliance run result for the dashboard widget.
    Returns a neutral "all-clear" response when no scan has been run yet.
    """
    if _last_result:
        return _last_result

    # Default state — no data scanned yet
    now = datetime.now(timezone.utc).isoformat()
    return {
        "overall_score": 100,
        "overall_compliant": True,
        "generated_at": now,
        "reports": [
            {
                "regulation": fw,
                "score": 100,
                "status": "compliant",
                "checks": [],
                "last_checked": now,
            }
            for fw in ["GDPR", "CCPA", "HIPAA"]
        ],
    }