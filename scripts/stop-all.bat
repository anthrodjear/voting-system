@echo off
setlocal enabledelayedexpansion

:: =============================================================================
::  Voting System - Stop All Services
:: =============================================================================
::  Gracefully shuts down all services in the correct dependency order.
::
::  Usage:
::    scripts\stop-all.bat                 Stop Docker containers (preserves data)
::    scripts\stop-all.bat --local         Kill locally-running Node processes
::    scripts\stop-all.bat --volumes       Stop and REMOVE all data volumes
::    scripts\stop-all.bat --force         Force kill all related processes
:: =============================================================================

set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

:: ── Parse flags ──────────────────────────────────────────────────────────────
set "MODE=docker"
set "REMOVE_VOLUMES="
set "FORCE_KILL="

for %%a in (%*) do (
    if "%%a"=="--local"      set "MODE=local"
    if "%%a"=="--docker"     set "MODE=docker"
    if "%%a"=="--volumes"    set "REMOVE_VOLUMES=1"
    if "%%a"=="--force"      set "FORCE_KILL=1"
)

set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "CYAN=[96m"
set "RESET=[0m"

echo.
echo %CYAN%===============================================================================%RESET%
echo %CYAN%  IEBC Voting System - Stop All Services%RESET%
echo %CYAN%  Mode: %MODE%%RESET%
if defined REMOVE_VOLUMES echo %RED%  WARNING: Data volumes will be DELETED!%RESET%
echo %CYAN%===============================================================================%RESET%
echo.

:: =============================================================================
::  DOCKER MODE
:: =============================================================================
if "%MODE%"=="docker" goto :docker_stop
goto :local_stop

:docker_stop

:: Check Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%[INFO]%RESET% Docker daemon is not running. Nothing to stop.
    goto :stop_local_processes
)

echo %GREEN%[1/4]%RESET% Checking running containers...
docker-compose ps --services --filter "status=running" 2>nul >nul
if errorlevel 1 (
    echo %GREEN%[OK]%RESET%   No Docker containers are running.
    goto :stop_local_processes
)

echo.
echo %GREEN%[2/4]%RESET% Stopping application services (frontend, backend)...
echo        Sending graceful shutdown signals...
docker-compose stop frontend backend 2>nul
echo %GREEN%[OK]%RESET%   Application services stopped.

echo.
echo %GREEN%[3/4]%RESET% Stopping infrastructure services (RabbitMQ, Redis, PostgreSQL)...
echo        Allowing RabbitMQ to flush messages...
docker-compose stop rabbitmq 2>nul
echo %GREEN%  [OK]%RESET% RabbitMQ stopped.
docker-compose stop redis 2>nul
echo %GREEN%  [OK]%RESET% Redis stopped.
docker-compose stop postgres 2>nul
echo %GREEN%  [OK]%RESET% PostgreSQL stopped.

:: Stop optional blockchain node
docker-compose --profile blockchain stop besu 2>nul

echo.
if defined REMOVE_VOLUMES (
    echo %RED%[4/4]%RESET% Removing containers AND data volumes...
    docker-compose down --volumes --remove-orphans 2>nul
    echo %GREEN%[OK]%RESET%   All containers and volumes removed.
    echo.
    echo %YELLOW%[NOTE]%RESET% All database data, Redis cache, and RabbitMQ messages have been deleted.
    echo        Run scripts\start-all.bat --seed to repopulate the database.
) else (
    echo %GREEN%[4/4]%RESET% Removing stopped containers (data volumes preserved)...
    docker-compose down --remove-orphans 2>nul
    echo %GREEN%[OK]%RESET%   Containers removed. Data volumes preserved.
    echo.
    echo %YELLOW%[TIP]%RESET%  To also delete all data: scripts\stop-all.bat --volumes
)

goto :cleanup_processes

:: =============================================================================
::  LOCAL MODE
:: =============================================================================
:local_stop

echo %GREEN%[1/3]%RESET% Finding running Node.js processes for this project...

:: Kill Backend (NestJS) processes
set "backend_killed=0"
for /f "tokens=2 delims=," %%p in ('wmic process where "name='node.exe' and commandline like '%%nest start%%'" get processid /format:csv 2^>nul ^| findstr /r "[0-9]"') do (
    echo %GREEN%  [KILL]%RESET% Backend process (PID %%p)
    taskkill /PID %%p /F >nul 2>&1
    set "backend_killed=1"
)
for /f "tokens=2 delims=," %%p in ('wmic process where "name='node.exe' and commandline like '%%voting-system-backend%%'" get processid /format:csv 2^>nul ^| findstr /r "[0-9]"') do (
    echo %GREEN%  [KILL]%RESET% Backend process (PID %%p)
    taskkill /PID %%p /F >nul 2>&1
    set "backend_killed=1"
)
if !backend_killed! equ 0 echo %GREEN%  [OK]%RESET%   No backend processes found.

