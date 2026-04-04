from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys

# Add backend directory to Python path so 'app' module is found
sys.path.insert(0, os.path.dirname(__file__))

from app.routes import generate
from app.routes import scan
from app.routes import dashboard
from app.routes import compliance
from app.routes import anonymize
from app.routes import history

app = FastAPI(title="PrivacyForge API", version="1.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://privacyforge-1.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(generate.router, prefix="/api", tags=["generate"])
app.include_router(scan.router, prefix="/api", tags=["scan"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(compliance.router, prefix="/api", tags=["compliance"])
app.include_router(anonymize.router, prefix="/api", tags=["anonymize"])
app.include_router(history.router, prefix="/api", tags=["history"])

# Serve React frontend static files
# __file__ = /repo/backend/main.py → go up one level to find frontend/dist
frontend_dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../frontend/dist")
frontend_dist = os.path.abspath(frontend_dist)

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def home():
        return {"message": "PrivacyForge backend running", "version": "1.0.0"}