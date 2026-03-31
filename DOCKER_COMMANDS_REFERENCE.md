# Docker Commands Quick Reference

**Jugaad Nights - Essential Commands for Daily Development**

---

## 🚀 Getting Started

### First Time Setup
```bash
# Navigate to project
cd /path/to/jugaad-nights

# Clean up any old containers
docker-compose down -v

# Build images and start all services
docker-compose up --build

# Leave running in terminal (watch logs)
# Wait ~45 seconds for "healthy" status
```

### Subsequent Starts
```bash
# Just start (reuses existing images)
docker-compose up

# Start in background
docker-compose up -d

# View logs (attach to running containers)
docker logs -f jugaad-nights-backend
```

---

## ✅ Verification

### Check Container Status
```bash
# See all containers and their status
docker ps

# Nicer format
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Expected: All 3 containers should show (healthy)
```

### Test Services
```bash
# Test Backend API
curl http://localhost:3000/api/health

# Test PostgreSQL
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights -c "SELECT 1"

# Test Redis
docker exec -it jugaad-redis redis-cli PING
```

### View Logs
```bash
# All services
docker-compose logs

# Backend only
docker-compose logs backend

# Follow in real-time
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50 backend

# Last 30 seconds
docker-compose logs --since 30s backend
```

---

## 🛑 Stopping and Cleaning

### Pause (Fastest)
```bash
# Stop containers but keep them
docker-compose stop

# Resume later
docker-compose start
```

### Stop and Clean
```bash
# Stop and remove containers (keeps data)
docker-compose down

# Stop, remove containers AND delete data volumes
docker-compose down -v

# Remove all Docker unused images/volumes
docker system prune -a
```

---

## 🗄️ Database Access

### PostgreSQL Shell
```bash
# Open interactive SQL shell
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights

# Inside psql:
\dt                              # List all tables
\d sales_orders                  # Describe table
\df                              # List functions
SELECT * FROM users;             # Query users
SELECT COUNT(*) FROM orders;     # Count records
\q                               # Exit
```

### PostgreSQL Commands
```bash
# One-off query
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights \
  -c "SELECT * FROM users;"

# Run batch of commands
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights \
  -c "SELECT COUNT(*) FROM sales_orders; SELECT COUNT(*) FROM inventory;"

# List databases
docker exec -it jugaad-postgres psql -U postgres -l

# List users
docker exec -it jugaad-postgres psql -U postgres -c "\du"
```

### Backup/Restore
```bash
# Backup database
docker exec jugaad-postgres pg_dump -U postgres jugaad_nights > backup.sql

# Backup compressed
docker exec jugaad-postgres pg_dump -U postgres jugaad_nights | gzip > backup.sql.gz

# Restore
docker exec -i jugaad-postgres psql -U postgres jugaad_nights < backup.sql

# Restore from gzip
gunzip < backup.sql.gz | docker exec -i jugaad-postgres psql -U postgres jugaad_nights
```

---

## 🔴 Redis Access

### Redis CLI
```bash
# Interactive Redis shell
docker exec -it jugaad-redis redis-cli

# Inside redis-cli:
PING                             # Test connection
INFO                             # Server info
DBSIZE                           # Number of keys
KEYS *                           # List all keys
GET key_name                     # Get value
SET key_name value               # Set value
DEL key_name                     # Delete key
FLUSHDB                          # Clear current database
FLUSHALL                         # Clear all databases
EXIT                             # Quit
```

### Redis Commands (One-off)
```bash
# Test connection
docker exec -it jugaad-redis redis-cli PING

# Get all keys
docker exec -it jugaad-redis redis-cli KEYS "*"

# Check memory
docker exec -it jugaad-redis redis-cli INFO memory

# Get specific key
docker exec -it jugaad-redis redis-cli GET "key-name"

# Clear cache
docker exec -it jugaad-redis redis-cli FLUSHDB
```

