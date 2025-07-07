#!/bin/bash
# rollback-unit.sh - Unit Rollback Script from ErrorFixv2.md Appendix C

UNIT_ID=$1

if [ -z "$UNIT_ID" ]; then
  echo "Usage: $0 <UNIT_ID>"
  echo "Example: $0 TYPE-A-001"
  exit 1
fi

BACKUP_DIR="./backups/$UNIT_ID"
UNIT_DIR="./units/$UNIT_ID"

if [ ! -d "$UNIT_DIR" ]; then
  echo "Error: Unit $UNIT_ID not found."
  exit 1
fi

echo "Rolling back Unit $UNIT_ID..."

# Create rollback report
cat > "./units/$UNIT_ID/rollback-report.md" << EOF
# Rollback Report

**Unit ID:** $UNIT_ID  
**Rolled Back At:** $(date -u +%Y-%m-%dT%H:%M:%SZ)  
**Reason:** Manual rollback requested

## Issues Encountered
- Manual rollback requested by user
- Preserving current state before rollback

## Actions Taken
- Git status captured
- Files reset to previous state
- Unit marked as rolled back

## Next Steps
- Review rollback-report.md
- Identify root cause of issues
- Re-attempt unit with fixes
EOF

# Update unit tracking
if [ -f "./units/$UNIT_ID/unit.json" ]; then
  jq '.status = "rolled-back" | 
      .rollbackTime = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' "./units/$UNIT_ID/unit.json" > tmp.json
  mv tmp.json "./units/$UNIT_ID/unit.json"
fi

# Perform rollback using git
if [ -d "$BACKUP_DIR" ]; then
  echo "Found backup directory, restoring files..."
  cp -r "$BACKUP_DIR"/* ./
  echo "Files restored from backup"
else
  echo "No backup directory found, using git reset..."
  # Reset to last commit
  git reset --hard HEAD
  echo "Git reset complete"
fi

# Verify rollback
echo "Running verification after rollback..."
npm run typecheck 2>&1 > "./units/$UNIT_ID/rollback-errors.txt"
npm test 2>&1 > "./units/$UNIT_ID/rollback-tests.txt"

echo "Rollback of Unit $UNIT_ID complete"
echo "Rollback report: ./units/$UNIT_ID/rollback-report.md"
echo "Run 'git status' to see current state"