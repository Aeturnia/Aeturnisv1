#!/bin/bash
# Script to ensure TypeScript checks work consistently between local and CI

echo "🔍 Cleaning build artifacts..."
rm -rf packages/*/dist
rm -rf packages/*/tsconfig.tsbuildinfo

echo "📦 Installing dependencies..."
npm install
npm install --workspaces

echo "🏗️ Building shared package first..."
npm run build --workspace=packages/shared

echo "✅ Running TypeScript checks..."
npm run typecheck

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ TypeScript checks passed"
else
  echo "❌ TypeScript checks failed"
  exit 1
fi