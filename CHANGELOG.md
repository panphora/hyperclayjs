# Changelog

## [1.19.5] - 2026-01-31

### Added
- `savePageForce` and `view-mode-excludes-edit-modules` options in `PRESETS['smooth-sailing']`



## [1.19.4] - 2026-01-31

### Added
- `savePageForce()` function that bypasses duplicate content check when saving pages



## [1.19.3] - 2026-01-31

### Fixed
- Add preset and features merge to template output, add DO NOT EDIT warning to generated files



## [1.19.2] - 2026-01-31

### Added
- Allow features param to add modules on top of a preset
- Description below Smooth Sailing preset
- Cache headers for improved performance

### Changed
- Updated wrangler configuration
- Updated config page

### Fixed
- Button height in preset UI



## [1.19.1] - 2026-01-30

### Added
- Smooth Sailing preset — all modules with no difficulty tags
- Intermediate difficulty to hyper-morph and cache-bust modules, updated config page legend

### Changed
- Module dependency graph regenerated



## [1.19.0] - 2026-01-30

### Added
- Snapshot-remove attribute and onbeforesnapshot hook

### Changed
- Updated website meta descriptions and intro copy

### Fixed
- Warning toast icon SVG



## [1.18.0] - 2026-01-22

### Added
- Module difficulty levels and notification support
- Snapshot HTML sent with save for platform live sync



## [1.17.0] - 2026-01-12

### Added
- Autosave on [persist] input changes
- Allow toast-hyperclay to configure default toast styling
- Full document sync with Mutation.pause/resume
- Smart script matching for live sync

### Changed
- Update hyper-morph vendor with head improvements
- Update hyper-morph vendor with extension element handling
- Remove unnecessary defensive code in live-sync and toast

### Fixed
- Prevent FOUC when cache-busting Tailwind CSS after save
- Live-sync null reference errors and improve debugging
- Live sync bugs: clientId sharing, headHash false positives, Tailwind duplicates
- Include config.html in version update build script



## [1.16.0] - 2026-01-07

### Added
- Autosize functionality

### Changed
- Updated dependencies for better compatibility
- Made live-sync depend on hyper-morph directly
- Optimized save system with single DOM clone and no parsing for comparisons
- Replaced Idiomorph with HyperMorph for DOM morphing

### Fixed
- Save system edge cases
- Unsaved warning false positives and added autosave debug logging



## [1.15.0] - 2025-12-24

### Added
- Multi-value OR and negation syntax to option visibility conditions
- Empty value matching support in option visibility

### Changed
- Extracted parseOptionAttribute function for improved testability



## [1.14.1] - 2025-12-24

### Added
- Documentation comments explaining key design decisions

### Changed
- Improved baseline capture and insertStyles stability



## [1.14.0] - 2025-12-24

### Added
- hiddenExports configuration option
- view-mode-excludes-edit toggle

### Changed
- release.sh to be generic for any npm package
- release.sh to auto-accept after version selection

### Fixed
- cacheBust and tailwindInject bugs
- release.sh to build after version bump



## [1.13.0] - 2025-12-22

### Added
- CSS variables for modal and toast font customization



## [1.12.0] - 2025-12-22

### Added
- Documentation for Custom Attributes and Save/Edit Features
- Documentation for all event attributes
- onclickchildren event attribute



## [1.11.0] - 2025-12-22

### Added
- tailwindInject module for injecting Tailwind CSS
- view-mode optimization



## [1.10.0] - 2025-12-20

### Added
- live-sync feature with documentation
- Content Mirror demo (renamed from Live Sync)

### Changed
- live-sync to extract head/body from snapshot clone
- save-system description updated
- load-jsdelivr.html tracked in git for CI builds

### Fixed
- release script path for load-jsdelivr.html
- config.html to load module data from CDN in production
- build script to update website/load-jsdelivr.html directly



## [1.9.0] - 2025-12-19

### Added
- snapshot.js as source of truth for page state
- save, cache bust, and live-sync functionality

### Changed
- Update build scripts and regenerate docs
- Misc improvements
- Rename insertStyleTag to insertStyles with backwards compatibility
- Improved timeout handling
- More accurate documentation
- Update index.html

### Fixed
- live-sync headHash handling
- build/load-jsdelivr.html



## [1.8.0] - 2025-12-12

### Added
- Documentation and website
- Open graph meta tags
- Favicon and improved meta tags

### Changed
- Reorganized project structure by moving source files to src/ directory
- Moved website files to website/ directory and configured Cloudflare Workers deploy
- Improved heading colors
- Improved demos with better descriptions

### Fixed
- Modal styles
- Library dependencies and demo front page



## [1.7.0] - 2025-12-05

