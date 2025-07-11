#!/bin/bash

echo "🔧 Fixing Port Configuration Issue"
echo "================================="

echo -e "\n1. Current server status:"
if curl -s http://localhost:5000/health > /dev/null; then
    UPTIME=$(curl -s http://localhost:5000/health | jq -r '.uptime' 2>/dev/null || echo "unknown")
    echo "✅ Server is running on port 5000 (uptime: ${UPTIME}s)"
else
    echo "❌ No server on port 5000"
fi

if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Server is running on port 8080"
else
    echo "❌ No server on port 8080"
fi

echo -e "\n2. Stopping old server process..."
pkill -f "tsx src/server.ts" || true
sleep 2

echo -e "\n3. Starting new server with PORT=8080..."
cd /home/runner/workspace/packages/server

# Ensure PORT is set
export PORT=8080
echo "PORT environment variable set to: $PORT"

# Start the server
echo "Starting server with: PORT=8080 npm run dev"
PORT=8080 npm run dev &

echo -e "\n4. Waiting for new server to start..."
sleep 5

echo -e "\n5. Verifying new server..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ SUCCESS: Server is now running on port 8080"
    curl -s http://localhost:8080/health | jq . 2>/dev/null || curl -s http://localhost:8080/health
else
    echo "❌ FAILED: Server did not start on port 8080"
    echo "Checking if it's still on port 5000..."
    curl -s http://localhost:5000/health > /dev/null && echo "⚠️ Server is still on port 5000"
fi

echo -e "\n✅ Done! The Replit workflow should now detect the server on port 8080."