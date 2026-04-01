#!/usr/bin/env bash
# =============================================================================
#  Voting System - Start All Services (Unix/Linux/macOS)
# =============================================================================
#  Blockchain Voting Platform (Kenya IEBC-Inspired)
#
#  Services:
#    1. PostgreSQL 15         - port 5432
#    2. Redis 7               - port 6379
#    3. RabbitMQ 3            - ports 5672 / 15672 (management UI)
#    4. Backend API (NestJS)  - port 3001
#    5. Frontend (Next.js)    - port 3000
#    6. Hyperledger Besu      - ports 8545/8546/30303  (optional, --blockchain)
#
#  Usage:
#    ./scripts/start-all.sh                 Start via Docker Compose (default)
#    ./scripts/start-all.sh --local         Start services natively
#    ./scripts/start-all.sh --blockchain    Include Hyperledger Besu node
#    ./scripts/start-all.sh --build         Force Docker image rebuild
#    ./scripts/start-all.sh --seed          Run DB migrations + seeds after start
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ── Colours ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

# ── Parse flags ───────────────────────────────────────────────────────────────
MODE="docker"
BLOCKCHAIN=""
BUILD_FLAG=""
SEED_FLAG=""

for arg in "$@"; do
    case "$arg" in
        --local)      MODE="local" ;;
        --docker)     MODE="docker" ;;
        --blockchain) BLOCKCHAIN="--profile blockchain" ;;
        --build)      BUILD_FLAG="--build" ;;
        --seed)       SEED_FLAG="1" ;;
        --help|-h)
            echo "Usage: $0 [--local|--docker] [--blockchain] [--build] [--seed]"
            exit 0
            ;;
    esac
done

# ── Helper functions ──────────────────────────────────────────────────────────
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

wait_for_port() {
    local host="$1" port="$2" name="$3" timeout="${4:-60}"
    local elapsed=0
    echo -n "        Waiting for $name..."
    while ! (echo > /dev/tcp/"$host"/"$port") 2>/dev/null; do
        if [ $elapsed -ge "$timeout" ]; then
            echo ""
            warn "$name did not become ready in ${timeout}s."
            return 1
        fi
        echo -n "."
        sleep 2
        elapsed=$((elapsed + 2))
    done
    echo ""
    ok "$name is ready (port $port)."
}

wait_for_container_healthy() {
    local container="$1" name="$2" timeout="${3:-60}"
    local elapsed=0
    echo -n "        Waiting for $name health check..."
    while [ "$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)" != "healthy" ]; do
        if [ $elapsed -ge "$timeout" ]; then
            echo ""
            warn "$name health check timed out after ${timeout}s."
            return 1
        fi
        echo -n "."
        sleep 2
        elapsed=$((elapsed + 2))
    done
    echo ""
    ok "$name is healthy."
}

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}===============================================================================${NC}"
echo -e "${CYAN}  IEBC Voting System - Start All Services${NC}"
echo -e "${CYAN}  Mode: ${MODE}${NC}"
[ -n "$BLOCKCHAIN" ] && echo -e "${CYAN}  Blockchain: ENABLED (Hyperledger Besu)${NC}"
echo -e "${CYAN}===============================================================================${NC}"
echo ""

# ── Pre-flight checks ────────────────────────────────────────────────────────
if [ ! -f ".env.docker" ]; then
    warn ".env.docker not found - copying from .env.example"
    [ -f ".env.example" ] && cp ".env.example" ".env.docker"
fi

if [ ! -f ".env" ]; then
    warn ".env not found - copying from .env.example"
    [ -f ".env.example" ] && cp ".env.example" ".env"
fi

