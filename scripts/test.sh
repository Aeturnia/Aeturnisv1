#!/bin/bash

set -e

echo "🧪 Running Aeturnis Online tests..."

# Run tests for all packages
echo "📦 Testing shared package..."
cd packages/shared && npm run test
cd ../..

echo "🖥️ Testing server package..."  
cd packages/server && npm run test
cd ../..

echo "🌐 Testing client package..."
cd packages/client && npm run test
cd ../..

echo "✅ All tests completed!"