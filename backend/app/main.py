from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from app.routers import findings, evidence, reports
import os
import shutil
import logging

app = FastAPI(
    title="VAPT Report Automation System (VRAS)",
    description="A GUI tool to import scanner outputs, review findings, and generate reports.",
    version="1.1.0",
)

# Allow CORS for local development (frontend served from a different origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Startup capability check
wk_path = shutil.which("wkhtmltopdf")
if wk_path:
    logging.info(f"wkhtmltopdf found at: {wk_path}")
    app.state.wkhtmltopdf = True
else:
    logging.warning("wkhtmltopdf not found on PATH. PDF generation will fall back to HTML only.")
    app.state.wkhtmltopdf = False
# Initialize a small in-memory activity log for debugging
app.state.activity_log = []

def append_activity(entry: str):
    try:
        app.state.activity_log.append({"ts": __import__('datetime').datetime.utcnow().isoformat() + 'Z', "entry": entry})
        # keep log size bounded
        if len(app.state.activity_log) > 200:
            app.state.activity_log.pop(0)
    except Exception:
        pass

app.state.append_activity = append_activity

os.makedirs("generated_reports", exist_ok=True)
app.mount("/reports", StaticFiles(directory="generated_reports"), name="reports")

app.include_router(findings.router)
app.include_router(evidence.router)
app.include_router(reports.router)
from app.routers import debug
app.include_router(debug.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the VAPT Report Automation System API"}
