# =============================================================================
# Stage 1: Base - Common dependencies
# =============================================================================
FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# =============================================================================
# Stage 2: Development - Hot reload mode
# =============================================================================
FROM base AS development

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG APP_NAME

# Set environment variables for development
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3001}
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV APP_NAME="IEBC Voting System"
ENV NEXT_TELEMETRY_DISABLED=1

# Expose the application port
EXPOSE 3000

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the Next.js development server
CMD ["npm", "run", "dev"]

# =============================================================================
# Stage 3: Builder - Production build
# =============================================================================
FROM base AS builder

# Copy dependencies from base
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ARG APP_NAME

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3001/api}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
ENV APP_NAME="IEBC Voting System"
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# =============================================================================
# Stage 4: Production - Optimized production image
# =============================================================================
FROM node:20-alpine AS runner

# Install wget for health check
RUN apk add --no-cache wget

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Copy necessary config files
COPY --from=builder /app/next.config.js ./

# Copy standalone server.js if it exists, otherwise create it
# Next.js standalone output includes server.js automatically

# Change ownership of the application directory to non-root user
RUN chown nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port that Next.js runs on
EXPOSE 3000

# Set the port explicitly
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for container readiness
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the Next.js production server
CMD ["node", "server.js"]