### Changed
- Improved Option Visibility library



## [1.6.0] - 2025-12-03

### Changed
- Updated URLs to version 1.5.0
- Removed Tailwind Play integration



## [1.5.0] - 2025-12-02

### Added
- savestatus, save-toast, and onaftersave features

### Changed
- URLs updated to version 1.4.0



## [1.4.0] - 2025-11-25

### Added
- Lazy-load vendor scripts in edit mode only
- Toggle switch for export-to-window in configurator
- Migration guide for v1.2 → v1.3+
- ES module exports and fix standalone module imports

### Changed
- Update module-dependency-graph.json
- Make window exports optional via export-to-window module

### Fixed
- Update admin description
- Update edit-mode description
- Changelog

### Breaking Changes
- Remove emmet-mini, info removal, tell API change, toast.useLegacy removal



All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.1] - 2025-11-22

### Fixed
- Use `import.meta.url` instead of `document.currentScript` for ES module compatibility
- jsDelivr cache loader now properly detects failed loads (requires modules.length > 0)
- Added no-cache headers to load-jsdelivr.html

## [1.3.0] - 2025-11-22

### Breaking Changes
- **Module ID renames** - Update your `?features=` URLs:
  - `save` → `save-system`
  - `options` → `option-visibility`
  - `editmode` → `edit-mode`
  - `events` → `event-attrs`
  - `ajax` → `ajax-elements`
  - `helpers` → `dom-helpers`
  - `inputs` → `input-helpers`
  - `prompts` → `dialogs`
  - `modals` → `modal`
  - `alljs` → `all-js`
  - `get-data-from-form` → `form-data`
  - `copy-to-clipboard` → `clipboard`
  - `query-parser` → `query-params`
- **Removed `info` module** - Merged into `dialogs`. Use `?features=dialogs` to get `info()`.
- **Removed `hyperclayReady`** - No longer needed. Scripts after loader auto-wait via top-level await.
- **Standard preset changed** - Now includes `option-visibility`, excludes `ajax-elements`
- **Safari 15.4+ required** - Top-level await requires Safari 15.4+

### Changed
- Display names now match module IDs in configurator UI
- Renamed template: `hyperclay-minimal.template.js` → `hyperclay.template.js`
- Parallel module loading simplified and cleaned up
- Extracted autosave into separate `core/autosave.js` module

### Fixed
- LOAD_FIRST set updated to use new module IDs (`dom-helpers`, `all-js`)

## [1.2.0] - 2025-11-20

### Added
- Debug mode via `?debug=true` URL parameter
- `toast-hyperclay` module for legacy Hyperclay platform styling
- Idiomorph integration

### Changed
- Optimized module loading to happen in parallel

## [1.1.2] - 2025-11-20

### Changed
- Updated load-jsdelivr.html

### Fixed
- Allow elements as context in All.js (`All(selector, element)`)

## [1.1.1] - 2025-11-19

### Changed
- Improved module exports

### Fixed
- Post-publish script issues

## [1.1.0] - 2025-11-19

### Changed
- Updated release.sh script
- Modules can now specify custom exports
- Release documentation updated to skip GitHub releases step

## [1.0.2] - 2025-11-19

### Added
- `window.hyperclayReady` promise that resolves when HyperclayJS is fully loaded
- `window.hyperclay` namespace with all exported module functions
- `window.h` as a shorter alias for `window.hyperclay`
- Automatic aggregation of all module exports into the global namespace

## [1.0.1] - 2025-11-18

### Added
- Build system that auto-generates `hyperclay.js` from `module-dependency-graph.json`
- Template file for hyperclay.js generation
- `npm run build` and `npm run build:loader` commands
- RELEASE.md with npm publication process
- Support for 32 modular features across 7 categories

### Changed
- Reorganized codebase into category-based folder structure
- Renamed `hyperclay-starter-kit.js` to `hyperclay.js`
- Renamed `starter-kit-configurator.html` to `index.html`
- Updated README.md with comprehensive documentation

### Fixed
- All broken import paths after reorganization
- Module dependency paths to match folder structure
- Preset loading bug (now correctly accesses `.modules` property)
- 10 critical bugs including module initialization, admin features, ajax buttons, etc.

## [1.0.0] - 2025-11-14

### Added
- Initial release of HyperclayJS modular library
- Self-detecting module loader with automatic dependency resolution
- 32 modules organized into 7 categories
- 3 presets: minimal, standard, everything
- Interactive configurator for building custom bundles
- Automatic dependency graph generation using Madge
- URL parameters support (?preset=minimal, ?features=save,admin)
- Topological sorting for correct module load order
- Dynamic ES6 module imports
- Module auto-initialization system
