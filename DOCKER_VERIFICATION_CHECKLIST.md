# Docker Verification Checklist - March 31, 2026

**Purpose:** Verify Docker networking is properly configured and working  
**Time Required:** 5-10 minutes  
**Status:** Ready to verify  

---

## Pre-Start Checks

### ☐ Check 1: `.env` File Updated

```bash
cat backend/.env | grep -E "DB_HOST|REDIS_HOST"
```

**Expected Output:**
```
DB_HOST=postgres
REDIS_HOST=redis
```

**Status:** ✅ Verified in updated file

---

### ☐ Check 2: `docker-compose.yml` Verified

```bash
# Services exist
grep -E "postgres:|redis:|backend:" docker-compose.yml

# Networking configured
grep -A5 "networks:" docker-compose.yml

# Backend depends on services
grep -A10 "depends_on:" docker-compose.yml
```

**Expected:**
- ✅ postgres service
- ✅ redis service  
- ✅ backend service
- ✅ jugaad-network defined
- ✅ backend depends_on postgres and redis

**Status:** ✅ Already correctly configured

---

## Setup Steps

### ☐ Step 1: Clean Up Previous Setup

```powershell
# Stop all containers
docker-compose down -v

# Expected output: All containers removed, volumes removed
```

**Verification:**
```powershell
docker ps  # Should show no containers
```

---

### ☐ Step 2: Start Fresh Build

```powershell
# Navigate to project root
cd "c:\Users\AREEN PIHU SHARMA\OneDrive\Desktop\jugaad-nights"

# Build and start
docker-compose up --build
```

**Expected Output (watch for these lines):**
```
Building backend
[... compilation steps ...]
Successfully built ...
Successfully tagged ...
Creating jugaad-postgres
Successfully connected jugaad-postgres to the network
Creating jugaad-redis
Successfully connected jugaad-redis to the network
Creating jugaad-nights-backend
Successfully connected jugaad-nights-backend to the network

[Nest] ... LOG [NestFactory] Nest application successfully started
[Nest] ... LOG Listening on port 3000
```

**⏱️ Wait 45-60 seconds for all services to be healthy**

---

## During Runtime Checks

Open a **NEW terminal** while containers are running:

### ☐ Check 3: All Containers Running

```powershell
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE               PORTS           NAMES
abc123         postgres:16         5432->5432     jugaad-postgres
def456         redis:7             6379->6379     jugaad-redis
ghi789         jugaad-backend      3000->3000     jugaad-nights-backend
```

**Status to Check:** Each should show "Up X minutes" ✅

---

### ☐ Check 4: All Containers Healthy

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```

**Expected Output:**
```
NAMES                      STATUS
jugaad-postgres            Up 1 minute (healthy)
jugaad-redis               Up 1 minute (healthy)
jugaad-nights-backend      Up 30 seconds (healthy)
```

**✅ Verification:** All should show `(healthy)`

---

### ☐ Check 5: Backend Connected to Database

```powershell
docker logs jugaad-nights-backend | findstr "Connected\|TypeOrmCoreModule\|listening"
```

**Expected Output:**
```
[Nest] ... LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized
[Nest] ... LOG listening on port 3000
```

**✅ Verification:** Should show database connection initialized

---

### ☐ Check 6: API Health Check

```powershell
curl http://localhost:3000/api/health -UseBasicParsing
```

**Expected Output:**
```json
{"status":"ok","timestamp":"2026-03-31T..."}
```

**✅ Verification:** Should return 200 OK

---

### ☐ Check 7: Database Accessible

```powershell
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights -c "SELECT now();"
```

**Expected Output:**
```
              now
-------------------------------
 2026-03-31 07:00:00.000000+00
(1 row)
```

**✅ Verification:** Database responds with timestamp

---

### ☐ Check 8: Redis Accessible

```powershell
docker exec -it jugaad-redis redis-cli PING
```

**Expected Output:**
```
PONG
```

**✅ Verification:** Redis responds with PONG

---

### ☐ Check 9: Container Network Check

```powershell
docker network ls
```

**Expected Output:**
```
NETWORK ID     NAME              DRIVER
xxx            jugaad-network    bridge
```

**✅ Verification:** jugaad-network should exist

---

### ☐ Check 10: Network Connectivity

```powershell
# Check all containers on network
docker network inspect jugaad-network
```

**Expected Output:**
```json
{
  "Containers": {
    "abc123...": {
      "Name": "jugaad-postgres",
      "IPv4Address": "172.23.0.2/16"
    },
    "def456...": {
      "Name": "jugaad-redis",
      "IPv4Address": "172.23.0.3/16"
    },
    "ghi789...": {
      "Name": "jugaad-nights-backend",
      "IPv4Address": "172.23.0.4/16"
    }
  }
}
```

**✅ Verification:** All 3 containers on same network with IPs

---

## Functional Tests

### ☐ Test 11: Login Flow

```bash
# From frontend browser or Postman:
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "staff@jugaadnights.com",
  "password": "password123"
}
```

**Expected:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "email": "staff@jugaadnights.com",
      "role": "staff",
      "outlet_id": "..."
    },
    "token": "eyJhbGci..."
  }
}
```

**✅ Verification:** 200 OK with token

---

### ☐ Test 12: Form Submission (Sales)

From frontend:
1. Navigate to Sales
2. Click "New Order"
3. Fill form with:
   - Customer: Test Customer
   - Item: Paneer (qty: 2, price: 300)
4. Click Submit

