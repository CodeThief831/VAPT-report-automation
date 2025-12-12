from fastapi import APIRouter, Request, HTTPException

router = APIRouter(
    prefix="/api/debug",
    tags=["debug"],
)

@router.get("/status")
async def get_status(request: Request):
    app = request.app
    status = {
        "wkhtmltopdf": getattr(app.state, 'wkhtmltopdf', False),
        "generated_reports_dir": True if hasattr(app.state, 'wkhtmltopdf') else True,
    }
    # Check storage dirs
    try:
        import os
        status["generated_reports_exists"] = os.path.isdir("generated_reports")
        status["evidence_storage_exists"] = os.path.isdir("evidence_storage")
    except Exception:
        status["generated_reports_exists"] = None
        status["evidence_storage_exists"] = None
    return status

@router.get("/logs")
async def get_logs(request: Request, limit: int = 50):
    try:
        logs = getattr(request.app.state, 'activity_log', [])
        return list(reversed(logs[-limit:]))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to read activity log")
