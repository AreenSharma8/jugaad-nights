# Docker Networking Setup - Complete Guide

**Date:** March 31, 2026  
**Status:** ✅ CONFIGURED & READY  
**Purpose:** Ensure backend connects to PostgreSQL & Redis in Docker containers  

---

## 🔧 Changes Made

### ✅ Step 1: Updated `.env` File

**File:** `backend/.env`

**Changed From:** ❌
```env
DB_HOST=localhost
REDIS_HOST=localhost
```

**Changed To:** ✅
```env
DB_HOST=postgres
REDIS_HOST=redis
```

**Why:**
- Inside Docker containers, `localhost` refers to the container itself
- To reach other containers, use the **service name** from `docker-compose.yml`
- `postgres` = PostgreSQL container service name
- `redis` = Redis container service name

---

## 📋 Configuration Status

### ✅ docker-compose.yml (Already Perfect!)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: jugaad-postgres
    environment:
      POSTGRES_DB: jugaad_nights
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - jugaad-network  # 🔥 Connected to network

  redis:
    image: redis:7-alpine
    container_name: jugaad-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - jugaad-network  # 🔥 Connected to network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: jugaad-nights-backend
    depends_on:
      postgres:
        condition: service_healthy  # ✅ Waits for DB
      redis:
        condition: service_healthy   # ✅ Waits for Redis
    environment:
      DB_HOST: postgres          # ✅ Service name
      DB_PORT: 5432             # ✅ Internal port
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: jugaad_nights
      REDIS_HOST: redis         # ✅ Service name
      REDIS_PORT: 6379          # ✅ Internal port
      NODE_ENV: development
      PORT: 3000
    ports:
      - "3000:3000"
    networks:
      - jugaad-network  # 🔥 Connected to network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/docs', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 3s
      start_period: 40s
      retries: 3

volumes:
  postgres_data:  # Persistent database volume

networks:
  jugaad-network:  # 🔥 Custom network for service discovery
    driver: bridge
```

**Key Features:**
- ✅ All containers on same network (`jugaad-network`)
- ✅ Backend waits for DB to be healthy (`depends_on` with `service_healthy`)
- ✅ Backend waits for Redis to be healthy
- ✅ Persistent database volume (`postgres_data`)
- ✅ Healthchecks for reliability
- ✅ Environment variables properly set

---

## 🧪 How Docker Networking Works

### Container-to-Container Communication

```
Backend Container (jugaad-nights-backend)
        ↓
Request to "postgres:5432"
        ↓
Docker DNS resolves "postgres" → postgres container IP
        ↓
PostgreSQL Container (jugaad-postgres)
        ↑
Response with data
        ↓
Backend receives data
```

### Network Bridge

```
          Docker Bridge Network (jugaad-network)
         /         |         \
        /          |          \
   postgres      redis      backend
   (5432)       (6379)      (3000)

All containers can reach each other by service name!
```

---

## 🚀 Setup Instructions

### Step 1: Clean Up Previous Docker Setup

```bash
# Stop all containers
docker-compose down -v

# Remove old volumes (CAREFUL - deletes data!)
docker volume prune -f

# Verify nothing is running
docker ps
```

### Step 2: Start Fresh Docker Containers

```bash
# Navigate to project root
cd jugaad-nights

# Build and start all containers
docker-compose up --build

# Expected output:
# ✅ Creating jugaad-postgres
# ✅ Creating jugaad-redis
# ✅ Creating jugaad-nights-backend
```

### Step 3: Verify Containers Are Running

```bash
# Check container status
docker ps

# Expected output:
CONTAINER ID   IMAGE              PORTS          NAMES
abc123         postgres:16        5432->5432    jugaad-postgres
def456         redis:7            6379->6379    jugaad-redis
ghi789         jugaad-backend     3000->3000    jugaad-nights-backend
```

### Step 4: Check Container Logs

```bash
# Backend logs (should say: "Listening on port 3000")
docker logs jugaad-nights-backend -f

