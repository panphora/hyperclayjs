# Migration Guide: From Monolithic to Modular

This guide explains how to migrate the existing Hyperclay JavaScript codebase into self-contained ES modules.

## Module Structure Template

Each module should follow this structure:

```javascript
/**
 * Module Name
 * Brief description of what this module does
 */

// Import dependencies
import { dependency } from '../core/dependency.js';

// Module implementation
class MyFeature {
  // ... implementation
}

// Main export
export function myFeature() {
  // ... main functionality
}

// Export to window for global access (optional)
export function exportToWindow() {
  if (typeof window !== 'undefined') {
    window.myFeature = myFeature;
  }
}

// Auto-initialization (optional)
export function init() {
  if (typeof window !== 'undefined') {
    // Initialization code
    exportToWindow();
  }
}

// Auto-initialize on import (if needed)
if (typeof window !== 'undefined') {
  init();
}

// Default export
export default myFeature;
```

## Migration Steps

### 1. Analyze Dependencies

For each file in `public-assets/js/`:

1. List all imports at the top
2. Identify what the module exports
3. Note any side effects (DOM manipulation, event listeners, etc.)

### 2. Create Module Files

#### Core Modules (`./core/`)

These should have NO dependencies:

- **mutation.js** - From `dom/Mutation.js`
- **nearest.js** - From `dom/nearest.js`
- **cookie.js** - From `browser/cookie.js`
- **save-core.js** - Extract basic save functionality from `hyperclay/savePage.js`

#### Feature Modules (`./features/`)

- **save.js** - From `hyperclay/savePage.js`
  ```javascript
  import { saveCoreFunction } from '../core/save-core.js';
  import { toast } from '../ui/toast.js';
  import { Mutation } from '../core/mutation.js';
  ```

- **admin.js** - Combine from:
  - `hyperclay/adminInputs.js`
  - `hyperclay/adminResources.js`
  - `hyperclay/adminContenteditable.js`
  - `hyperclay/adminOnClick.js`
  ```javascript
  import { cookie } from '../core/cookie.js';
  ```

- **persist.js** - From `hyperclay/enablePersistentFormInputValues.js`

- **options.js** - From `hyperclay/optionVisibilityRuleGenerator.js`
  ```javascript
  import { Mutation } from '../core/mutation.js';
  ```

- **ajax.js** - From `custom-attributes/ajaxElements.js`

- **events.js** - Combine from:
  - `custom-attributes/onclickaway.js`
  - `custom-attributes/onclone.js`
  - `custom-attributes/onpagemutation.js`
  - `custom-attributes/onrender.js`

- **sortable.js** - From `custom-attributes/sortable.js`
  ```javascript
  import { Mutation } from '../core/mutation.js';
  import Sortable from '../vendor/Sortable.js';
  ```

- **helpers.js** - From `custom-attributes/domHelpers.js`
  ```javascript
  import { nearest } from '../core/nearest.js';
  ```

- **inputs.js** - Combine from:
  - `custom-attributes/prevent.js`
  - `editing/autosize.js`

#### UI Modules (`./ui/`)

- **toast.js** - From `ui/toast.js`
- **modals.js** - From `ui/theModal.js`
- **prompts.js** - From `ui/prompts.js`
  ```javascript
  import { modal } from './modals.js';
  import { toast } from './toast.js';
  ```

### 3. Handle Global Exports

Each module should handle its own global exports:

```javascript
// At the end of the module
export function exportToWindow() {
  if (typeof window !== 'undefined') {
    // Add to window object
    window.myFeature = myFeature;

    // Or extend existing object
    window.hyperclay = window.hyperclay || {};
    window.hyperclay.myFeature = myFeature;
  }
}
```

### 4. Handle CSS Dependencies

For modules that need CSS:

```javascript
export function injectStyles() {
  if (typeof document === 'undefined') return;

  const styleId = 'my-module-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .my-class {
      /* styles */
    }
  `;
  document.head.appendChild(style);
}

