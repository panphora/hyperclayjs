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

Use `await import()` to ensure modules finish loading before your code runs:

```html
<!-- Standard setup with window.hyperclay (presets include export-to-window) -->
<script type="module">
  await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=standard');
  const { toast, savePage } = window.hyperclay;
</script>

<!-- Custom features with window.hyperclay (include export-to-window explicitly) -->
<script type="module">
  await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?features=save-core,toast,export-to-window');
  const { toast, savePage } = window.hyperclay;
</script>

<!-- ES modules only (omit export-to-window) -->
<script type="module">
  await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?features=save-core,toast');
  const { default: toast } = window.hyperclayModules['toast'];
</script>
```

**Note:** Presets (`?preset=...`) include `export-to-window` by default. Custom features (`?features=...`) require explicitly adding `export-to-window` if you want `window.hyperclay` access.

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

{{MODULE_TABLES}}

## Presets

{{PRESET_DESCRIPTIONS}}

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

<!-- Persist form values -->
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
<script src="/js/hyperclay.js?features=save,admin,toast" type="module"></script>
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

## Links

- [Documentation](https://hyperclay.com/docs)
- [Examples](https://hyperclay.com/examples)
- [Configurator](https://hyperclay.com/configurator)
- [GitHub Issues](https://github.com/hyperclay/hyperclayjs/issues)