### Monitor Redis
```bash
# Real-time command monitor
docker exec -it jugaad-redis redis-cli MONITOR

# View slowlog
docker exec -it jugaad-redis redis-cli SLOWLOG GET 10

# Track statistics
docker exec -it jugaad-redis redis-cli --stat
```

---

## 🔍 Debugging

### View Container Logs
```bash
# Real-time logs
docker logs -f jugaad-backend

# Last 100 lines
docker logs --tail=100 jugaad-backend

# Timestamps included
docker logs -t jugaad-backend

# Filter for errors
docker logs jugaad-backend | grep ERROR
```

### Execute Commands in Container
```bash
# Get shell access
docker exec -it jugaad-backend sh

# Inside container:
# npm run build              # Rebuild
# npm run test               # Run tests
# node -e "console.log()"    # Run JS
# exit                       # Exit shell

# Run single command
docker exec jugaad-backend npm run build

# Run with input
docker exec -i jugaad-backend npm run seed < input.json
```

### Container Info
```bash
# Full container details
docker inspect jugaad-backend

# Get specific info
docker inspect -f '{{.State.Status}}' jugaad-backend  # Container status
docker inspect -f '{{.NetworkSettings.IPAddress}}' jugaad-backend  # IP address
docker inspect -f '{{json .Mounts}}' jugaad-backend  # Volumes

#Current port mappings
docker port jugaad-backend

# Process list inside container
docker top jugaad-backend

# File system changes
docker diff jugaad-backend
```

---

## 🔄 Updates and Rebuilds

### Update Code
```bash
# Edit code...

# Option 1: Restart container (if hot-reload enabled)
docker-compose restart backend

# Option 2: Rebuild image
docker-compose up --build

# Option 3: Full rebuild
docker-compose down --remove-orphans
docker-compose up --build --no-cache
```

### Update Docker Images
```bash
# Pull latest base images
docker pull node:20-alpine
docker pull postgres:16-alpine
docker pull redis:7-alpine

# Rebuild application
docker-compose up --build

# Verify
docker ps
```

### Remove Old Images
```bash
# List images
docker images

# Remove unused images
docker image prune

# Force remove specific image
docker rmi image_name

# Remove all dangling
docker system prune -f
```

---

## 📊 Monitoring

### Resource Usage
```bash
# Real-time stats
docker stats

# Stats for specific container
docker stats jugaad-backend

# Exit: Ctrl+C
```

### Performance
```bash
# Check running processes
docker top jugaad-backend

# Network stats
docker network inspect jugaad-network

# Volume usage
docker volume inspect postgres_data
```

### Health Checks
```bash
# See health status
docker ps

# View health logs
docker inspect --format='{{json .State.Health}}' jugaad-backend | jq .

# Manual health check
curl http://localhost:3000/api/health
```

---

## 🔧 Useful Scripts

### Create Backup Script
```bash
#!/bin/bash
# Save as: backup.sh
# Usage: ./backup.sh

BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"

mkdir -p $BACKUP_DIR

docker exec jugaad-postgres pg_dump -U postgres jugaad_nights > $BACKUP_FILE

echo "Backup created: $BACKUP_FILE"
echo "Size: $(du -h $BACKUP_FILE | cut -f1)"
```

### Quick Health Check Script
```bash
#!/bin/bash
# Save as: health.sh
# Usage: ./health.sh

echo "=== Container Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "=== API Test ==="
curl -s http://localhost:3000/api/health | jq .

echo ""
echo "=== Database Test ==="
docker exec jugaad-postgres psql -U postgres -d jugaad_nights -c "SELECT COUNT(*) as users FROM users;" 2>/dev/null || echo "Database error"

echo ""
echo "=== Redis Test ==="
docker exec jugaad-redis redis-cli PING 2>/dev/null || echo "Redis error"
```

### Cleanup Script
```bash
#!/bin/bash
# Save as: cleanup.sh
# Usage: ./cleanup.sh

echo "Stopping containers..."
docker-compose down

echo "Removing all images..."
docker image prune -af

echo "Removing all volumes..."
docker volume prune -f

echo "Cleaning up..."
docker system prune -af

echo "Done!"
```

