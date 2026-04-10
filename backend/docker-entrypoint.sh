#!/bin/sh
# =============================================================================
# Backend Entrypoint Script
# =============================================================================
# This script runs before the backend starts and handles:
# - Waiting for database to be ready
# - Running database migrations
# - Seeding data (optional)
# - Starting the application
# =============================================================================

set -e

echo "========================================"
echo "Starting Backend Entrypoint Script"
echo "========================================"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Wait for Redis to be ready (if configured)
if [ -n "$REDIS_HOST" ]; then
  echo "Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."
  while ! nc -z $REDIS_HOST ${REDIS_PORT:-6379}; do
    sleep 1
  done
  echo "Redis is ready!"
fi

# Run database migrations (skip in development if using sync)
if [ "$NODE_ENV" = "production" ] || [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run migration:run || echo "Migration failed or already up to date"
fi

# Run seeds if specified
if [ "$RUN_SEEDS" = "true" ]; then
  echo "Running database seeds..."
  npm run seed:all || echo "Seeding completed or failed"
fi

echo "========================================"
echo "Starting application..."
echo "========================================"

# Execute the main command
exec "$@"
