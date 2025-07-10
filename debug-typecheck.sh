#!/bin/bash
# Comprehensive TypeScript debugging script

echo "🔍 TypeScript Debugging Script"
echo "=============================="

echo -e "\n📌 Environment Info:"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "TypeScript version: $(npx tsc --version)"

echo -e "\n📁 Checking for uncommitted changes:"
git status --porcelain

echo -e "\n🧹 Cleaning all build artifacts..."
rm -rf packages/*/dist
rm -rf packages/*/tsconfig.tsbuildinfo
rm -rf node_modules
rm -rf packages/*/node_modules

echo -e "\n📦 Fresh install of dependencies..."
npm install
npm install --workspaces

echo -e "\n🏗️ Building shared package..."
cd packages/shared
npm run build
cd ../..

echo -e "\n🔎 Running TypeScript check on server package..."
cd packages/server
npx tsc --noEmit --listFiles > /tmp/ts-files.txt 2>&1

if [ $? -eq 0 ]; then
  echo "✅ TypeScript check passed (exit code 0)"
else
  echo "❌ TypeScript check failed (exit code $?)"
fi

echo -e "\n📊 TypeScript errors (if any):"
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20

echo -e "\n🔍 Checking for case-sensitive import issues:"
grep -r "from ['\"].*[A-Z]" src/ | grep -v node_modules | head -10

echo -e "\n📋 TypeScript configuration:"
echo "Root tsconfig.json:"
cat ../../tsconfig.json | head -20
echo -e "\nServer tsconfig.json:"
cat tsconfig.json | head -20

echo -e "\n🚩 Checking for type definition issues:"
ls -la ../../node_modules/@types/ | head -10
ls -la node_modules/@types/ 2>/dev/null | head -10

echo -e "\n✅ Debugging complete"