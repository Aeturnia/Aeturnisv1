#!/bin/bash

echo "🔧 Fixing Server Restart Loop"
echo "============================="

# Step 1: Kill any existing server processes
echo -e "\n1. Stopping existing server processes..."
pkill -f "tsx src/server.ts" || true
pkill -f "node.*server" || true
sleep 2

# Step 2: Check environment configuration
echo -e "\n2. Checking environment configuration..."
cd packages/server

echo "Current directory: $(pwd)"
echo -n "PORT in .env file: "
grep "^PORT=" .env | cut -d= -f2 || echo "Not found"

echo -n "Checking if .env file exists: "
if [ -f .env ]; then
    echo "Yes"
    echo "First few lines of .env:"
    head -5 .env
else
    echo "No - Creating .env file"
    cp .env.example .env 2>/dev/null || echo "No .env.example found"
fi

# Step 3: Test server startup
echo -e "\n3. Testing server startup with explicit PORT..."
export PORT=8080
echo "Set PORT environment variable to: $PORT"

# Step 4: Start server with debug output
echo -e "\n4. Starting server with debug output..."
echo "Running: PORT=8080 npm run dev"
PORT=8080 npm run dev 2>&1 | tee server-startup.log &

# Wait for server to start
echo -e "\n5. Waiting for server to start..."
sleep 5

# Step 6: Check if server is running
echo -e "\n6. Checking server status..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Server is running on port 8080"
    curl -s http://localhost:8080/health | jq . || curl -s http://localhost:8080/health
else
    echo "❌ Server is not responding on port 8080"
    echo "Checking port 5000..."
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "⚠️ Server is running on port 5000 instead!"
    fi
fi

echo -e "\n7. Checking running processes..."
ps aux | grep -E "tsx|node.*server" | grep -v grep | head -5

echo -e "\n✅ Diagnostic complete. Check server-startup.log for details."