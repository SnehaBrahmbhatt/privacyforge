from faker import Faker
import pandas as pd
import random

fake = Faker()

def generate_fake_value(col_type):
    if col_type == "name":
        return fake.name()
    elif col_type == "email":
        return fake.email()
    elif col_type == "phone":
        return fake.phone_number()
    elif col_type == "numeric":
        return random.randint(1, 1000)
    else:
        return fake.word()

def generate_synthetic_dataframe(schema, rows=100):
    data = {}

    for col, meta in schema.items():
        data[col] = [generate_fake_value(meta["type"]) for _ in range(rows)]

    return pd.DataFrame(data)