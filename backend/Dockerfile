# ==================== BUILD STAGE ====================
# Multi-stage build to keep final image small
FROM node:20-alpine AS builder

WORKDIR /app

# Docker runtime defaults for service discovery
ENV IN_DOCKER=true \
  DB_HOST=postgres \
  DB_PORT=5432 \
  DB_USER=postgres \
  DB_PASSWORD=postgres \
  DB_NAME=jugaad_nights \
  REDIS_HOST=redis \
  REDIS_PORT=6379

# Install build dependencies (if needed)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# ==================== PRODUCTION STAGE ====================
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force && \
    chown -R nestjs:nodejs /app

# Copy built application from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check - verify API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application (Node.js handles signals natively)
CMD ["node", "dist/main"]
