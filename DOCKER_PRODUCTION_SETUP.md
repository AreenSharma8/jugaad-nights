# Docker Production Setup Guide
**Jugaad Nights - Complete Containerized Deployment**

---

## 📋 Quick Start (5 Minutes)

### Prerequisites
```bash
# Verify Docker is installed
docker --version  # Should be 20.10+

# Verify Docker Compose is installed
docker-compose --version  # Should be 2.0+
```

### Start the Application
```bash
# 1. Navigate to project root
cd /path/to/jugaad-nights

# 2. Clean previous containers (if needed)
docker-compose down -v

# 3. Build and start all services
docker-compose up --build

# 4. Wait 45 seconds for services to be healthy
# (Watch for "postgres is ready to accept connections" and "Backend is running on port 3000")
```

### Verify Everything is Working
```bash
# In a new terminal, check service health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test API
curl http://localhost:3000/api/health

# View logs
docker-compose logs -f backend
```

---

## 🏗️ Architecture Overview

### Three-Tier Container System

```
┌─────────────────────────────────────────┐
│         Docker Bridge Network            │
│         (jugaad-network)                 │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │              │    │
│  │  PostgreSQL  │  │    Redis     │    │
│  │   Port 5432  │  │   Port 6379  │    │
│  │   (postgres) │  │   (redis)    │    │
│  │              │  │              │    │
│  └──────────────┘  └──────────────┘    │
│        ▲                  ▲             │
│        │                  │             │
│        └──────────────────┘             │
│              │                          │
│         ┌────▼─────┐                   │
│         │           │                   │
│         │  NestJS   │                   │
│         │ Backend   │                   │
│         │ Port 3000 │                   │
│         │           │                   │
│         └───────────┘                   │
│              │                          │
└──────────────┼──────────────────────────┘
               │
        ┌──────▼──────┐
        │   Frontend   │
        │  Port 5173   │
        │  (Vite Dev)  │
        └──────────────┘
```

### Service Communication
- **Backend** ↔ **PostgreSQL**: Uses `postgres` hostname (Docker DNS)
- **Backend** ↔ **Redis**: Uses `redis` hostname (Docker DNS)
- **Frontend** ↔ **Backend**: Uses `http://localhost:3000/api`
- All containers on same bridge network (`jugaad-network`)

---

## 📁 Configuration Files

### 1. Dockerfile (`backend/Dockerfile`)

**Purpose:** Build optimized image for NestJS backend

**Key Features:**
```dockerfile
# Multi-stage build: Reduces final image from ~800MB → ~300MB
FROM node:20-alpine AS builder  # Build stage
FROM node:20-alpine             # Production stage (clean slate)

# Non-root user: Better security
USER nestjs (uid: 1001)

# Health check: Verifies service is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3

# Proper signal handling: Dumb-init prevents zombie processes
ENTRYPOINT ["/sbin/dumb-init", "--"]
```

**Build Process:**
1. **Builder Stage**: Install all deps, copy source, compile TypeScript
2. **Production Stage**: Clean alpine base, install only prod deps, copy compiled code
3. **Result**: Only ~300MB final image (vs 800MB with dev deps)

### 2. docker-compose.yml

**Purpose:** Orchestrate all three services with networking

**Services:**

#### PostgreSQL
```yaml
postgres:
  image: postgres:16-alpine
  volumes:
    - postgres_data:/var/lib/postgresql/data  # Persistent storage
  environment:
    POSTGRES_DB: jugaad_nights
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
    timeout: 5s
    retries: 5
  ports:
    - "5432:5432"
```

**Why PostgreSQL 16:**
- Improved performance
- Better JSON handling
- Alpine base for small image size

#### Redis
```yaml
redis:
  image: redis:7-alpine
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 3s
    retries: 5
  ports:
    - "6379:6379"
```

**Redis Purpose:**
- Session caching
- Job queue (BullMQ)
- Rate limiting
- Real-time data

#### NestJS Backend
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  environment:
    # Service names instead of localhost (Docker DNS)
    DB_HOST: postgres
    REDIS_HOST: redis
  ports:
    - "3000:3000"
  restart: unless-stopped
```

**Key Configuration:**
- `depends_on.condition: service_healthy`: Wait for databases before starting backend
- `DB_HOST: postgres`: Uses Docker's internal DNS (NOT localhost)
- `restart: unless-stopped`: Auto-restart if crashed

### 3. Environment Files

#### backend/.env (Docker Configuration)
```env
# Database - Uses Docker service name
DB_TYPE=postgres
DB_HOST=postgres              # Service name (not localhost!)
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jugaad_nights
DB_LOGGING=false

