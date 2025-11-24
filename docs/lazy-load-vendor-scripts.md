# Lazy-Loading Vendor Scripts

## Problem

Large vendor scripts (Sortable.js ~118KB, tailwind-play ~370KB) were bundled directly into modules, forcing all users to download them even if they were just viewing the page.

## Solution

Conditionally load heavy vendor scripts only when in edit mode via dynamically injected `<script save-ignore>` tags.

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Module System                                              │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │ sortable.js (~3KB)  │    │ tailwind-play.js (~1KB)     │ │
│  │ (wrapper)           │    │ (wrapper)                   │ │
│  └──────────┬──────────┘    └──────────────┬──────────────┘ │
└─────────────┼──────────────────────────────┼────────────────┘
              │                              │
              │ if (isEditMode)              │ if (isEditMode)
              │ inject <script>              │ inject <script>
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CDN / Vendor Files (not in module graph)                   │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │ Sortable.vendor.js  │    │ tailwind-play.vendor.js     │ │
│  │ (~118KB)            │    │ (~370KB)                    │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Flow

1. **User includes module** (e.g., `sortable` or `tailwind-play`)
2. **Wrapper checks `isEditMode`**
   - If `false`: Do nothing (0 bytes loaded)
   - If `true`: Continue to step 3
3. **Inject script tag** into `<head>`:
   ```html
   <script save-ignore src="...vendor.js"></script>
   ```
4. **Vendor script loads and initializes**
5. **On save**: `save-ignore` attribute causes script tag to be stripped from saved HTML

### Code Pattern

Both wrappers use a shared utility (`utilities/loadVendorScript.js`):

```js
import { isEditMode } from "../core/isAdminOfCurrentResource.js";
import { loadVendorScript, getVendorUrl } from "../utilities/loadVendorScript.js";

function init() {
  if (!isEditMode) return;
  loadVendorScript(getVendorUrl(import.meta.url, 'example.vendor.js'));
}

init();
```

For scripts that need the loaded global:

```js
async function init() {
  if (!isEditMode) return;
  const Lib = await loadVendorScript(url, 'LibGlobalName');
  // Use Lib...
}
```

## File Naming Convention

| File | Purpose |
|------|---------|
| `module.js` | Lightweight wrapper (~1-3KB) in module graph |
| `module.vendor.js` | Heavy vendor script, loaded via script tag |

## Results

| Module | Before | After | Savings |
|--------|--------|-------|---------|
| sortable | 118.1KB | 3.1KB | ~115KB |
| tailwind-play | 362.3KB | 0.9KB | ~361KB |

## Benefits

- **Viewers** never download heavy vendor scripts
- **Editors** get full functionality when needed
- **Saved pages** stay clean (script tags stripped via `save-ignore`)
- **CDN caching** still works for vendor scripts
- **Module graph** stays small and fast

## Files Changed

- `vendor/Sortable.js` → `vendor/Sortable.vendor.js`
- `vendor/tailwind-play.js` → `vendor/tailwind-play.vendor.js`
- `utilities/loadVendorScript.js` (new shared utility)
- `custom-attributes/sortable.js` (rewritten as wrapper)
- `vendor/tailwind-play.js` (new wrapper)
- `build/generate-dependency-graph.js` (updated module definitions)
