"""
Compliance routes.

POST /api/compliance/check  — run compliance checks against selected frameworks
GET  /api/compliance        — list supported frameworks

Bug 4 fix: was a stub with hardcoded dummy data; now calls compliance_service.
Bug 5 fix: frontend calls /api/compliance/check, so the route is now /check
           (the router is mounted at /api, so the full path becomes /api/compliance/check).
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from models.schemas import ComplianceCheckRequest, ComplianceResult
from services import compliance_service

router = APIRouter(prefix="/compliance", tags=["compliance"])


@router.post("/check", response_model=ComplianceResult)
def check_compliance(req: ComplianceCheckRequest):
    """
    Run compliance checks for the given text against the requested frameworks.
    Supported frameworks: GDPR, CCPA, HIPAA, PDPA.
    """
    try:
        return compliance_service.check_compliance(req)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Compliance check failed: {exc}",
        )


@router.get("/frameworks")
def list_frameworks():
    """Return the list of supported compliance frameworks."""
    return {
        "frameworks": ["GDPR", "CCPA", "HIPAA", "PDPA"],
    }
