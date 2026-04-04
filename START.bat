@echo off
title EcoSenitel Startup
color 0A
echo.
echo  =============================================
echo   ECOSenitel - Starting up...
echo  =============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

:: Get the directory of this script
set ROOT=%~dp0
cd /d "%ROOT%"

:: Install Python deps if needed
echo [1/4] Installing Python dependencies...
pip install -r requirements.txt -q

:: Install Node deps if needed
echo [2/4] Installing Node dependencies...
cd frontend
if not exist "node_modules\" (
    echo       Running npm install - this may take a minute...
    npm install
) else (
    echo       node_modules already installed, skipping.
)
cd ..

:: Start Flask in a new window
echo [3/4] Starting Flask backend on port 5000...
start "EcoSenitel Backend" cmd /k "cd /d %ROOT% && python app.py"

:: Wait for Flask to start
timeout /t 3 /nobreak >nul

:: Start Vite in a new window
echo [4/4] Starting React frontend on port 8080...
start "EcoSenitel Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

:: Wait for Vite to start
timeout /t 4 /nobreak >nul

:: Open browser
echo.
echo  Opening http://localhost:8080 in your browser...
start http://localhost:8080

echo.
echo  =============================================
echo   Both servers are running!
echo   Frontend: http://localhost:8080
echo   Backend:  http://127.0.0.1:5000
echo.
echo   Close the two terminal windows to stop.
echo  =============================================
echo.
pause