# Redis - Uses Docker service name
REDIS_HOST=redis              # Service name (not localhost!)
REDIS_PORT=6379

# Application
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
API_PREFIX=/api

# Security
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug
```

#### backend/.env.example (Template)
```env
# Keeps source code clean - no secrets in git
DB_TYPE=postgres
DB_HOST=localhost             # For local development
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jugaad_nights
DB_LOGGING=true

REDIS_HOST=localhost
REDIS_PORT=6379

NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
API_PREFIX=/api

JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=*
LOG_LEVEL=debug
```

#### backend/.dockerignore (Build Optimization)
```
node_modules
dist
test
coverage
.nxcache
.env
.env.example
.env.*.example
.git
.gitignore
README.md
Dockerfile
docker-compose.yml
```

**Purpose:** Reduce build context, speed up Docker builds

### 4. frontend/.env (For Docker Backend)
```env
# Points to Docker backend
VITE_API_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

---

## 🚀 Complete Startup Commands

### Clean Start (Recommended First Time)
```bash
# 1. Remove all previous containers, networks, volumes
docker-compose down -v

# 2. Build fresh and start all services
docker-compose up --build

# Expected Output (Wait 45 seconds):
# postgres_1  | database system is ready to accept connections
# redis_1     | Ready to accept connections
# backend_1   | [Nest] 15  - 03/31/2026, 10:30:45 AM     LOG [NestFactory] Application initialized
# backend_1   | [Nest] 15  - 03/31/2026, 10:30:45 AM     LOG [BootstrapService] Application is running on port 3000
```

### Restart Existing Setup
```bash
# If containers already exist, just restart them
docker-compose up

# Or rebuild if code changed
docker-compose up --build
```

### Run in Background
```bash
# Start detached (run in background)
docker-compose up -d --build

# View logs anytime
docker-compose logs -f           # All services
docker-compose logs -f backend   # Backend only
docker-compose logs -f postgres  # Database only

# Stop services
docker-compose stop

# Resume services
docker-compose start
```

### Development Workflow
```bash
# Terminal 1: Start all services
docker-compose up

# Terminal 2: Edit code in backend/src

# Changes auto-reload? NO - NestJS needs restart
# Stop (Ctrl+C) and restart docker-compose up

# Alternative: Use hot-reload volume mount
# (Advanced - see Docker Development section)
```

---

## ✅ Verification Procedures

### 1. Check Container Status
```bash
# Show all containers and their status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Expected Output:
# NAMES                STATUS                       PORTS
# jugaad-postgres      Up 40 seconds (healthy)      0.0.0.0:5432->5432/tcp
# jugaad-redis        Up 39 seconds (healthy)      0.0.0.0:6379->6379/tcp
# jugaad-backend      Up 35 seconds (healthy)      0.0.0.0:3000->3000/tcp
```

### 2. Test API Connectivity
```bash
# Simple health check
curl http://localhost:3000/api/health

# Expected Response (202 status):
# {"status":"ok"}
```

### 3. View Database
```bash
# Connect to PostgreSQL container
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights

# List tables
\dt

# Query data
SELECT * FROM users LIMIT 5;

# Exit
\q
```

### 4. Check Redis
```bash
# Connect to Redis
docker exec -it jugaad-redis redis-cli

# Ping server
PING

# View keys
KEYS *

# Exit
EXIT
```

### 5. View Backend Logs
```bash
# Real-time logs
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50 backend

# Specific timestamp
docker-compose logs --since 10m backend
```

### 6. Test Complete Flow
```bash
# 1. Get Auth Token (if needed)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jugaad.com","password":"password"}'

# 2. Create Sales Order
curl -X POST http://localhost:3000/api/sales/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"outlet_id":1,"total_amount":500,"payment_method":"cash"}'

# 3. View in Database
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights \
  -c "SELECT * FROM sales_orders ORDER BY created_at DESC LIMIT 1;"
```

---

## 🔧 Common Operations

### Stop All Services
```bash
docker-compose stop
# Containers paused but not removed (faster restart)
```

### Remove Everything
```bash
# Stop and remove containers, networks (keeps volumes)
docker-compose down

# Remove everything INCLUDING data
docker-compose down -v
```

