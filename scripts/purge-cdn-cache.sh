#!/usr/bin/env bash
set -euo pipefail

PREV_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || true)

if [ -z "$PREV_TAG" ]; then
  echo "No previous tag found, skipping CDN purge"
  exit 0
fi

FILES=$(git diff --name-only "$PREV_TAG" HEAD -- 'src/**/*.js' 'src/*.js')
FILE_COUNT=$(echo "$FILES" | grep -c . || true)

if [ "$FILE_COUNT" -eq 0 ]; then
  echo "No modified JS files in src/ since $PREV_TAG"
  exit 0
fi

if [ "$FILE_COUNT" -gt 10 ]; then
  echo "Warning: $FILE_COUNT files changed, only purging the first 10"
  FILES=$(echo "$FILES" | head -10)
  FILE_COUNT=10
fi

echo "Purging jsdelivr @latest cache for $FILE_COUNT files changed since $PREV_TAG:"
echo "$FILES" | sed 's/^/  /'
echo ""
echo "Waiting 30s for npm registry to update..."
sleep 30

for file in $FILES; do
  url="https://purge.jsdelivr.net/npm/hyperclayjs@latest/$file"
  printf "  %s " "$url"
  if curl -fsS "$url" > /dev/null 2>&1; then
    echo "✓"
  else
    echo "✗"
  fi
done
