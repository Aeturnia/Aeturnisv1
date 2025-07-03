#!/bin/bash

set -e

echo "🔧 Building Aeturnis Online..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf packages/*/dist

# Build packages in dependency order
echo "📦 Building shared package..."
cd packages/shared && npm run build
cd ../..

echo "🖥️ Building server package..."
cd packages/server && npm run build
cd ../..

echo "🌐 Building client package..."
cd packages/client && npm run build
cd ../..

echo "✅ Build completed successfully!"