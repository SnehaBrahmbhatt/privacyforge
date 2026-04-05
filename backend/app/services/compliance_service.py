"""
Compliance checking service.
Implements rule-based checks for GDPR, CCPA, HIPAA, and PDPA.
"""
from __future__ import annotations

from models.schemas import (
    ComplianceCheckRequest,
    ComplianceResult,
    FrameworkResult,
)
from services.scan_service import scan_text, _RISK_WEIGHT


# ── Rule definitions per framework ───────────────────────────────────────────

_FRAMEWORK_RULES: dict[str, list[dict]] = {
    "GDPR": [
        {
            "id": "gdpr_1",
            "check": "No SSN exposure",
            "violation": "Social Security Numbers detected — prohibited under GDPR Art. 9 (special category data)",
            "triggers": ["SSN"],
            "weight": 25,
        },
        {
            "id": "gdpr_2",
            "check": "No credit card data in plaintext",
            "violation": "Credit card numbers found — financial data requires explicit consent under GDPR Art. 6",
            "triggers": ["CREDIT_CARD", "IBAN"],
            "weight": 25,
        },
        {
            "id": "gdpr_3",
            "check": "Personal identifiers minimised",
            "violation": "Email/phone/name detected — apply data minimisation (GDPR Art. 5)",
            "triggers": ["EMAIL", "PHONE", "PERSON"],
            "weight": 15,
        },
        {
            "id": "gdpr_4",
            "check": "No IP addresses stored",
            "violation": "IP addresses are personal data under GDPR — pseudonymise before storage",
            "triggers": ["IP_ADDRESS"],
            "weight": 10,
        },
        {
            "id": "gdpr_5",
            "check": "No raw location data",
            "violation": "Postal/ZIP codes found — location data subject to GDPR Art. 4(1)",
            "triggers": ["ZIPCODE"],
            "weight": 5,
        },
    ],
    "CCPA": [
        {
            "id": "ccpa_1",
            "check": "No sensitive personal information",
            "violation": "SSN or financial identifiers found — subject to CCPA § 1798.121 restrictions",
            "triggers": ["SSN", "CREDIT_CARD"],
            "weight": 30,
        },
        {
            "id": "ccpa_2",
            "check": "Consumer identifiers disclosed",
            "violation": "Email / phone / name detected — consumers have right to opt-out under CCPA § 1798.120",
            "triggers": ["EMAIL", "PHONE", "PERSON"],
            "weight": 20,
        },
        {
            "id": "ccpa_3",
            "check": "No network activity data",
            "violation": "IP addresses or URLs present — browsing/network data is CCPA-regulated",
            "triggers": ["IP_ADDRESS", "URL"],
            "weight": 10,
        },
    ],
    "HIPAA": [
        {
            "id": "hipaa_1",
            "check": "No direct patient identifiers (PHI)",
            "violation": "Name or SSN found — these are HIPAA Safe Harbor identifiers (§ 164.514(b))",
            "triggers": ["PERSON", "SSN"],
            "weight": 35,
        },
        {
            "id": "hipaa_2",
            "check": "No contact information",
            "violation": "Phone/email found — contact details are PHI under HIPAA § 164.514(b)(2)",
            "triggers": ["PHONE", "EMAIL"],
            "weight": 25,
        },
        {
            "id": "hipaa_3",
            "check": "No geographic data smaller than state",
            "violation": "ZIP/postal codes found — sub-state geographic data is a HIPAA identifier",
            "triggers": ["ZIPCODE"],
            "weight": 15,
        },
        {
            "id": "hipaa_4",
            "check": "No IP/device identifiers",
            "violation": "IP addresses detected — device identifiers are HIPAA PHI",
            "triggers": ["IP_ADDRESS"],
            "weight": 10,
        },
    ],
    "PDPA": [
        {
            "id": "pdpa_1",
            "check": "No national ID or financial data",
            "violation": "SSN or credit card found — sensitive personal data under PDPA § 26",
            "triggers": ["SSN", "CREDIT_CARD", "IBAN"],
            "weight": 30,
        },
        {
            "id": "pdpa_2",
            "check": "Personal data minimisation",
            "violation": "Email/phone/name detected — collect only what is necessary (PDPA § 22)",
            "triggers": ["EMAIL", "PHONE", "PERSON"],
            "weight": 20,
        },
        {
            "id": "pdpa_3",
            "check": "No location data",
            "violation": "Postal codes found — location data is regulated under PDPA",
            "triggers": ["ZIPCODE"],
            "weight": 10,
        },
    ],
}


def _run_framework(
    framework: str,
    detected_types: set[str],
) -> FrameworkResult:
    rules = _FRAMEWORK_RULES.get(framework, [])
    violations: list[str] = []
    passed: list[str] = []
    penalty = 0

    for rule in rules:
        triggered = any(t in detected_types for t in rule["triggers"])
        if triggered:
            violations.append(rule["violation"])
            penalty += rule["weight"]
        else:
            passed.append(rule["check"])

    score = max(0, 100 - penalty)
    compliant = len(violations) == 0

    return FrameworkResult(
        name=framework,
        compliant=compliant,
        violations=violations,
        score=score,
        passed_checks=passed,
    )


def check_compliance(req: ComplianceCheckRequest) -> ComplianceResult:
    """Run compliance checks for the requested frameworks."""
    scan = scan_text(req.text)
    detected_types = {e.type for e in scan.entities}

    framework_results: list[FrameworkResult] = []
    for fw in req.frameworks:
        fw_upper = fw.upper()
        if fw_upper in _FRAMEWORK_RULES:
            framework_results.append(_run_framework(fw_upper, detected_types))

    if not framework_results:
        # No valid frameworks provided
        framework_results = [_run_framework("GDPR", detected_types)]

    overall_score = (
        sum(r.score for r in framework_results) // len(framework_results)
        if framework_results else 100
    )
    overall_compliant = all(r.compliant for r in framework_results)

    return ComplianceResult(
        overall_compliant=overall_compliant,
        frameworks=framework_results,
        overall_score=overall_score,
    )
