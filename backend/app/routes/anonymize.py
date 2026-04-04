"""
Anonymization route.

POST /anonymize   — JSON body
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import AnonymizeRequest, AnonymizeResult
from app.services import anonymize_service

router = APIRouter(tags=["anonymize"])


@router.post("/anonymize", response_model=AnonymizeResult)
async def anonymize(req: AnonymizeRequest):
    """
    Anonymize PII in text using the chosen strategy.

    Strategies:
      - mask    : replace chars with ████ (default)
      - redact  : replace with [TYPE]
      - replace : substitute with realistic fake values
      - hash    : deterministic 8-char hex pseudonym
    """
    try:
        return anonymize_service.anonymize_text(req)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Anonymization failed: {exc}",
        )