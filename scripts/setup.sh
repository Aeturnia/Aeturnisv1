#!/bin/bash

set -e

echo "🛠️ Setting up Aeturnis Online development environment..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create environment files if they don't exist
echo "🔧 Setting up environment files..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
else
    echo "ℹ️ .env file already exists"
fi

if [ ! -f ".env.development" ]; then
    cp .env.example .env.development
    echo "✅ Created .env.development file"
else
    echo "ℹ️ .env.development file already exists"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p packages/client/public/assets
mkdir -p packages/client/src/assets/{images,sounds,fonts}
mkdir -p packages/server/src/routes
mkdir -p packages/server/src/middleware
mkdir -p packages/server/src/controllers
mkdir -p packages/server/src/models
mkdir -p packages/server/src/services
mkdir -p logs

echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Start development: npm run dev"
echo "3. Visit http://localhost:5173 for the client"
echo "4. Visit http://localhost:3000 for the server"