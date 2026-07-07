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

{{MODULE_TABLES}}

## Presets

{{PRESET_DESCRIPTIONS}}

## Lazy-Loaded Modules

Some modules with large vendor dependencies are **lazy-loaded** to optimize page performance:

| Module | Wrapper Size | Vendor Size | Loaded When |
|--------|-------------|-------------|-------------|
| `sortable` | ~3KB | ~118KB | Edit mode only |

**How it works:**
- The wrapper module checks if the page is in edit mode (`isEditMode`)
- If true, it injects a `<script save-remove>` tag that loads the vendor script
- If false, nothing is loaded - viewers don't download the heavy scripts
- The `save-remove` attribute (the legacy alias for `no-save`) strips the script tag when the page is saved

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

### Rich Text Editing (richclay)

Requires the `richclay` module (included in the `smooth-sailing` and `everything` presets). Editors activate only in edit mode; the saved file keeps just the author's markup plus the marker attribute.

```html
<!-- Inline editor: edits the element in place, matches the page's own styles,
     floating toolbar appears on focus. Value tokens combine like class names. -->
<h1 editable="single-line">Page title</h1>
<div editable>
  <p>Multi-line rich text with a floating toolbar.</p>
</div>
<p editable="single-line no-toolbar">No toolbar, keyboard shortcuts only</p>
<p editable="toolbar-on-select">Toolbar only while text is selected</p>

<!-- Card editor: bordered editor box with an attached toolbar -->
<div data-richclay aria-label="Article body">
  <p>Saved content.</p>
</div>
```

Full token reference, options, and custom toolbar buttons: the [richclay README](https://github.com/panphora/richclay#readme). `window.RichClay` / `window.hyperclay.RichClay` expose the class for custom buttons and programmatic use.

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
