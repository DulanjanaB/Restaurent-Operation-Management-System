# Restaurant Operations Management System - one-time installation.
#
#   powershell -ExecutionPolicy Bypass -File scripts\install.ps1            # local install
#   powershell -ExecutionPolicy Bypass -File scripts\install.ps1 -Mode Docker
#   powershell -ExecutionPolicy Bypass -File scripts\install.ps1 -CheckOnly  # prerequisites only
#
# Local mode needs Node.js 20+ and PostgreSQL 17 on this computer.
# Docker mode needs Docker Desktop (it runs PostgreSQL and both apps).
# Re-running is safe: existing configuration files are kept.

param(
  [ValidateSet('Local', 'Docker')] [string] $Mode = 'Local',
  [switch] $CheckOnly,
  [switch] $NoStart
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$logs = Join-Path $root 'logs'

function Step([string] $text) { Write-Host "`n== $text" -ForegroundColor Cyan }
function Ok([string] $text) { Write-Host "   OK  $text" -ForegroundColor Green }
function Warn([string] $text) { Write-Host "   !!  $text" -ForegroundColor Yellow }
function Fail([string] $text) { Write-Host "`nERROR: $text" -ForegroundColor Red; exit 1 }

function Has-Command([string] $name) { return [bool] (Get-Command $name -ErrorAction SilentlyContinue) }

function New-Secret {
  $bytes = New-Object byte[] 48
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return ([Convert]::ToBase64String($bytes)).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Read-Value([string] $label, [string] $default) {
  $answer = Read-Host "$label [$default]"
  if ([string]::IsNullOrWhiteSpace($answer)) { return $default } else { return $answer.Trim() }
}

function Read-Plain-Secret([string] $label) {
  while ($true) {
    $first = Read-Host -AsSecureString "$label"
    $second = Read-Host -AsSecureString 'Repeat it'
    $a = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($first))
    $b = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($second))
    if ($a.Length -lt 8) { Warn 'Use at least 8 characters.'; continue }
    if ($a -ne $b) { Warn 'The two entries do not match.'; continue }
    return $a
  }
}

function Read-EnvFile([string] $path) {
  $values = @{}
  if (Test-Path $path) {
    foreach ($line in Get-Content $path) {
      if ($line -match '^\s*([A-Z_]+)=(.*)$') { $values[$matches[1]] = $matches[2] }
    }
  }
  return $values
}

function Write-EnvFile([string] $path, [hashtable] $values) {
  $lines = $values.GetEnumerator() | Sort-Object Name | ForEach-Object { "$($_.Key)=$($_.Value)" }
  Set-Content -Path $path -Value $lines -Encoding ascii
}

function Wait-Http([string] $url, [int] $seconds) {
  $deadline = (Get-Date).AddSeconds($seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 | Out-Null
      return $true
    } catch {
      $status = $_.Exception.Response
      if ($status) { return $true }   # any HTTP answer means the server is up
      Start-Sleep -Seconds 2
    }
  }
  return $false
}

# ---------------------------------------------------------------- prerequisites
Step 'Checking prerequisites'

if (-not (Has-Command 'node')) { Fail 'Node.js is not installed. Install Node.js 20 LTS from https://nodejs.org and run this again.' }
$nodeMajor = [int] ((node -v) -replace '^v(\d+)\..*', '$1')
if ($nodeMajor -lt 20) { Fail "Node.js 20 or newer is needed (found v$nodeMajor)." }
Ok "Node.js $(node -v)"

if (-not (Has-Command 'npm')) { Fail 'npm was not found. Reinstall Node.js.' }
Ok "npm $(npm -v)"

if ($Mode -eq 'Docker') {
  if (-not (Has-Command 'docker')) { Fail 'Docker is not installed. Install Docker Desktop and run this again.' }
  docker compose version *> $null
  if ($LASTEXITCODE -ne 0) { Fail 'Docker Compose is not available. Update Docker Desktop.' }
  Ok 'Docker and Docker Compose'
} else {
  if (Has-Command 'psql') { Ok 'PostgreSQL client (psql) found' } else { Warn 'psql not found - you will create the database by hand (see the guide).' }
}

if ($CheckOnly) { Write-Host "`nPrerequisites check finished. Nothing was changed." -ForegroundColor Green; exit 0 }

# ---------------------------------------------------------------- configuration
Step 'Configuration'

