@echo off
setlocal enabledelayedexpansion

:: =============================================================================
::  Voting System - Start All Services
:: =============================================================================
::  Blockchain Voting Platform (Kenya IEBC-Inspired)
::
::  Services:
::    1. PostgreSQL 15         - port 5432
::    2. Redis 7               - port 6379
::    3. RabbitMQ 3            - ports 5672 / 15672 (management UI)
::    4. Backend API (NestJS)  - port 3001
::    5. Frontend (Next.js)    - port 3000
::    6. Hyperledger Besu      - ports 8545/8546/30303  (optional, --blockchain)
::
::  Usage:
::    scripts\start-all.bat                 Start via Docker Compose (default)
::    scripts\start-all.bat --local         Start services natively (needs PG/Redis/RabbitMQ installed)
::    scripts\start-all.bat --blockchain    Include Hyperledger Besu node
::    scripts\start-all.bat --build         Force Docker image rebuild
::    scripts\start-all.bat --seed          Run DB migrations + seeds after start
:: =============================================================================

set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

:: ── Parse flags ──────────────────────────────────────────────────────────────
set "MODE=docker"
set "BLOCKCHAIN="
set "BUILD_FLAG="
set "SEED_FLAG="

for %%a in (%*) do (
    if "%%a"=="--local"       set "MODE=local"
    if "%%a"=="--docker"      set "MODE=docker"
    if "%%a"=="--blockchain"  set "BLOCKCHAIN=--profile blockchain"
    if "%%a"=="--build"       set "BUILD_FLAG=--build"
    if "%%a"=="--seed"        set "SEED_FLAG=1"
)

:: ── Colours (ANSI codes where supported) ─────────────────────────────────────
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "CYAN=[96m"
set "RESET=[0m"

echo.
echo %CYAN%===============================================================================%RESET%
echo %CYAN%  IEBC Voting System - Start All Services%RESET%
echo %CYAN%  Mode: %MODE%%RESET%
if defined BLOCKCHAIN echo %CYAN%  Blockchain: ENABLED (Hyperledger Besu)%RESET%
echo %CYAN%===============================================================================%RESET%
echo.

:: ── Pre-flight checks ────────────────────────────────────────────────────────

:: Check .env files exist
if not exist ".env.docker" (
    echo %YELLOW%[WARN]%RESET% .env.docker not found - copying from .env.example
    if exist ".env.example" (
        copy ".env.example" ".env.docker" >nul
    ) else (
        echo %RED%[ERROR]%RESET% No .env.example found. Please create environment configuration.
        exit /b 1
    )
)

if not exist ".env" (
    echo %YELLOW%[WARN]%RESET% .env not found - copying from .env.example
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
    )
)

:: =============================================================================
::  DOCKER MODE
:: =============================================================================
if "%MODE%"=="docker" goto :docker_mode
goto :local_mode

:docker_mode
echo %GREEN%[1/6]%RESET% Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%RESET% Docker is not installed or not in PATH.
    echo        Install Docker Desktop: https://docs.docker.com/desktop/windows/
    exit /b 1
)
docker info >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%RESET% Docker daemon is not running. Please start Docker Desktop.
    exit /b 1
)
echo %GREEN%[OK]%RESET%   Docker is running.

echo.
echo %GREEN%[2/6]%RESET% Pulling latest images (if needed)...
docker-compose pull --ignore-pull-failures 2>nul

echo.
echo %GREEN%[3/6]%RESET% Starting infrastructure (PostgreSQL, Redis, RabbitMQ)...
docker-compose up -d postgres redis rabbitmq %BLOCKCHAIN%
if errorlevel 1 (
    echo %RED%[ERROR]%RESET% Failed to start infrastructure services.
    exit /b 1
)

echo.
echo %GREEN%[4/6]%RESET% Waiting for infrastructure health checks...
echo        This may take up to 60 seconds...

:: Wait for PostgreSQL (using docker inspect)
echo|set /p="        PostgreSQL"
set /a attempts=0
:wait_pg
set /a attempts+=1
if %attempts% gtr 30 (
    echo.
    echo %RED%[ERROR]%RESET% PostgreSQL did not become healthy in time.
    docker-compose logs postgres
    exit /b 1
)
for /f "tokens=*" %%s in ('docker inspect --format="{{.State.Health.Status}}" voting-postgres 2^>nul') do set "pg_health=%%s"
if not "%pg_health%"=="healthy" (
    echo|set /p="."
    timeout /t 2 /nobreak >nul
    goto :wait_pg
)
echo.
echo %GREEN%  [OK]%RESET% PostgreSQL is ready.

:: Wait for Redis (using docker inspect)
echo|set /p="        Redis"
set /a attempts=0
:wait_redis
set /a attempts+=1
if %attempts% gtr 15 (
    echo.
    echo %RED%[ERROR]%RESET% Redis did not become healthy in time.
    exit /b 1
)
for /f "tokens=*" %%s in ('docker inspect --format="{{.State.Health.Status}}" voting-redis 2^>nul') do set "redis_health=%%s"
if not "%redis_health%"=="healthy" (
    echo|set /p="."
    timeout /t 2 /nobreak >nul
    goto :wait_redis
)
echo.
echo %GREEN%  [OK]%RESET% Redis is ready.