---

## 🐛 Troubleshooting Commands

### Container Won't Start
```bash
# Check logs
docker logs jugaad-backend

# Check if port is in use
lsof -i :3000              # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Restart in verbose mode
docker-compose up --verbose

# Remove and rebuild
docker-compose down -v
docker-compose up --build
```

### Connection Refuses
```bash
# Verify container is running
docker ps

# Check networking
docker network inspect jugaad-network

# Test connection from container
docker exec jugaad-backend curl postgres:5432

# View network interfaces
docker exec jugaad-backend ip addr
```

### Database Issues
```bash
# Check postgres status
docker ps | grep postgres

# View postgres logs
docker logs jugaad-postgres

# Try connecting
docker exec -it jugaad-postgres psql -U postgres -c "SELECT version();"

# Check disk space
docker exec jugaad-postgres df -h

# Check connections
docker exec jugaad-postgres psql -U postgres -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### Memory Issues
```bash
# Check memory usage
docker stats

# Limit container memory
docker update --memory 2g jugaad-backend

# Check PostgreSQL memory
docker exec jugaad-postgres psql -U postgres -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size FROM pg_database;"
```

---

## 📋 Useful Settings

### Show All Containers (including stopped)
```bash
docker ps -a
```

### Show Container Size
```bash
docker ps -s
```

### Show Only Running Containers
```bash
docker ps --filter status=running
```

### Show by Label
```bash
docker ps --filter "label=environment=development"
```

### Format Output (Table)
```bash
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Format Output (JSON)
```bash
docker ps --format json | jq .
```

---

## 🌐 Network Commands

### List Networks
```bash
docker network ls
```

### Inspect Network
```bash
docker network inspect jugaad-network
```

### Test DNS from Container
```bash
docker exec jugaad-backend nslookup postgres
docker exec jugaad-backend ping postgres
docker exec jugaad-backend ping redis
```

### Connect to Different Network
```bash
docker network connect other-network jugaad-backend
```

---

## 💡 Pro Tips

### Quick Aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias dc='docker-compose'
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}"'
alias dlogs='docker logs -f'
```

### Watch Container Status
```bash
# Continuously update (Linux/Mac)
watch docker ps --format "table {{.Names}}\t{{.Status}}"

# Windows: Use Task Scheduler or repeat command
dockerps.bat (if you create it)
```

### Copy Files From Container
```bash
docker cp jugaad-backend:/app/dist ./backend-dist
```

### Copy Files Into Container
```bash
docker cp ./file.txt jugaad-backend:/app/
```

### Export Container as Image
```bash
docker commit jugaad-backend myapp:backup
docker save myapp:backup > myapp-backup.tar
```

---

## 🚨 Emergency Commands

### Kill All Containers
```bash
docker kill $(docker ps -q)
```

### Remove All Containers
```bash
docker rm $(docker ps -aq)
```

### Remove All Images
```bash
docker rmi $(docker images -q)
```

### Reset Docker (⚠️ removes everything)
```bash
docker system prune -a --volumes
```

---

## 📚 More Help

### Docker CLI Help
```bash
docker --help
docker-compose --help
docker ps --help
docker exec --help
```

### Get Version Info
```bash
docker --version
docker-compose --version
docker info
```

### View Complete Logs
```bash
# All containers
docker-compose logs

# Save to file
docker-compose logs > logs.txt

# Follow specific service
docker-compose logs -f backend
```

---

## 🎯 Most Common Commands You'll Use

```bash
# 1. Start everything
docker-compose up --build

# 2. View status
docker ps --format "table {{.Names}}\t{{.Status}}"

# 3. View logs
docker logs -f jugaad-backend

# 4. Database query
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights

# 5. Stop everything
docker-compose down

# 6. Backup database
docker exec jugaad-postgres pg_dump -U postgres jugaad_nights > backup.sql
```

---

**Last Updated:** March 31, 2026  
**Status:** Ready for Production ✅
