from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from typing import List
import os
from app.models.evidence import Evidence
from PIL import Image

router = APIRouter(
    prefix="/api/evidence",
    tags=["evidence"],
)

# Simple in-memory metadata store
db_evidence = {}

STORAGE_DIR = os.path.abspath(os.path.join(os.getcwd(), "evidence_storage"))
os.makedirs(STORAGE_DIR, exist_ok=True)


@router.post("/runs/{run_id}/evidence", response_model=List[Evidence])
async def upload_evidence_for_run(run_id: str, files: List[UploadFile] = File(...), request=None):
    uploaded_evidence = []
    for upload in files:
        # Create a safe evidence id and storage filename
        filename = os.path.basename(upload.filename)
        evidence_id = f"E-{run_id}-{filename}"
        stored_path = os.path.join(STORAGE_DIR, f"{evidence_id}")

        # Save file to disk
        content = await upload.read()
        with open(stored_path, "wb") as out_f:
            out_f.write(content)
        size = len(content)

        # Try to determine image resolution for common image types
        resolution = "N/A"
        try:
            img = Image.open(stored_path)
            resolution = f"{img.width}x{img.height}"
            img.close()
        except Exception:
            # not an image or PIL failed; keep resolution as N/A
            pass

        evidence = Evidence(
            id=evidence_id,
            filename=filename,
            mime_type=upload.content_type,
            size=size,
            resolution=resolution,
            uploader="user",
            timestamp="2025-12-12T12:00:00Z",
        )
        db_evidence[evidence_id] = {"meta": evidence, "path": stored_path}
        uploaded_evidence.append(evidence)

    # Append activity to app state log if available
    try:
        if request and hasattr(request.app.state, 'append_activity'):
            request.app.state.append_activity(f"Uploaded {len(uploaded_evidence)} evidence files for run {run_id}")
    except Exception:
        pass

    return uploaded_evidence


@router.get("/{evidence_id}", response_model=Evidence)
async def get_evidence_metadata(evidence_id: str):
    if evidence_id not in db_evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return db_evidence[evidence_id]["meta"]


@router.get("/{evidence_id}/file")
async def get_evidence_file(evidence_id: str):
    """Return the raw file bytes for an evidence item."""
    if evidence_id not in db_evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    path = db_evidence[evidence_id]["path"]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    # Let the client render the image directly
    return FileResponse(path)