# =============================================================================
#  DOCKER MODE
# =============================================================================
if [ "$MODE" = "docker" ]; then

    echo -e "${GREEN}[1/6]${NC} Checking Docker..."
    if ! command -v docker &>/dev/null; then
        err "Docker is not installed. Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    if ! docker info &>/dev/null; then
        err "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    ok "Docker is running."

    echo ""
    echo -e "${GREEN}[2/6]${NC} Pulling latest images (if needed)..."
    docker-compose pull --ignore-pull-failures 2>/dev/null || true

    echo ""
    echo -e "${GREEN}[3/6]${NC} Starting infrastructure (PostgreSQL, Redis, RabbitMQ)..."
    docker-compose up -d postgres redis rabbitmq $BLOCKCHAIN

    echo ""
    echo -e "${GREEN}[4/6]${NC} Waiting for infrastructure health checks..."

    wait_for_container_healthy "voting-postgres" "PostgreSQL" 60
    wait_for_container_healthy "voting-redis" "Redis" 30
    wait_for_container_healthy "voting-rabbitmq" "RabbitMQ" 90 || warn "RabbitMQ timed out (non-critical, continuing)..."

    echo ""
    echo -e "${GREEN}[5/6]${NC} Starting Backend API and Frontend..."
    if ! docker-compose up -d $BUILD_FLAG backend frontend; then
        warn "Startup failed, attempting rebuild..."
        docker-compose up -d --build backend frontend
    fi

    # Wait for backend
    wait_for_port "localhost" "3001" "Backend API" 90 || true
    # Wait for frontend
    wait_for_port "localhost" "3000" "Frontend" 60 || true

    # Optional blockchain
    if [ -n "$BLOCKCHAIN" ]; then
        echo ""
        echo "        Waiting for Hyperledger Besu (may take 60s+)..."
        wait_for_port "localhost" "8545" "Besu JSON-RPC" 120 || true
    fi

    # Optional seed
    echo ""
    if [ -n "$SEED_FLAG" ]; then
        echo -e "${GREEN}[6/6]${NC} Running database migrations and seeds..."
        docker-compose exec backend npm run migration:run
        docker-compose exec backend npm run seed:all
        ok "Database seeded successfully."
    else
        echo -e "${GREEN}[6/6]${NC} Skipping seed (use --seed to auto-seed)."
    fi

# =============================================================================
#  LOCAL MODE
# =============================================================================
else

    echo -e "${GREEN}[INFO]${NC} Running in LOCAL mode - services must be installed natively."
    echo ""

    echo -e "${GREEN}[1/6]${NC} Checking prerequisites..."

    if ! command -v node &>/dev/null; then
        err "Node.js not found. Install Node.js 20+: https://nodejs.org"
        exit 1
    fi
    ok "Node.js $(node --version)"

    if ! command -v npm &>/dev/null; then
        err "npm not found."
        exit 1
    fi

    # Check PostgreSQL
    echo -n "Checking PostgreSQL..."
    if docker exec voting-postgres pg_isready -U postgres &>/dev/null; then
        echo -e " ${GREEN}[OK]${NC} (Docker container)"
    elif command -v pg_isready &>/dev/null && pg_isready &>/dev/null; then
        echo -e " ${GREEN}[OK]${NC} (native)"
    else
        echo ""
        err "PostgreSQL not accessible. Start it via Docker or install locally."
        echo "       Quick fix: docker-compose up -d postgres"
        exit 1
    fi

    # Check Redis
    echo -n "Checking Redis..."
    if docker exec voting-redis redis-cli ping 2>/dev/null | grep -q PONG; then
        echo -e " ${GREEN}[OK]${NC} (Docker container)"
    elif command -v redis-cli &>/dev/null && redis-cli ping 2>/dev/null | grep -q PONG; then
        echo -e " ${GREEN}[OK]${NC} (native)"
    else
        echo ""
        err "Redis not accessible. Start it via Docker or install locally."
        echo "       Quick fix: docker-compose up -d redis"
        exit 1
    fi

    # Check RabbitMQ (non-fatal)
    echo -n "Checking RabbitMQ..."
    if docker exec voting-rabbitmq rabbitmq-diagnostics check_running &>/dev/null; then
        echo -e " ${GREEN}[OK]${NC} (Docker container)"
    else
        echo -e " ${YELLOW}[WARN]${NC} RabbitMQ not running (non-critical for development)."
    fi

    echo ""
    echo -e "${GREEN}[2/6]${NC} Installing dependencies..."
    if [ ! -d "backend/node_modules" ]; then
        echo "        Installing backend dependencies..."
        npm install --prefix backend
    else
        ok "Backend dependencies already installed."
    fi

    if [ ! -d "frontend/node_modules" ]; then
        echo "        Installing frontend dependencies..."
        npm install --prefix frontend
    else
        ok "Frontend dependencies already installed."
    fi

    echo ""
    echo -e "${GREEN}[3/6]${NC} Running database migrations..."
    (cd backend && npm run migration:run)

    if [ -n "$SEED_FLAG" ]; then
        echo ""
        echo -e "${GREEN}[4/6]${NC} Seeding database..."
        (cd backend && npm run seed:all)
    else
        echo ""
        echo -e "${GREEN}[4/6]${NC} Skipping seed (use --seed to auto-seed)."
    fi

    echo ""
    echo -e "${GREEN}[5/6]${NC} Starting Backend API (NestJS) on port 3001..."
    (cd backend && npm run start:dev) &
    BACKEND_PID=$!
    echo "        Backend PID: $BACKEND_PID"

    sleep 5

    echo ""
    echo -e "${GREEN}[6/6]${NC} Starting Frontend (Next.js) on port 3000..."
    (cd frontend && npm run dev) &
    FRONTEND_PID=$!
    echo "        Frontend PID: $FRONTEND_PID"

    # Save PIDs for stop-all.sh
    echo "$BACKEND_PID" > .pids-backend
    echo "$FRONTEND_PID" > .pids-frontend

    echo ""
    echo "        Press Ctrl+C to stop both services..."
    trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .pids-backend .pids-frontend; echo ""; info "Services stopped."; exit 0' INT TERM
    wait

