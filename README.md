# HyperclayJS

A modular JavaScript library for building interactive malleable HTML files with Hyperclay. Load only what you need with automatic dependency resolution.

## Features

- 🎯 **Modular Design** - Pick exactly the features you need
- 🚀 **Self-detecting Loader** - Automatic dependency resolution from URL params
- 📦 **Tree-shakeable** - Optimized for modern bundlers
- 🎨 **Rich Feature Set** - From basic save to advanced UI components
- 💪 **Zero Dependencies** - Core modules have no external dependencies
- 🔧 **Visual Configurator** - Interactive tool to build your custom bundle

## Quick Start

### Using CDN (Self-detecting Loader)

The self-detecting loader reads URL parameters and automatically loads the requested features with all dependencies.

Destructure directly from the import:

```html
<script type="module">
  const { toast, savePage } = await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=standard');
  toast('Hello!');
</script>
```

Or with custom features:

```html
<script type="module">
  const { toast, ask } = await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?features=toast,dialogs');
</script>
```

**Note:** Presets include `export-to-window` by default, which also exports to `window.hyperclay`. Omit it from custom features if you only want ES module exports.

### Using NPM

```bash
npm install hyperclayjs
```

```javascript
// Import specific modules
import { savePage } from 'hyperclayjs/core/savePage';
import toast from 'hyperclayjs/ui/toast';
```

To load a full preset, use the CDN loader with `?preset=standard`:

```html
<script type="module">
  await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=standard');
</script>
```

## Available Modules

### Core Features (Essential functionality)

| Module | Size | Description |
|--------|------|-------------|
| autosave | 1.4KB | Auto-save on DOM changes |
| edit-mode | 1.8KB | Toggle edit mode on hyperclay on/off |
| edit-mode-helpers | 6.8KB | Admin-only functionality: [viewmode:disabled], [editmode:resource], [editmode:onclick] |
| option-visibility | 7.1KB | Dynamic show/hide based on ancestor state with option:attribute="value" |
| persist | 6.4KB | Persist input/select/textarea values to the DOM with [persist] attribute |
| save-core | 11.5KB | Basic save function only - hyperclay.savePage() |
| save-system | 15.4KB | CMD+S, [trigger-save] button, savestatus attribute |
| save-toast | 0.9KB | Toast notifications for save events |
| snapshot | 11.9KB | Source of truth for page state - captures DOM snapshots for save and sync |
| unsaved-warning | 1.3KB | Warn before leaving page with unsaved changes |

### Custom Attributes (HTML enhancements)

| Module | Size | Description |
|--------|------|-------------|
| ajax-elements | 2.8KB | [ajax-form], [ajax-button] for async form submissions |
| dom-helpers | 6.8KB | el.nearest, el.val, el.text, el.exec, el.cycle |
| event-attrs | 5.3KB | [onclickaway], [onclickchildren], [onclone], [onpagemutation], [onrender] |
| input-helpers | 3.9KB | [prevent-enter], [autosize] for textareas |
| movable | 2.5KB | Free-positioning drag with [movable] and [movable-handle], edit mode only |
| onaftersave | 1KB | [onaftersave] attribute - run JS when save status changes |
| refetch-on-save | 0.9KB | Flash-free refetch of href/src resources on save via [refetch-on-save] attribute |
| save-freeze | 2.8KB | [save-freeze] attribute - freeze element innerHTML for saves, live DOM changes freely |
| sortable | 3.3KB | Drag-drop sorting with [sortable], lazy-loads ~118KB Sortable.js in edit mode |

### UI Components (User interface elements)

| Module | Size | Description |
|--------|------|-------------|
| dialogs | 8.5KB | ask(), consent(), tell(), snippet() dialog functions |
| quickcrop | 16.8KB | Image-crop modal for upload flows - quickcrop(file) returns a cropped Blob; uses themodal when available |
| the-modal | 23KB | Full modal window creation system - window.theModal |
| toast | 15.8KB | Success/error message notifications, toast(msg, msgType) |

### Utilities (Core utilities (often auto-included))

| Module | Size | Description |
|--------|------|-------------|
| cache-bust | 0.6KB | Cache-bust href/src attributes |
| cookie | 1.4KB | Cookie management (often auto-included) |
| debounce | 0.7KB | Function debouncing |
| mutation | 16.4KB | DOM mutation observation (often auto-included) |
| nearest | 3.4KB | Find nearest elements (often auto-included) |
| throttle | 1.3KB | Function throttling |

