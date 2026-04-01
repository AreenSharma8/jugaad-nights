# Troubleshooting Guide

## 🚀 Quick Start Issues

### Docker not starting
**Error**: `Cannot connect to Docker daemon`

**Solution**:
```bash
# Restart Docker Desktop
# Or start Docker service:
sudo systemctl start docker  # Linux
brew services start docker   # Mac (if using Homebrew)
```

---

### Port already in use
**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution**:
```bash
# Kill process on port
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :8080
kill -9 <PID>

# Then restart:
docker-compose up -d
```

---

## 🐛 Backend Issues

### Database connection failed
**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Causes & Solutions**:
1. PostgreSQL not running
   ```bash
   docker-compose ps  # Check if postgres is running
   docker-compose up postgres -d
   ```

2. Wrong credentials in `.env`
   ```bash
   # Verify in .env.development:
   DB_HOST=postgres
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

3. Database not initialized
   ```bash
   docker exec jugaad-nights-backend npm run migration:run
   docker exec jugaad-nights-backend npm run seed
   ```

---

### Login returns "Invalid credentials"
**Cause**: Demo users not seeded

**Solution**:
```bash
# Run seed inside container
docker exec jugaad-nights-backend npm run seed

# Verify users created:
docker exec jugaad-postgres psql -U postgres -d jugaad_nights \
  -c "SELECT email FROM users;"
```

---

### API returns 500 error
**Solution**: Check backend logs
```bash
docker logs jugaad-nights-backend -f

# Look for:
# - Database connection errors
# - TypeORM migration issues
# - Missing environment variables
```

---

### TypeORM migration errors
**Error**: `Migration xxx seems incomplete`

**Solution**:
```bash
# Revert all migrations
docker exec jugaad-nights-backend npm run migration:revert

# Drop and recreate database
docker-compose down -v
docker-compose up -d postgres
# Wait for postgres to start
sleep 10

# Re-initialize
docker-compose up backend
```

---

## 🎨 Frontend Issues

### Page keeps refreshing infinitely
**Cause**: Redirect loop in auth

**Solution**:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for `🔐 [Auth Init]` logs
4. Clear localStorage:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

---

### Login button not working
**Cause**: API request failing

**Solution**:
1. **Check Network tab in DevTools**:
   - Does POST to `/api/auth/login` show?
   - What's the response status?

2. **If 503/504**: Backend not ready
   ```bash
   docker-compose ps
   # Wait for backend to be healthy
   ```

3. **If 401/403**: Invalid credentials
   ```bash
   # Verify demo user exists
   docker exec jugaad-postgres psql -U postgres -d jugaad_nights \
     -c "SELECT email, is_active FROM users WHERE email='admin@jugaadnights.com';"
   ```

---

### API calls return CORS errors
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Cause**: HTTP scheme mismatch

**Solution**:
1. Check browser console for full error
2. Verify frontend using relative path `/api`
3. Restart frontend:
   ```bash
   docker-compose restart frontend
   ```

---

### Blank page or 404
**Cause**: Frontend not built or nginx misconfigured

**Solution**:
```bash
# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up frontend -d

# Check nginx logs
docker logs jugaad-nights-frontend
```

---

## 📊 Database Issues

### Check database connection
```bash
# Connect to postgres
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights

# List tables
\dt

# Check users table
SELECT COUNT(*) FROM users;
```

---

### Reset database completely
```bash
# WARNING: Deletes all data
docker-compose down -v
docker-compose up -d
docker exec jugaad-nights-backend npm run seed
```

---

## 🔄 Redis Issues

### Redis not connecting
**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
```bash
# Check Redis is running
docker-compose ps redis

# Check Redis health
docker exec jugaad-redis redis-cli ping
# Expected output: PONG

# Restart Redis
docker-compose restart redis
```

---

## 🐳 Docker Issues

### Container exits immediately
**Error**: Container status shows `Exited (1)`

**Solution**:
```bash
# Check exit logs
docker logs <container-name>

# Rebuild and restart
docker-compose down -v
docker-compose up -d --build
```

---

### Out of disk space
**Error**: `no space left on device`

**Solution**:
```bash
# Clean up Docker
docker system prune -a --volumes

# Reclaim space
docker buildx prune -a

# Check disk usage
df -h
```

---

## 🔍 Health Checks

### Verify all services
```bash
# Check containers running
docker ps

# Expected: All 4 containers "Up" and "healthy"
# - jugaad-postgres
# - jugaad-redis  
# - jugaad-nights-backend
# - jugaad-nights-frontend
```

---

### Test API endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Login (if demo users exist)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jugaadnights.com","password":"Demo@12345"}'

# Frontend
curl http://localhost:8080
```

---

## 📋 Debug Commands

### View real-time logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

### Execute commands in container
```bash
# Backend shell
docker exec -it jugaad-nights-backend sh

# Run npm commands
docker exec -it jugaad-nights-backend npm list vite

# Database client
docker exec -it jugaad-postgres psql -U postgres -d jugaad_nights
```

---

### Backup and restore
```bash
# Backup database
docker exec jugaad-postgres pg_dump -U postgres jugaad_nights > backup.sql

# Restore database
docker exec -i jugaad-postgres psql -U postgres jugaad_nights < backup.sql
```

---

## ❓ Still Having Issues?

1. **Check logs first**: `docker-compose logs -f`
2. **Verify environment**: Check `.env` file
3. **Restart services**: `docker-compose down -v && docker-compose up -d`
4. **Review documentation**: Check SETUP.md and QUICK_REFERENCE.md

