#!/bin/bash

echo "🔍 Verifying Port Configuration..."
echo "================================="

# Check server configuration
echo -e "\n📦 Server Configuration:"
echo -n "server.ts default port: "
grep -o "PORT.*||.*[0-9]\+" packages/server/src/server.ts | grep -o "[0-9]\+$"

echo -n "server .env PORT: "
grep "^PORT=" packages/server/.env | cut -d= -f2

# Check client configuration
echo -e "\n🌐 Client Configuration:"
echo -n "client .env API URL: "
grep "VITE_API_URL" packages/client/.env | cut -d= -f2

echo -n "client .env WS URL: "
grep "VITE_WS_URL" packages/client/.env | cut -d= -f2

# Check Replit configuration
echo -e "\n⚙️ Replit Configuration:"
echo -n ".replit waitForPort: "
grep "waitForPort" .replit | grep -o "[0-9]\+"

echo -n ".replit localPort mappings: "
grep "localPort" .replit | grep -o "[0-9]\+" | tr '\n' ' '
echo

# Check for any remaining port 5000 references (excluding timeouts)
echo -e "\n⚠️ Checking for remaining port 5000 references:"
echo "(Excluding timeout values and test files)"
grep -r "port.*5000\|5000.*port\|localhost:5000" --include="*.ts" --include="*.js" --include="*.env" --exclude-dir="node_modules" --exclude-dir="dist" --exclude-dir="__tests__" --exclude-dir="test*" . 2>/dev/null | grep -v "timeout\|Timeout\|TIMEOUT\|mock\|Mock" | head -5

echo -e "\n✅ Port configuration verification complete!"