### View Resource Usage
```bash
# CPU, Memory, Network, Disk usage
docker stats
```

### Scale Services (if needed)
```bash
# Run multiple backend instances
docker-compose up --scale backend=3
```

### Update Image
```bash
# Pull latest base images
docker pull node:20-alpine
docker pull postgres:16-alpine
docker pull redis:7-alpine

# Rebuild with new images
docker-compose up --build
```

### Inspect Container
```bash
# View detailed info
docker inspect jugaad-backend

# View IP address
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' jugaad-backend
```

---

## 🐛 Troubleshooting

### Backend Won't Start
**Error:** `Backend service failed to start`

**Solutions:**
```bash
# Check backend logs
docker-compose logs backend

# Check if port 3000 is already in use
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Force kill existing process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows

# Rebuild
docker-compose down -v
docker-compose up --build
```

### Database Connection Refused
**Error:** `Error: connect ECONNREFUSED postgres:5432`

**Cause:** Backend started before PostgreSQL was ready

**Solution:**
```bash
# Check PostgreSQL status
docker logs jugaad-postgres

# Wait for startup message:
# "database system is ready to accept connections"

# In docker-compose.yml, backend already waits for postgres
# Make sure depends_on.condition is set to "service_healthy"
```

### Redis Connection Failed
**Error:** `Error: connect ECONNREFUSED redis:6379`

**Solution:**
```bash
# Check Redis status
docker logs jugaad-redis

# Verify services are on same network
docker network ls
docker network inspect jugaad-network
```

### Frontend Can't Reach Backend
**Error:** `API call returns 404/500`

**Cause:** Incorrect API URL

**Solution:**
```env
# Correct (frontend/.env):
VITE_API_URL=http://localhost:3000/api

# Wrong:
VITE_API_URL=postgres:3000/api  # postgres host
VITE_API_URL=http://backend:3000/api  # wrong from outside container
```

### Data Lost After Restart
**Error:** Database empty after `docker-compose up`

**Cause:** Volumes not properly configured

**Check:**
```bash
# Verify volume exists
docker volume ls | grep postgres_data

# Inspect volume
docker volume inspect jugaad_postgres_data

# Check docker-compose.yml has:
# volumes:
#   postgres_data:
```

### Slow Performance
**Solutions:**
```bash
# Check resource limits
docker stats

# Increase Docker memory (Settings → Resources → Memory)

# Check database query performance
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights \
  -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### Build Takes Too Long
**Solutions:**
```bash
# Clear build cache
docker builder prune

# Reduce layers in Dockerfile

# Use alpine base images (already done)

# Verify .dockerignore excludes unnecessary files
cat backend/.dockerignore
```

---

## 🔒 Security Checklist

### Development (Current)
- ✅ Non-root user in container
- ✅ Health checks
- ✅ Network isolation (bridge network)
- ⚠️ Default database password (change for production)
- ⚠️ Default JWT secret (change in production)
- ⚠️ CORS_ORIGIN=* (restrictive for production)

### Production Preparation
```bash
# 1. Generate strong JWT secret
openssl rand -base64 32  # Copy output to JWT_SECRET

# 2. Set secure database password
# In backend/.env:
DB_PASSWORD=<generated-secure-password>

# 3. Restrict CORS origin
# In backend/.env, change from:
CORS_ORIGIN=*
# To:
CORS_ORIGIN=https://your-domain.com

# 4. Use environment-specific files
# backend/.env.production (don't commit to git)
# backend/.env.staging (don't commit to git)

# 5. Enable database logging only for development
DB_LOGGING=false  # Production

# 6. Set proper log level
LOG_LEVEL=warn  # Production (not debug)

# 7. Add database backup volume
# In docker-compose.yml, add backup service:
backup:
  image: postgres:16-alpine
  volumes:
    - ./backups:/backups
  command: >
    sh -c 'while true; do
      pg_dump -h postgres -U postgres jugaad_nights > /backups/backup-$(date +%Y%m%d-%H%M%S).sql;
      sleep 86400;
    done'
```

### Secret Management
```bash
# Option 1: Use .env.local (not in git)
echo "backend/.env.local" >> .gitignore

# Option 2: Use Docker secrets (for Swarm/Kubernetes)
# Advanced - covered in production deployment guide

