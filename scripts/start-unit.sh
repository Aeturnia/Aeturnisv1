#!/bin/bash
# start-unit.sh - Unit Start Script from ErrorFixv2.md Appendix C

UNIT_ID=$1
AGENT=$2

if [ -z "$UNIT_ID" ] || [ -z "$AGENT" ]; then
  echo "Usage: $0 <UNIT_ID> <AGENT>"
  echo "Example: $0 TYPE-A-001 'Type Definition Agent'"
  exit 1
fi

echo "Starting Unit $UNIT_ID for $AGENT"
mkdir -p "./units/$UNIT_ID"
cd "./units/$UNIT_ID"

# Create tracking file
cat > unit.json << EOF
{
  "id": "$UNIT_ID",
  "agent": "$AGENT",
  "startTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "in-progress"
}
EOF

# Capture baseline
echo "Capturing baseline state..."
npm run typecheck 2>&1 > baseline-errors.txt
npm test 2>&1 > baseline-tests.txt
npm run lint 2>&1 > baseline-lint.txt

# Count baseline errors
BASELINE_TS_ERRORS=$(grep -c "error TS" baseline-errors.txt || echo "0")
BASELINE_ESLINT_ERRORS=$(grep -c "error" baseline-lint.txt || echo "0")

# Update tracking with baseline metrics
jq '.baselineErrors = {
  "typescript": '$BASELINE_TS_ERRORS',
  "eslint": '$BASELINE_ESLINT_ERRORS'
}' unit.json > tmp.json
mv tmp.json unit.json

echo "Unit $UNIT_ID initialized"
echo "Baseline TypeScript errors: $BASELINE_TS_ERRORS"
echo "Baseline ESLint errors: $BASELINE_ESLINT_ERRORS"
echo "Tracking file: ./units/$UNIT_ID/unit.json"