:: Kill Frontend (Next.js) processes
set "frontend_killed=0"
for /f "tokens=2 delims=," %%p in ('wmic process where "name='node.exe' and commandline like '%%next dev%%'" get processid /format:csv 2^>nul ^| findstr /r "[0-9]"') do (
    echo %GREEN%  [KILL]%RESET% Frontend process (PID %%p)
    taskkill /PID %%p /F >nul 2>&1
    set "frontend_killed=1"
)
for /f "tokens=2 delims=," %%p in ('wmic process where "name='node.exe' and commandline like '%%voting-system-frontend%%'" get processid /format:csv 2^>nul ^| findstr /r "[0-9]"') do (
    echo %GREEN%  [KILL]%RESET% Frontend process (PID %%p)
    taskkill /PID %%p /F >nul 2>&1
    set "frontend_killed=1"
)
if !frontend_killed! equ 0 echo %GREEN%  [OK]%RESET%   No frontend processes found.

echo.
echo %GREEN%[2/3]%RESET% Checking for processes on voting system ports...

:: Kill anything on port 3001 (Backend)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING" 2^>nul') do (
    echo %GREEN%  [KILL]%RESET% Process on port 3001 (PID %%p)
    taskkill /PID %%p /F >nul 2>&1
)

:: Kill anything on port 3000 (Frontend)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING" 2^>nul') do (
    echo %GREEN%  [KILL]%RESET% Process on port 3000 (PID %%p)
    taskkill /PID %%p /F >nul 2>&1
)

echo %GREEN%[OK]%RESET%   Ports cleared.

echo.
echo %GREEN%[3/3]%RESET% Checking if Docker infrastructure should also stop...
echo %YELLOW%[INFO]%RESET% In local mode, infrastructure services (PostgreSQL, Redis, RabbitMQ)
echo        running in Docker are NOT stopped automatically.
echo        To stop them too: docker-compose stop postgres redis rabbitmq
echo        Or run: scripts\stop-all.bat --docker

goto :summary

:: =============================================================================
::  CLEANUP PROCESSES (force kill stragglers)
:: =============================================================================
:cleanup_processes

if defined FORCE_KILL (
    echo.
    echo %YELLOW%[FORCE]%RESET% Killing any remaining processes on voting system ports...

    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING" 2^>nul') do (
        taskkill /PID %%p /F >nul 2>&1
    )
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING" 2^>nul') do (
        taskkill /PID %%p /F >nul 2>&1
    )
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5432" ^| findstr "LISTENING" 2^>nul') do (
        taskkill /PID %%p /F >nul 2>&1
    )
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":6379" ^| findstr "LISTENING" 2^>nul') do (
        taskkill /PID %%p /F >nul 2>&1
    )
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5672" ^| findstr "LISTENING" 2^>nul') do (
        taskkill /PID %%p /F >nul 2>&1
    )

    echo %GREEN%[OK]%RESET%   Force cleanup complete.
)

:stop_local_processes

:: Also clean up any Node windows opened by start-all.bat
for /f "tokens=2 delims=," %%p in ('wmic process where "name='cmd.exe' and commandline like '%%Voting Backend%%'" get processid /format:csv 2^>nul ^| findstr /r "[0-9]"') do (
    taskkill /PID %%p /F >nul 2>&1
)
for /f "tokens=2 delims=," %%p in ('wmic process where "name='cmd.exe' and commandline like '%%Voting Frontend%%'" get processid /format:csv 2^>nul ^| findstr /r "[0-9]"') do (
    taskkill /PID %%p /F >nul 2>&1
)

:: =============================================================================
::  SUMMARY
:: =============================================================================
:summary
echo.
echo %CYAN%===============================================================================%RESET%
echo %CYAN%  ALL SERVICES STOPPED%RESET%
echo %CYAN%===============================================================================%RESET%
echo.

if "%MODE%"=="docker" (
    if defined REMOVE_VOLUMES (
        echo   %RED%Data volumes DELETED.%RESET%
        echo   To start fresh:  scripts\start-all.bat --seed
    ) else (
        echo   %GREEN%Containers stopped. Data volumes preserved.%RESET%
        echo   To start again:  scripts\start-all.bat
        echo   To delete data:  scripts\stop-all.bat --volumes
    )
) else (
    echo   %GREEN%Local development processes killed.%RESET%
    echo   Infrastructure (Docker) still running.
    echo   To start again:  scripts\start-all.bat --local
)

echo.
echo   %YELLOW%Port status:%RESET%
for %%p in (3000 3001 5432 6379 5672) do (
    netstat -ano | findstr ":%%p" | findstr "LISTENING" >nul 2>&1
    if errorlevel 1 (
        echo     Port %%p: %GREEN%FREE%RESET%
    ) else (
        echo     Port %%p: %YELLOW%STILL IN USE%RESET%
    )
)
echo.
echo %CYAN%===============================================================================%RESET%

endlocal
