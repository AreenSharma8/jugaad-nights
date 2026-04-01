# Docker Desktop Troubleshooting Guide

## ❌ Error: "unable to get image 'postgres:16-alpine': request returned 500 Internal Server Error"

This error means **Docker Desktop's daemon is not responding properly**.

---

## 🔧 QUICK FIX (Do This First)

### Option 1: Use Batch Script (Easiest)
```powershell
cd "C:\Users\AREEN PIHU SHARMA\OneDrive\Desktop\jugaad-nights"
.\restart-docker.bat
```

### Option 2: Use PowerShell Script
```powershell
cd "C:\Users\AREEN PIHU SHARMA\OneDrive\Desktop\jugaad-nights"
powershell -ExecutionPolicy Bypass -File .\restart-docker.ps1
```

### Option 3: Manual Steps
```powershell
# Stop all containers and clean up
docker-compose down -v
docker system prune -a -f

# Wait 10 seconds
Start-Sleep -Seconds 10

# Restart Docker Desktop manually
# Click: Start Menu → Search "Docker" → Click "Docker Desktop"

# Wait 30-60 seconds for Docker to fully start

# Verify Docker is running
docker ps

# Now try to start the app
docker-compose up -d
```

---

## ⚙️ Advanced Troubleshooting

### If scripts don't work:

#### 1️⃣ Restart Docker Desktop Completely

**Method A: GUI**
- Close Docker Desktop completely
- Wait 10 seconds
- Open Docker Desktop again
- Wait 60 seconds for it to fully load
- Check notification area to confirm "Docker is running"

**Method B: Task Manager**
```powershell
# Open Task Manager
Start-Process taskmgr

# Find "Docker Desktop" → Right-click → End Task
# Wait 10 seconds
# Then manually start Docker Desktop
```

#### 2️⃣ Clean Docker Cache
```powershell
# Remove all unused images, networks, containers
docker system prune -a -f

# Optional: Aggressive clean (removes all volumes)
docker system prune -a -f --volumes
```

#### 3️⃣ Check Docker Daemon Status
```powershell
# Check if Docker is running
docker ps

# If error: Docker daemon is NOT running
# If success: Docker is running
```

#### 4️⃣ Allocate More Resources
- Open Docker Desktop Settings
- Go to "Resources"
- Increase CPU cores (recommend: 4+)
- Increase RAM (recommend: 8GB+)
- Click "Apply & Restart"

#### 5️⃣ Reset Docker Desktop
- Docker Desktop Settings
- Troubleshoot tab
- Click "Clean / Purge data" (⚠️ deletes all containers/images)
- Restart Docker Desktop

---

## ✅ Verify Everything is Working

Once Docker Desktop is running:

```powershell
# Test 1: Docker is responsive
docker ps

# Test 2: Can access Docker images
docker images

# Test 3: Can build images
docker-compose build

# Test 4: Start the app
docker-compose up -d

# Test 5: Check running services
docker-compose ps

# Test 6: Access the app
# Frontend: http://localhost:8080
# Backend: http://localhost:3000
```

---

##  🚀 Full Startup Sequence

After Docker Desktop is fixed:

```powershell
cd "C:\Users\AREEN PIHU SHARMA\OneDrive\Desktop\jugaad-nights"

# Option A: Auto (recommended)
bash start.sh

# Option B: Manual
docker-compose up -d

# Wait 30-60 seconds for startup

# Check status
docker-compose ps

# View logs if needed
docker-compose logs -f
```

---

## 🆘 Still Having Issues?

### Check Docker Desktop Logs
```powershell
# Docker Desktop keeps detailed logs
# Windows: %APPDATA%\Docker\desktop.log
# Check for errors indicating the problem
```

### Check Available Disk Space
```powershell
# Make sure you have at least 20GB free space
Get-Volume
```

### Check Network
```powershell
# Ensure you're not behind a corporate proxy
# Try this:
docker run --rm hello-world

# If it fails: Docker can't download images
# May need proxy configuration
```

### Docker Desktop Version
```powershell
# Check Docker version
docker --version

# If old: Update to latest version
# Download from: https://www.docker.com/products/docker-desktop
```

---

## 📝 Prevention Tips

1. ✅ Always stop services before shutting down PC: `docker-compose down`
2. ✅ Allocate enough RAM to Docker (8GB minimum)
3. ✅ Clear cache periodically: `docker system prune -a`
4. ✅ Keep Docker Desktop updated
5. ✅ Don't run Docker on OneDrive/cloud sync folders (can cause issues)

---

## 🎯 Summary

| Issue | Solution |
|-------|----------|
| Docker frozen | Run `restart-docker.bat` or PowerShell script |
| Can't download images | Check internet connection, restart Docker |
| "500 Internal Server Error" | Docker daemon crashed, restart Docker |
| Slow startup | Allocate more RAM to Docker |
| Permissions error | Run PowerShell as Administrator |

---

## 💡 Quick Commands

```powershell
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Restart everything
docker-compose restart

# Clean up
docker system prune -a -f
```

---

**After fixing Docker, let me know if the app starts successfully!** 🚀
