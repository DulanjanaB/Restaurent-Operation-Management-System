# Starts the Restaurant Operations system after installation.
#
#   powershell -ExecutionPolicy Bypass -File scripts\start.ps1           # local
#   powershell -ExecutionPolicy Bypass -File scripts\start.ps1 -Mode Docker

param([ValidateSet('Local', 'Docker')] [string] $Mode = 'Local')

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $root 'logs'
New-Item -ItemType Directory -Force -Path $logs | Out-Null

function Wait-Http([string] $url, [int] $seconds) {
  $deadline = (Get-Date).AddSeconds($seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 | Out-Null
      return $true
    } catch {
      if ($_.Exception.Response) { return $true }   # any HTTP answer means it is up
      Start-Sleep -Seconds 2
    }
  }
  return $false
}

if ($Mode -eq 'Docker') {
  Push-Location $root
  docker compose up -d
  Pop-Location
  Write-Host 'Containers are running. Logs: docker compose logs -f'
  exit 0
}

# The backend's first start creates the database tables, which can take a minute.
Write-Host 'Starting the API (port 3001) ...'
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run start:prod > ..\logs\backend.log 2>&1' `
  -WorkingDirectory (Join-Path $root 'backend') -WindowStyle Minimized
if (-not (Wait-Http 'http://localhost:3001/auth/me' 180)) {
  Write-Host 'The API did not start. Read logs\backend.log for the reason.' -ForegroundColor Red
  exit 1
}
Write-Host 'API is running.' -ForegroundColor Green

Write-Host 'Starting the web app (port 3000) ...'
Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm run start > ..\logs\frontend.log 2>&1' `
  -WorkingDirectory (Join-Path $root 'frontend') -WindowStyle Minimized
if (-not (Wait-Http 'http://localhost:3000/login' 120)) {
  Write-Host 'The web app did not start. Read logs\frontend.log for the reason.' -ForegroundColor Red
  exit 1
}
Write-Host 'Web app is running at http://localhost:3000' -ForegroundColor Green