### DOM Utilities (DOM manipulation helpers)

| Module | Size | Description |
|--------|------|-------------|
| all-js | 14.7KB | Full DOM manipulation library |
| dom-ready | 0.4KB | DOM ready callback |
| form-data | 2KB | Extract form data as an object |
| style-injection | 4.2KB | Dynamic stylesheet injection |

### String Utilities (String manipulation helpers)

| Module | Size | Description |
|--------|------|-------------|
| copy-to-clipboard | 0.9KB | Clipboard utility |
| query-params | 0.3KB | Parse URL search params |
| slugify | 1KB | URL-friendly slug generator |

### Communication & Files (File handling and messaging)

| Module | Size | Description |
|--------|------|-------------|
| file-upload | 11.3KB | File upload with progress |
| live-sync | 25.9KB | Real-time DOM sync across browsers |
| send-message | 1.3KB | Message sending utility |

### Data & Undo (Page data and undo history)

| Module | Size | Description |
|--------|------|-------------|
| data | 0.5KB | Read/write structured data from the DOM via named rules tags — window.hyperclay.extractData() / applyData(). Backs the /_/api endpoint shape. |
| undo | 0.8KB | DOM-state undo/redo via MutationObserver inverse-op replay. Cmd+Z works out of the box; integrates with hypercms via window.hyperclay.undo. |

### Vendor Libraries (Third-party libraries)

| Module | Size | Description |
|--------|------|-------------|
| hyper-morph | 18.8KB | DOM morphing with content-based element matching |
| hypercms | 135.4KB | Live edit-in-place CMS sidebar driven by a hyper-html-api rules tag. Pairs with [sortable] and [hyper-morph]. |

## Presets

### Minimal (~62.7KB)
Essential features for basic editing

**Modules:** `save-core`, `snapshot`, `save-system`, `edit-mode-helpers`, `toast`, `save-toast`, `export-to-window`, `view-mode-excludes-edit-modules`

### Standard (~90.1KB)
Standard feature set for most use cases

**Modules:** `save-core`, `snapshot`, `save-system`, `unsaved-warning`, `edit-mode-helpers`, `persist`, `option-visibility`, `event-attrs`, `dom-helpers`, `data`, `toast`, `save-toast`, `export-to-window`, `view-mode-excludes-edit-modules`

### CMS (~213.1KB)
Visual CMS editing for rules-tag pages: hypercms sidebar, undo, drag-reorder, save

**Modules:** `save-core`, `snapshot`, `save-system`, `unsaved-warning`, `toast`, `save-toast`, `mutation`, `hypercms`, `sortable`, `undo`, `export-to-window`, `view-mode-excludes-edit-modules`

### Smooth Sailing (~358.9KB)
Everything, without gotchas

**Modules:** `save-core`, `save-system`, `unsaved-warning`, `save-toast`, `edit-mode-helpers`, `persist`, `snapshot`, `option-visibility`, `edit-mode`, `event-attrs`, `ajax-elements`, `sortable`, `movable`, `dom-helpers`, `input-helpers`, `onaftersave`, `save-freeze`, `dialogs`, `quickcrop`, `toast`, `the-modal`, `mutation`, `nearest`, `cookie`, `throttle`, `debounce`, `dom-ready`, `window-load`, `all-js`, `style-injection`, `form-data`, `hypercms`, `undo`, `data`, `slugify`, `copy-to-clipboard`, `query-params`, `behavior-collector`, `send-message`, `file-upload`, `refetch-on-save`, `export-to-window`, `view-mode-excludes-edit-modules`

### Everything (~405.6KB)
All available features

Includes all available modules across all categories.

## Lazy-Loaded Modules

Some modules with large vendor dependencies are **lazy-loaded** to optimize page performance:

| Module | Wrapper Size | Vendor Size | Loaded When |
|--------|-------------|-------------|-------------|
| `sortable` | ~3KB | ~118KB | Edit mode only |

**How it works:**
- The wrapper module checks if the page is in edit mode (`isEditMode`)
- If true, it injects a `<script save-remove>` tag that loads the vendor script
- If false, nothing is loaded - viewers don't download the heavy scripts
- The `save-remove` attribute strips the script tag when the page is saved

This means:
- **Editors** get full functionality when needed
- **Viewers** never download the heavy vendor scripts
- **Saved pages** stay clean with no leftover script tags

## Visual Configurator

Explore features and build your custom bundle with our interactive configurator:

```bash
npm run dev
```

