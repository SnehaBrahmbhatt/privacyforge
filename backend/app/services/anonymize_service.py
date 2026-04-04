import re
from faker import Faker

from app.models.schemas import AnonymizeRequest, AnonymizeResult

fake = Faker()

_PATTERNS = {
    "email": r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    "phone": r"\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}\b",
    "name": r"(?<!\.\s)\b([A-Z][a-z]+ [A-Z][a-z]+)\b",
    "credit_card": r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b",
    "ip_address": r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",
}

_REPLACERS = {
    "mask": {
        "email": lambda m: m.group()[0] + "***@***.***",
        "phone": lambda m: "***-***-****",
        "name": lambda m: m.group().split()[0][0] + "*** " + m.group().split()[1][0] + "***",
        "credit_card": lambda m: "****-****-****-" + m.group().replace(" ", "").replace("-", "")[-4:],
        "ip_address": lambda m: "***.***.***.***",
    },
    # Bug 2/3 fix: added "redact" and "hash" strategies to match schema's Literal
    "redact": {
        "email": lambda m: "[EMAIL]",
        "phone": lambda m: "[PHONE]",
        "name": lambda m: "[NAME]",
        "credit_card": lambda m: "[CREDIT_CARD]",
        "ip_address": lambda m: "[IP_ADDRESS]",
    },
    "suppress": {
        "email": lambda m: "[EMAIL REMOVED]",
        "phone": lambda m: "[PHONE REMOVED]",
        "name": lambda m: "[NAME REMOVED]",
        "credit_card": lambda m: "[CARD REMOVED]",
        "ip_address": lambda m: "[IP REMOVED]",
    },
    "synthetic": {
        "email": lambda m: fake.email(),
        "phone": lambda m: fake.phone_number(),
        "name": lambda m: fake.name(),
        "credit_card": lambda m: fake.credit_card_number(card_type=None),
        "ip_address": lambda m: fake.ipv4(),
    },
    # Bug 2/3 fix: "replace" is same as synthetic (schema uses "replace" not "synthetic")
    "replace": {
        "email": lambda m: fake.email(),
        "phone": lambda m: fake.phone_number(),
        "name": lambda m: fake.name(),
        "credit_card": lambda m: fake.credit_card_number(card_type=None),
        "ip_address": lambda m: fake.ipv4(),
    },
    "generalize": {
        "email": lambda m: "user@domain.com",
        "phone": lambda m: "+X-XXX-XXX-XXXX",
        "name": lambda m: "Individual",
        "credit_card": lambda m: "XXXX-XXXX-XXXX-XXXX",
        "ip_address": lambda m: "X.X.X.X",
    },
    # Bug 2/3 fix: "hash" strategy — deterministic 8-char hex pseudonym
    "hash": {
        "email": lambda m: __import__("hashlib").sha256(m.group().encode()).hexdigest()[:8],
        "phone": lambda m: __import__("hashlib").sha256(m.group().encode()).hexdigest()[:8],
        "name": lambda m: __import__("hashlib").sha256(m.group().encode()).hexdigest()[:8],
        "credit_card": lambda m: "****-****-****-" + __import__("hashlib").sha256(m.group().encode()).hexdigest()[:4],
        "ip_address": lambda m: __import__("hashlib").sha256(m.group().encode()).hexdigest()[:8],
    },
}


# Bug 2 fix: function now accepts an AnonymizeRequest Pydantic model (matching how anonymize.py calls it)
# Bug 3 fix: return dict now includes original_entity_count (required by AnonymizeResult schema)
def anonymize_text(req: AnonymizeRequest) -> AnonymizeResult:
    """
    Anonymize PII in text using the chosen strategy.

    Accepts an AnonymizeRequest Pydantic model.
    Returns an AnonymizeResult Pydantic model.
    """
    strategy = req.strategy if req.strategy in _REPLACERS else "mask"
    replacers = _REPLACERS[strategy]
    targets = req.entities if req.entities else list(_PATTERNS.keys())
    result = req.text
    masked_count = 0

    # First pass: count original entities so we can report original_entity_count
    original_count = 0
    for entity_type in targets:
        pattern = _PATTERNS.get(entity_type)
        if pattern:
            original_count += len(re.findall(pattern, req.text))

    for entity_type in targets:
        pattern = _PATTERNS.get(entity_type)
        if not pattern:
            continue
        replacer = replacers.get(entity_type)
        if not replacer:
            continue

        def make_replacer(fn):
            def _replace(m):
                nonlocal masked_count
                masked_count += 1
                return fn(m)
            return _replace

        result = re.sub(pattern, make_replacer(replacer), result)

    # Bug 3 fix: include original_entity_count in return (was missing, causing ValidationError)
    return AnonymizeResult(
        anonymized_text=result,
        entities_masked=masked_count,
        strategy=strategy,
        original_entity_count=original_count,
    )