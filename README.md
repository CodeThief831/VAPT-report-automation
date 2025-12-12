# VAPT Report Automation

Lightweight VAPT report automation system (FastAPI backend + React frontend).

This workspace is maintained as a Windows-first project. Docker artifacts were removed — run locally on Windows.

Quick Start (Windows)

1. Prepare Python virtual environment

```powershell
cd "C:\Users\royal\OneDrive\Desktop\Report Automation\backend"
python -m venv .venv
& .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Run backend (development)

```powershell
# from backend folder (virtualenv active)
uvicorn app.main:app --reload
```

3. Frontend (Node.js required)

```powershell
cd "C:\Users\royal\OneDrive\Desktop\Report Automation\frontend"
# install deps if needed
npm install
# dev server
npm run start
# or build for production
npm run build
```

4. Populate sample findings (optional)

```powershell
# from backend folder
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
