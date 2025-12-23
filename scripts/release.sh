#!/bin/bash
set -e  # Exit on error

# NPM Release Automation Script
# Generic release script for any npm package

echo "╔════════════════════════════════════════╗"
echo "║      NPM Release Automation           ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Check if we're in an npm package directory
if [ ! -f "package.json" ]; then
    error "No package.json found - must run from npm package root"
    exit 1
fi

# Get package name for messaging
PACKAGE_NAME=$(node -p "require('./package.json').name")

# ============================================
# STEP 1: Collect Release Information
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Release Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get version bump type
echo "Select version bump type:"
echo "  1) patch   (bug fixes, 1.0.0 → 1.0.1)"
echo "  2) minor   (new features, 1.0.0 → 1.1.0)"
echo "  3) major   (breaking changes, 1.0.0 → 2.0.0)"
echo "  4) custom  (enter version manually)"
echo ""
read -p "Enter choice [1-4]: " version_choice

case $version_choice in
    1) VERSION_TYPE="patch" ;;
    2) VERSION_TYPE="minor" ;;
    3) VERSION_TYPE="major" ;;
    4)
        read -p "Enter custom version (e.g., 2.0.0-beta.1): " CUSTOM_VERSION
        VERSION_TYPE="custom"
        ;;
    *)
        error "Invalid choice"
        exit 1
        ;;
esac

# Get changelog entries - auto-generate from commits since last tag
echo ""
info "Generating changelog from commits since last release..."

# Get the last tag
LAST_TAG=$(git tag --sort=-version:refname | head -1)

if [ -n "$LAST_TAG" ]; then
    info "Last release: $LAST_TAG"

    # Get commit range
    COMMIT_RANGE="${LAST_TAG}..HEAD"

    # Get the git log
    GIT_LOG=$(git log "$COMMIT_RANGE" --pretty=format:"%s")

    if [ -z "$GIT_LOG" ]; then
        warn "No commits since last tag"
        echo ""
        info "Enter changelog entries manually (Ctrl+D when done):"
        echo "Format: Type: Description"
        echo "Types: Added, Changed, Fixed, Breaking"
        echo ""
        CHANGELOG_ENTRIES=$(cat)
    else
        echo ""
        echo "Commits since $LAST_TAG:"
        echo "$GIT_LOG"
        echo ""

        # Use claude CLI to generate changelog
        info "Analyzing commits with Claude..."
        CHANGELOG_ENTRIES=$(echo "$GIT_LOG" | npx @anthropic-ai/claude-code -p "Analyze these git commit messages and generate changelog entries. Format each entry as one of: 'Added: description', 'Changed: description', 'Fixed: description', or 'Breaking: description'. Only output the formatted changelog entries, nothing else. One entry per line.")

        echo ""
        echo "Generated changelog:"
        echo "$CHANGELOG_ENTRIES"
        echo ""
        success "Changelog auto-accepted"
    fi
else
    warn "No previous tags found"
    echo ""
    info "Enter changelog entries manually (Ctrl+D when done):"
    echo "Format: Type: Description"
    echo "Types: Added, Changed, Fixed, Breaking"
    echo ""
    CHANGELOG_ENTRIES=$(cat)
fi

# Publish tag - default to latest
NPM_TAG="latest"

# ============================================
# STEP 2: Pre-Release Checks
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Pre-Release Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check git status
info "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    error "You have uncommitted changes:"
    git status --short
    echo ""
    error "Commit or stash changes before releasing"
    exit 1
else
    success "Working directory clean"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    error "Not on main branch (currently on: $CURRENT_BRANCH)"
    error "Switch to main branch before releasing"
    exit 1
else
    success "On main branch"
fi

# Pull latest
info "Pulling latest changes..."
git pull origin main || warn "Could not pull (may need to merge)"

# ============================================
# STEP 3: Run Tests
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Run Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run tests
info "Running tests..."
if npm test; then
    success "All tests passed"
else
    error "Tests failed - aborting release"
    exit 1
fi

# ============================================
# STEP 4: Version Bump
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Version Bump"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
info "Current version: $CURRENT_VERSION"

# Bump version
if [ "$VERSION_TYPE" = "custom" ]; then
    NEW_VERSION="$CUSTOM_VERSION"
    npm version "$NEW_VERSION" --no-git-tag-version
else
    NEW_VERSION=$(npm version "$VERSION_TYPE" --no-git-tag-version | sed 's/^v//')
fi

success "Version bumped to: $NEW_VERSION"

# ============================================
# STEP 5: Build with New Version
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Build with New Version"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if build script exists
if node -e "process.exit(require('./package.json').scripts?.build ? 0 : 1)" 2>/dev/null; then
    info "Running build..."
    npm run build
    success "Build complete"
else
    info "No build script found, skipping"
fi