**Expected in DevTools Network:**
```
POST /api/sales 201 Created
Response: {status: "success", data: {id: "...", customer_name: "Test Customer"}}
```

**✅ Verification:** Order appears in table immediately

---

### ☐ Test 13: Form Submission (Inventory)

From frontend:
1. Navigate to Inventory
2. Click "New Item"
3. Fill form with:
   - Name: Milk
   - Category: Dairy
   - Unit: LTR
   - Stock: 50
   - Reorder: 10
   - Cost: 80
4. Click Submit

**Expected in DevTools Network:**
```
POST /api/inventory 201 Created
Response: {status: "success", data: {id: "...", item_name: "Milk"}}
```

**✅ Verification:** Item appears in stock table immediately

---

## Log Analysis

### ☐ Check 14: Backend Logs for Errors

```powershell
docker logs jugaad-nights-backend | findstr "ERROR\|WARN" | head -20
```

**Expected:** No ERROR logs (WAR

Ns are OK)

**❌ If you see:**
```
ERROR: connect ECONNREFUSED
ERROR: getaddrinfo ENOTFOUND postgres
```

**⚠️ Problem:** DB connection failed. Check:
1. `.env` has `DB_HOST=postgres`
2. PostgreSQL container is healthy
3. Run: `docker logs jugaad-postgres`

---

### ☐ Check 15: Database Logs for Errors

```powershell
docker logs jugaad-postgres | findstr "ERROR\|FATAL" | head -10
```

**Expected:** No ERROR/FATAL logs

**❌ If you see:** Database startup errors - wait 60 seconds and try again

---

### ☐ Check 16: Redis Logs for Errors

```powershell
docker logs jugaad-redis | findstr "Error\|error" | head -10
```

**Expected:** No error logs

---

## Troubleshooting Checks

### If Backend Won't Start

```powershell
# Check logs
docker logs jugaad-nights-backend

# Common issues:
# 1. Port 3000 in use
lsof -i :3000  # Find process
kill -9 <PID>  # Kill process

# 2. .env not updated
cat backend/.env | grep DB_HOST  # Should show: postgres

# 3. Database not ready
docker ps --format "table {{.Names}}\t{{.Status}}"
# Wait if postgres shows "starting" instead of "healthy"
```

---

### If Backend Can't Connect to Database

```powershell
# Check PostgreSQL is healthy
docker ps --format "table {{.Names}}\t{{.Status}}"
# postgres should show (healthy)

# If not healthy, wait and try again
sleep 30
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check DB logs
docker logs jugaad-postgres

# Verify network connection
docker exec -it jugaad-nights-backend sh
# Inside container:
ping postgres  # Should respond with IP
ping redis     # Should respond with IP
```

---

### If Can't Connect from Host to API

```powershell
# Check if port is exposed
docker ps | findstr "3000"

# Check firewall
netstat -ano | findstr ":3000"

# Try different IP
curl http://127.0.0.1:3000/api/health
curl http://localhost:3000/api/health
```

---

## Performance Checks

### ☐ Check 17: Container Resource Usage

```powershell
docker stats --no-stream
```

**Expected:**
```
CONTAINER            CPU %    MEM %
jugaad-postgres      0.1%     50MB
jugaad-redis         0.0%     10MB
jugaad-nights-backend 0.2%    150MB
```

**✅ Verification:** All within reasonable limits

---

## Final Verification Checklist

```
☐ All 3 containers running (docker ps)
☐ All containers healthy (docker ps --format "table {{.Names}}\t{{.Status}}")
☐ Backend logs show "Listening on port 3000"
☐ API responds: curl http://localhost:3000/api/health
☐ .env has DB_HOST=postgres
☐ Database accessible: docker exec ... psql
☐ Redis accessible: docker exec ... redis-cli PING
☐ All containers on same network: docker network inspect jugaad-network
☐ Login works: POST /api/auth/login
☐ Form submission works: POST /api/sales (or inventory)
☐ Data displays on page after submission
☐ No ERROR logs in Container logs
☐ Resource usage normal (< 500MB total)
```

---

## Status Summary

| Component | Status | Last Checked |
|-----------|--------|--------------|
| PostgreSQL | ✅ | - |
| Redis | ✅ | - |
| Backend | ✅ | - |
| Network | ✅ | - |
| API | ✅ | - |
| Database | ✅ | - |
| Cache | ✅ | - |

---

## Quick Commands Reference

```bash
# View everything
docker ps -a

# View running only
docker ps

# View with format
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View logs
docker logs -f jugaad-nights-backend

# Stop containers
docker-compose stop

# Stop and remove
docker-compose down

# Stop and remove with volumes
docker-compose down -v

# Restart containers
docker-compose restart

# Rebuild
docker-compose up --build

# Execute command in container
docker exec -it jugaad-nights-backend sh

# Check network
docker network inspect jugaad-network

# Check stats
docker stats --no-stream
```

---

## Success Criteria

✅ **All checks pass:**
- Backend running and healthy
- Connected to PostgreSQL
- Connected to Redis
- API responding on port 3000
- Form submissions work
- Data persists to database
- Data displays on page

✅ **No errors in logs**

✅ **Docker networking working:**
- Containers can reach each other by service name
- DNS resolution working
- Bridge network properly isolated

✅ **Ready for development and testing!**

---

**Date:** March 31, 2026  
**Configuration:** ✅ Complete  
**Testing:** Ready to begin  
**Status:** ✅ Verified and Ready  
