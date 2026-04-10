# Docker Setup Guide

This guide covers running the Voting System using Docker Compose.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Docker Compose v2.0 or higher
- At least 4GB of free RAM

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
# Linux/Mac
cp .env.example .env

# Windows
copy .env.example .env
```

Edit `.env` and set secure passwords for:
- `DB_PASSWORD`
- `RABBITMQ_PASSWORD`
- `JWT_SECRET`

### 2. Start the Services

Using the helper script:

```bash
# Linux/Mac
./scripts/docker-cmd.sh up

# Windows
.\scripts\docker-cmd.bat up
```

Or manually:

```bash
docker-compose up -d
```

### 3. Access the Application

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Main web application |
| Backend API | http://localhost:3001/v1 | REST API endpoint |
| API Documentation | http://localhost:3001/v1/docs | Swagger/OpenAPI docs |
| RabbitMQ | http://localhost:15672 | Management UI (guest/guest) |

## Services Overview

| Service | Description | Health Check |
|---------|-------------|--------------|
| `postgres` | PostgreSQL 16 database | Built-in |
| `redis` | Redis 7 cache | Built-in |
| `rabbitmq` | RabbitMQ message queue | Built-in |
| `backend` | NestJS API server | `/v1/health/live` |
| `frontend` | Next.js frontend | `/` (root) |
| `besu` | (Optional) Hyperledger Besu blockchain | `localhost:8545` |

## Common Commands

### Using Helper Scripts

```bash
# Start all services
./scripts/docker-cmd.sh up

# Stop all services
./scripts/docker-cmd.sh down

# View logs
./scripts/docker-cmd.sh logs

# Restart services
./scripts/docker-cmd.sh restart

# Rebuild images
./scripts/docker-cmd.sh build

# Run database migrations
./scripts/docker-cmd.sh db-migrate

# Run database seeds
./scripts/docker-cmd.sh db-seed

# Open shell in backend
./scripts/docker-cmd.sh shell-backend

# Open shell in frontend
./scripts/docker-cmd.sh shell-frontend

# Clean up everything (WARNING: deletes data!)
./scripts/docker-cmd.sh clean
```

### Manual Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Rebuild after dependency changes
docker-compose build --no-cache

# Run migrations
docker-compose exec backend npm run migration:run

# Run seeds
docker-compose exec backend npm run seed:all

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Development Workflow

### Hot Reload

Both frontend and backend support hot reloading:
- **Frontend**: Changes to React components are automatically reflected
- **Backend**: NestJS restarts automatically on file changes

### Installing New Dependencies

```bash
# Backend
docker-compose exec backend npm install <package>
docker-compose restart backend

# Frontend
docker-compose exec frontend npm install <package>
docker-compose restart frontend
```

### Running Database Migrations

```bash
# Generate a new migration
docker-compose exec backend npm run migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
docker-compose exec backend npm run migration:run

# Revert last migration
docker-compose exec backend npm run migration:revert
```

## Production Deployment

For production, use multi-stage builds:

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Or build manually:

```bash
# Backend
cd backend
docker build --target production -t voting-backend:latest .

# Frontend
cd frontend
docker build --target runner -t voting-frontend:latest .
```

## Troubleshooting

### Services Won't Start

Check logs:
```bash
docker-compose logs -f
```

### Database Connection Issues

Ensure PostgreSQL is healthy:
```bash
docker-compose ps
docker-compose logs postgres
```

### Port Already in Use

Change ports in `.env`:
```env
FRONTEND_PORT=3002
BACKEND_PORT=3003
```

### Volume Permission Issues (Linux)

```bash
sudo chown -R $USER:$USER .
```

### Clear All Data

⚠️ **Warning: This deletes all data!**

```bash
docker-compose down -v
docker volume prune
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `DB_PASSWORD` | PostgreSQL password | (required) |
| `JWT_SECRET` | JWT signing key | (required) |
| `RABBITMQ_PASSWORD` | RabbitMQ password | (required) |
| `FRONTEND_PORT` | Frontend port | `3000` |
| `BACKEND_PORT` | Backend port | `3001` |

### Resource Limits

Default limits in `docker-compose.yml`:
- **Backend**: 2GB RAM limit, 512MB reserved
- **Frontend**: 1GB RAM limit, 256MB reserved

## Blockchain (Optional)

To enable the Hyperledger Besu blockchain node:

```bash
docker-compose --profile blockchain up -d
```

This adds the `besu` service for blockchain integration.

## Health Checks

All services have health checks configured:

| Service | Endpoint | Interval |
|---------|----------|----------|
| Backend | `/v1/health/live` | 30s |
| Frontend | `/` | 30s |
| PostgreSQL | `pg_isready` | 10s |
| Redis | `redis-cli ping` | 10s |
| RabbitMQ | `rabbitmq-diagnostics` | 30s |

## Networking

Services communicate via the `voting-network` Docker network:
- Internal DNS: `postgres`, `redis`, `rabbitmq`, `backend`, `frontend`
- No external access to database/cache services

## Security Notes

- Backend runs as non-root user (`nodejs`)
- Frontend runs as non-root user (`nextjs`)
- Environment files are excluded from builds (`.dockerignore`)
- Use strong passwords in production
- JWT secret should be at least 32 characters
