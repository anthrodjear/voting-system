@echo off
REM =============================================================================
REM Docker Helper Script for Windows
REM =============================================================================

echo Voting System Docker Management Script
echo ======================================
echo.

if "%~1"=="" goto :help
if "%~1"=="help" goto :help
if "%~1"=="up" goto :up
if "%~1"=="down" goto :down
if "%~1"=="build" goto :build
if "%~1"=="logs" goto :logs
if "%~1"=="restart" goto :restart
if "%~1"=="clean" goto :clean
if "%~1"=="shell-backend" goto :shell_backend
if "%~1"=="shell-frontend" goto :shell_frontend
if "%~1"=="db-migrate" goto :db_migrate
if "%~1"=="db-seed" goto :db_seed
goto :help

:help
echo Usage: docker-cmd.bat [command]
echo.
echo Commands:
echo   up              - Start all services in detached mode
echo   down            - Stop and remove all containers
echo   build           - Rebuild all images
echo   logs            - Follow logs from all services
echo   restart         - Restart all services
echo   clean           - Stop and remove all containers, volumes, and images
echo   shell-backend   - Open a shell in the backend container
echo   shell-frontend  - Open a shell in the frontend container
echo   db-migrate      - Run database migrations
echo   db-seed         - Run database seeds
echo.
goto :end

:up
echo Starting all services...
docker-compose up -d
echo.
echo Services should be available at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001/v1
echo   RabbitMQ: http://localhost:15672
goto :end

:down
echo Stopping all services...
docker-compose down
goto :end

:build
echo Building all images...
docker-compose build --no-cache
goto :end

:logs
echo Following logs (Press Ctrl+C to exit)...
docker-compose logs -f
goto :end

:restart
echo Restarting all services...
docker-compose restart
goto :end

:clean
echo WARNING: This will remove all containers, volumes, and images!
set /p confirm="Are you sure? (yes/no): "
if /i "%confirm%"=="yes" (
    docker-compose down -v --rmi all
    echo Cleaned up all Docker resources.
) else (
    echo Cancelled.
)
goto :end

:shell_backend
echo Opening shell in backend container...
docker-compose exec backend sh
goto :end

:shell_frontend
echo Opening shell in frontend container...
docker-compose exec frontend sh
goto :end

:db_migrate
echo Running database migrations...
docker-compose exec backend npm run migration:run
goto :end

:db_seed
echo Running database seeds...
docker-compose exec backend npm run seed:all
goto :end

:end
