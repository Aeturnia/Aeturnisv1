#!/bin/bash
# create-backup.sh - Backup Creation Script for Unit Safety

UNIT_ID=$1

if [ -z "$UNIT_ID" ]; then
  echo "Usage: $0 <UNIT_ID>"
  echo "Example: $0 TYPE-A-001"
  exit 1
fi

BACKUP_DIR="./backups/$UNIT_ID"
TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)

echo "Creating backup for Unit $UNIT_ID..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create git stash for current state
git add -A
git stash push -m "Backup before Unit $UNIT_ID - $TIMESTAMP"

# Get current git hash
CURRENT_HASH=$(git rev-parse HEAD)

# Create backup metadata
cat > "$BACKUP_DIR/backup.json" << EOF
{
  "unitId": "$UNIT_ID",
  "timestamp": "$TIMESTAMP",
  "gitHash": "$CURRENT_HASH",
  "stashName": "Backup before Unit $UNIT_ID - $TIMESTAMP"
}
EOF

# Copy critical files
echo "Backing up critical files..."
cp -r ./packages/server/src "$BACKUP_DIR/" 2>/dev/null || echo "No server src to backup"
cp -r ./packages/shared "$BACKUP_DIR/" 2>/dev/null || echo "No shared package to backup"
cp ./package.json "$BACKUP_DIR/" 2>/dev/null || echo "No package.json to backup"
cp ./tsconfig*.json "$BACKUP_DIR/" 2>/dev/null || echo "No tsconfig files to backup"

# Create file list
find . -name "*.ts" -o -name "*.js" -o -name "*.json" | grep -v node_modules | grep -v .git > "$BACKUP_DIR/file-list.txt"

echo "Backup created successfully!"
echo "Backup location: $BACKUP_DIR"
echo "Git stash: Backup before Unit $UNIT_ID - $TIMESTAMP"
echo "Restore with: git stash apply 'stash^{/Backup before Unit $UNIT_ID}'"