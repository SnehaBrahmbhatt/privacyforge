"""
PII detection service.

Primary engine : Microsoft Presidio (if spaCy model is installed).
Fallback engine: Regex patterns (works with zero ML deps).

The service is transparent about which engine is active.
"""
from __future__ import annotations

import hashlib
import re
import uuid
from typing import Optional

from models.schemas import EntityResult, ScanResult

# ── Regex fallback patterns ───────────────────────────────────────────────────

_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("EMAIL",       re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")),
    ("PHONE",       re.compile(r"\b(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b")),
    ("SSN",         re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    ("CREDIT_CARD", re.compile(r"\b(?:\d{4}[-\s]?){3}\d{4}\b")),
    ("IP_ADDRESS",  re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")),
    ("URL",         re.compile(r"https?://[^\s<>\"']+|www\.[^\s<>\"']+")),
    ("DATE",        re.compile(r"\b(?:\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}|\d{4}[/\-]\d{2}[/\-]\d{2})\b")),
    ("PERSON",      re.compile(r"\b(?:Mr|Mrs|Ms|Dr|Prof)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b")),
    ("ZIPCODE",     re.compile(r"\b\d{5}(?:-\d{4})?\b")),
    ("IBAN",        re.compile(r"\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}(?:[A-Z0-9]{0,16})\b")),
]

# Risk scoring weights per entity type
_RISK_WEIGHT: dict[str, int] = {
    "SSN": 30,
    "CREDIT_CARD": 30,
    "IBAN": 25,
    "EMAIL": 15,
    "PHONE": 15,
    "PERSON": 10,
    "IP_ADDRESS": 10,
    "DATE": 5,
    "URL": 5,
    "ZIPCODE": 5,
}

_RECOMMENDATIONS: dict[str, str] = {
    "SSN":         "Social Security Numbers should never be stored in plain text. Use tokenization.",
    "CREDIT_CARD": "Credit card numbers must be PCI-DSS compliant — mask or tokenize immediately.",
    "IBAN":        "Bank account numbers are highly sensitive. Apply field-level encryption.",
    "EMAIL":       "Email addresses are PII. Consider hashing or pseudonymizing before storage.",
    "PHONE":       "Phone numbers are direct contact identifiers. Mask digits before sharing.",
    "PERSON":      "Full names are PII. Anonymize or aggregate before use in analytics.",
    "IP_ADDRESS":  "IP addresses can be used to identify individuals. Truncate the last octet.",
    "DATE":        "Dates of birth can be combined with other data to re-identify individuals.",
    "URL":         "URLs may embed user tokens or session IDs. Sanitize before logging.",
    "ZIPCODE":     "ZIP codes in combination with other fields can enable re-identification.",
}


# ── Presidio engine (optional) ────────────────────────────────────────────────

_presidio_analyzer: Optional[object] = None
_presidio_available = False

try:
    from presidio_analyzer import AnalyzerEngine
    _presidio_analyzer = AnalyzerEngine()
    _presidio_available = True
except Exception:
    pass  # fall through to regex


def _scan_with_regex(text: str) -> list[EntityResult]:
    """Pure-regex PII extraction. No ML dependencies."""
    found: list[EntityResult] = []
    seen: set[tuple[int, int]] = set()

    for entity_type, pattern in _PATTERNS:
        for m in pattern.finditer(text):
            span = (m.start(), m.end())
            if span in seen:
                continue
            seen.add(span)
            found.append(EntityResult(
                type=entity_type,
                value=m.group(),
                start=m.start(),
                end=m.end(),
                confidence=0.85,
            ))

    return found


def _scan_with_presidio(text: str) -> list[EntityResult]:
    """Presidio-based PII extraction."""
    from presidio_analyzer import AnalyzerEngine  # type: ignore
    analyzer: AnalyzerEngine = _presidio_analyzer  # type: ignore
    results = analyzer.analyze(text=text, language="en")
    entities: list[EntityResult] = []
    for r in results:
        entities.append(EntityResult(
            type=r.entity_type,
            value=text[r.start:r.end],
            start=r.start,
            end=r.end,
            confidence=round(r.score, 3),
        ))
    return entities


def _compute_risk(entities: list[EntityResult]) -> tuple[int, str]:
    """Return (risk_score 0–100, risk_level)."""
    raw = sum(_RISK_WEIGHT.get(e.type, 5) for e in entities)
    score = min(100, raw)
    if score >= 70:
        level = "high"
    elif score >= 35:
        level = "medium"
    else:
        level = "low"
    return score, level


def _build_recommendations(entities: list[EntityResult]) -> list[str]:
    seen: set[str] = set()
    recs: list[str] = []
    for e in entities:
        if e.type not in seen and e.type in _RECOMMENDATIONS:
            recs.append(_RECOMMENDATIONS[e.type])
            seen.add(e.type)
    if not recs:
        recs.append("No high-risk PII detected. Continue following data minimisation principles.")
    return recs


def scan_text(text: str) -> ScanResult:
    """
    Scan text for PII entities.
    Uses Presidio when available, falls back to regex.
    """
    if _presidio_available:
        entities = _scan_with_presidio(text)
        # Supplement with regex for types Presidio may miss
        regex_entities = _scan_with_regex(text)
        existing_spans = {(e.start, e.end) for e in entities}
        for re_entity in regex_entities:
            if (re_entity.start, re_entity.end) not in existing_spans:
                entities.append(re_entity)
    else:
        entities = _scan_with_regex(text)

    risk_score, risk_level = _compute_risk(entities)
    recommendations = _build_recommendations(entities)

    return ScanResult(
        entities=entities,
        risk_score=risk_score,
        risk_level=risk_level,
        recommendations=recommendations,
        entity_count=len(entities),
        scan_id=str(uuid.uuid4()),
    )
