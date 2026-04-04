"""
Synthetic data generation service.
Uses Faker to generate realistic values for each detected schema type.
"""
from __future__ import annotations

import random

import pandas as pd
from faker import Faker

fake = Faker()

# Type → generator function mapping
_GENERATORS: dict[str, callable] = {
    "name":        fake.name,
    "email":       fake.email,
    "phone":       fake.phone_number,
    "address":     fake.address,
    "date":        lambda: fake.date(pattern="%Y-%m-%d"),
    "ssn":         fake.ssn,
    "credit_card": lambda: fake.credit_card_number(card_type=None),
    "ip_address":  fake.ipv4,
    "url":         fake.url,
    "company":     fake.company,
    "job":         fake.job,
    "text":        lambda: fake.sentence(nb_words=6),
    "numeric":     lambda: random.randint(1, 10_000),
}


def generate_fake_value(col_type: str) -> str | int:
    """Return a single fake value for the given schema type."""
    fn = _GENERATORS.get(col_type, fake.word)
    return fn()


def generate_synthetic_dataframe(
    schema: dict[str, dict],
    rows: int = 100,
) -> pd.DataFrame:
    """
    Generate a DataFrame with `rows` rows of synthetic data
    matching the provided schema.
    """
    rows = max(1, min(rows, 10_000))   # guard: 1 ≤ rows ≤ 10 000
    data: dict[str, list] = {}

    for col, meta in schema.items():
        col_type = meta.get("type", "text")
        data[col] = [generate_fake_value(col_type) for _ in range(rows)]

    return pd.DataFrame(data)