# ============================================
# STEP 6: Update CHANGELOG
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Update CHANGELOG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DATE=$(date +%Y-%m-%d)

# Create changelog entry
CHANGELOG_ENTRY="## [$NEW_VERSION] - $DATE

"

# Parse changelog entries by type
while IFS= read -r line; do
    if [[ $line =~ ^Added: ]]; then
        ADDED_ITEMS="${ADDED_ITEMS}- ${line#Added: }
"
    elif [[ $line =~ ^Changed: ]]; then
        CHANGED_ITEMS="${CHANGED_ITEMS}- ${line#Changed: }
"
    elif [[ $line =~ ^Fixed: ]]; then
        FIXED_ITEMS="${FIXED_ITEMS}- ${line#Fixed: }
"
    elif [[ $line =~ ^Breaking: ]]; then
        BREAKING_ITEMS="${BREAKING_ITEMS}- ${line#Breaking: }
"
    fi
done <<< "$CHANGELOG_ENTRIES"

# Build sections
[ -n "$ADDED_ITEMS" ] && CHANGELOG_ENTRY="${CHANGELOG_ENTRY}### Added
$ADDED_ITEMS
"
[ -n "$CHANGED_ITEMS" ] && CHANGELOG_ENTRY="${CHANGELOG_ENTRY}### Changed
$CHANGED_ITEMS
"
[ -n "$FIXED_ITEMS" ] && CHANGELOG_ENTRY="${CHANGELOG_ENTRY}### Fixed
$FIXED_ITEMS
"
[ -n "$BREAKING_ITEMS" ] && CHANGELOG_ENTRY="${CHANGELOG_ENTRY}### Breaking Changes
$BREAKING_ITEMS
"

# Insert into CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    # Insert after header - use a temp file approach instead of awk -v
    TEMP_FILE=$(mktemp)
    TEMP_ENTRY=$(mktemp)

    # Write changelog entry to temp file
    echo "$CHANGELOG_ENTRY" > "$TEMP_ENTRY"

    # Insert after first header line
    awk -v entry_file="$TEMP_ENTRY" '
        /^# / && !inserted {
            print $0
            print ""
            while ((getline line < entry_file) > 0) {
                print line
            }
            close(entry_file)
            inserted=1
            next
        }
        {print}
    ' CHANGELOG.md > "$TEMP_FILE"

    mv "$TEMP_FILE" CHANGELOG.md
    rm -f "$TEMP_ENTRY"
    success "CHANGELOG.md updated"
else
    # Create new CHANGELOG.md
    echo "# Changelog

$CHANGELOG_ENTRY" > CHANGELOG.md
    success "CHANGELOG.md created"
fi

# ============================================
# STEP 7: Commit and Tag
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Commit and Tag"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate commit message with Claude
info "Generating commit message with Claude..."
COMMIT_MSG=$(echo "$CHANGELOG_ENTRIES" | npx @anthropic-ai/claude-code -p "Based on these changelog entries, generate a single-line commit message (max 72 chars) for a release. Start with 'chore: release v$NEW_VERSION - ' followed by a brief summary of the main changes. Output only the commit message, nothing else.")

echo ""
echo "Commit message: $COMMIT_MSG"

# Stage all changes
git add -A

# Commit
git commit -m "$(cat <<EOF
$COMMIT_MSG

$CHANGELOG_ENTRIES
EOF
)"
success "Changes committed"

# Create tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
success "Tag created: v$NEW_VERSION"

# ============================================
# STEP 8: Dry Run
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Pre-Publish Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

info "Running npm publish --dry-run..."
npm publish --dry-run --tag "$NPM_TAG"
echo ""

# ============================================
# STEP 9: Publish
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Publish to npm"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Publishing: $CURRENT_VERSION → $NEW_VERSION (tag: $NPM_TAG)"
echo ""

# Publish to npm
info "Publishing to npm..."
npm publish --tag "$NPM_TAG"
success "Published to npm!"

# Push to git
info "Pushing to GitHub..."
git push origin main
git push origin --tags
success "Pushed to GitHub"

# ============================================
# STEP 10: Verify
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sleep 5  # Give npm a moment to update

info "Verifying npm publication..."
NPM_VERSION=$(npm view "$PACKAGE_NAME" version 2>/dev/null || echo "unknown")
if [ "$NPM_VERSION" = "$NEW_VERSION" ]; then
    success "npm shows version: $NPM_VERSION"
else
    warn "npm shows version: $NPM_VERSION (expected: $NEW_VERSION)"
    warn "It may take a few moments for npm to update"
fi

# ============================================
# Done!
# ============================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Release Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Released: $PACKAGE_NAME@$NEW_VERSION"
echo "npm tag: $NPM_TAG"
echo "Git tag: v$NEW_VERSION"
echo ""
echo "Test: npm install $PACKAGE_NAME@$NEW_VERSION"
echo ""