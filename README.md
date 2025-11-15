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

The self-detecting loader reads URL parameters and automatically loads the requested features with all dependencies:

```html
<!-- Minimal setup (~23KB) -->
<script src="https://hyperclay.com/js/hyperclay.js?preset=minimal" type="module"></script>

<!-- Standard setup (~50KB) -->
<script src="https://hyperclay.com/js/hyperclay.js?preset=standard" type="module"></script>

<!-- Custom features -->
<script src="https://hyperclay.com/js/hyperclay.js?features=save,admin,toast,ajax" type="module"></script>

<!-- Everything (~220KB) -->
<script src="https://hyperclay.com/js/hyperclay.js?preset=everything" type="module"></script>
```

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
| `save-core` | 4.9KB | Basic save function - `hyperclay.savePage()` |
| `save` | 4.4KB | Full save: button, keyboard shortcut, auto-save, change tracking |
| `admin` | 4.3KB | Hides admin inputs, scripts, contenteditable for viewers |
| `persist` | 1.4KB | Persist form values to DOM with `[persist]` attribute |
| `options` | 4.3KB | Dynamic show/hide based on page state |
| `editmode` | 0.9KB | Toggle edit mode on/off |

### Custom Attributes (HTML enhancements)

| Module | Size | Description |
|--------|------|-------------|
| `events` | 2.7KB | `[onclickaway]`, `[onclone]`, `[onpagemutation]`, `[onrender]` |
| `ajax` | 1.8KB | `[ajax-form]`, `[ajax-button]` for async submissions |
| `sortable` | 120KB | Drag-drop sorting with `[sortable]` - includes Sortable.js |
| `helpers` | 5.2KB | DOM methods: `el.nearest`, `el.val`, `el.text`, `el.exec`, `el.cycle` |
| `inputs` | 0.9KB | `[prevent-enter]`, `[autosize]` for textareas |

### UI Components (User interface elements)

| Module | Size | Description |
|--------|------|-------------|
| `prompts` | 7.3KB | Dialog functions: `ask()`, `consent()`, `tell()`, `snippet()` |
| `toast` | 7.3KB | Success/error notifications - `toast(msg, msgType)` |
| `modals` | 18.8KB | Full modal window system - `window.theModal` |
| `info` | 3.3KB | Info dialog component |
| `tailwind-play` | 362KB | Live Tailwind CSS editing based on HTML classes |

### Utilities (Often auto-included)

| Module | Size | Description |
|--------|------|-------------|
| `mutation` | 12.8KB | DOM mutation observation (auto-included by features) |
| `nearest` | 3.2KB | Find nearest elements (auto-included by helpers) |
| `cookie` | 1.2KB | Cookie management (auto-included by admin) |
| `throttle` | 0.6KB | Function throttling |
| `debounce` | 0.2KB | Function debouncing |

### DOM Utilities

| Module | Size | Description |
|--------|------|-------------|
| `dom-ready` | 0.2KB | DOM ready callback |
| `window-load` | 0.2KB | Window load callback |
| `jquery-like` | 12.1KB | Full DOM manipulation library |
| `style-injection` | 0.8KB | Dynamic stylesheet injection |
| `dom-morphing` | 7.9KB | Efficient DOM updates (idiomorph) |

### String Utilities

| Module | Size | Description |
|--------|------|-------------|
| `slugify` | 0.5KB | URL-friendly slug generator |
| `emmet-html` | 1.4KB | Emmet-like HTML generation |
| `copy-to-clipboard` | 0.7KB | Clipboard utility |
| `query-parser` | 0.1KB | Parse URL search params |

### Communication & Files

| Module | Size | Description |
|--------|------|-------------|
| `send-message` | 1.1KB | Message sending utility |
| `file-upload` | 10.3KB | File upload with progress |

## Presets

### Minimal (~23KB)
Essential features for basic editing:
- `save-core`, `save`, `admin`, `toast`

### Standard (~29KB)
Standard feature set for most use cases:
- Everything in Minimal
- `persist`, `ajax`, `events`, `helpers`

### Everything (~220KB)
All available features including:
- All core features
- All custom attributes (including sortable)
- All UI components
- Development tools (Tailwind Play)

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

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All features use modern JavaScript (ES2020+). For older browser support, use a transpiler.

## API Examples

### Save System

```javascript
// Manually save the page
hyperclay.savePage();

// Initialize auto-save
hyperclay.initSavePageOnChange();

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
<!-- Only visible/editable when admin -->
<div contenteditable admin>Admin can edit this</div>
<input type="text" admin>
<script admin>console.log('Admin only');</script>
```

## Module Creation

Each module should be a self-contained ES module:

```javascript
// features/my-feature.js
import dependency from '../utilities/dependency.js';

export default function myFeature() {
  // Feature implementation
}

// Export initialization function
export function init() {
  if (typeof window !== 'undefined') {
    // Auto-initialize on import
    myFeature();
  }
}

// Auto-run if needed
if (typeof window !== 'undefined') {
  init();
}
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