// Call in init()
export function init() {
  injectStyles();
  // ... other initialization
}
```

### 5. Update Import Paths

Change from:
```javascript
import { something } from "./hyperclay/something.js";
```

To:
```javascript
import { something } from "../features/something.js";
```

### 6. Test Each Module

Create test files for each module:

```javascript
// test/features/save.test.js
import { savePage } from '../../features/save.js';

describe('Save Feature', () => {
  test('saves page content', async () => {
    // Test implementation
  });
});
```

## File Mapping

| Original File | New Location | Dependencies |
|--------------|--------------|--------------|
| `hyperclay/savePage.js` | `features/save.js` + `core/save-core.js` | toast, mutation |
| `hyperclay/adminInputs.js` | `features/admin.js` (part 1) | cookie |
| `hyperclay/adminResources.js` | `features/admin.js` (part 2) | cookie |
| `hyperclay/adminContenteditable.js` | `features/admin.js` (part 3) | cookie |
| `hyperclay/adminOnClick.js` | `features/admin.js` (part 4) | cookie |
| `hyperclay/enablePersistentFormInputValues.js` | `features/persist.js` | - |
| `hyperclay/optionVisibilityRuleGenerator.js` | `features/options.js` | mutation |
| `custom-attributes/ajaxElements.js` | `features/ajax.js` | - |
| `custom-attributes/onclickaway.js` | `features/events.js` (part 1) | - |
| `custom-attributes/onclone.js` | `features/events.js` (part 2) | - |
| `custom-attributes/onpagemutation.js` | `features/events.js` (part 3) | - |
| `custom-attributes/onrender.js` | `features/events.js` (part 4) | - |
| `custom-attributes/sortable.js` | `features/sortable.js` | mutation, Sortable |
| `custom-attributes/domHelpers.js` | `features/helpers.js` | nearest |
| `custom-attributes/prevent.js` | `features/inputs.js` (part 1) | - |
| `editing/autosize.js` | `features/inputs.js` (part 2) | - |
| `ui/toast.js` | `ui/toast.js` | - |
| `ui/theModal.js` | `ui/modals.js` | - |
| `ui/prompts.js` | `ui/prompts.js` | modals, toast |
| `dom/Mutation.js` | `core/mutation.js` | - |
| `dom/nearest.js` | `core/nearest.js` | - |
| `browser/cookie.js` | `core/cookie.js` | - |
| `vendor/Sortable.js` | `vendor/Sortable.js` | - |
| `vendor/tailwind-play.js` | `vendor/tailwind-play.js` | - |

## Checklist

- [ ] Create directory structure
- [ ] Migrate core modules (no dependencies)
- [ ] Migrate UI modules (toast, modals)
- [ ] Migrate feature modules
- [ ] Update all import paths
- [ ] Add exportToWindow() functions
- [ ] Add init() functions where needed
- [ ] Test each module individually
- [ ] Test preset bundles
- [ ] Update documentation
- [ ] Create build scripts
- [ ] Set up CI/CD
- [ ] Publish to npm

## Common Patterns

### Pattern 1: Feature Detection

```javascript
export function init() {
  if (typeof window === 'undefined') return;

  // Check if feature is needed
  if (document.querySelector('[data-my-feature]')) {
    // Initialize feature
  }
}
```

### Pattern 2: Lazy Loading

```javascript
export async function loadWhenNeeded() {
  // Check if feature is needed
  if (!document.querySelector('[sortable]')) return;

  // Dynamically import heavy dependency
  const { default: Sortable } = await import('../vendor/Sortable.js');

  // Initialize
  initSortable(Sortable);
}
```

### Pattern 3: Configuration

```javascript
const defaultConfig = {
  duration: 3000,
  position: 'bottom-right'
};

export function configure(options) {
  Object.assign(defaultConfig, options);
}
```

## Next Steps

1. Start with core modules (they have no dependencies)
2. Move to UI modules (toast, modals)
3. Then feature modules in dependency order
4. Finally, create preset bundles

This modular approach will make the codebase:
- Easier to maintain
- Better for tree-shaking
- Simpler to test
- More flexible for users