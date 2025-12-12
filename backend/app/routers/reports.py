from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.report_generator import ReportGenerator
from app.models.findings import Finding, StepToReproduce
from fastapi import UploadFile, File, Form
import json
import os
from PIL import Image
from app.routers import evidence as evidence_router
from app.routers import findings as findings_router

router = APIRouter(
    prefix="/api/runs",
    tags=["reports"],
)

class ReportGenerationResponse(BaseModel):
    job_id: str
    message: str
    report_url: Optional[str] = None
    pdf_generated: bool = False
    note: Optional[str] = None
    html_content: Optional[str] = None

def generate_report_sync(run_id: str, template: str, findings_data: List[Dict[str, Any]]):
    """
    Generates a report by fetching findings and evidence, rendering a template,
    and saving the output.
    """
    print(f"Generating report for run {run_id} with template {template}...")

    # 1. Instantiate the report generator
    generator = ReportGenerator(template=template)

    # 2. Normalize incoming raw finding dicts into `Finding` models
    try:
        findings: List[Finding] = []
        for fd in findings_data:
            # If steps_to_reproduce was provided as a string, convert to structured steps
            if 'steps_to_reproduce' in fd and isinstance(fd['steps_to_reproduce'], str):
                lines = [l.strip() for l in fd['steps_to_reproduce'].splitlines() if l.strip()]
                fd['steps_to_reproduce'] = [
                    {"step_number": i + 1, "text": line} for i, line in enumerate(lines)
                ]
            # Parse into Pydantic Finding model (will validate and coerce types)
            finding = Finding.parse_obj(fd)
            findings.append(finding)

        report_path = generator.generate(findings=findings, run_id=run_id)
        print(f"Report for run {run_id} generated successfully at: {report_path}")
        return report_path
    except Exception as e:
        print(f"Failed to generate report for run {run_id}: {e}")
        # re-raise so callers can handle and report error state
        raise


@router.post("/{run_id}/generate", response_model=ReportGenerationResponse)
async def generate_report(run_id: str, findings: List[Dict[str, Any]], template: str = "corporate", request: Request = None):
    """
    Accept raw finding dicts from the frontend and normalize them server-side.
    This avoids request validation errors when the frontend sends `steps_to_reproduce`
    as a plain string (legacy UI behavior).
    """
    job_id = f"report-{run_id}-{template}"
    try:
        # log start
        try:
            if request and hasattr(request.app.state, 'append_activity'):
                request.app.state.append_activity(f"Started report generation for run {run_id}")
        except Exception:
            pass

        paths = generate_report_sync(run_id, template, findings)

        # log success
        try:
            if request and hasattr(request.app.state, 'append_activity'):
                request.app.state.append_activity(f"Completed report generation for run {run_id}")
        except Exception:
            pass
    except Exception as e:
        # Surface server-side failure to the frontend with a 500 error
        try:
            if request and hasattr(request.app.state, 'append_activity'):
                request.app.state.append_activity(f"Report generation failed for run {run_id}: {e}")
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))

    # Prefer PDF if it was generated, otherwise fall back to HTML
    report_url = None
    pdf_generated = False
    note = None
    html_content = None
    if paths and isinstance(paths, dict):
        if paths.get('pdf'):
            report_url = f"/reports/{paths['pdf'].split('/')[-1]}"
            pdf_generated = True
        elif paths.get('html'):
            report_url = f"/reports/{paths['html'].split('/')[-1]}"
            note = 'PDF generation failed or not available; HTML report generated.'
            # include HTML content in the response so frontend can render inline
            html_content = paths.get('html_content')
    else:
        report_url = f"/reports/report-{run_id}.html"
        note = 'Report generation did not return paths; check server logs.'
    return {
        "job_id": job_id,
        "message": "Report generation completed.",
        "report_url": report_url,
        "pdf_generated": pdf_generated,
        "note": note,
        "html_content": html_content,
    }


@router.post("/{run_id}/import")
async def import_run(run_id: str, metadata: str = Form(...), files: List[UploadFile] = File(None), request: Request = None):
    """Import a run: metadata is JSON array of findings (without evidence ids) and files are uploaded evidence.

    The metadata should be a JSON array where each finding can include a `attached_filenames` list
    referring to filenames uploaded in `files`. This endpoint will save files to evidence_storage and
    create findings in `db_findings` linking evidence by id.
    """
    try:
        data = json.loads(metadata)
        if not isinstance(data, list):
            raise ValueError("metadata must be a JSON array of findings")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid metadata JSON: {e}")

    # Save uploaded files to evidence storage and build mapping filename->evidence_id
    filename_to_eid = {}
    if files:
        for upload in files:
            filename = os.path.basename(upload.filename)
            evidence_id = f"E-{run_id}-{filename}"
            stored_path = os.path.join(evidence_router.STORAGE_DIR, evidence_id)
            content = await upload.read()
            with open(stored_path, "wb") as out_f:
                out_f.write(content)
            # try to get resolution using PIL
            resolution = "N/A"
            try:
                img = Image.open(stored_path)
                resolution = f"{img.width}x{img.height}"
                img.close()
            except Exception:
                pass
            evidence = evidence_router.Evidence(
                id=evidence_id,
                filename=filename,
                mime_type=upload.content_type,
                size=len(content),
                resolution=resolution,
                uploader="import",
                timestamp=__import__('datetime').datetime.utcnow().isoformat() + 'Z',
            )
            evidence_router.db_evidence[evidence_id] = {"meta": evidence, "path": stored_path}
            filename_to_eid[filename] = evidence_id

    created = []
    # Create findings from metadata and link evidence by filename mapping
    for f in data:
        # ensure required fields
        if 'id' not in f or 'title' not in f:
            continue
        # convert steps if provided as string
        if 'steps_to_reproduce' in f and isinstance(f['steps_to_reproduce'], str):
            lines = [l.strip() for l in f['steps_to_reproduce'].splitlines() if l.strip()]
            f['steps_to_reproduce'] = [{"step_number": i+1, "text": line} for i, line in enumerate(lines)]

        # attach evidence ids from filenames
        attached = []
        for fn in f.get('attached_filenames', []):
            eid = filename_to_eid.get(fn)
            if eid:
                attached.append(eid)

        # build Finding model
        finding_obj = Finding.parse_obj({
            'id': f['id'],
            'title': f.get('title'),
            'owasp_category': f.get('owasp_category'),
            'severity': f.get('severity', 'Medium'),
            'cvss_v3': f.get('cvss_v3'),
            'description': f.get('description', ''),
            'steps_to_reproduce': f.get('steps_to_reproduce', []),
            'evidence': []
        })

        # link evidence metadata objects to finding.evidence
        for eid in attached:
            meta = evidence_router.db_evidence.get(eid)
            if meta:
                finding_obj.evidence.append(meta['meta'])

        # store in findings db
        findings_router.db_findings[finding_obj.id] = finding_obj
        created.append(finding_obj)

    # append activity
    try:
        if request and hasattr(request.app.state, 'append_activity'):
            request.app.state.append_activity(f"Imported run {run_id}: created {len(created)} findings, uploaded {len(filename_to_eid)} files")
    except Exception:
        pass

    return {"created": [c.id for c in created], "uploaded_files": list(filename_to_eid.keys())}
