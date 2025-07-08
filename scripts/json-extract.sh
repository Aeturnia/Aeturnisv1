#!/bin/bash
# Simple JSON field extractor for unit.json files
# Usage: json-extract.sh <field> <file>

FIELD=$1
FILE=$2

if [ -z "$FIELD" ] || [ -z "$FILE" ]; then
  echo "Usage: $0 <field> <file>"
  exit 1
fi

# Extract value for simple fields
grep "\"$FIELD\"" "$FILE" | sed -E "s/.*\"$FIELD\"[[:space:]]*:[[:space:]]*\"?([^\",:}]+)\"?.*/\1/" | tr -d ' "'