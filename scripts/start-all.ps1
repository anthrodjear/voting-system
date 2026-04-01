# =============================================================================
#  Voting System - Start All Services (PowerShell)
# =============================================================================
#  Usage:
#    .\scripts\start-all.ps1                  Start via Docker Compose (default)
#    .\scripts\start-all.ps1 -Blockchain      Include Hyperledger Besu node
#    .\scripts\start-all.ps1 -Build           Force Docker image rebuild
#    .\scripts\start-all.ps1 -Seed            Run DB migrations + seeds after start
# =============================================================================

param(
    [switch]$Blockchain,
    [switch]$Build,
    [switch]$Seed
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# Colours
function Write-Ok($msg)   { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "  [ERROR] $msg" -ForegroundColor Red }
function Write-Step($n, $msg) { Write-Host "[$n/6] $msg" -ForegroundColor Green }

function Wait-Healthy {
    param([string]$Container, [string]$Name, [int]$TimeoutSec = 60)
    Write-Host "        Waiting for $Name" -NoNewline
    $elapsed = 0
    while ($elapsed -lt $TimeoutSec) {
        $status = docker inspect --format='{{.State.Health.Status}}' $Container 2>$null
        if ($status -eq "healthy") {
            Write-Host ""
            Write-Ok "$Name is ready."
            return $true
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
    Write-Host ""
    Write-Warn "$Name health check timed out after ${TimeoutSec}s."
    return $false
}

# Banner
Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  IEBC Voting System - Start All Services" -ForegroundColor Cyan
Write-Host "  Mode: Docker" -ForegroundColor Cyan
if ($Blockchain) { Write-Host "  Blockchain: ENABLED (Hyperledger Besu)" -ForegroundColor Cyan }
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# Pre-flight
if (-not (Test-Path ".env.docker")) {
    Write-Warn ".env.docker not found - copying from .env.example"
    if (Test-Path ".env.example") { Copy-Item ".env.example" ".env.docker" }
}
if (-not (Test-Path ".env")) {
    Write-Host "  [WARN] .env not found - copying from .env.example" -ForegroundColor Yellow
    if (Test-Path ".env.example") { Copy-Item ".env.example" ".env" }
}

# Step 1: Docker check
Write-Step 1 "Checking Docker..."
try { docker info --format='{{.ServerVersion}}' | Out-Null } catch {
    Write-Err "Docker is not running. Please start Docker Desktop."
    exit 1
}
Write-Ok "Docker is running."

# Step 2: Pull images
Write-Host ""
Write-Step 2 "Pulling latest images (if needed)..."
docker-compose pull --ignore-pull-failures 2>$null | Out-Null

# Step 3: Start infrastructure
Write-Host ""
Write-Step 3 "Starting infrastructure (PostgreSQL, Redis, RabbitMQ)..."
$infraArgs = @("up", "-d", "postgres", "redis", "rabbitmq")
if ($Blockchain) { $infraArgs += @("--profile", "blockchain") }
& docker-compose @infraArgs
if ($LASTEXITCODE -ne 0) {
    Write-Err "Failed to start infrastructure services."
    exit 1
}

# Step 4: Wait for infrastructure
Write-Host ""
Write-Step 4 "Waiting for infrastructure health checks..."
Wait-Healthy "voting-postgres" "PostgreSQL" 60 | Out-Null
Wait-Healthy "voting-redis" "Redis" 30 | Out-Null
Wait-Healthy "voting-rabbitmq" "RabbitMQ" 90 | Out-Null

# Step 5: Start backend FIRST, then frontend
Write-Host ""
Write-Step 5 "Starting Backend API..."
$buildArgs = @("up", "-d")
if ($Build) { $buildArgs += "--build" }
$buildArgs += "backend"
& docker-compose @buildArgs
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Backend failed. Attempting rebuild..."
    docker-compose up -d --build backend
}
Write-Ok "Backend container started."

Write-Host "        Waiting for Backend to become healthy (up to 90s)..."
Wait-Healthy "voting-backend" "Backend API" 90 | Out-Null

Write-Host ""
Write-Host "        Starting Frontend..."
docker-compose up -d frontend
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Frontend failed. Retrying in 10s..."
    Start-Sleep -Seconds 10
    docker-compose up -d frontend
}
Write-Ok "Frontend container started."

Write-Host "        Waiting for Frontend to become healthy (up to 60s)..."
Wait-Healthy "voting-frontend" "Frontend" 60 | Out-Null

# Step 6: Optional seed
Write-Host ""
if ($Seed) {
    Write-Step 6 "Running database migrations and seeds..."
    docker-compose exec backend npm run migration:run
    docker-compose exec backend npm run seed:all
    Write-Ok "Database seeded successfully."
} else {
    Write-Step 6 "Skipping seed (use -Seed to auto-seed)."
}

# Summary
Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  ALL SERVICES STARTED SUCCESSFULLY" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Service                          URL                         Status"
Write-Host "  -----------------------------------------------------------------------"
Write-Host "  Frontend (Next.js)             http://localhost:3000            " -NoNewline; Write-Host "Running" -ForegroundColor Green
Write-Host "  Backend API (NestJS)           http://localhost:3001            " -NoNewline; Write-Host "Running" -ForegroundColor Green
Write-Host "  API Docs (Swagger)             http://localhost:3001/docs       " -NoNewline; Write-Host "Running" -ForegroundColor Green
Write-Host "  PostgreSQL                     localhost:5432                   " -NoNewline; Write-Host "Running" -ForegroundColor Green
Write-Host "  Redis                          localhost:6379                   " -NoNewline; Write-Host "Running" -ForegroundColor Green
Write-Host "  RabbitMQ AMQP                  localhost:5672                   " -NoNewline; Write-Host "Running" -ForegroundColor Green
Write-Host "  RabbitMQ Management UI         http://localhost:15672           " -NoNewline; Write-Host "Running" -ForegroundColor Green
Write-Host ""
Write-Host "  Useful commands:" -ForegroundColor Yellow
Write-Host "    docker-compose logs -f              View all logs"
Write-Host "    docker-compose logs -f backend      View backend logs"
Write-Host "    docker-compose ps                   Check service status"
Write-Host "    .\scripts\stop-all.ps1              Stop all services"
Write-Host ""
Write-Host "  Default credentials:" -ForegroundColor Yellow
Write-Host "    DB:       postgres / postgres"
Write-Host "    RabbitMQ: guest / guest"
Write-Host ""

# Auto-open browser
Write-Host "  Opening browser..." -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"
Start-Process "http://localhost:3001/docs"

Write-Host "===============================================================================" -ForegroundColor Cyan
