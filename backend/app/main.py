from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import generate

app = FastAPI(title="PrivacyForge API")

#  CORS (required for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  Health check
@app.get("/")
def home():
    return {"message": "PrivacyForge backend running"}

#  Main routes
app.include_router(generate.router, prefix="/api")