# Database logs
docker logs jugaad-postgres -f

# Redis logs
docker logs jugaad-redis -f
```

### Step 5: Verify Backend Connected to DB

```bash
# Check if backend is healthy
docker ps --format "table {{.Names}}\t{{.Status}}"

# Should show:
# jugaad-nights-backend    Up ... (healthy)
# jugaad-postgres          Up ... (healthy)
# jugaad-redis             Up ... (healthy)
```

---

## 📡 Testing Connectivity

### Test Backend → Database

```bash
# Access backend container
docker exec -it jugaad-nights-backend sh

# Inside container, try to connect to postgres
psql -h postgres -U postgres -d jugaad_nights

# If connection works, you see:
# jugaad_nights=#

# Exit psql
\q
```

### Test Backend → Redis

```bash
# Access backend container
docker exec -it jugaad-nights-backend sh

# Inside container, try to connect to redis
redis-cli -h redis -p 6379

# If connection works, you see:
# 127.0.0.1:6379>

# Test connection
PING

# Should return:
# PONG

# Exit redis
exit
```

### Test API Health

```bash
# From host machine
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

---

## ⚠️ Common Docker Networking Problems & Solutions

### Problem 1: `ECONNREFUSED` on Port 5432

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Cause:** Using `localhost` or `127.0.0.1` inside container (wrong!)

**Solution:**
```env
# ❌ WRONG
DB_HOST=localhost
DB_HOST=127.0.0.1

# ✅ CORRECT
DB_HOST=postgres
```

---

### Problem 2: Backend Starts Before Database Ready

**Symptom:**
```
Backend error: unable to connect to database
Database still initializing...
```

**Cause:** No `depends_on` or no healthcheck

**Solution:**
```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy  # ✅ Wait for health
    redis:
      condition: service_healthy
```

---

### Problem 3: "postgres" Not Found / Can't Resolve Hostname

**Symptom:**
```
Error: getaddrinfo ENOTFOUND postgres
```

**Cause:** Containers not on same network

**Solution:**
```yaml
services:
  postgres:
    networks:
      - jugaad-network  # ✅ Add network

  backend:
    networks:
      - jugaad-network  # ✅ Add network

networks:
  jugaad-network:
    driver: bridge
```

---

### Problem 4: Containers Can't Communicate

**Symptom:**
```
Backend can't reach postgres or redis
```

**Solution Check:**

```bash
# Verify network exists
docker network ls

# Should show:
# jugaad-networks

# Verify container is on network
docker network inspect jugaad-networks

# Should show all 3 containers:
# - postgres
# - redis
# - backend
```

---

### Problem 5: Database Volume Persists Issues

**Symptom:**
```
Old database data still exists
Can't start fresh
```

**Solution:**
```bash
# Clean up volumes
docker-compose down -v

# -v flag removes named volumes
# Starts fresh on next `docker-compose up`
```

---

## 🔄 Complete Docker Workflow

### Fresh Start

```bash
# 1. Clean up everything
docker-compose down -v

# 2. Build fresh
docker-compose up --build

# 3. Wait for containers to be healthy (30-45 seconds)

# 4. Verify health
docker ps --format "table {{.Names}}\t{{.Status}}"

# 5. Check logs if any errors
docker logs jugaad-nights-backend
```

### During Development

```bash
# Backend code changes → auto-rebuild (if using volume mounts)
# Or manually rebuild:
docker-compose up --build

# View logs in real-time
docker logs -f jugaad-nights-backend
```

### Stopping Containers

```bash
# Stop without removing
docker-compose stop

# Stop and remove (keep volumes)
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

---

## 📊 Port Mappings (Host → Container)

| Service | Container Port | Host Port | Purpose |
|---------|-----------------|-----------|---------|
| PostgreSQL | 5432 | 5432 | Database |
| Redis | 6379 | 6379 | Caching |
| Backend | 3000 | 3000 | API Server |

**Inside Containers:**
- Backend connects to `postgres:5432` (not `localhost:5432`)
- Backend connects to `redis:6379` (not `localhost:6379`)

**From Host:**
- Access DB: `psql -h localhost -p 5432 -U postgres`
- Access Redis: `redis-cli -h localhost -p 6379`
- Access API: `http://localhost:3000`

