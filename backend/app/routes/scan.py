from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime
import re

router = APIRouter()

# In-memory scan history (replace with DB later)
_scan_history: list[dict] = []


class ScanRequest(BaseModel):
    text: str


def _detect_entities(text: str) -> list[dict]:
    entities = []

    # Email
    for m in re.finditer(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text):
        entities.append({
            "type": "email", "value": m.group(),
            "start": m.start(), "end": m.end(), "confidence": 0.99,
        })

    # Phone (common formats)
    for m in re.finditer(r"\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}\b", text):
        entities.append({
            "type": "phone", "value": m.group(),
            "start": m.start(), "end": m.end(), "confidence": 0.92,
        })

    # Simple name heuristic (two capitalised words not at sentence start)
    for m in re.finditer(r"(?<!\.\s)(?<!\n)(?<! I )\b([A-Z][a-z]+ [A-Z][a-z]+)\b", text):
        entities.append({
            "type": "name", "value": m.group(),
            "start": m.start(), "end": m.end(), "confidence": 0.75,
        })

    # Credit card (basic Luhn pattern)
    for m in re.finditer(r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b", text):
        entities.append({
            "type": "credit_card", "value": m.group(),
            "start": m.start(), "end": m.end(), "confidence": 0.88,
        })

    # IP address
    for m in re.finditer(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", text):
        entities.append({
            "type": "ip_address", "value": m.group(),
            "start": m.start(), "end": m.end(), "confidence": 0.95,
        })

    return entities


def _risk_score(entities: list[dict]) -> tuple[float, str]:
    if not entities:
        return 0.0, "low"
    score = min(1.0, len(entities) * 0.15)
    high_risk = {"credit_card", "phone", "email"}
    if any(e["type"] in high_risk for e in entities):
        score = max(score, 0.55)
    if score >= 0.7:
        return score, "high"
    if score >= 0.35:
        return score, "medium"
    return score, "low"


@router.post("/scan")
async def scan_text(req: ScanRequest):
    try:
        entities = _detect_entities(req.text)
        risk_score, risk_level = _risk_score(entities)

        recs = []
        types_found = {e["type"] for e in entities}
        if "email" in types_found:
            recs.append("Mask or remove email addresses before sharing.")
        if "phone" in types_found:
            recs.append("Redact phone numbers to protect personal contact info.")
        if "credit_card" in types_found:
            recs.append("Immediately remove credit card numbers — PCI-DSS violation risk.")
        if "name" in types_found:
            recs.append("Consider anonymising personal names.")
        if not recs:
            recs.append("No immediate action required.")

        scan_id = str(uuid4())
        record = {
            "id": scan_id,
            "timestamp": datetime.utcnow().isoformat(),
            "preview": req.text[:120],
            "risk_level": risk_level,
            "entity_count": len(entities),
            "scan_result": {
                "entities": entities,
                "risk_score": round(risk_score, 2),
                "risk_level": risk_level,
                "recommendations": recs,
            },
        }
        _scan_history.insert(0, record)
        if len(_scan_history) > 100:
            _scan_history.pop()

        return record["scan_result"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scans/history")
async def get_history():
    return _scan_history


@router.get("/scans/{scan_id}")
async def get_scan(scan_id: str):
    for record in _scan_history:
        if record["id"] == scan_id:
            return record
    raise HTTPException(status_code=404, detail="Scan not found.")