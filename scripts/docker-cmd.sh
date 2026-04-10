#!/bin/bash
# =============================================================================
# Docker Helper Script for Linux/Mac
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

show_help() {
    echo -e "${GREEN}Voting System Docker Management Script${NC}"
    echo "======================================"
    echo ""
    echo "Usage: ./scripts/docker-cmd.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up              - Start all services in detached mode"
    echo "  down            - Stop and remove all containers"
    echo "  build           - Rebuild all images"
    echo "  logs            - Follow logs from all services"
    echo "  restart         - Restart all services"
    echo "  clean           - Stop and remove all containers, volumes, and images"
    echo "  shell-backend   - Open a shell in the backend container"
    echo "  shell-frontend  - Open a shell in the frontend container"
    echo "  db-migrate      - Run database migrations"
    echo "  db-seed         - Run database seeds"
    echo "  status          - Show status of all containers"
    echo ""
}

cmd_up() {
    echo -e "${GREEN}Starting all services...${NC}"
    docker-compose up -d
    echo ""
    echo -e "${GREEN}Services should be available at:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001/v1"
    echo "  RabbitMQ: http://localhost:15672"
}

cmd_down() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    docker-compose down
}

cmd_build() {
    echo -e "${GREEN}Building all images...${NC}"
    docker-compose build --no-cache
}

cmd_logs() {
    echo -e "${GREEN}Following logs (Press Ctrl+C to exit)...${NC}"
    docker-compose logs -f
}

cmd_restart() {
    echo -e "${YELLOW}Restarting all services...${NC}"
    docker-compose restart
}

cmd_clean() {
    echo -e "${RED}WARNING: This will remove all containers, volumes, and images!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [[ $confirm == "yes" ]]; then
        docker-compose down -v --rmi all
        echo -e "${GREEN}Cleaned up all Docker resources.${NC}"
    else
        echo "Cancelled."
    fi
}

cmd_shell_backend() {
    echo -e "${GREEN}Opening shell in backend container...${NC}"
    docker-compose exec backend sh
}

cmd_shell_frontend() {
    echo -e "${GREEN}Opening shell in frontend container...${NC}"
    docker-compose exec frontend sh
}

cmd_db_migrate() {
    echo -e "${GREEN}Running database migrations...${NC}"
    docker-compose exec backend npm run migration:run
}

cmd_db_seed() {
    echo -e "${GREEN}Running database seeds...${NC}"
    docker-compose exec backend npm run seed:all
}

cmd_status() {
    echo -e "${GREEN}Container Status:${NC}"
    docker-compose ps
}

# Main command handler
case "${1:-}" in
    up)
        cmd_up
        ;;
    down)
        cmd_down
        ;;
    build)
        cmd_build
        ;;
    logs)
        cmd_logs
        ;;
    restart)
        cmd_restart
        ;;
    clean)
        cmd_clean
        ;;
    shell-backend)
        cmd_shell_backend
        ;;
    shell-frontend)
        cmd_shell_frontend
        ;;
    db-migrate)
        cmd_db_migrate
        ;;
    db-seed)
        cmd_db_seed
        ;;
    status)
        cmd_status
        ;;
    help|""|*)
        show_help
        ;;
esac
