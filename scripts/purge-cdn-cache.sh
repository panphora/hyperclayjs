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

# --diff-filter=d drops DELETIONS. jsdelivr resolves @latest per path to the newest
# version that CONTAINS that path, so a file removed in this release keeps answering
# with the last version that had it — correctly, and forever. Verifying one is a
# guaranteed failure on every release whose range still contains the deletion, and
# this script's exit 1 turns that into a rolled-back release.
FILES=$(git diff --name-only --diff-filter=d "$PREV_TAG" HEAD -- 'src/**/*.js' 'src/*.js')
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
# and confirm it for THE FILES THAT CHANGED.
#
# package.json is NOT verified here, and the claim that used to sit in this
# comment — that the bare `@latest` purge always refreshes it — is false. That
# bare URL is the package's default file, the `main` entry (`src/hyperclay.js`),
# a different cache object entirely; it has never touched package.json on any
# release. Worse, verifying package.json actively caused the failure it reported:
# a purge does not fetch, the NEXT request does, so on 2026-08-23 the first probe
# of that never-purged path resolved against jsdelivr metadata that had not caught
# up, answered 1.37.4, and PINNED it for s-maxage (12 hours). The following 11
# retries were edge hits on the object the first retry had just created. Nothing
# loads package.json from the CDN, so the whole check was cost with no signal.
#
# The rule that generalizes: never GET a `@latest` path you did not just purge,
# and re-purge before re-reading, because a bare retry can only re-read whatever
# the first one froze.
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
for path in $FILES; do
  SERVED=""
  for i in $(seq 1 12); do
    SERVED=$(resolved_version "$path")
    [ "$SERVED" = "$CURRENT_VERSION" ] && break
    # Re-purge before re-reading. A stale answer means the edge is now holding a
    # resolution made against metadata that had not caught up, and re-GETting only
    # returns that same frozen object — the retry loop cannot heal what it pinned.
    # Purging first drops the object so the next read resolves again.
    curl -sS -o /dev/null "https://purge.jsdelivr.net/npm/hyperclayjs@latest/$path" 2>/dev/null || true
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
