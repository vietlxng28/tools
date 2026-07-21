@echo off
setlocal
title Tools Runner

echo ===========================================
echo               Starting Tools
echo ===========================================
echo.

echo [1/3] Starting Spring Boot Backend...
start /b "" cmd /c "cd /d "%~dp0spring-backend" && mvnw.cmd clean spring-boot:run > "%~dp0backend.log" 2>&1"
echo Backend is launching in the background (Log: backend.log)...

echo.
echo [2/3] Checking React Frontend...

if not exist "%~dp0react-frontend\node_modules\" (
    echo [!] node_modules not found. Running npm install...
    cd /d "%~dp0react-frontend" && call npm install

    if %errorlevel% neq 0 (
        echo [X] ERROR: npm install failed!
        pause
        exit /b %errorlevel%
    )
)

echo.
echo [3/3] Starting React Frontend...
start /b "" cmd /c "cd /d "%~dp0react-frontend" && npm run dev > "%~dp0frontend.log" 2>&1"
echo Frontend is launching in the background (Log: frontend.log)...

echo.
echo -------------------------------------------
echo Application is starting successfully!
echo To view backend log : powershell Get-Content backend.log -Wait
echo To view frontend log: powershell Get-Content frontend.log -Wait
echo -------------------------------------------

timeout /t 3 /nobreak > nul
exit