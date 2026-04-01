#!/usr/bin/env powershell
# ============================================================================
# RESTART DOCKER - PowerShell Script
# ============================================================================
# Safely stops, cleans, and restarts Docker Desktop on Windows
# Useful when Docker Desktop is frozen or has connection issues
#
# Usage:
#   .\restart-docker.ps1
# ============================================================================

Write-Host "======================================" -ForegroundColor Blue
Write-Host "RESTARTING DOCKER DESKTOP" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue

# Stop Docker Desktop
Write-Host "`n[1/4] Stopping Docker Desktop..." -ForegroundColor Cyan
docker-compose down -v 2>$null
docker system prune -a -f 2>$null
Stop-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue -Force
Start-Sleep -Seconds 2

# Kill Docker processes
Write-Host "[2/4] Killing Docker processes..." -ForegroundColor Cyan
Get-Process docker -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process "com.docker.*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Restart Docker Desktop
Write-Host "[3/4] Starting Docker Desktop..." -ForegroundColor Cyan

# Try to start Docker Desktop
try {
    Start-Process "C:\Program Files\Docker\Docker\Docker.exe" -ErrorAction Stop
    Write-Host "Docker Desktop starting..." -ForegroundColor Green
} catch {
    Write-Host "Could not start Docker Desktop automatically" -ForegroundColor Yellow
    Write-Host "Please start Docker Desktop manually from Start Menu" -ForegroundColor Yellow
}

# Wait for Docker to be ready
Write-Host "[4/4] Waiting for Docker daemon to be ready..." -ForegroundColor Cyan
$timeout = 0
$maxTimeout = 60

while ($timeout -lt $maxTimeout) {
    try {
        docker ps >$null 2>&1
        if ($?) {
            Write-Host "Docker is ready!" -ForegroundColor Green
            break
        }
    } catch {
        # Docker not ready yet
    }
    
    Start-Sleep -Seconds 2
    $timeout += 2
    Write-Host "." -NoNewline -ForegroundColor Cyan
}

Write-Host "`n"

if ($timeout -ge $maxTimeout) {
    Write-Host "WARNING: Docker did not respond within ${maxTimeout}s" -ForegroundColor Yellow
    Write-Host "It may still be starting. Please wait a moment..." -ForegroundColor Yellow
} else {
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "DOCKER RESTARTED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "`nNow run:" -ForegroundColor Cyan
    Write-Host "  docker-compose up -d" -ForegroundColor Yellow
}
