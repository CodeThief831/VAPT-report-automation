# run-all.ps1
# Starts backend and frontend in separate PowerShell jobs so both run from one command.
# Usage: .\run-all.ps1

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start backend job
$backendScript = Join-Path $repoRoot 'run-backend.ps1'
$frontendScript = Join-Path $repoRoot 'run-frontend.ps1'

Write-Host 'Starting backend as job...'
Start-Job -Name VRA-Backend -ScriptBlock { param($s) & $s } -ArgumentList $backendScript | Out-Null
Start-Sleep -Seconds 2
Write-Host 'Starting frontend as job...'
Start-Job -Name VRA-Frontend -ScriptBlock { param($s) & $s } -ArgumentList $frontendScript | Out-Null

Write-Host 'Backend and Frontend started as background jobs.'
Write-Host 'Use `Get-Job` and `Receive-Job -Name <name>` to inspect output, or open the dev servers in your browser.'
