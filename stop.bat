@echo off
title Stop Supply Chain Platform

echo Stopping Backend and Frontend server processes...

taskkill /FI "WINDOWTITLE eq Supply Chain - Backend (FastAPI)*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Supply Chain - Frontend (React Vite)*" /T /F >nul 2>&1

echo.
echo Supply Chain platform windows stopped.
echo You can also close any remaining terminal windows directly.
timeout /t 2 /nobreak >nul
