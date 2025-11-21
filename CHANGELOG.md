# Changelog

## [1.2.0] - 2025-11-20

### Added
- Debug mode functionality
- Toast-hyperclay integration with idiomorph



## [1.1.2] - 2025-11-20

### Changed
- Update load-jsdelivr.html

### Fixed
- Allow elements as context in All.js



## [1.1.1] - 2025-11-19

### Changed
- improved module exports

### Fixed
- post-publish script issues



## [1.1.0] - 2025-11-19

### Changed
- Updated release.sh script
- Modules can now specify custom exports
- Release documentation updated to skip GitHub releases step



All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.2] - 2025-11-19

### Added
- `window.hyperclayReady` promise that resolves when HyperclayJS is fully loaded
- `window.hyperclay` namespace with all exported module functions
- `window.h` as a shorter alias for `window.hyperclay`
- Automatic aggregation of all module exports into the global namespace

## [1.0.1] - 2025-11-18

### Added
- Build system that auto-generates `hyperclay.js` from `module-dependency-graph.json`
- Build script (`build/build-loader.js`) to generate loader from dependency graph
- Template file (`build/hyperclay.template.js`) for hyperclay.js generation
- `npm run build` command that generates dependency graph and builds loader
- `npm run build:loader` command to generate hyperclay.js
- RELEASE.md with comprehensive npm publication process
- Auto-generated dependency graph with accurate file sizes and dependencies
- Support for 32 modular features across 7 categories
- BUG_FIXES_REPORT.md documenting all critical bug fixes with effects and side effects
- FIXES_PLAN.md with implementation plans and pseudo code for remaining issues
- TOP_ISSUES.md tracking resolved critical issues
- NEXT_TOP_ISSES.md tracking upcoming issues to address

### Changed
- Reorganized entire codebase into category-based folder structure:
  - `core/` - Core hyperclay features (save, admin, persist, editmode, options)
  - `custom-attributes/` - HTML attribute enhancements (ajax, events, sortable, helpers)
  - `ui/` - UI components (toast, modals, prompts, info)
  - `utilities/` - General utilities (mutation, cookie, throttle, debounce, pipe)
  - `dom-utilities/` - DOM manipulation helpers (dom-ready, window-load, jquery-like, style-injection, dom-morphing)
  - `string-utilities/` - String manipulation tools (slugify, emmet-html, copy-to-clipboard, query-parser)
  - `communication/` - File upload and messaging (send-message, file-upload)
- Renamed `hyperclay-starter-kit.js` to `hyperclay.js` as main entry point
- Renamed `starter-kit-configurator.html` to `index.html`
- Updated configurator branding from "Hyperclay Starter Kit" to "Hyperclay.js Configurator"
- Moved build scripts from `scripts/` to `build/` directory
- Updated all import paths to reflect new folder structure
- Enhanced README.md with comprehensive module documentation, API examples, and development setup
- Updated package.json exports to match new folder structure
- Changed `npm run dev` to build before starting dev server
- Updated `prepublishOnly` script to run build and tests
- RELEASE.md updated to reflect new build process (no dist/ folder)

### Removed
- MIGRATION_GUIDE.md (content merged into README.md)
- `hyperclay/` folder (consolidated into main hyperclay.js)
- `dist/` directory (no longer needed with new build system)
- `scripts/` directory (moved to build/)
- `features/` empty directory
- Placeholder build scripts that didn't exist (build-modules.js, build-presets.js, build-starter.js)
- Missing dependencies from hyperclay.js (getTimeFromNow, restoreFromBackup, getCurrentFolderId, showHyperclayAppPopup, movingBorder)
- `build/` from .gitignore (build scripts need to be committed)

### Fixed
- All broken import paths after reorganization (23+ files updated)
- Module dependency paths in hyperclay.js to match actual folder structure
- Bug in resolveDependencies function that prevented modules with dependencies from being resolved
- Incorrect module mappings (ui/modals.js → ui/theModal.js, etc.)
- Template path reference in build-loader.js
- File list in package.json to include all new category folders
- Preset loading bug: presets are now correctly accessed via `.modules` property instead of being used as arrays directly

#### Critical Bug Fixes (10 issues resolved)
1. **Module initialization** - Modules with default exports now initialize correctly (`build/hyperclay.template.js`)
   - Added fallback to call `loaded.default()` when `loaded.init()` doesn't exist
2. **Admin feature activation** - Admin features now activate when loaded (`core/adminContenteditable.js`)
   - Added missing `init()` function that wires up before-save hooks and DOM-ready logic
3. **Ajax button handling** - Ajax buttons properly support their own action/method attributes (`custom-attributes/ajaxElements.js`)
   - Fixed to prioritize button's own attributes, fallback to parent form, support standalone buttons
   - Fixed import path from non-existent `../dom/` to `../dom-utilities/`
