import pandas as pd

def detect_schema(df: pd.DataFrame):
    schema = {}

    for col in df.columns:
        if "name" in col.lower():
            col_type = "name"
        elif "email" in col.lower():
            col_type = "email"
        elif "phone" in col.lower():
            col_type = "phone"
        elif pd.api.types.is_numeric_dtype(df[col]):
            col_type = "numeric"
        else:
            col_type = "text"

        schema[col] = {"type": col_type}

    return schema