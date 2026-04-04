import re
from faker import Faker

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
    "generalize": {
        "email": lambda m: "user@domain.com",
        "phone": lambda m: "+X-XXX-XXX-XXXX",
        "name": lambda m: "Individual",
        "credit_card": lambda m: "XXXX-XXXX-XXXX-XXXX",
        "ip_address": lambda m: "X.X.X.X",
    },
}


def anonymize_text(text: str, strategy: str, entities: list[str]) -> dict:
    if strategy not in _REPLACERS:
        strategy = "mask"

    replacers = _REPLACERS[strategy]
    targets = entities if entities else list(_PATTERNS.keys())
    result = text
    masked_count = 0

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

    return {
        "anonymized_text": result,
        "entities_masked": masked_count,
        "strategy": strategy,
    }