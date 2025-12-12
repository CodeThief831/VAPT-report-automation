# run-frontend.ps1
# Changes to frontend folder, installs deps if needed, and starts the dev server.
# Usage: .\run-frontend.ps1

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location (Join-Path $repoRoot 'frontend')

if (-not (Test-Path 'node_modules')) {
    Write-Host 'node_modules not found — installing dependencies (npm install)'
    npm install
}

Write-Host 'Starting frontend (npm start)'
npm start

Pop-Location
