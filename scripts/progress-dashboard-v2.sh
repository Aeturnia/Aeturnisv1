#!/bin/bash
# progress-dashboard-v2.sh - Progress Dashboard without jq dependency

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JSON_EXTRACT="$SCRIPT_DIR/json-extract.sh"

echo "# Error Resolution Progress Dashboard"
echo ""
echo "**Last Updated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Count current errors
echo "## Current Error Status"
TS_ERRORS=$(cd packages/server && npm run typecheck 2>&1 | grep -c "error TS" || echo "0")
ESLINT_ERRORS=$(cd packages/server && npm run lint 2>&1 | grep -c "  error  " || echo "0")
ESLINT_WARNINGS=$(cd packages/server && npm run lint 2>&1 | grep -c "  warning  " || echo "0")
TOTAL_ERRORS=$((TS_ERRORS + ESLINT_ERRORS))

echo "- TypeScript Errors: **$TS_ERRORS**"
echo "- ESLint Errors: **$ESLINT_ERRORS**"
echo "- ESLint Warnings: $ESLINT_WARNINGS"
echo "- **Total Blocking Errors:** $TOTAL_ERRORS"
echo ""

# Unit status from files
echo "## Unit Status"
if [ -d "./units" ]; then
  COMPLETED=0
  IN_PROGRESS=0
  
  # Count completed units
  for unit_file in ./units/*/unit.json; do
    if [ -f "$unit_file" ]; then
      STATUS=$($JSON_EXTRACT "status" "$unit_file")
      if [ "$STATUS" = "complete" ]; then
        COMPLETED=$((COMPLETED + 1))
      elif [ "$STATUS" = "in-progress" ]; then
        IN_PROGRESS=$((IN_PROGRESS + 1))
      fi
    fi
  done
  
  echo "- ✅ Completed: $COMPLETED units"
  echo "- 🔄 In Progress: $IN_PROGRESS units"
  echo ""
  
  # List units with details
  if [ "$COMPLETED" -gt 0 ] || [ "$IN_PROGRESS" -gt 0 ]; then
    echo "### Unit Details:"
    echo "| Unit | Agent | Status | Errors Fixed |"
    echo "|------|-------|--------|--------------|"
    
    for unit_file in ./units/*/unit.json; do
      if [ -f "$unit_file" ]; then
        UNIT_DIR=$(dirname "$unit_file")
        UNIT_NAME=$(basename "$UNIT_DIR")
        AGENT=$($JSON_EXTRACT "agent" "$unit_file")
        STATUS=$($JSON_EXTRACT "status" "$unit_file")
        ERRORS_FIXED=$($JSON_EXTRACT "errorsFixed" "$unit_file")
        
        if [ "$STATUS" = "complete" ]; then
          STATUS_ICON="✅"
        elif [ "$STATUS" = "in-progress" ]; then
          STATUS_ICON="🔄"
        else
          STATUS_ICON="⏸️"
        fi
        
        echo "| $UNIT_NAME | $AGENT | $STATUS_ICON $STATUS | $ERRORS_FIXED |"
      fi
    done
    echo ""
  fi
else
  echo "- No units directory found"
fi
echo ""

# Error comparison
echo "## Progress from ErrorCatalog v1.2.0"
echo "- **Starting Errors (v1.0.1):** 195 TypeScript + 160 ESLint = 355 total"
echo "- **After 8 Chunks (v1.2.0):** 411 TypeScript + 137 ESLint = 548 total"
echo "- **Current Status:** $TS_ERRORS TypeScript + $ESLINT_ERRORS ESLint = $TOTAL_ERRORS total"
echo ""

# Calculate changes
TS_CHANGE=$((TS_ERRORS - 411))
ESLINT_CHANGE=$((ESLINT_ERRORS - 137))
TOTAL_CHANGE=$((TOTAL_ERRORS - 548))

echo "### Since v1.2.0:"
if [ $TS_CHANGE -gt 0 ]; then
  echo "- TypeScript: +$TS_CHANGE errors (revealed by type fixes)"
else
  echo "- TypeScript: $TS_CHANGE errors"
fi
if [ $ESLINT_CHANGE -gt 0 ]; then
  echo "- ESLint: +$ESLINT_CHANGE errors"
else
  echo "- ESLint: $ESLINT_CHANGE errors"
fi
if [ $TOTAL_CHANGE -gt 0 ]; then
  echo "- **Total: +$TOTAL_CHANGE errors**"
else
  echo "- **Total: $TOTAL_CHANGE errors**"
fi
echo ""

# Quality indicators
echo "## System Health"
echo -n "- Server Status: "
if curl -s http://localhost:8080/health >/dev/null 2>&1; then
  echo "✅ Running"
else
  echo "❌ Down"
fi

echo -n "- TypeScript Build: "
if [ $TS_ERRORS -eq 0 ]; then
  echo "✅ Clean"
else
  echo "❌ $TS_ERRORS errors"
fi

echo -n "- ESLint Status: "
if [ $ESLINT_ERRORS -eq 0 ]; then
  echo "✅ Clean"
else
  echo "❌ $ESLINT_ERRORS errors"
fi
echo ""

# Calculate total errors fixed
TOTAL_FIXED=0
for unit_file in ./units/*/unit.json; do
  if [ -f "$unit_file" ]; then
    STATUS=$($JSON_EXTRACT "status" "$unit_file")
    if [ "$STATUS" = "complete" ]; then
      ERRORS_FIXED=$($JSON_EXTRACT "errorsFixed" "$unit_file")
      if [ -n "$ERRORS_FIXED" ] && [ "$ERRORS_FIXED" -ne 0 ]; then
        TOTAL_FIXED=$((TOTAL_FIXED + ERRORS_FIXED))
      fi
    fi
  fi
done

echo "## Cumulative Progress"
echo "- Total Errors Fixed: **$TOTAL_FIXED**"
echo "- Units Completed: **$COMPLETED**"
echo "- Average Errors per Unit: **$((TOTAL_FIXED / (COMPLETED > 0 ? COMPLETED : 1)))**"
echo ""

echo "---"
echo "*Dashboard generated from ErrorFixv2.md strategy*"