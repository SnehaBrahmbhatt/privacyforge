
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import generate

app = FastAPI(title="PrivacyForge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "PrivacyForge backend running"}

app.include_router(generate.router, prefix="/api")