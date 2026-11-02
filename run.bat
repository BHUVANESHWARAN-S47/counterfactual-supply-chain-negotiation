@echo off
setlocal enabledelayedexpansion
title Counterfactual Supply Chain - Multi-Agent Platform Launcher

echo ===============================================================================
echo     COUNTERFACTUAL MULTI-AGENT SUPPLY CHAIN & NEGOTIATION PLATFORM
echo ===============================================================================
echo.

:: Navigate to project root directory
cd /d "%~dp0"

:: 1. Check Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in your system PATH.
    echo Please install Python 3.10+ from https://www.python.org/ and try again.
    pause
    exit /b 1
)

:: 2. Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH.
    echo Please install Node.js 18+ from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

:: 3. Check for .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [*] .env not found. Creating default .env from .env.example...
        copy /y ".env.example" ".env" >nul
        echo [OK] Created .env configuration file.
    )
)

:: 4. Check frontend node_modules
if not exist "frontend\node_modules\" (
    echo [*] Frontend dependencies not found. Running npm install in frontend...
    cd frontend
    call npm install
    cd /d "%~dp0"
)

echo.
echo [*] Starting Backend Server (FastAPI on port 8001)...
start "Supply Chain - Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

echo [*] Starting Frontend Server (Vite on port 5173)...
start "Supply Chain - Frontend (React Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo [*] Waiting 5 seconds for services to initialize...
timeout /t 5 /nobreak >nul

echo [*] Opening browser to application...
start http://localhost:5173

echo.
echo ===============================================================================
echo                     PLATFORM RUNNING SUCCESSFULLY!
echo ===============================================================================
echo  Frontend UI:   http://localhost:5173
echo  Backend API:   http://127.0.0.1:8001
echo  Swagger Docs:  http://127.0.0.1:8001/docs
echo.
echo  --- DEMO CREDENTIALS ---
echo  Admin:        admin@supplychain.ai        / admin123
echo  Procurement:  procurement@supplychain.ai  / procure123
echo  Supplier:     apex@supplier.com           / supplier123
echo  Customer:     cust@acme.com               / cust123
echo.
echo  Note: Keep the opened terminal windows running while using the app.
echo        To stop everything, run 'stop.bat' or close the terminal windows.
echo ===============================================================================
echo.
pause
