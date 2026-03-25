@echo off
echo 🌌 INITIALIZING PROMPT WARS SYSTEM...

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install it to continue.
    pause
    exit /b
)

:: Start Backend
echo [1/2] Launching Backend Server...
start cmd /k "cd backend && npm install && npm run dev"

:: Start Frontend
echo [2/2] Launching Frontend Interface...
start cmd /k "cd frontend && npm install && npm run dev"

echo 🚀 SYSTEM STANDBY. 
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Admin: http://localhost:3000/admin
pause
