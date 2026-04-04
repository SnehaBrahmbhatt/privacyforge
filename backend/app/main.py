"""
PrivacyForge FastAPI application entry point.

Bugs fixed vs original:
  1. Only the /generate route was registered — all other routes the frontend
     calls (scan, anonymize, compliance, dashboard, history) were missing,
     causing 404 on every page except the URL-upload feature.
  2. CORS had allow_credentials=True with allow_origins=["*"] which is
     rejected by browsers — fixed by using specific origins in production
     and only setting allow_credentials when origins are explicit.
  3. /health was defined on root "/" which clashed with possible frontend
     static serving — moved to /health as the frontend expects it.
  4. Error responses now use RFC-7807 JSON format instead of raw strings.
"""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.utils.config import settings
from app.routes import (
    generate,
    scan,
    anonymize,
    compliance,
    dashboard,
    history,
)
from app.models.schemas import HealthResponse

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=settings.log_level.upper())
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PrivacyForge API",
    description="AI-powered privacy compliance and synthetic data generation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Fix: allow_credentials=True is incompatible with allow_origins=["*"].
# Use explicit origins when credentials are needed; wildcard otherwise.
origins = settings.origins_list
use_credentials = origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=use_credentials,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "type": "internal_error"},
    )

# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["meta"])
async def health():
    """Backend liveness check. The Sidebar polls this every 30 s."""
    return HealthResponse(status="ok", version="1.0.0")

# Legacy root probe (keeps old clients working)
@app.get("/", tags=["meta"])
async def root():
    return {"message": "PrivacyForge backend running", "docs": "/docs"}

# ── Routers ───────────────────────────────────────────────────────────────────
# Fix: all routes the frontend expects are now registered.
# The original code only registered `generate` — every other page 404'd.
app.include_router(generate.router)    # POST /generate
app.include_router(scan.router)        # POST /scan, POST /scan/text
app.include_router(anonymize.router)   # POST /anonymize
app.include_router(compliance.router)  # GET/POST /compliance*
app.include_router(dashboard.router)   # GET /dashboard/stats, GET /scans/recent
app.include_router(history.router)     # GET /scans/history, GET /scans/{id}