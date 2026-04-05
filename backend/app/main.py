from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import sys

# main.py is inside backend/app/, so add backend/app/ to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes import generate
from routes import scan
from routes import dashboard
from routes import compliance
from routes import anonymize
from routes import history

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

# main.py is at backend/app/main.py
# frontend/dist is at frontend/dist
# so go up 3 levels: app -> backend -> root -> frontend/dist
frontend_dist = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../frontend/dist")
)

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def home():
        return {"message": "PrivacyForge backend running", "version": "1.0.0"}