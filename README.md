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
<!-- Minimal setup -->
<script src="https://hyperclay.com/js/hyperclay.js?preset=minimal" type="module"></script>

<!-- Standard setup -->
<script src="https://hyperclay.com/js/hyperclay.js?preset=standard" type="module"></script>

<!-- Custom features -->
<script src="https://hyperclay.com/js/hyperclay.js?features=save,admin,toast,ajax" type="module"></script>

<!-- Everything -->
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
| Admin Features | 5.3KB | Hides admin inputs, scripts, contenteditable, onclick for regular viewers |
| Edit Mode | 1.4KB | Toggle edit mode on/off |
| Form Persistence | 2.2KB | Persist form values to the DOM with [persist] attribute |
| Option Visibility | 4.4KB | Dynamic show/hide based on ancestor state with option:attribute="value" |
| Save Core | 5.9KB | Basic save function only - hyperclay.savePage() |
| Save System | 4.9KB | Full save: save button, keyboard shortcut, auto-save, change tracking |

### Custom Attributes (HTML enhancements)

| Module | Size | Description |
|--------|------|-------------|
| AJAX Elements | 2.7KB | [ajax-form], [ajax-button] for async form submissions |
| DOM Helpers | 5.4KB | el.nearest, el.val, el.text, el.exec, el.cycle |
| Event Attributes | 3.5KB | [onclickaway], [onclone], [onpagemutation], [onrender] |
| Input Helpers | 1.2KB | [prevent-enter], [autosize] for textareas |
| Sortable | 117.9KB | Drag-drop sorting with [sortable] - includes Sortable.js vendor library |

### UI Components (User interface elements)

| Module | Size | Description |
|--------|------|-------------|
| Dialog Functions | 7.7KB | ask(), consent(), tell(), snippet() functions |
| Info Dialog | 3.2KB | Info dialog component |
| Modal System | 18.4KB | Full modal window creation system - window.theModal |
| Tailwind Play | 362.3KB | Live Tailwind CSS editing - no need for a build system |
| Toast Notifications | 7.3KB | Success/error message notifications - toast(msg, msgType) |

### Utilities (Core utilities (often auto-included))

| Module | Size | Description |
|--------|------|-------------|
| Cookie Helper | 1.3KB | Cookie management (often auto-included) |
| Debounce | 0.2KB | Function debouncing |
| Mutation Observer | 12.8KB | DOM mutation observation (often auto-included) |
| Nearest Element | 3.2KB | Find nearest elements (often auto-included) |
| Throttle | 0.6KB | Function throttling |

### DOM Utilities (DOM manipulation helpers)

| Module | Size | Description |
|--------|------|-------------|
| All.js (jQuery-like) | 13.9KB | Full DOM manipulation library |
| DOM Ready | 0.2KB | DOM ready callback |
| Get Data From Form | 1.7KB | Extract form data as an object |
| Style Injection | 0.8KB | Dynamic stylesheet injection |

### String Utilities (String manipulation helpers)

| Module | Size | Description |
|--------|------|-------------|
| Copy to Clipboard | 0.9KB | Clipboard utility |
| Emmet HTML | 1.4KB | Emmet-like HTML generation |
| Slugify | 0.7KB | URL-friendly slug generator |
| URL Query Parser | 0.1KB | Parse URL search params |

### Communication & Files (File handling and messaging)

| Module | Size | Description |
|--------|------|-------------|
| File Upload to App Owner | 10.4KB | File upload with progress |
| Send Message to App Owner | 1.2KB | Message sending utility |

### Vendor Libraries (Third-party libraries)

| Module | Size | Description |
|--------|------|-------------|
| Idiomorph | 7.9KB | Efficient DOM morphing library |

## Presets

### Minimal (~23.4KB)
Essential features for basic editing

**Modules:** `save-core`, `save`, `admin`, `toast`

### Standard (~37.2KB)
Standard feature set for most use cases

**Modules:** `save-core`, `save`, `admin`, `persist`, `ajax`, `events`, `helpers`, `toast`

### Everything (~624.4KB)
All available features

Includes all available modules across all categories.

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
