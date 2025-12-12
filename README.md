# VAPT Report Automation

Lightweight VAPT report automation system (FastAPI backend + React frontend).

This workspace is maintained as a Windows-first project. Docker artifacts were removed — run locally on Windows.

Quick Start (Windows) — One Command

From the repo root, run:

```powershell
.\run-all.ps1
```

This will:
- Activate the Python virtualenv automatically
- Start backend on `http://localhost:8000` (with API docs at `/docs`)
- Start frontend on `http://localhost:3000`
- Open both in separate PowerShell windows

### Setup (first time)

1. Install Python dependencies:

```powershell
cd backend
python -m venv .venv
& .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Install Node.js dependencies:

```powershell
cd frontend
npm install
```

3. Run the app:

```powershell
# from repo root
.\run-all.ps1
```

### Individual Commands (optional)

If you prefer separate windows:

```powershell
# Backend only
.\run-backend.ps1

# Frontend only
.\run-frontend.ps1
```

### Populate Sample Findings (optional)

```powershell
cd backend
python auto_fill_findings.py
```

Notes
- This repo is intended for Windows development and testing.
- Generated reports and evidence files are stored under `backend/generated_reports/` and `backend/evidence_storage/` and are ignored by Git.
- If you want to reintroduce Docker later, create Dockerfiles and `docker-compose.yml` and document the workflow.

Support
- Development: `backend/` contains FastAPI app and `frontend/` contains React app.
- Tests: `backend/tests/` includes a few pytest tests for guidance.

License & Contribution
- Add licensing and contribution guidelines as needed.
