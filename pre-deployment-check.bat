@echo off
echo ========================================
echo   TrendSphere - Pre-Deployment Checklist
echo ========================================
echo.

echo [1/6] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo [2/6] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python first.
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo [3/6] Checking if .env file exists...
if not exist ".env" (
    echo ❌ .env file not found!
    echo    Please copy .env.example to .env and fill in your values
    pause
    exit /b 1
)
echo ✅ .env file found

echo.
echo [4/6] Checking node_modules...
if not exist "node_modules" (
    echo ⚠️  node_modules not found. Installing dependencies...
    npm install
) else (
    echo ✅ node_modules found
)

echo.
echo [5/6] Checking Python dependencies...
python -c "import prophet" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Prophet not installed. Installing Python dependencies...
    pip install -r requirements.txt
) else (
    echo ✅ Prophet library found
)

echo.
echo [6/6] Checking MongoDB connection...
echo ⚠️  Make sure MongoDB is running locally or MongoDB Atlas is configured

echo.
echo ========================================
echo   ✅ Pre-deployment checks complete!
echo ========================================
echo.
echo Next steps:
echo 1. Verify your .env file has all required values
echo 2. Test locally: npm start
echo 3. Push to GitHub: git push origin main
echo 4. Deploy to Render following DEPLOYMENT_STEPS.md
echo.
pause
