# ============================================================================
# BACKEND DOCKERFILE - NestJS Application
# ============================================================================
# Multi-stage Docker build for the Jugaad Nights backend API server.
# This Dockerfile optimizes for both development and production environments.
# ============================================================================

# ====== STAGE 1: BUILDER ======
# Compiles TypeScript source code to JavaScript
# Contains all build dependencies and development packages
# ====== 
FROM node:20-alpine AS builder

WORKDIR /app

# ========== ENVIRONMENT VARIABLES FOR DOCKER ==========
# These variables are used to connect to other Docker services
ENV IN_DOCKER=true \
  DB_HOST=postgres \
  DB_PORT=5432 \
  DB_USER=postgres \
  DB_PASSWORD=postgres \
  DB_NAME=jugaad_nights \
  REDIS_HOST=redis \
  REDIS_PORT=6379 \
  NODE_ENV=development

# Install build dependencies required for native modules
# python3: Required by node-gyp for building native packages
# make, g++: Required for compiling C++ extensions
# Build tools are needed for packages like bcrypt, pg
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  bash

# Copy package dependency definitions
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY .prettierrc ./
COPY eslint.config.mjs ./

# Install all dependencies (including dev dependencies needed for build)
# npm ci is used instead of npm install for reproducible builds
RUN npm ci --prefer-offline --no-audit --legacy-peer-deps

# Copy source code into builder
COPY src ./src

# Build the NestJS application
# This compiles TypeScript to JavaScript in the dist/ folder
RUN npm run build

# ====== STAGE 2: DEVELOPMENT STAGE ======
# Running environment for development with hot-reload capability
# This stage includes source code watching and debugging tools
# ======
FROM node:20-alpine AS development

WORKDIR /app

# Install runtime dependencies
# curl: Used for health checks
# bash: Required for npm scripts and startup
RUN apk add --no-cache curl bash

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY .prettierrc ./
COPY eslint.config.mjs ./

# Install all dependencies for development
RUN npm ci --prefer-offline --no-audit --legacy-peer-deps

# Copy source code for hot-reload development
COPY src ./src

# Copy development entrypoint script that handles startup
COPY docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

# Copy pre-built dist from builder stage for immediate availability
# This allows migrations and CLI commands to work without waiting for npm run start:dev
COPY --from=builder /app/dist ./dist

# Expose the API port
EXPOSE 3000

# Development health check - verify API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start NestJS in watch mode for development with dist cleanup
# This enables automatic recompilation on file changes
# The entrypoint script removes stale dist files and handles startup
ENTRYPOINT ["./docker-entrypoint.sh"]

# ====== STAGE 3: PRODUCTION STAGE ======
# Minimal production image with only runtime dependencies
# Optimized for size and security with non-root user
# ======
FROM node:20-alpine AS production

WORKDIR /app

# Install curl for health checks and bash for debugging
RUN apk add --no-cache curl bash

# Create non-root user for security (prevents running as root)
# This is a security best practice for containerized applications
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files for production dependencies
COPY package*.json ./

# Install only production dependencies
# npm ci is used for reproducible builds
# npm cache clean removes cached npm files to reduce image size
RUN npm ci --only=production --prefer-offline --no-audit --legacy-peer-deps && \
    npm cache clean --force && \
    chown -R nestjs:nodejs /app

# Copy built application from builder stage
# --chown ensures the nodejs user owns the files
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Switch to non-root user for running the application
USER nestjs

# Expose the API port
EXPOSE 3000

# Production health check - verifies API is healthy
# interval: Check every 30 seconds
# timeout: Fail if check takes longer than 10 seconds
# start_period: Wait 40 seconds before first check
# retries: Mark unhealthy after 3 failed checks
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application in production
# The CMD refers to the built JavaScript files in dist/
CMD ["node", "dist/main"]