---

## ✅ Verification Checklist

After starting Docker containers:

- [ ] All 3 containers are running: `docker ps`
- [ ] All containers show "healthy": `docker ps --format "table {{.Names}}\t{{.Status}}"`
- [ ] Backend logs show "Listening on port 3000": `docker logs jugaad-nights-backend`
- [ ] No connection errors in backend logs
- [ ] API responds: `curl http://localhost:3000/api/health`
- [ ] Database volume exists: `docker volume ls | grep jugaad`
- [ ] Network exists: `docker network ls | grep jugaad-network`

---

## 🎯 Quick Reference

### Key Commands

```bash
# Start containers
docker-compose up -d

# Start with rebuild
docker-compose up --build -d

# View logs
docker logs jugaad-nights-backend -f

# List containers
docker ps

# Stop containers
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Execute command in container
docker exec -it jugaad-nights-backend sh

# Check network
docker network inspect jugaad-network
```

### Environment Variables Used

**In Backend Container:**
```
DB_HOST=postgres          (service name, not localhost!)
DB_PORT=5432              (container internal port)
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=jugaad_nights
REDIS_HOST=redis          (service name, not localhost!)
REDIS_PORT=6379           (container internal port)
NODE_ENV=development
PORT=3000
```

---

## 🚨 Troubleshooting Checklist

If something isn't working:

1. **Backend won't start?**
   ```bash
   docker logs jugaad-nights-backend
   # Check for DB_HOST=postgres and REDIS_HOST=redis
   ```

2. **Can't connect to database?**
   ```bash
   # Verify DB is healthy
   docker ps --format "table {{.Names}}\t{{.Status}}"
   # Check if "service_healthy" shows in backend status
   ```

3. **Redis connection error?**
   ```bash
   docker logs jugaad-redis
   # Check redis is running and healthy
   ```

4. **Port already in use?**
   ```bash
   # Kill process using port
   lsof -i :3000
   kill -9 <PID>
   # Or change port in docker-compose.yml
   ```

5. **Volume has old data?**
   ```bash
   docker-compose down -v
   # -v removes volumes
   docker-compose up
   # Fresh database
   ```

---

## 📚 Docker Networking Theory

### Why Service Names Work

Docker provides an internal DNS server that resolves service names to container IPs:

```
Request to "postgres:5432"
        ↓
Docker DNS (127.0.0.11:53)
        ↓
Lookup "postgres" in jugaad-network
        ↓
Found: Container IP 172.23.0.2
        ↓
Request forwarded to 172.23.0.2:5432
        ↓
PostgreSQL responds
```

### Network Driver: Bridge

Bridge network allows:
- ✅ Container-to-container communication by service name
- ✅ Port mapping (container port → host port)
- ✅ DNS resolution
- ✅ Isolation from other containers

---

## ✨ Summary

| Before | After |
|--------|-------|
| `DB_HOST=localhost` ❌ | `DB_HOST=postgres` ✅ |
| `REDIS_HOST=localhost` ❌ | `REDIS_HOST=redis` ✅ |
| Backend before DB ready | Backend waits for healthy DB |
| Connection refused errors | Smooth container communication |
| No persistence | Database persists in volume |
| Random issues | Reliable networking |

---

## 🎉 Ready to Test!

```bash
# Clean start
docker-compose down -v

# Fresh build and run
docker-compose up --build

# Watch logs
docker logs -f jugaad-nights-backend

# In another terminal, test
curl http://localhost:3000/api/health
```

**Expected:** All containers running, backend connected to DB, API responding! ✅

---

**Status:** ✅ DOCKER NETWORKING CONFIGURED & READY  
**Next:** Start containers and verify connectivity  