$rootEnvPath = Join-Path $root '.env'
if (Test-Path $rootEnvPath) {
  Ok 'Existing .env kept - delete it to start the setup again'
  $config = Read-EnvFile $rootEnvPath
} else {
  Write-Host 'Answer a few questions. Press Enter to accept the value in brackets.'
  $config = @{}
  $config.APP_PUBLIC_URL = Read-Value 'Address staff will open the app at' 'http://localhost:3000'
  $config.ADMIN_USERNAME = Read-Value 'Administrator username' 'admin'
  $config.ADMIN_EMAIL = Read-Value 'Administrator email' 'admin@your-restaurant.example'
  $config.ADMIN_PASSWORD = Read-Plain-Secret 'Administrator password'
  $config.DB_PASSWORD = New-Secret
  $config.JWT_SECRET = New-Secret
  $config.DB_SYNC = 'true'
  Write-EnvFile $rootEnvPath $config
  Ok 'Created .env (keep it private - it holds passwords)'
}

if ($Mode -eq 'Local') {
  $backendEnv = @{
    DB_HOST = 'localhost'; DB_PORT = '5432'; DB_USERNAME = 'restaurant_user'
    DB_PASSWORD = $config.DB_PASSWORD; DB_NAME = 'restaurant_management'
    JWT_SECRET = $config.JWT_SECRET; JWT_EXPIRES_IN = '8h'
    ADMIN_USERNAME = $config.ADMIN_USERNAME; ADMIN_EMAIL = $config.ADMIN_EMAIL
    ADMIN_PASSWORD = $config.ADMIN_PASSWORD; DB_SYNC = $config.DB_SYNC
  }
  Write-EnvFile (Join-Path $root 'backend\.env') $backendEnv
  Write-EnvFile (Join-Path $root 'frontend\.env.local') @{
    BACKEND_API_URL = 'http://localhost:3001'
    NEXT_PUBLIC_APP_URL = $config.APP_PUBLIC_URL
  }
  Ok 'Wrote backend\.env and frontend\.env.local'
}

# ---------------------------------------------------------------- database
if ($Mode -eq 'Local') {
  Step 'Database'
  if (Has-Command 'psql') {
    $superPassword = Read-Plain-Secret 'Password of the PostgreSQL superuser (postgres)'
    $env:PGPASSWORD = $superPassword
    $roleExists = (psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_roles WHERE rolname='restaurant_user'")
    if (-not $roleExists) { psql -U postgres -h localhost -c "CREATE USER restaurant_user WITH PASSWORD '$($config.DB_PASSWORD)'" | Out-Null }
    $dbExists = (psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname='restaurant_management'")
    if (-not $dbExists) { psql -U postgres -h localhost -c "CREATE DATABASE restaurant_management OWNER restaurant_user" | Out-Null }
    Remove-Item Env:PGPASSWORD
    Ok 'Database user and database are ready'
  } else {
    Write-Host @"
Create the database yourself, in pgAdmin or psql, then press Enter:
  CREATE USER restaurant_user WITH PASSWORD '<DB_PASSWORD from .env>';
  CREATE DATABASE restaurant_management OWNER restaurant_user;
"@
    Read-Host 'Press Enter when the database is ready' | Out-Null
  }
}

# ---------------------------------------------------------------- build
if ($Mode -eq 'Local') {
  Step 'Installing and building the backend'
  Push-Location (Join-Path $root 'backend')
  npm ci; if ($LASTEXITCODE -ne 0) { Fail 'npm ci failed in backend' }
  npm run build; if ($LASTEXITCODE -ne 0) { Fail 'backend build failed' }
  Pop-Location
  Ok 'Backend built'

  Step 'Installing and building the web app'
  Push-Location (Join-Path $root 'frontend')
  npm ci; if ($LASTEXITCODE -ne 0) { Fail 'npm ci failed in frontend' }
  npm run build; if ($LASTEXITCODE -ne 0) { Fail 'frontend build failed' }
  Pop-Location
  Ok 'Web app built'
} else {
  Step 'Building and starting the containers'
  Push-Location $root
  docker compose up -d --build; if ($LASTEXITCODE -ne 0) { Fail 'docker compose failed - see the messages above' }
  Pop-Location
  Ok 'Containers started'
}

# ---------------------------------------------------------------- start
if ($NoStart) { Write-Host "`nInstallation finished. Start later with scripts\start.ps1" -ForegroundColor Green; exit 0 }

Step 'Starting the system'
& (Join-Path $PSScriptRoot 'start.ps1') -Mode $Mode

Write-Host "`nInstallation complete." -ForegroundColor Green
Write-Host "Open: $($config.APP_PUBLIC_URL)"
Write-Host "Sign in as '$($config.ADMIN_USERNAME)' with the administrator password you chose."
Write-Host 'Change that password from My Profile straight away.'
