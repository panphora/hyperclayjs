# view-mode-excludes-edit-modules

A feature flag that skips edit-only modules when the page is in view mode, reducing bundle size for viewers.

## Usage

Add `view-mode-excludes-edit-modules` to your features list:

```html
<script type="module">
  await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=standard&features=view-mode-excludes-edit-modules');
</script>
```

Or with custom features:

```html
<script type="module">
  await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?features=toast,dialogs,view-mode-excludes-edit-modules');
</script>
```

## How It Works

1. **Detects edit mode** using the same logic as hyperclay:
   - URL parameter `?editmode=true` (highest priority)
   - Cookie `isAdminOfCurrentResource` (fallback)

2. **In edit mode**: All requested modules load normally

3. **In view mode**: Modules marked as `isEditModeOnly` are automatically excluded

## Edit-Only Modules

These modules are skipped in view mode when this feature is enabled:

| Module | Description |
|--------|-------------|
| `save-core` | Basic save function |
| `save-system` | CMD+S, [trigger-save] button |
| `autosave` | Auto-save on DOM changes |
| `unsaved-warning` | Warn before leaving with unsaved changes |
| `save-toast` | Toast notifications for save events |
| `edit-mode-helpers` | [viewmode:disabled], [editmode:resource], [editmode:onclick] |
| `persist` | Persist input/select/textarea values to DOM |
| `snapshot` | DOM snapshots for save and sync |
| `sortable` | Drag-drop sorting |
| `onaftersave` | Run JS when save status changes |
| `cache-bust` | Cache-bust href/src attributes |
| `file-upload` | File upload with progress |
| `live-sync` | Real-time DOM sync across browsers |

## Size Savings

When using the `standard` preset:

| Mode | Modules Loaded | Approximate Size |
|------|----------------|------------------|
| Edit mode | All standard modules | ~50KB |
| View mode | Only view-compatible modules | ~15KB |

## When to Use

- **Production sites** where most visitors are viewers, not editors
- **Performance-critical pages** where every KB matters
- **Sites with heavy edit features** (live-sync, sortable, file-upload)

## When NOT to Use

- **Development** - you want full functionality regardless of mode
- **Admin-only pages** - all users are editors anyway
- **Simple sites** - if you're already using minimal preset, savings are small
