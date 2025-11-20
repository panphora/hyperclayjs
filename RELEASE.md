# Release Process

This document outlines the step-by-step process for releasing a new version of HyperclayJS to npm.

## Pre-Release Checklist

Before starting a release, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Dependency graph is up to date (`npm run generate:deps`)
- [ ] No uncommitted changes (`git status`)
- [ ] On the `main` branch (`git checkout main`)
- [ ] Latest changes pulled (`git pull origin main`)
- [ ] All features/fixes for this release are merged
- [ ] Breaking changes (if any) are documented

## Release Steps

### 1. Update Dependencies

```bash
# Check for outdated dependencies
npm outdated

# Update if needed
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

### 2. Generate Fresh Dependency Graph

```bash
# Regenerate with latest file sizes and dependencies
npm run generate:deps

# Verify the output looks correct
git diff module-dependency-graph.json
```

### 3. Update Version Number

Choose the appropriate version bump:
- **Patch** (1.0.0 → 1.0.1) - Bug fixes, small changes
- **Minor** (1.0.0 → 1.1.0) - New features, backward compatible
- **Major** (1.0.0 → 2.0.0) - Breaking changes

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major
```

This will:
- Update `package.json` version
- Create a git commit with the version
- Create a git tag (e.g., `v1.2.3`)

### 4. Update CHANGELOG.md

Edit `CHANGELOG.md` to document the changes:

```markdown
## [1.2.3] - 2025-01-15

### Added
- New feature X
- Module Y for better performance

### Changed
- Updated module Z to use new API
- Improved error messages in feature A

### Fixed
- Bug in admin feature when...
- Memory leak in mutation observer

### Breaking Changes
- Renamed `oldFunction()` to `newFunction()`
- Changed module path from X to Y
```

### 5. Build Loader

```bash
# Build hyperclay.js from module-dependency-graph.json
npm run build

# This runs:
# 1. npm run generate:deps - Analyzes dependencies and creates module-dependency-graph.json
# 2. npm run build:loader - Generates hyperclay.js from the graph

# Verify build output
ls -lh hyperclay.js
cat hyperclay.js | head -20  # Check it shows "AUTO-GENERATED FILE"
```

### 6. Test the Build

```bash
# Run all tests
npm test

# Test the configurator locally
npm run dev

# Verify in browser:
# - Test minimal preset
# - Test standard preset
# - Test custom features
# - Check console for errors
# - Verify hyperclay.js loads correctly
```

### 7. Commit Changes

```bash
# Stage all changes
git add CHANGELOG.md module-dependency-graph.json hyperclay.js

# Commit
git commit -m "chore: prepare release v1.2.3"

# Update the version tag to include these changes
git tag -f v1.2.3
```

### 8. Push to GitHub

**Note:** We do not create formal GitHub releases at https://github.com/hyperclay/hyperclayjs/releases. The git tags and CHANGELOG.md serve as our release documentation.

```bash
# Push commits
git push origin main

# Push tags
git push origin --tags
```

### 9. Publish to npm

**IMPORTANT:** This is the point of no return. Once published, you cannot unpublish (only deprecate).

```bash
# Dry run to see what will be published
npm publish --dry-run

# Review the output carefully:
# - Check file list (should include hyperclay.js, core/, ui/, custom-attributes/, etc.)
# - Verify package.json is correct
# - Check version number

# If everything looks good, publish
npm publish

# For beta/alpha releases
npm publish --tag beta
npm publish --tag alpha
```

### 10. Verify Publication

```bash
# Check on npm
npm view hyperclayjs

# Test installation in a fresh project
mkdir /tmp/test-hyperclayjs
cd /tmp/test-hyperclayjs
npm init -y
npm install hyperclayjs

# Verify it works
node -e "console.log(require('hyperclayjs'))"
```

### 11. Update CDN (if applicable)

If you maintain a CDN version:

```bash
# Upload to CDN
# Example: Upload hyperclay.js and module folders to https://hyperclay.com/js/
# Required files: hyperclay.js, core/, custom-attributes/, ui/, utilities/, etc.

# Test CDN URLs
curl https://hyperclay.com/js/hyperclay.js?preset=minimal
```

### 12. Announce Release

- [ ] Post on Twitter/X
- [ ] Update documentation site
- [ ] Post in Discord/Slack community
- [ ] Email newsletter (if applicable)

Example announcement:
```
🚀 HyperclayJS v1.2.3 is now available!

✨ New features:
- Feature X for better Y
- Module Z improvements

🐛 Bug fixes:
- Fixed issue with admin features
- Performance improvements

📦 Install: npm install hyperclayjs
📚 Docs: https://hyperclay.com/docs
🔗 Release notes: https://github.com/hyperclay/hyperclayjs/releases/tag/v1.2.3
```

## Post-Release

### Monitor for Issues

- [ ] Watch GitHub issues for bug reports
- [ ] Monitor npm download stats
- [ ] Check for security vulnerabilities
- [ ] Review user feedback

### If Something Goes Wrong

#### Unpublish (within 72 hours)

```bash
# Only works within 72 hours of publishing
npm unpublish hyperclayjs@1.2.3
```

#### Deprecate (after 72 hours)

```bash
# Deprecate a version
npm deprecate hyperclayjs@1.2.3 "Critical bug, use 1.2.4 instead"

# Publish fixed version immediately
npm version patch
npm publish
```

## Beta/Alpha Releases

For pre-release versions:

```bash
# Update to pre-release version
npm version prepatch --preid=beta  # 1.0.0 -> 1.0.1-beta.0
npm version preminor --preid=beta  # 1.0.0 -> 1.1.0-beta.0
npm version premajor --preid=beta  # 1.0.0 -> 2.0.0-beta.0

# Or manually set version
npm version 2.0.0-beta.1

# Publish with tag
npm publish --tag beta

# Users install with:
npm install hyperclayjs@beta
```

## Rollback Process

If you need to rollback a release:

1. **Don't unpublish** - This breaks existing installs
2. **Publish a patch** with the fix
3. **Deprecate the bad version**:

```bash
npm deprecate hyperclayjs@1.2.3 "Bug in feature X, use 1.2.4"
```

## Version History

Keep this section updated with release dates:

- `1.0.0` - 2025-01-10 - Initial release
- `1.0.1` - 2025-01-12 - Bug fixes
- `1.1.0` - 2025-01-15 - New features

## Automated Release (Optional)

Consider setting up automated releases with GitHub Actions:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build
      - run: npm test

      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Release Signing (Optional)

For added security, sign your releases:

```bash
# Configure git to sign tags
git config user.signingkey YOUR_GPG_KEY_ID
git config tag.gpgSign true

# Create signed tag
git tag -s v1.2.3 -m "Release v1.2.3"

# Verify signature
git tag -v v1.2.3
```

## Emergency Hotfix Process

For critical bugs that need immediate release:

1. Create hotfix branch from the tagged release
2. Fix the bug
3. Bump patch version
4. Follow steps 5-10 above
5. Merge hotfix back to main

```bash
# Create hotfix branch
git checkout -b hotfix/1.2.4 v1.2.3

# Make fixes
# ... edit files ...

# Commit and version
git add .
git commit -m "fix: critical bug in feature X"
npm version patch

# Push and publish
git push origin hotfix/1.2.4
git push origin --tags
npm publish

# Merge back to main
git checkout main
git merge hotfix/1.2.4
git push origin main
```

## Support

For questions about the release process:
- Open an issue: https://github.com/hyperclay/hyperclayjs/issues
- Email: support@hyperclay.com
- Discord: https://discord.gg/hyperclay
