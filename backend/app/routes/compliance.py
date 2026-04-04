from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ComplianceRequest(BaseModel):
    text: str
    frameworks: List[str]

@router.post("/compliance")
def check_compliance(req: ComplianceRequest):
    # dummy logic for now
    results = []

    for fw in req.frameworks:
        results.append({
            "name": fw,
            "score": 80,
            "compliant": True,
            "violations": []
        })

    return {
        "overall_compliant": True,
        "frameworks": results
    }