fi

# =============================================================================
#  SUMMARY
# =============================================================================
echo ""
echo -e "${CYAN}===============================================================================${NC}"
echo -e "${CYAN}  ALL SERVICES STARTED SUCCESSFULLY${NC}"
echo -e "${CYAN}===============================================================================${NC}"
echo ""
echo -e "  ${GREEN}Service${NC}                          ${GREEN}URL${NC}                         ${GREEN}Status${NC}"
echo -e "  -----------------------------------------------------------------------"
echo -e "  Frontend (Next.js)             http://localhost:3000            ${GREEN}Running${NC}"
echo -e "  Backend API (NestJS)           http://localhost:3001            ${GREEN}Running${NC}"
echo -e "  API Docs (Swagger)             http://localhost:3001/docs       ${GREEN}Running${NC}"
echo -e "  PostgreSQL                     localhost:5432                   ${GREEN}Running${NC}"
echo -e "  Redis                          localhost:6379                   ${GREEN}Running${NC}"
echo -e "  RabbitMQ AMQP                  localhost:5672                   ${GREEN}Running${NC}"
echo -e "  RabbitMQ Management UI         http://localhost:15672           ${GREEN}Running${NC}"
if [ -n "$BLOCKCHAIN" ]; then
echo -e "  Besu JSON-RPC                  http://localhost:8545            ${GREEN}Running${NC}"
echo -e "  Besu WebSocket                 ws://localhost:8546              ${GREEN}Running${NC}"
fi
echo ""
echo -e "  ${YELLOW}Useful commands:${NC}"
if [ "$MODE" = "docker" ]; then
echo -e "    docker-compose logs -f              View all logs"
echo -e "    docker-compose logs -f backend      View backend logs"
echo -e "    docker-compose ps                   Check service status"
echo -e "    ./scripts/stop-all.sh               Stop all services"
else
echo -e "    ./scripts/stop-all.sh --local       Stop local processes"
fi
echo ""
echo -e "  ${YELLOW}Default credentials:${NC}"
echo -e "    DB:       postgres / postgres"
echo -e "    RabbitMQ: guest / guest"
echo ""

# Auto-open browser
echo -e "${GREEN}[OPEN]${NC} Launching browser..."
sleep 2
open_url() {
    if command -v xdg-open &>/dev/null; then
        xdg-open "$1" &>/dev/null &
    elif command -v open &>/dev/null; then
        open "$1" &>/dev/null &
    elif command -v start &>/dev/null; then
        start "" "$1" &>/dev/null &
    else
        echo -e "  ${YELLOW}Open manually:${NC} $1"
    fi
}
open_url "http://localhost:3000"
open_url "http://localhost:3001/docs"

echo ""
echo -e "${CYAN}===============================================================================${NC}"