This will:
1. Generate fresh dependency data
2. Start a local server on port 3535
3. Open the configurator in your browser

The configurator shows:
- Real-time bundle size calculation
- Automatic dependency resolution
- Generated CDN URL
- Feature descriptions and categories

## Development

### Project Structure

```
hyperclayjs/
├── src/hyperclay.js          # Self-detecting module loader
├── src/core/                 # Core hyperclay features
├── src/custom-attributes/    # HTML attribute enhancements
├── src/ui/                   # UI components (toast, modals, prompts)
├── src/utilities/            # General utilities (mutation, cookie, etc.)
├── src/dom-utilities/        # DOM manipulation helpers
├── src/string-utilities/     # String manipulation tools
├── src/communication/        # File upload and messaging
├── src/vendor/               # Third-party libraries (Sortable.js, etc.)
├── scripts/                  # Build and generation scripts
└── website/config.html       # Interactive configurator
```

### Setup

```bash
# Install dependencies
npm install

# Generate dependency graph
npm run generate:deps

# Start development server with configurator
npm run dev

# Build bundles
npm run build

# Run tests
npm test
```

### Automatic Dependency Graph

The project uses Madge to automatically analyze dependencies and generate rich metadata:

```bash
npm run generate:deps
```

This creates `module-dependency-graph.generated.json` with:
- Complete dependency tree
- Actual file sizes
- Category assignments
- Preset configurations

The configurator dynamically loads this file to always show accurate information.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

The loader uses ES modules with top-level await. Use `await import()` to ensure modules finish loading before your code runs.

## API Examples

### Save System

```javascript
// Manually save the page
hyperclay.savePage();

// Add save button
hyperclay.initHyperclaySaveButton(); // Looks for [trigger-save]

// Keyboard shortcut
hyperclay.initSaveKeyboardShortcut(); // CMD/CTRL+S
```

Any element with the `trigger-save` attribute saves the page on click. For
viewers who can't save (not the owner / not in edit mode), the loader shows a
toast instead — "You're not the owner, changes are local only" — even on pages
that exclude the save modules via `view-mode-excludes-edit-modules`.

### Toast Notifications

```javascript
toast("Operation successful!", "success");
toast("Something went wrong", "error");
```

### Dialog Prompts

```javascript
// Ask for input
const name = await ask("What's your name?");

// Get consent
const agreed = await consent("Do you agree to terms?");

// Show message
tell("Welcome to Hyperclay!");
```

### Custom Attributes

```html
<!-- AJAX form submission -->
<form ajax-form="/api/submit">
  <input name="email" type="email">
  <button>Submit</button>
</form>

<!-- Auto-resize textarea -->
<textarea autosize></textarea>

<!-- Drag-drop sorting -->
<ul sortable>
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

<!-- Run code when clicked away -->
<div onclickaway="console.log('Clicked outside')">
  Click outside this div
</div>

<!-- Persist input/select/textarea values -->
<input type="text" name="username" persist>
```

### Admin Features

```html
<!-- Only visible/editable in edit mode -->
<div contenteditable editmode:contenteditable>Admin can edit this</div>
<input type="text" viewmode:disabled>
<script editmode:resource>console.log('Admin only');</script>
```

## Module Creation

Each module should be a self-contained ES module:

```javascript
// features/my-feature.js
import dependency from '../utilities/dependency.js';

export default function myFeature() {
  // Feature implementation
}

// Auto-init when module is imported
myFeature();
```

## Migration from Monolithic Script

### Before
```html
<script src="/public/js/old-hyperclay.js"></script>
```

### After
```html
<!-- Use preset -->
<script src="/public/js/hyperclay.js?preset=standard" type="module"></script>

<!-- Or specific features -->
<script src="/public/js/hyperclay.js?features=save-core,edit-mode-helpers,toast" type="module"></script>
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `npm run generate:deps` to update the dependency graph
5. Test your changes with `npm run dev`
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT © Hyperclay

### Third-Party Credits

This project includes the following open-source libraries:

- **[HyperMorph](https://github.com/hyperclay/hyper-morph)** - DOM morphing with content-based element matching (0BSD)
- **[Sortable.js](https://github.com/SortableJS/Sortable)** - Drag-and-drop library (MIT)

## Links

- [Documentation](https://hyperclay.com/docs)
- [Examples](https://hyperclay.com/examples)
- [Configurator](https://hyperclay.com/configurator)
- [GitHub Issues](https://github.com/hyperclay/hyperclayjs/issues)
