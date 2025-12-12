from fastapi import APIRouter, HTTPException, Request
from typing import List
from app.models.findings import Finding, FindingUpdate, StepToReproduce

router = APIRouter(
    prefix="/api/findings",
    tags=["findings"],
)

# Placeholder for a database
db_findings = {}

@router.get("/", response_model=List[Finding])
async def get_all_findings():
    return list(db_findings.values())

@router.get("/{finding_id}", response_model=Finding)
async def get_finding(finding_id: str):
    if finding_id not in db_findings:
        raise HTTPException(status_code=404, detail="Finding not found")
    return db_findings[finding_id]

@router.patch("/{finding_id}", response_model=Finding)
async def update_finding(finding_id: str, finding_update: FindingUpdate, request: Request = None):
    if finding_id not in db_findings:
        raise HTTPException(status_code=404, detail="Finding not found")
    
    finding = db_findings[finding_id]
    update_data = finding_update.dict(exclude_unset=True)
    updated_finding = finding.copy(update=update_data)
    # Normalize steps_to_reproduce if it came in as a string (legacy data)
    try:
        sts = updated_finding.steps_to_reproduce
        if isinstance(sts, str):
            lines = [l.strip() for l in sts.splitlines() if l.strip()]
            normalized = [StepToReproduce(step_number=i+1, text=line) for i, line in enumerate(lines)]
            updated_finding.steps_to_reproduce = normalized
    except Exception:
        # If steps are already structured or missing, ignore
        pass

    db_findings[finding_id] = updated_finding
    # append to activity log
    try:
        if request and hasattr(request.app.state, 'append_activity'):
            request.app.state.append_activity(f"Updated finding {finding_id}")
    except Exception:
        pass
    return updated_finding

@router.put("/{finding_id}", response_model=Finding)
async def replace_finding(finding_id: str, finding: Finding, request: Request = None):
    """Replace an entire finding (PUT). If finding doesn't exist, create it."""
    if finding_id != finding.id:
        raise HTTPException(status_code=400, detail="Finding ID in URL must match finding ID in body")
    
    db_findings[finding_id] = finding
    try:
        if request and hasattr(request.app.state, 'append_activity'):
            request.app.state.append_activity(f"Replaced finding {finding_id}")
    except Exception:
        pass
    return finding

@router.post("/{finding_id}/steps", response_model=Finding)
async def add_str_step(finding_id: str, step: StepToReproduce, request: Request = None):
    if finding_id not in db_findings:
        raise HTTPException(status_code=404, detail="Finding not found")
    
    finding = db_findings[finding_id]
    finding.steps_to_reproduce.append(step)
    try:
        if request and hasattr(request.app.state, 'append_activity'):
            request.app.state.append_activity(f"Added STR step to {finding_id}")
    except Exception:
        pass
    return finding


@router.post("/", response_model=Finding)
async def create_finding(finding: Finding, request: Request = None):
    """Create a new finding. Caller provides the `id` field."""
    if finding.id in db_findings:
        raise HTTPException(status_code=400, detail="Finding with this ID already exists")
    db_findings[finding.id] = finding
    try:
        if request and hasattr(request.app.state, 'append_activity'):
            request.app.state.append_activity(f"Created finding {finding.id}")
    except Exception:
        pass
    return finding
