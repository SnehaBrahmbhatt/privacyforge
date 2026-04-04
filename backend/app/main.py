from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import generate
from app.routes import scan
from app.routes import dashboard
from app.routes import compliance
from app.routes import anonymize   # Bug 1 fix: was never imported/registered
from app.routes import history     # Bug 1 fix: was never imported/registered

app = FastAPI(title="PrivacyForge API", version="1.0.0")

# CORS — restrict to your frontend origin in production
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check (root)
@app.get("/")
def home():
    return {"message": "PrivacyForge backend running", "version": "1.0.0"}


# Routes
app.include_router(generate.router, prefix="/api", tags=["generate"])
app.include_router(scan.router, prefix="/api", tags=["scan"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(compliance.router, prefix="/api", tags=["compliance"])
app.include_router(anonymize.router, prefix="/api", tags=["anonymize"])   # Bug 1 fix
app.include_router(history.router, prefix="/api", tags=["history"])       # Bug 1 fix