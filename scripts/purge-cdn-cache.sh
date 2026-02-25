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

CURRENT_VERSION=$(node -p "require('./package.json').version")

echo "Purging jsdelivr @latest cache for $FILE_COUNT files changed since $PREV_TAG:"
echo "  Published version: $CURRENT_VERSION"
echo "$FILES" | sed 's/^/  /'
echo ""

echo "Waiting for npm registry to serve $CURRENT_VERSION as @latest..."
for i in $(seq 1 24); do
  LATEST=$(curl -fsS "https://registry.npmjs.org/hyperclayjs/latest" 2>/dev/null | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).version" 2>/dev/null || echo "")
  if [ "$LATEST" = "$CURRENT_VERSION" ]; then
    echo "  npm registry updated after ~$((i * 5))s"
    break
  fi
  if [ "$i" -eq 24 ]; then
    echo "  Warning: npm still shows $LATEST after 120s, purging anyway"
  fi
  sleep 5
done

printf "  Purging @latest alias... "
if curl -fsS "https://purge.jsdelivr.net/npm/hyperclayjs@latest" > /dev/null 2>&1; then
  echo "✓"
else
  echo "✗"
fi

for file in $FILES; do
  url="https://purge.jsdelivr.net/npm/hyperclayjs@latest/$file"
  printf "  %s " "$url"
  if curl -fsS "$url" > /dev/null 2>&1; then
    echo "✓"
  else
    echo "✗"
  fi
done
