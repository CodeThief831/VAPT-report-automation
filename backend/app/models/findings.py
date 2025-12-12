from pydantic import BaseModel, Field
from typing import List, Optional

class StepToReproduce(BaseModel):
    step_number: int
    text: str
    attached_evidence_ids: List[str] = Field(default_factory=list)

class EvidenceLink(BaseModel):
    id: str
    filename: str
    uploader: str
    timestamp: str
    caption: str

class Finding(BaseModel):
    id: str = Field(..., example="F-2025-001")
    title: str = Field(..., example="Reflected XSS in /search")
    owasp_category: Optional[str] = Field(None, example="A3: Injection (XSS)")
    severity: str = Field(..., example="High")
    cvss_v3: Optional[str] = Field(None, example="7.4")
    description: str
    steps_to_reproduce: List[StepToReproduce] = Field(default_factory=list)
    evidence: List[EvidenceLink] = Field(default_factory=list)

class FindingUpdate(BaseModel):
    title: Optional[str] = None
    owasp_category: Optional[str] = None
    severity: Optional[str] = None
    cvss_v3: Optional[str] = None
    description: Optional[str] = None
    steps_to_reproduce: Optional[List[StepToReproduce]] = None
