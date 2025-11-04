@echo off
echo ========================================
echo   TrendSphere Quick Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
node --version
echo.

REM Check if npm is available
echo [2/5] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not available!
    pause
    exit /b 1
)
echo [OK] npm is available
npm --version
echo.

REM Install dependencies
echo [3/5] Installing dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

REM Check if .env exists
echo [4/5] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] .env file not found
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy .env.example .env
        echo.
        echo [IMPORTANT] Please edit .env file and add your configuration:
        echo   - MongoDB connection string
        echo   - JWT secret key
        echo   - Email credentials (optional)
        echo   - Google Client ID (optional)
        echo.
        echo Opening .env file...
        start notepad .env
        echo.
        echo After editing .env, press any key to continue...
        pause >nul
    ) else (
        echo [ERROR] .env.example file not found!
        pause
        exit /b 1
    )
) else (
    echo [OK] .env file exists
)
echo.

REM Final instructions
echo [5/5] Setup Complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Make sure MongoDB is running
echo    - Local: Start MongoDB service
echo    - Cloud: Use MongoDB Atlas connection string in .env
echo.
echo 2. Start the server:
echo    npm start
echo.
echo 3. Open in browser:
echo    http://localhost:3000/index.html
echo.
echo ========================================
echo.
echo Would you like to start the server now? (Y/N)
set /p start_server=

if /i "%start_server%"=="Y" (
    echo.
    echo Starting TrendSphere server...
    echo Press Ctrl+C to stop the server
    echo.
    npm start
) else (
    echo.
    echo Run 'npm start' when you're ready to start the server
    echo.
    pause
)
