@echo off
setlocal
title Excel Handler Runner

echo ===========================================
echo    Starting Excel Handler Application
echo ===========================================
echo.

echo [1/2] Starting Spring Boot Backend...
start "Spring-Backend" cmd /k "cd spring-backend && mvnw.cmd clean spring-boot:run"

echo.
echo [2/2] Checking React Frontend...

if not exist "react-frontend\node_modules\" (
    echo [!] node_modules not found. Running npm install...
    cd react-frontend && call npm install && cd ..

    if %errorlevel% neq 0 (
        echo [X] ERROR: npm install failed!
        pause
        exit /b %errorlevel%
    )
)

echo.
echo [3/3] Starting React Frontend...
start "React-Frontend" cmd /k "cd react-frontend && npm run dev"

echo.
echo -------------------------------------------
echo Application is starting. Closing in 3s...
echo -------------------------------------------

timeout /t 3 /nobreak > nul
exit