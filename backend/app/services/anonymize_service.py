"""
Anonymization service.
Supports four strategies: mask | redact | replace | hash
"""
from __future__ import annotations

import hashlib
import re

from faker import Faker

from app.models.schemas import AnonymizeRequest, AnonymizeResult
from app.services.scan_service import scan_text

fake = Faker()

# Faker replacements per entity type
_REPLACEMENTS: dict[str, callable] = {
    "PERSON":       fake.name,
    "EMAIL":        fake.email,
    "PHONE":        fake.phone_number,
    "SSN":          lambda: f"{fake.numerify('###')}-{fake.numerify('##')}-{fake.numerify('####')}",
    "CREDIT_CARD":  lambda: fake.credit_card_number(card_type=None),
    "IP_ADDRESS":   fake.ipv4,
    "URL":          fake.url,
    "DATE":         lambda: fake.date(pattern="%m/%d/%Y"),
    "ZIPCODE":      fake.zipcode,
    "IBAN":         lambda: fake.iban(),
}


def _mask_value(value: str) -> str:
    """Replace all characters except first/last with ████."""
    if len(value) <= 2:
        return "█" * len(value)
    return value[0] + "█" * (len(value) - 2) + value[-1]


def _hash_value(value: str) -> str:
    """Deterministic 8-char hex hash (same input → same output)."""
    return hashlib.sha256(value.encode()).hexdigest()[:8]


def _redact_value(entity_type: str) -> str:
    return f"[{entity_type}]"


def _replace_value(entity_type: str) -> str:
    fn = _REPLACEMENTS.get(entity_type)
    return fn() if fn else f"[{entity_type}]"


def anonymize_text(req: AnonymizeRequest) -> AnonymizeResult:
    """
    Detect PII in text and apply the chosen anonymization strategy.
    """
    scan = scan_text(req.text)

    # Filter by requested entity types (empty = apply to all)
    targets = req.entities if req.entities else [e.type for e in scan.entities]
    entities_to_process = [e for e in scan.entities if e.type in targets]

    # Sort descending by start position so replacements don't shift offsets
    entities_to_process.sort(key=lambda e: e.start, reverse=True)

    result = req.text
    count = 0

    for entity in entities_to_process:
        original = result[entity.start:entity.end]

        if req.strategy == "mask":
            replacement = _mask_value(original)
        elif req.strategy == "redact":
            replacement = _redact_value(entity.type)
        elif req.strategy == "replace":
            replacement = _replace_value(entity.type)
        elif req.strategy == "hash":
            replacement = _hash_value(original)
        else:
            replacement = _redact_value(entity.type)

        result = result[:entity.start] + replacement + result[entity.end:]
        count += 1

    return AnonymizeResult(
        anonymized_text=result,
        entities_masked=count,
        strategy=req.strategy,
        original_entity_count=len(scan.entities),
    )