:: Wait for RabbitMQ (using docker inspect)
echo|set /p="        RabbitMQ"
set /a attempts=0
:wait_rmq
set /a attempts+=1
if %attempts% gtr 30 (
    echo.
    echo %YELLOW%[WARN]%RESET% RabbitMQ health check timed out (non-critical, continuing)...
    goto :rmq_done
)
for /f "tokens=*" %%s in ('docker inspect --format="{{.State.Health.Status}}" voting-rabbitmq 2^>nul') do set "rmq_health=%%s"
if not "%rmq_health%"=="healthy" (
    echo|set /p="."
    timeout /t 2 /nobreak >nul
    goto :wait_rmq
)
echo.
echo %GREEN%  [OK]%RESET% RabbitMQ is ready.
:rmq_done

echo.
echo %GREEN%[5/6]%RESET% Starting Backend API...
docker-compose up -d %BUILD_FLAG% backend
if errorlevel 1 (
    echo %YELLOW%[WARN]%RESET% Backend failed to start. Attempting rebuild...
    docker-compose up -d --build backend
    if errorlevel 1 (
        echo %RED%[ERROR]%RESET% Failed to start backend even after rebuild.
        docker-compose logs backend
        exit /b 1
    )
)

:: Wait for backend using Docker health check
echo        Waiting for Backend API (up to 90s)...
set /a attempts=0
:wait_backend
set /a attempts+=1
if %attempts% gtr 45 (
    echo %YELLOW%[WARN]%RESET% Backend health check timed out. Starting frontend anyway...
    goto :start_frontend
)
for /f "tokens=*" %%s in ('docker inspect --format="{{.State.Health.Status}}" voting-backend 2^>nul') do set "backend_health=%%s"
if "%backend_health%"=="healthy" (
    echo.
    echo %GREEN%  [OK]%RESET% Backend API is ready.
    goto :start_frontend
)
echo|set /p="."
timeout /t 2 /nobreak >nul
goto :wait_backend

:start_frontend
echo.
echo        Starting Frontend...
docker-compose up -d frontend
if errorlevel 1 (
    echo %YELLOW%[WARN]%RESET% Frontend failed to start. It may need backend healthy first.
    echo        Trying again after 10s...
    timeout /t 10 /nobreak >nul
    docker-compose up -d frontend
)

:: Wait for frontend using Docker health check
echo        Waiting for Frontend (up to 60s)...
set /a attempts=0
:wait_frontend
set /a attempts+=1
if %attempts% gtr 30 (
    echo %YELLOW%[WARN]%RESET% Frontend health check timed out. Check logs with: docker-compose logs frontend
    goto :frontend_done
)
for /f "tokens=*" %%s in ('docker inspect --format="{{.State.Health.Status}}" voting-frontend 2^>nul') do set "frontend_health=%%s"
if "%frontend_health%"=="healthy" (
    echo.
    echo %GREEN%  [OK]%RESET% Frontend is ready.
    goto :frontend_done
)
echo|set /p="."
timeout /t 2 /nobreak >nul
goto :wait_frontend
:frontend_done

:: Optional blockchain
if defined BLOCKCHAIN (
    echo.
    echo        Waiting for Hyperledger Besu (may take 60s+)...
    set /a attempts=0
    :wait_besu
    set /a attempts+=1
    if %attempts% gtr 40 (
        echo %YELLOW%[WARN]%RESET% Besu health check timed out. Check logs with: docker-compose logs besu
        goto :besu_done
    )
    curl -sf http://localhost:8545 >nul 2>&1
    if errorlevel 1 (
        echo|set /p="."
        timeout /t 3 /nobreak >nul
        goto :wait_besu
    )
    echo.
    echo %GREEN%  [OK]%RESET% Hyperledger Besu is ready.
    :besu_done
)

:: Optional seed
if defined SEED_FLAG (
    echo.
    echo %GREEN%[6/6]%RESET% Running database migrations and seeds...
    docker-compose exec backend npm run migration:run
    docker-compose exec backend npm run seed:all
    echo %GREEN%[OK]%RESET%   Database seeded successfully.
) else (
    echo.
    echo %GREEN%[6/6]%RESET% Skipping seed (use --seed to auto-seed).
)

goto :summary

:: =============================================================================
::  LOCAL MODE
:: =============================================================================
:local_mode
echo %GREEN%[INFO]%RESET% Running in LOCAL mode - services must be installed natively.
echo.

:: Check prerequisites
echo %GREEN%[1/6]%RESET% Checking prerequisites...

where node >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%RESET% Node.js not found. Install Node.js 20+ from https://nodejs.org
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo %GREEN%[OK]%RESET%   Node.js %%v

