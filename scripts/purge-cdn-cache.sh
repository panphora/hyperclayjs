#!/usr/bin/env bash
set -euo pipefail

# `npm publish --dry-run` still runs the publish/postpublish lifecycle scripts —
# npm's publish.js guards only the upload with `if (!dryRun)`. Without this guard
# every release purged jsdelivr twice: once during the pre-publish dry run, when
# the new version did not exist on the registry yet so the wait loop below could
# not possibly succeed, and once for real. The dry-run pass purged the @latest
# alias while it still resolved to the PREVIOUS version, which makes jsdelivr
# re-fetch and re-cache the old build under @latest.
if [ "${npm_config_dry_run:-}" = "true" ]; then
  echo "npm publish --dry-run — skipping CDN purge"
  exit 0
fi

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
LATEST=""
REGISTRY_READY=0
for i in $(seq 1 24); do
  LATEST=$(curl -fsS "https://registry.npmjs.org/hyperclayjs/latest" 2>/dev/null | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).version" 2>/dev/null || echo "")
  if [ "$LATEST" = "$CURRENT_VERSION" ]; then
    echo "  npm registry updated after ~$((i * 5))s"
    REGISTRY_READY=1
    break
  fi
  sleep 5
done

# Purging while the registry still answers with the old version is worse than
# not purging: jsdelivr re-resolves @latest, gets the old version back, and
# caches that fresh. Leaving the existing cache to expire is the safer failure.
if [ "$REGISTRY_READY" -eq 0 ]; then
  echo ""
  echo "WARNING: npm still shows ${LATEST:-unknown} after 120s — NOT purging."
  echo "Purging now would re-cache the old build under @latest, which production loads."
  echo "Re-run once the registry has caught up:  bash scripts/purge-cdn-cache.sh"
  exit 0
fi

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

# A 2xx from the purge API only means the request was accepted. Production loads
# hyperclayjs from the unpinned @latest, so confirm the alias actually moved —
# and confirm it for THE FILES THAT CHANGED, not just for package.json.
#
# Verifying package.json alone is worth nothing here: the bare `@latest` purge
# above always refreshes it, so that check passed on every release whether or
# not a single per-file purge landed. jsdelivr resolves `@latest` per PATH, so a
# file whose purge failed keeps answering from an older version for up to 7 days
# while package.json reports the new one.
#
# `x-jsd-version` is the resolved version for that exact path, which is the thing
# in question. Reading it beats diffing bytes: a file that genuinely did not
# change between the two versions has identical content either way, so a content
# comparison cannot tell a healed path from a stale one.
resolved_version() {
  curl -fsS -o /dev/null -D- "https://cdn.jsdelivr.net/npm/hyperclayjs@latest/$1" 2>/dev/null \
    | tr -d '\r' | awk 'tolower($1) == "x-jsd-version:" { print $2 }'
}

echo ""
echo "Verifying jsdelivr @latest serves $CURRENT_VERSION for each purged path..."

STALE=""
for path in "package.json" $FILES; do
  SERVED=""
  for i in $(seq 1 12); do
    SERVED=$(resolved_version "$path")
    [ "$SERVED" = "$CURRENT_VERSION" ] && break
    sleep 5
  done
  if [ "$SERVED" = "$CURRENT_VERSION" ]; then
    printf "  ✓ %s\n" "$path"
  else
    printf "  ✗ %s (serving %s)\n" "$path" "${SERVED:-unknown}"
    STALE="$STALE $path"
  fi
done

if [ -n "$STALE" ]; then
  echo ""
  echo "WARNING: jsdelivr @latest still serves an older version for:"
  for path in $STALE; do echo "  $path"; done
  echo "Production loads hyperclayjs from @latest, so it may still be running old code."
  echo "Re-run: bash scripts/purge-cdn-cache.sh"
  # Non-zero so a release script can see this rather than reading a warning that
  # scrolled past. It runs as a postpublish hook, where the publish has already
  # happened and cannot be undone, so this reports rather than prevents.
  exit 1
fi

echo ""
echo "All purged paths are live on jsdelivr at $CURRENT_VERSION."