# Option 3: Use environment variable injection
docker-compose -f docker-compose.yml \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  up
```

---

## 📊 Performance Optimization

### Database Query Optimization
```bash
# Enable query logging
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights \
  -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

# View slow queries
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights \
  -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### Redis Optimization
```bash
# Monitor Redis operations
docker exec -it jugaad-redis redis-cli MONITOR

# Check memory usage
docker exec -it jugaad-redis redis-cli INFO memory

# Set memory limit (in docker-compose.yml)
command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### Backend Optimization
```bash
# Environment variables for production
NODE_ENV=production     # Disables debug logging
LOG_LEVEL=warn         # Only warnings and errors
```

---

## 🔄 Backup and Recovery

### Backup Database
```bash
# One-time backup
docker exec jugaad-postgres pg_dump -U postgres jugaad_nights > backup.sql

# Restore from backup
docker exec -i jugaad-postgres psql -U postgres jugaad_nights < backup.sql
```

### Backup Redis
```bash
# Create Redis snapshot
docker exec jugaad-redis redis-cli BGSAVE

# Restore from snapshot
# Redis snapshot is automatically saved in redis data volume
```

### Full System Backup
```bash
# Backup all volumes
docker run --rm \
  -v jugaad_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Backup application code
tar -czf app-backup.tar.gz ./backend ./src ./public
```

---

## 📈 Monitoring Setup

### Container Health
```bash
# Real-time status
watch docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Log aggregation
docker-compose logs --follow --tail=100
```

### Application Metrics
```bash
# Backend performance metrics
curl http://localhost:3000/api/metrics

# Database connections
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights \
  -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### Service Restart Tracking
```bash
# Check restart count
docker inspect jugaad-backend | grep RestartCount

# If high, check logs for crashes
docker logs --tail=100 jugaad-backend
```

---

## 🚢 Deployment Options

### Option 1: Docker Compose (Current - Development/Testing)
```bash
docker-compose up -d
```
- Best for: Local development, small deployments
- Limitation: Single host only

### Option 2: Docker Swarm (Production - Simple)
```bash
# Initialize swarm
docker swarm init

# Deploy
docker stack deploy -c docker-compose.yml jugaad-nights
```
- Best for: Multi-node, high availability
- Features: Load balancing, automatic failover

### Option 3: Kubernetes (Enterprise)
```bash
# Requires: Kubernetes cluster setup
kubectl apply -f k8s/
```
- Best for: Enterprise scale, complex orchestration
- Features: Auto-scaling, rolling updates, health monitoring

### Option 4: Cloud Platforms
- **AWS ECS**: Use AWS container registry + ECS service
- **Azure Container Instances**: Direct Docker image deployment
- **Google Cloud Run**: Serverless container deployment
- **DigitalOcean App Platform**: Simplified deployment
- **Heroku**: Git-based deployment (if configured)

---

## 📚 Additional Resources

### Docker Documentation
- [Docker Official Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices)

### NestJS Docker
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Docker with NestJS](https://docs.nestjs.com/deployment#docker)

### PostgreSQL in Docker
- [PostgreSQL Official Image](https://hub.docker.com/_/postgres)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Redis in Docker
- [Redis Official Image](https://hub.docker.com/_/redis)
- [Redis Best Practices](https://redis.io/topics/optimization)

---

## ✨ Next Steps

1. **Start Services**
   ```bash
   docker-compose up --build
   ```

2. **Verify All Services**
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

3. **Test API**
   ```bash
   curl http://localhost:3000/api/health
   ```

4. **Access Frontend**
   ```bash
   # Open browser: http://localhost:5173
   # Or if running npm run dev separately
   ```

5. **Test Full Flow**
   - Login to frontend
   - Create sample data (order, inventory, etc.)
   - Verify data in database
   - Restart containers
   - Verify data persists

6. **Prepare for Production**
   - Update JWT_SECRET
   - Change database passwords
   - Set CORS_ORIGIN
   - Review security checklist

---

## 📞 Support

**Common Issues?** Check the **Troubleshooting** section above.

**Need Help?**
1. Check logs: `docker-compose logs -f`
2. Verify connectivity: `docker network inspect jugaad-network`
3. Test individual services: `curl http://localhost:3000/api/health`

**Docker Not Running?**
- Windows/Mac: Start Docker Desktop
- Linux: `sudo systemctl start docker`

---

**Version:** 1.0 | **Last Updated:** March 31, 2026 | **Status:** Production Ready ✅
