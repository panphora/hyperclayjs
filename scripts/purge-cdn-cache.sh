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

# jsdelivr purge API tolerates ~60 requests/min; purge sequentially at 1/s,
# back off on 429 (5s, 10s, 20s), log a hard failure and move on after 3 tries.
FAILED=0
purge_url() {
  local url="$1" retries=0 status backoff
  while :; do
    status=$(curl -sS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)
    case "${status:-000}" in
      2*)
        echo "✓"
        sleep 1
        return 0
        ;;
      429)
        if [ "$retries" -ge 3 ]; then
          echo "✗ (rate limited after 3 retries)"
          FAILED=$((FAILED + 1))
          return 0
        fi
        retries=$((retries + 1))
        backoff=$((5 * 2 ** (retries - 1)))
        printf "429, retrying in %ss... " "$backoff"
        sleep "$backoff"
        ;;
      *)
        echo "✗ ($status)"
        FAILED=$((FAILED + 1))
        return 0
        ;;
    esac
  done
}

printf "  Purging @latest alias... "
purge_url "https://purge.jsdelivr.net/npm/hyperclayjs@latest"

for file in $FILES; do
  url="https://purge.jsdelivr.net/npm/hyperclayjs@latest/$file"
  printf "  %s " "$url"
  purge_url "$url"
done

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "WARNING: $FAILED purge(s) failed — stale files may persist on the CDN for up to 7 days."
  echo "Purge manually: curl https://purge.jsdelivr.net/npm/hyperclayjs@latest/<path>"
fi
