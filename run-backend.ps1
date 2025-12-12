# run-backend.ps1
# Activates a Python venv (if present) and starts the FastAPI backend with uvicorn.
# Usage: .\run-backend.ps1

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Candidate activate scripts (check backend/.venv first, then repo root .venv)
$venvActivates = @(
    Join-Path $repoRoot 'backend\.venv\Scripts\Activate.ps1',
    Join-Path $repoRoot '.venv\Scripts\Activate.ps1',
    Join-Path $repoRoot 'backend\venv\Scripts\Activate.ps1'
)

$activated = $false
foreach ($act in $venvActivates) {
    if (Test-Path $act) {
        Write-Host "Activating virtualenv: $act"
        & $act
        $activated = $true
        break
    }
}

Push-Location (Join-Path $repoRoot 'backend')
if (-not $activated) {
    Write-Host "Warning: no virtualenv activate script found. Ensure Python environment is activated manually." -ForegroundColor Yellow
}

Write-Host "Starting backend (uvicorn app.main:app --reload)"
uvicorn app.main:app --reload

Pop-Location
