#!/bin/bash

echo "🚀 Starting Aeturnis Online Development Environment"
echo "=================================================="

# Kill any existing processes
echo "Stopping any existing processes..."
pkill -f "tsx src/server.ts" || true
pkill -f "vite" || true
sleep 2

# Start backend server
echo -e "\n📦 Starting Backend Server (Port 8080)..."
cd packages/server
PORT=8080 npm run dev 2>&1 | sed 's/^/[SERVER] /' &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to initialize..."
sleep 5

# Check if server is running
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Backend server is running on port 8080"
else
    echo "❌ Backend server failed to start"
    echo "Check logs above for errors"
    exit 1
fi

# Start frontend client
echo -e "\n🌐 Starting Frontend Client (Port 3000)..."
cd ../client
npm run dev 2>&1 | sed 's/^/[CLIENT] /' &
CLIENT_PID=$!

# Wait for client to start
sleep 5

echo -e "\n✅ Development environment started!"
echo "=================================="
echo "Backend API: http://localhost:8080"
echo "Frontend UI: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo 'Stopping servers...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT TERM
wait