where npm >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%RESET% npm not found.
    exit /b 1
)

:: Check PostgreSQL
echo|set /p="Checking PostgreSQL..."
docker exec voting-postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    psql --version >nul 2>&1
    if errorlevel 1 (
        echo.
        echo %RED%[ERROR]%RESET% PostgreSQL not accessible. Start it via Docker or install locally.
        echo        Quick fix: docker-compose up -d postgres
        exit /b 1
    )
    echo %GREEN%[OK]%RESET% (native)
) else (
    echo %GREEN%[OK]%RESET% (Docker container)
)

:: Check Redis
echo|set /p="Checking Redis..."
docker exec voting-redis redis-cli ping 2>nul | findstr "PONG" >nul
if errorlevel 1 (
    redis-cli ping 2>nul | findstr "PONG" >nul
    if errorlevel 1 (
        echo.
        echo %RED%[ERROR]%RESET% Redis not accessible. Start it via Docker or install locally.
        echo        Quick fix: docker-compose up -d redis
        exit /b 1
    )
    echo %GREEN%[OK]%RESET% (native)
) else (
    echo %GREEN%[OK]%RESET% (Docker container)
)

:: Check RabbitMQ (non-fatal warning)
echo|set /p="Checking RabbitMQ..."
docker exec voting-rabbitmq rabbitmq-diagnostics check_running >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%[WARN]%RESET% RabbitMQ not running (non-critical for development).
) else (
    echo %GREEN%[OK]%RESET% (Docker container)
)

echo.
echo %GREEN%[2/6]%RESET% Installing dependencies...
if not exist "backend\node_modules" (
    echo        Installing backend dependencies...
    call npm install --prefix backend
) else (
    echo %GREEN%[OK]%RESET%   Backend dependencies already installed.
)
if not exist "frontend\node_modules" (
    echo        Installing frontend dependencies...
    call npm install --prefix frontend
) else (
    echo %GREEN%[OK]%RESET%   Frontend dependencies already installed.
)

echo.
echo %GREEN%[3/6]%RESET% Running database migrations...
cd backend
call npm run migration:run
cd ..

if defined SEED_FLAG (
    echo.
    echo %GREEN%[4/6]%RESET% Seeding database...
    cd backend
    call npm run seed:all
    cd ..
) else (
    echo.
    echo %GREEN%[4/6]%RESET% Skipping seed (use --seed to auto-seed).
)

echo.
echo %GREEN%[5/6]%RESET% Starting Backend API (NestJS) on port 3001...
start "Voting Backend" cmd /k "cd /d %PROJECT_ROOT%\backend && npm run start:dev"

:: Give backend a head start
timeout /t 5 /nobreak >nul

echo.
echo %GREEN%[6/6]%RESET% Starting Frontend (Next.js) on port 3000...
start "Voting Frontend" cmd /k "cd /d %PROJECT_ROOT%\frontend && npm run dev"

goto :summary

:: =============================================================================
::  SUMMARY
:: =============================================================================
:summary
echo.
echo %CYAN%===============================================================================%RESET%
echo %CYAN%  ALL SERVICES STARTED SUCCESSFULLY%RESET%
echo %CYAN%===============================================================================%RESET%
echo.
echo   %GREEN%Service%RESET%                          %GREEN%URL%RESET%                         %GREEN%Status%RESET%
echo   -----------------------------------------------------------------------
echo   Frontend (Next.js)             http://localhost:3000            %GREEN%Running%RESET%
echo   Backend API (NestJS)           http://localhost:3001            %GREEN%Running%RESET%
echo   API Docs (Swagger)             http://localhost:3001/docs       %GREEN%Running%RESET%
echo   PostgreSQL                     localhost:5432                   %GREEN%Running%RESET%
echo   Redis                          localhost:6379                   %GREEN%Running%RESET%
echo   RabbitMQ AMQP                  localhost:5672                   %GREEN%Running%RESET%
echo   RabbitMQ Management UI         http://localhost:15672           %GREEN%Running%RESET%
if defined BLOCKCHAIN (
echo   Besu JSON-RPC                  http://localhost:8545            %GREEN%Running%RESET%
echo   Besu WebSocket                 ws://localhost:8546              %GREEN%Running%RESET%
)
echo.
echo   %YELLOW%Useful commands:%RESET%
if "%MODE%"=="docker" (
    echo     docker-compose logs -f              View all logs
    echo     docker-compose logs -f backend      View backend logs
    echo     docker-compose ps                   Check service status
    echo     scripts\stop-all.bat                Stop all services
) else (
    echo     Check the opened terminal windows for Backend and Frontend logs.
    echo     scripts\stop-all.bat                Stop all services
)
echo.
echo   %YELLOW%Default credentials:%RESET%
echo     DB:       postgres / postgres
echo     RabbitMQ: guest / guest
echo.
echo %GREEN%[OPEN]%RESET% Launching browser...
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
start "" "http://localhost:3001/docs"

echo.
echo %CYAN%===============================================================================%RESET%

endlocal
