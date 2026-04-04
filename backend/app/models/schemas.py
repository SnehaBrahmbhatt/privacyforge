"""
Pydantic models shared across routes and services.
Centralising them here prevents circular imports.
"""
from __future__ import annotations

from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


# ── Scan ─────────────────────────────────────────────────────────────────────

class ScanTextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500_000)


class EntityResult(BaseModel):
    type: str
    value: str
    start: int
    end: int
    confidence: float


class ScanResult(BaseModel):
    entities: list[EntityResult]
    risk_score: int                            # 0–100
    risk_level: Literal["low", "medium", "high"]
    recommendations: list[str]
    entity_count: int
    scan_id: str


# ── Anonymize ─────────────────────────────────────────────────────────────────

class AnonymizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500_000)
    strategy: Literal["mask", "redact", "replace", "hash"] = "mask"
    entities: list[str] = Field(
        default_factory=list,
        description="Entity types to anonymize. Empty = all detected types.",
    )


class AnonymizeResult(BaseModel):
    anonymized_text: str
    entities_masked: int
    strategy: str
    original_entity_count: int


# ── Compliance ────────────────────────────────────────────────────────────────

class ComplianceCheckRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500_000)
    frameworks: list[Literal["GDPR", "CCPA", "HIPAA", "PDPA"]] = Field(
        default=["GDPR"],
        min_length=1,
    )


class FrameworkResult(BaseModel):
    name: str
    compliant: bool
    violations: list[str]
    score: int                                 # 0–100
    passed_checks: list[str]


class ComplianceResult(BaseModel):
    overall_compliant: bool
    frameworks: list[FrameworkResult]
    overall_score: int


# ── Dashboard ─────────────────────────────────────────────────────────────────

class RecentScan(BaseModel):
    id: str
    timestamp: str
    risk_level: Literal["low", "medium", "high"]
    entity_count: int
    preview: str


class DashboardStats(BaseModel):
    total_scans: int
    pii_detected: int
    risk_score: int
    compliance_rate: int
    recent_scans: list[RecentScan]
    # Optional delta fields shown on stat cards
    scan_delta: Optional[str] = None
    records_delta: Optional[str] = None
    avg_process_time: Optional[str] = None
    records_anonymised: Optional[int] = None
    compliance_score: Optional[int] = None
    compliance_breakdown: Optional[dict[str, int]] = None


# ── History ───────────────────────────────────────────────────────────────────

class ScanHistory(BaseModel):
    id: str
    timestamp: str
    preview: str
    risk_level: Literal["low", "medium", "high"]
    entity_count: int
    scan_result: Optional[ScanResult] = None


# ── Generate (original route) ─────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    url: str = Field(..., description="Public URL of a CSV file")


class GenerateResult(BaseModel):
    download_url: str
    schema: dict[str, Any]
    preview: list[dict[str, Any]]


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
