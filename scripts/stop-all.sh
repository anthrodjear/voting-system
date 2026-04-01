#!/usr/bin/env bash
# =============================================================================
#  Voting System - Stop All Services (Unix/Linux/macOS)
# =============================================================================
#  Gracefully shuts down all services in the correct dependency order.
#
#  Usage:
#    ./scripts/stop-all.sh                 Stop Docker containers (preserves data)
#    ./scripts/stop-all.sh --local         Kill locally-running Node processes
#    ./scripts/stop-all.sh --volumes       Stop and REMOVE all data volumes
#    ./scripts/stop-all.sh --force         Force kill all related processes
# =============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ── Colours ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Parse flags ───────────────────────────────────────────────────────────────
MODE="docker"
REMOVE_VOLUMES=""
FORCE_KILL=""

for arg in "$@"; do
    case "$arg" in
        --local)   MODE="local" ;;
        --docker)  MODE="docker" ;;
        --volumes) REMOVE_VOLUMES="1" ;;
        --force)   FORCE_KILL="1" ;;
        --help|-h)
            echo "Usage: $0 [--local|--docker] [--volumes] [--force]"
            exit 0
            ;;
    esac
done

# ── Helpers ───────────────────────────────────────────────────────────────────
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}===============================================================================${NC}"
echo -e "${CYAN}  IEBC Voting System - Stop All Services${NC}"
echo -e "${CYAN}  Mode: ${MODE}${NC}"
[ -n "$REMOVE_VOLUMES" ] && echo -e "${RED}  WARNING: Data volumes will be DELETED!${NC}"
echo -e "${CYAN}===============================================================================${NC}"
echo ""

# =============================================================================
#  DOCKER MODE
# =============================================================================
if [ "$MODE" = "docker" ]; then

    if ! docker info &>/dev/null; then
        info "Docker daemon is not running. Nothing to stop."
        exit 0
    fi

    RUNNING=$(docker-compose ps --services --filter "status=running" 2>/dev/null)
    if [ -z "$RUNNING" ]; then
        ok "No Docker containers are running."
    else

        echo -e "${GREEN}[1/4]${NC} Stopping application services (frontend, backend)..."
        echo "        Sending graceful shutdown signals..."
        docker-compose stop frontend backend 2>/dev/null || true
        ok "Application services stopped."

        echo ""
        echo -e "${GREEN}[2/4]${NC} Stopping infrastructure services..."
        echo "        Allowing RabbitMQ to flush messages..."
        docker-compose stop rabbitmq 2>/dev/null || true
        ok "RabbitMQ stopped."
        docker-compose stop redis 2>/dev/null || true
        ok "Redis stopped."
        docker-compose stop postgres 2>/dev/null || true
        ok "PostgreSQL stopped."

        # Stop optional blockchain node
        docker-compose --profile blockchain stop besu 2>/dev/null || true
    fi

    echo ""
    if [ -n "$REMOVE_VOLUMES" ]; then
        echo -e "${RED}[3/3]${NC} Removing containers AND data volumes..."
        docker-compose down --volumes --remove-orphans 2>/dev/null || true
        ok "All containers and volumes removed."
        echo ""
        warn "All database data, Redis cache, and RabbitMQ messages have been deleted."
        echo "       Run ./scripts/start-all.sh --seed to repopulate the database."
    else
        echo -e "${GREEN}[3/3]${NC} Removing stopped containers (data volumes preserved)..."
        docker-compose down --remove-orphans 2>/dev/null || true
        ok "Containers removed. Data volumes preserved."
        echo ""
        echo -e "${YELLOW}[TIP]${NC}  To also delete all data: ./scripts/stop-all.sh --volumes"
    fi

    if [ -n "$FORCE_KILL" ]; then
        echo ""
        echo -e "${YELLOW}[FORCE]${NC} Killing any remaining processes on voting system ports..."
        for port in 3000 3001 5432 6379 5672; do
            pid=$(lsof -ti :"$port" 2>/dev/null || true)
            if [ -n "$pid" ]; then
                kill -9 "$pid" 2>/dev/null || true
                ok "Killed process on port $port (PID $pid)"
            fi
        done
    fi

# =============================================================================
#  LOCAL MODE
# =============================================================================
else

    echo -e "${GREEN}[1/3]${NC} Stopping local development processes..."

    # Kill via saved PIDs
    if [ -f ".pids-backend" ]; then
        BPID=$(cat .pids-backend)
        if kill -0 "$BPID" 2>/dev/null; then
            kill "$BPID" 2>/dev/null || true
            ok "Backend process stopped (PID $BPID)"
        fi
        rm -f .pids-backend
    fi

    if [ -f ".pids-frontend" ]; then
        FPID=$(cat .pids-frontend)
        if kill -0 "$FPID" 2>/dev/null; then
            kill "$FPID" 2>/dev/null || true
            ok "Frontend process stopped (PID $FPID)"
        fi
        rm -f .pids-frontend
    fi

    # Kill by process name patterns
    echo -e "${GREEN}[2/3]${NC} Killing Node.js processes on voting system ports..."

    for port in 3000 3001; do
        pid=$(lsof -ti :"$port" 2>/dev/null || true)
        if [ -n "$pid" ]; then
            kill "$pid" 2>/dev/null || true
            ok "Killed process on port $port (PID $pid)"
        fi
    done

    # Kill nest start / next dev processes
    pkill -f "nest start --watch" 2>/dev/null && ok "Killed NestJS dev process." || true
    pkill -f "next dev" 2>/dev/null && ok "Killed Next.js dev process." || true

    echo ""
    echo -e "${GREEN}[3/3]${NC} Infrastructure services (Docker) not stopped in local mode."
    echo -e "${YELLOW}[INFO]${NC} To stop them too: docker-compose stop postgres redis rabbitmq"
    echo "       Or run: ./scripts/stop-all.sh --docker"
fi

# =============================================================================
#  SUMMARY
# =============================================================================
echo ""
echo -e "${CYAN}===============================================================================${NC}"
echo -e "${CYAN}  ALL SERVICES STOPPED${NC}"
echo -e "${CYAN}===============================================================================${NC}"
echo ""

if [ "$MODE" = "docker" ]; then
    if [ -n "$REMOVE_VOLUMES" ]; then
        echo -e "  ${RED}Data volumes DELETED.${NC}"
        echo -e "  To start fresh:  ./scripts/start-all.sh --seed"
    else
        echo -e "  ${GREEN}Containers stopped. Data volumes preserved.${NC}"
        echo -e "  To start again:  ./scripts/start-all.sh"
        echo -e "  To delete data:  ./scripts/stop-all.sh --volumes"
    fi
else
    echo -e "  ${GREEN}Local development processes killed.${NC}"
    echo -e "  Infrastructure (Docker) still running."
    echo -e "  To start again:  ./scripts/start-all.sh --local"
fi

echo ""
echo -e "  ${YELLOW}Port status:${NC}"
for port in 3000 3001 5432 6379 5672; do
    if lsof -ti :"$port" &>/dev/null; then
        echo -e "    Port $port: ${YELLOW}STILL IN USE${NC}"
    else
        echo -e "    Port $port: ${GREEN}FREE${NC}"
    fi
done
echo ""
echo -e "${CYAN}===============================================================================${NC}"
