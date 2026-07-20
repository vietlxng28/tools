#!/bin/bash

cd "$(dirname "$0")" || exit

echo "==========================================="
echo "            Starting Tools"
echo "==========================================="
echo ""

echo "[1/3] Starting Spring Boot Backend..."

(
    cd spring-backend || exit
    chmod +x mvnw
    MAVEN_OPTS='-Xms128m -Xmx384m' ./mvnw clean spring-boot:run
) > backend.log 2>&1 &

echo "Backend is launching in the background (Log: backend.log)..."

echo ""
echo "[2/3] Checking React Frontend..."

if [ ! -d "react-frontend/node_modules" ]; then
    echo "[!] node_modules not found. Running npm install..."

    (cd react-frontend && npm install)

    if [ $? -ne 0 ]; then
        echo "[X] ERROR: npm install failed!"
        exit 1
    fi
fi

echo ""
echo "[3/3] Starting React Frontend..."

(
    cd react-frontend || exit
    npm run dev
) > frontend.log 2>&1 &

echo "Frontend is launching in the background (Log: frontend.log)..."

echo ""
echo "-------------------------------------------"
echo "Application is starting successfully!"
echo "To view backend log : tail -f backend.log"
echo "To view frontend log: tail -f frontend.log"
echo "-------------------------------------------"