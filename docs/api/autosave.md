# autosave

Automatically saves the page when DOM changes are detected.

## How It Works

1. Watches for any DOM mutations
2. Debounces changes (waits 3.3 seconds after last change)
3. Calls throttled save (max once per 1.2 seconds)
4. Only saves if content actually changed from baseline

## Usage

```html
<script src="hyperclay.js?save-system,autosave"></script>
```

No configuration needed. Saves happen automatically in edit mode.

## Example

User types in contenteditable → waits 3.3s → page auto-saves

The save is silent by default. Add `save-toast` for notifications:

```html
<script src="hyperclay.js?save-system,autosave,save-toast"></script>
```

## Recommended Companion Modules

| Module | Purpose |
|--------|---------|
| `unsaved-warning` | Warn before leaving with unsaved changes |
| `save-toast` | Show toast notifications on save |

## Full Setup

```html
<script src="hyperclay.js?save-system,autosave,unsaved-warning,save-toast"></script>
```

This gives you:
- Auto-save on changes
- Warning if leaving with unsaved work
- Toast notifications on save/error

## Dependencies

Requires `save-system` for the actual save functionality.
