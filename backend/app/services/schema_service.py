"""
Schema detection service.
Detects column types for synthetic data generation.
"""
from __future__ import annotations

import pandas as pd


# Keywords → synthetic type mapping (checked in column-name order)
_KEYWORD_MAP: list[tuple[list[str], str]] = [
    (["name", "fname", "lname", "firstname", "lastname", "fullname"], "name"),
    (["email", "mail"],                                                "email"),
    (["phone", "mobile", "cell", "tel"],                              "phone"),
    (["address", "street", "city", "state", "country", "zip", "postal"], "address"),
    (["dob", "birth", "birthday", "birthdate"],                       "date"),
    (["ssn", "social"],                                               "ssn"),
    (["card", "credit", "cvv", "pan"],                                "credit_card"),
    (["ip", "ipaddress"],                                             "ip_address"),
    (["url", "website", "link"],                                      "url"),
    (["company", "org", "employer"],                                  "company"),
    (["job", "title", "position", "role"],                            "job"),
    (["description", "bio", "note", "comment", "text"],               "text"),
]


def detect_schema(df: pd.DataFrame) -> dict[str, dict]:
    """
    Infer a synthetic-type for each column.

    Returns:
        { "col_name": { "type": "<synthetic_type>", "sample": <first_non_null_value> } }
    """
    schema: dict[str, dict] = {}

    for col in df.columns:
        col_lower = col.lower().replace(" ", "").replace("_", "")
        col_type: str | None = None

        # 1. Keyword match on column name
        for keywords, kw_type in _KEYWORD_MAP:
            if any(kw in col_lower for kw in keywords):
                col_type = kw_type
                break

        # 2. Dtype fallback
        if col_type is None:
            if pd.api.types.is_numeric_dtype(df[col]):
                col_type = "numeric"
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                col_type = "date"
            else:
                col_type = "text"

        # First non-null sample value for reference
        sample = None
        non_null = df[col].dropna()
        if not non_null.empty:
            sample = str(non_null.iloc[0])

        schema[col] = {"type": col_type, "sample": sample}

    return schema
