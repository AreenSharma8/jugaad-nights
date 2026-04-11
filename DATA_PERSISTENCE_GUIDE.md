# 🗂️ Data Persistence Guide - Wastage & Other Features

## Issue Summary
Your wastage data (and all application data) disappears after restarting Docker. This happens because:

### ❌ Command You Used (DELETES DATA)
```bash
docker-compose down -v
```

The `-v` flag **deletes all volumes**, including the PostgreSQL database files. This is equivalent to deleting your data folder.

---

## ✅ Solution: Correct Docker Commands

### 1. **Stop Containers (Keep Data)**
```bash
docker-compose down
```
This stops containers but **preserves all data** in Docker volumes.

### 2. **Restart Containers (Restore Data)**
```bash
docker-compose up -d
```
This starts containers again and **restores all previous data**.

---

## 📊 Docker Compose Configuration

Your `docker-compose.yml` is properly configured for data persistence:

```yaml
volumes:
  postgres_data:          # ✅ Database data persists here
    
# In postgres service:
  volumes:
    - postgres_data:/var/lib/postgresql/data  # ✅ Maps to named volume
```

**How it works:**
- `postgres_data` is a **named volume** managed by Docker
- It persists on your machine even when containers stop
- Stored at: `C:\Users\...\AppData\Local\Docker\volumes\`

---

## 🚨 When Data SHOULD Be Deleted

Use `docker-compose down -v` only when you want a **fresh start**:

```bash
# ⚠️ This DELETES all data (databases, cache, everything)
docker-compose down -v
```

---

## 📋 Complete Workflow

### Starting the App
```bash
# Start all services (create if needed, restore if exists)
docker-compose up -d
```

### Viewing Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# All logs
docker-compose logs -f
```

### Stopping the App
```bash
# ✅ CORRECT: Stop but keep data
docker-compose down

# ❌ WRONG: Delete everything
docker-compose down -v
```

### Cleaning Up
```bash
# Remove stopped containers (keeps volumes)
docker system prune

# Full cleanup (keeps named volumes)
docker system prune -a

# Total reset (deletes everything including volumes)
docker system prune -a --volumes
```

---

## 🔄 Data Flow During Restart

### Before Restart (Container 1)
```
Container → AppData Volume → Disk
                ↓
            postgres_data
            (Docker managed)
```

### After Container Stops
```
✅ AppData Volume persists on disk
✅ Named volume is preserved
✅ All database files remain
```

### After Restart (Container 2)
```
Container → AppData Volume → Same data restored!
                ↓
            postgres_data
            (All previous data)
```

---

## 🔍 Verify Data Persistence

### 1. Check Volume Status
```bash
docker volume ls
```

Expected output should show `postgres_data` and `redis_data`.

### 2. Check PostgreSQL Connection
```bash
docker-compose exec postgres psql -U postgres -d jugaad_nights -c "SELECT COUNT(*) FROM wastage_entries;"
```

This shows how many wastage records exist.

### 3. Check Real Data
```bash
# List all wastage entries
docker-compose exec postgres psql -U postgres -d jugaad_nights -c "SELECT * FROM wastage_entries;"
```

---

## 📱 Quick Reference Card

| Action | Command | Data Lost? |
|--------|---------|-----------|
| Stop containers | `docker-compose down` | ❌ No |
| Start containers | `docker-compose up -d` | ❌ No |
| Rebuild & restart | `docker-compose up -d --build` | ❌ No |
| Fresh start | `docker-compose down -v && docker-compose up -d` | ✅ Yes |
| System cleanup | `docker system prune` | ❌ No |
| Full reset | `docker system prune -a --volumes` | ✅ Yes |

---

## 🎯 For Your Wastage Feature

Now that we've fixed the outlet name display, here's what happens:

### First Entry
1. User fills wastage form (Paneer, 1.5 KG, "Spoiled")
2. Frontend sends to backend: `/wastage` POST
3. Backend stores in PostgreSQL `wastage_entries` table
4. ✅ Data persists in `postgres_data` volume

### After Restart
```bash
docker-compose down  # ✅ Keep data
docker-compose up -d # ✅ Restore data
```

The wastage history table will show all previous entries with correct outlet name!

### If You Did Down -v (Lost Data)
```bash
# You can still seed sample data:
docker-compose exec backend npm run seed
```

---

## 🐛 Troubleshooting

### Problem: Still seeing "Loading..." in outlet name
**Solution:** 
- Check if outlet exists in database: `docker-compose exec postgres psql -U postgres -d jugaad_nights -c "SELECT * FROM outlets;"`
- If empty, seed data: `docker-compose exec backend npm run seed`

### Problem: Wastage entries not appearing after restart
**Solution:**
- Verify PostgreSQL volume exists: `docker volume ls | grep postgres`
- Check if you used `-v` flag: `docker ps -a` to see history
- Rebuild containers: `docker-compose down && docker-compose up -d --build`

### Problem: Can't connect to database
**Solution:**
```bash
# Check health
docker-compose ps

# View logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

---

## 📝 Summary

✅ **After this fix:**
- Outlet name displays "Navrangpura" (or your actual outlet name)
- Data persists across restarts
- Use `docker-compose down` (NOT `down -v`)
- All wastage entries remain after container restarts

✅ **Key Files Involved:**
- `docker-compose.yml` - Volume configuration
- `backend/src/config/database.config.ts` - TypeORM settings
- `src/pages/Wastage.tsx` - Frontend outlet name display

🚀 **You're all set!**
