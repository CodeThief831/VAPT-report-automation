# run-all.ps1
# Single command to start backend AND frontend with automatic venv activation.
# Usage: .\run-all.ps1

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Find and activate virtualenv
$venvActivates = @(
    Join-Path $repoRoot '.venv\Scripts\Activate.ps1',
    Join-Path $repoRoot 'backend\.venv\Scripts\Activate.ps1',
    Join-Path $repoRoot 'backend\venv\Scripts\Activate.ps1'
)

$activated = $false
foreach ($act in $venvActivates) {
    if (Test-Path $act) {
        Write-Host "Activating virtualenv: $act" -ForegroundColor Green
        & $act
        $activated = $true
        break
    }
}

if (-not $activated) {
    Write-Host "Warning: no virtualenv found. Ensure Python environment is activated manually." -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting VAPT Report Automation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Start backend in a new PowerShell window
Write-Host "Starting backend (port 8000)..." -ForegroundColor Yellow
$backendCmd = @"
cd '$($repoRoot)\backend'
uvicorn app.main:app --reload
pause
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Start-Sleep -Seconds 3

# Start frontend in a new PowerShell window
Write-Host "Starting frontend (port 3000)..." -ForegroundColor Yellow
$frontendCmd = @"
cd '$($repoRoot)\frontend'
if (-not (Test-Path 'node_modules')) {
    npm install
}
npm start
pause
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Backend running on http://localhost:8000" -ForegroundColor Green
Write-Host "✓ Frontend running on http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Press Ctrl+C in each window to stop." -ForegroundColor Cyan
