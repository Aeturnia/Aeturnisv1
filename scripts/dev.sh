#!/bin/bash

set -e

echo "🚀 Starting Aeturnis Online development environment..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start development servers
echo "🔧 Starting development servers..."
npm run dev

echo "🌐 Development servers started!"
echo "📱 Client: http://localhost:5173"
echo "⚙️ Server: http://localhost:3000"