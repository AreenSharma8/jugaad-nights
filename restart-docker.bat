@echo off
REM ============================================================================
REM RESTART DOCKER - Batch Script for Windows
REM ============================================================================
REM Safely stops, cleans, and restarts Docker Desktop on Windows
REM Run this when Docker Desktop is frozen or has connection issues
REM
REM Usage:
REM   restart-docker.bat
REM ============================================================================

echo.
echo ======================================
echo RESTARTING DOCKER DESKTOP
echo ======================================
echo.

echo [1/4] Stopping Docker services...
docker-compose down -v >nul 2>&1
docker system prune -a -f >nul 2>&1
echo.

echo [2/4] Stopping Docker Desktop...
taskkill /IM "Docker Desktop.exe" /F >nul 2>&1
taskkill /IM docker.exe /F >nul 2>&1
timeout /t 3 /nobreak

echo.
echo [3/4] Restarting Docker Desktop...
cd %ProgramFiles%\Docker\Docker
start Docker.exe

echo.
echo [4/4] Waiting for Docker to start... (up to 60 seconds)
setlocal enabledelayedexpansion
set timeout=0
:wait_loop
docker ps >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo DOCKER RESTARTED SUCCESSFULLY
    echo ======================================
    echo.
    echo Now run:
    echo   docker-compose up -d
    echo.
    goto end
)
if !timeout! geq 60 (
    echo.
    echo WARNING: Docker did not respond within 60s
    echo It may still be starting. Please wait a moment...
    echo.
    goto end
)
echo.
timeout /t 2 /nobreak
set /a timeout=!timeout! + 2
goto wait_loop

:end
pause
