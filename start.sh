#!/bin/bash
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p)
    exit
}
trap cleanup SIGINT SIGTERM
echo "==========================================="
echo "  Starting Excel Handler Application"
echo "==========================================="
echo ""
echo "[1/2] Starting Spring Boot Backend..."
(cd spring-backend && ./mvnw clean spring-boot:run) &
echo ""
echo "[2/2] Starting React Frontend..."
(cd react-frontend && npm run dev) &
echo ""
echo "Both services are starting..."
echo "Press Ctrl+C to stop both."
echo "==========================================="
wait
