# =============================================================================
#  Voting System - Stop All Services (PowerShell)
# =============================================================================
#  Usage:
#    .\scripts\stop-all.ps1                 Stop Docker containers (preserves data)
#    .\scripts\stop-all.ps1 -Volumes        Stop and REMOVE all data volumes
#    .\scripts\stop-all.ps1 -Force          Force kill all related processes
# =============================================================================

param(
    [switch]$Volumes,
    [switch]$Force
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  IEBC Voting System - Stop All Services" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
if ($Volumes) { Write-Host "  WARNING: Data volumes will be DELETED!" -ForegroundColor Red }
Write-Host ""

# Check Docker
try { docker info --format='{{.ServerVersion}}' | Out-Null } catch {
    Write-Host "  [INFO] Docker is not running. Nothing to stop." -ForegroundColor Yellow
    exit 0
}

# Check running containers
$running = docker-compose ps --services --filter "status=running" 2>$null
if (-not $running) {
    Write-Host "  [OK] No Docker containers are running." -ForegroundColor Green
} else {
    Write-Host "[1/3] Stopping application services..." -ForegroundColor Green
    docker-compose stop frontend backend 2>$null
    Write-Host "  [OK] Application services stopped." -ForegroundColor Green

    Write-Host ""
    Write-Host "[2/3] Stopping infrastructure services..." -ForegroundColor Green
    docker-compose stop rabbitmq 2>$null
    Write-Host "  [OK] RabbitMQ stopped." -ForegroundColor Green
    docker-compose stop redis 2>$null
    Write-Host "  [OK] Redis stopped." -ForegroundColor Green
    docker-compose stop postgres 2>$null
    Write-Host "  [OK] PostgreSQL stopped." -ForegroundColor Green
    docker-compose --profile blockchain stop besu 2>$null
}

Write-Host ""
if ($Volumes) {
    Write-Host "[3/3] Removing containers AND data volumes..." -ForegroundColor Red
    docker-compose down --volumes --remove-orphans 2>$null
    Write-Host "  [OK] All containers and volumes removed." -ForegroundColor Green
    Write-Host ""
    Write-Host "  All database data, Redis cache, and RabbitMQ messages have been deleted." -ForegroundColor Yellow
    Write-Host "  Run .\scripts\start-all.ps1 -Seed to repopulate the database." -ForegroundColor Yellow
} else {
    Write-Host "[3/3] Removing stopped containers (data volumes preserved)..." -ForegroundColor Green
    docker-compose down --remove-orphans 2>$null
    Write-Host "  [OK] Containers removed. Data volumes preserved." -ForegroundColor Green
}

if ($Force) {
    Write-Host ""
    Write-Host "[FORCE] Killing any remaining processes on voting system ports..." -ForegroundColor Yellow
    foreach ($port in @(3000, 3001, 5432, 6379, 5672)) {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conn) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "  [KILL] Process on port $port" -ForegroundColor Green
        }
    }
}

# Summary
Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  ALL SERVICES STOPPED" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""
if ($Volumes) {
    Write-Host "  Data volumes DELETED." -ForegroundColor Red
    Write-Host "  To start fresh:  .\scripts\start-all.ps1 -Seed"
} else {
    Write-Host "  Containers stopped. Data volumes preserved." -ForegroundColor Green
    Write-Host "  To start again:  .\scripts\start-all.ps1"
    Write-Host "  To delete data:  .\scripts\stop-all.ps1 -Volumes"
}
Write-Host ""
Write-Host "  Port status:" -ForegroundColor Yellow
foreach ($port in @(3000, 3001, 5432, 6379, 5672)) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "    Port ${port}: STILL IN USE" -ForegroundColor Yellow
    } else {
        Write-Host "    Port ${port}: FREE" -ForegroundColor Green
    }
}
Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