4. **sendMessage null safety** - No longer crashes when element isn't in a form (`communication/sendMessage.js`)
   - Added null guard with user-friendly error toast and rejected promise
5. **Select element persistence** - Select dropdowns now persist correctly after save (`core/enablePersistentFormInputValues.js`)
   - Added logic to toggle `selected` attribute on option elements for both single and multi-select
6. **Unsaved changes tracking** - beforeunload warning now fires correctly (`core/savePage.js`)
   - Set `unsavedChanges` flag based on content comparison in main savePage function
7. **Prototype extensions safety** - DOM prototype extensions are now idempotent and safe (`custom-attributes/domHelpers.js`)
   - Added idempotence check, `configurable: true`, and null guards in setters
8. **onclone handler completeness** - Now processes all descendants with [onclone] attribute (`custom-attributes/onclone.js`)
   - Made patch idempotent using `__hyperclayOnclone` marker
   - Process entire subtree, not just top-level element
9. **Behavior data collection** - Scroll and blur events now captured correctly (`communication/behaviorCollector.js`)
   - Changed scroll listener from `document` to `window`
   - Added blur event listener with capture
10. **All.js proxy chaining and context selectors** - Array methods return plain arrays for primitives, enabling native method chaining (`dom-utilities/All.js`)
    - Added `isElementArray()` helper to distinguish DOM nodes from primitives
    - jQuery-like behavior where `.map(el => el.id)` returns unwrapped array
    - Fixed empty array handling: empty results from element operations now maintain proxy wrapping for chainability
    - Fixed Symbol property handling: added type guard to prevent "Cannot convert Symbol to number" errors
    - Fixed context selector logic: `All(selector, context)` now correctly searches for selector WITHIN context (jQuery-style)

#### Remaining Issues (documented in FIXES_PLAN.md)
5 additional issues have been analyzed with implementation plans:
- Issue #11: File upload helpers crash on edge cases
- Issue #14: onclickaway stops processing other targets
- Issue #16: Save-button clicks bubble into native submissions
- Issue #17: Style injection dedupes by filename substring
- Issue #20: Autosize ignores dynamically added textareas

See `FIXES_PLAN.md` for detailed pseudo code and implementation strategy.

## [1.0.0] - 2025-11-14

### Added
- Initial release of HyperclayJS modular library
- Self-detecting module loader with automatic dependency resolution
- 32 modules organized into 7 categories
- 3 presets: minimal (~23KB), standard (~29KB), everything (~220KB)
- Interactive configurator for building custom bundles
- Automatic dependency graph generation using Madge
- Support for URL parameters (?preset=minimal, ?features=save,admin)
- Topological sorting for correct module load order
- Dynamic ES6 module imports
- Module auto-initialization system
- Global hyperclayReady event when modules finish loading

### Core Features
- save-core (4.9KB) - Basic save function
- save (4.4KB) - Full save with button, keyboard shortcut, auto-save
- admin (4.3KB) - Hide admin elements from viewers
- persist (1.4KB) - Persist form values to DOM
- options (4.3KB) - Dynamic show/hide based on page state
- editmode (0.9KB) - Toggle edit mode on/off

### Custom Attributes
- events (2.7KB) - onclickaway, onclone, onpagemutation, onrender
- ajax (1.8KB) - AJAX forms and buttons
- sortable (120KB) - Drag-drop sorting with Sortable.js
- helpers (5.2KB) - DOM methods (nearest, val, text, exec, cycle)
- inputs (0.9KB) - prevent-enter, autosize for textareas

### UI Components
- prompts (7.3KB) - Dialog functions (ask, consent, tell, snippet)
- toast (7.3KB) - Success/error notifications
- modals (18.8KB) - Full modal window system
- info (3.3KB) - Info dialog component
- tailwind-play (362KB) - Live Tailwind CSS editing

### Utilities
- mutation (12.8KB) - DOM mutation observation
- nearest (3.2KB) - Find nearest elements
- cookie (1.2KB) - Cookie management
- throttle (0.6KB) - Function throttling
- debounce (0.2KB) - Function debouncing
- pipe (0.1KB) - Function composition

### DOM Utilities
- dom-ready (0.2KB) - DOM ready callback
- window-load (0.2KB) - Window load callback
- jquery-like (12.1KB) - Full DOM manipulation library
- style-injection (0.8KB) - Dynamic stylesheet injection
- dom-morphing (7.9KB) - Efficient DOM updates (idiomorph)

### String Utilities
- slugify (0.5KB) - URL-friendly slug generator
- emmet-html (1.4KB) - Emmet-like HTML generation
- copy-to-clipboard (0.7KB) - Clipboard utility
- query-parser (0.1KB) - Parse URL search params

### Communication
- send-message (1.1KB) - Message sending utility
- file-upload (10.3KB) - File upload with progress

[Unreleased]: https://github.com/hyperclay/hyperclayjs/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/hyperclay/hyperclayjs/releases/tag/v1.0.0
