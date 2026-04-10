# =============================================================================
# Stage 1: Base - Development dependencies
# =============================================================================
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for native modules and networking tools
RUN apk add --no-cache python3 make g++ git netcat-openbsd

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --legacy-peer-deps

# =============================================================================
# Stage 2: Development - Watch mode with hot reload
# =============================================================================
FROM base AS development

# Install networking tools for health checks and waiting
RUN apk add --no-cache netcat-openbsd

# Copy source code
COPY . .

# Set permissions for entrypoint script
RUN chmod +x docker-entrypoint.sh 2>/dev/null || true

# Expose the application port
EXPOSE 3001

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/v1/health/live || exit 1

# Use entrypoint script for development
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]

# =============================================================================
# Stage 3: Builder - Production build
# =============================================================================
FROM base AS builder

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# Stage 4: Production - Production dependencies only, non-root user
# =============================================================================
FROM node:20-alpine AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Copy necessary configuration files for production
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/nest-cli.json ./

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3001

# Install wget for health check
USER root
RUN apk add --no-cache wget
USER nodejs

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/v1/health/live || exit 1

# Start the application
CMD ["node", "dist/main.js"]
