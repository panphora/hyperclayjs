# HyperclayJS

A modular JavaScript library for building interactive HTML applications with Hyperclay. Load only what you need with automatic dependency resolution.

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
  const { toast, savePage } = await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=standard');
  toast('Hello!');
</script>
```

Or with custom features:

```html
<script type="module">
  const { toast, ask } = await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?features=toast,dialogs');
</script>
```

**Note:** Presets include `export-to-window` by default, which also exports to `window.hyperclay`. Omit it from custom features if you only want ES module exports.

### Using NPM

```bash
npm install hyperclayjs
```

```javascript
// Import specific modules
import { savePage } from 'hyperclayjs/core/savePage.js';
import toast from 'hyperclayjs/ui/toast.js';

// Or use presets
import 'hyperclayjs/presets/standard.js';
```

## Available Modules

### Core Features (Essential functionality)

| Module | Size | Description |
|--------|------|-------------|
| autosave | 1.1KB | Auto-save on DOM changes, unsaved changes warning |
| edit-mode | 1.8KB | Toggle edit mode on hyperclay on/off |
| edit-mode-helpers | 5.4KB | Admin-only functionality: [edit-mode-input], [edit-mode-resource], [edit-mode-onclick] |
| option-visibility | 4.7KB | Dynamic show/hide based on ancestor state with option:attribute="value" |
| persist | 2.5KB | Persist input/select/textarea values to the DOM with [persist] attribute |
| save-core | 6.3KB | Basic save function only - hyperclay.savePage() |
| save-system | 7KB | Manual save: keyboard shortcut (CMD+S), save button, change tracking |
| save-toast | 0.9KB | Toast notifications for save events (opt-in) |

### Custom Attributes (HTML enhancements)

| Module | Size | Description |
|--------|------|-------------|
| ajax-elements | 2.8KB | [ajax-form], [ajax-button] for async form submissions |
| dom-helpers | 5.7KB | el.nearest, el.val, el.text, el.exec, el.cycle |
| event-attrs | 3.6KB | [onclickaway], [onclone], [onpagemutation], [onrender] |
| input-helpers | 1.2KB | [prevent-enter], [autosize] for textareas |
| onaftersave | 1.2KB | [onaftersave] attribute - run JS when save status changes |
| sortable | 2.8KB | Drag-drop sorting with [sortable], lazy-loads ~118KB Sortable.js in edit mode |

### UI Components (User interface elements)

| Module | Size | Description |
|--------|------|-------------|
| dialogs | 8.4KB | ask(), consent(), tell(), snippet() dialog functions |
| tailwind-play | 0.7KB | Live Tailwind CSS editing, lazy-loads ~370KB script in edit mode only |
| the-modal | 19.8KB | Full modal window creation system - window.theModal |
| toast | 7.7KB | Success/error message notifications, toast(msg, msgType) |

### Utilities (Core utilities (often auto-included))

| Module | Size | Description |
|--------|------|-------------|
| cookie | 1.4KB | Cookie management (often auto-included) |
| debounce | 0.4KB | Function debouncing |
| mutation | 13KB | DOM mutation observation (often auto-included) |
| nearest | 3.4KB | Find nearest elements (often auto-included) |
| throttle | 0.8KB | Function throttling |

### DOM Utilities (DOM manipulation helpers)

| Module | Size | Description |
|--------|------|-------------|
| all-js | 14KB | Full DOM manipulation library |
| dom-ready | 0.4KB | DOM ready callback |
| form-data | 2KB | Extract form data as an object |
| style-injection | 1.1KB | Dynamic stylesheet injection |

### String Utilities (String manipulation helpers)

| Module | Size | Description |
|--------|------|-------------|
| copy-to-clipboard | 0.9KB | Clipboard utility |
| query-params | 0.3KB | Parse URL search params |
| slugify | 0.7KB | URL-friendly slug generator |

### Communication & Files (File handling and messaging)

| Module | Size | Description |
|--------|------|-------------|
| file-upload | 10.7KB | File upload with progress |
| send-message | 1.4KB | Message sending utility |

### Vendor Libraries (Third-party libraries)

| Module | Size | Description |
|--------|------|-------------|
| idiomorph | 8.2KB | Efficient DOM morphing library |

## Presets

### Minimal (~27.7KB)
Essential features for basic editing

**Modules:** `save-core`, `save-system`, `edit-mode-helpers`, `toast`, `save-toast`, `export-to-window`

### Standard (~44.2KB)
Standard feature set for most use cases

**Modules:** `save-core`, `save-system`, `edit-mode-helpers`, `persist`, `option-visibility`, `event-attrs`, `dom-helpers`, `toast`, `save-toast`, `export-to-window`

### Everything (~149.6KB)
All available features

Includes all available modules across all categories.

## Lazy-Loaded Modules

Some modules with large vendor dependencies are **lazy-loaded** to optimize page performance:

| Module | Wrapper Size | Vendor Size | Loaded When |
|--------|-------------|-------------|-------------|
| `sortable` | ~3KB | ~118KB | Edit mode only |
| `tailwind-play` | ~1KB | ~370KB | Edit mode only |

**How it works:**
- The wrapper module checks if the page is in edit mode (`isEditMode`)
- If true, it injects a `<script save-ignore>` tag that loads the vendor script
- If false, nothing is loaded - viewers don't download the heavy scripts
- The `save-ignore` attribute strips the script tag when the page is saved

This means:
- **Editors** get full functionality when needed
- **Viewers** never download ~500KB of vendor scripts
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
├── hyperclay.js              # Self-detecting module loader
├── core/                     # Core hyperclay features
├── custom-attributes/        # HTML attribute enhancements
├── ui/                       # UI components (toast, modals, prompts)
├── utilities/                # General utilities (mutation, cookie, etc.)
├── dom-utilities/            # DOM manipulation helpers
├── string-utilities/         # String manipulation tools
├── communication/            # File upload and messaging
├── vendor/                   # Third-party libraries (Sortable.js, etc.)
├── scripts/                  # Build and generation scripts
└── starter-kit-configurator.html  # Interactive configurator
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

This creates `module-dependency-graph.json` with:
- Complete dependency tree
- Actual file sizes
- Category assignments
- Preset configurations

The configurator dynamically loads this file to always show accurate information.

## Browser Support

- Chrome 89+
- Firefox 89+
- Safari 15.4+
- Edge 89+

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
<div contenteditable edit-mode-contenteditable>Admin can edit this</div>
<input type="text" edit-mode-input>
<script edit-mode-resource>console.log('Admin only');</script>
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
<script src="/js/old-hyperclay.js"></script>
```

### After
```html
<!-- Use preset -->
<script src="/js/hyperclay.js?preset=standard" type="module"></script>

<!-- Or specific features -->
<script src="/js/hyperclay.js?features=save,edit-mode-helpers,toast" type="module"></script>
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

- **[Idiomorph](https://github.com/bigskysoftware/idiomorph)** - DOM morphing library by Big Sky Software (0BSD)
- **[Tailwind CSS](https://github.com/tailwindlabs/tailwindcss)** - Utility-first CSS framework by Tailwind Labs (MIT)
- **[Sortable.js](https://github.com/SortableJS/Sortable)** - Drag-and-drop library (MIT)

## Links

- [Documentation](https://hyperclay.com/docs)
- [Examples](https://hyperclay.com/examples)
- [Configurator](https://hyperclay.com/configurator)
- [GitHub Issues](https://github.com/hyperclay/hyperclayjs/issues)
