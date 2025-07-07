#!/bin/bash
# start-unit.sh

UNIT_ID=$1
AGENT=$2

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
npm run typecheck 2>&1 > baseline-errors.txt
npm test 2>&1 > baseline-tests.txt

echo "Unit $UNIT_ID initialized"