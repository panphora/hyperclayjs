# Migration Guide

## v1.2 → v1.3+

### New Import Syntax

You can now destructure directly from the import:

```html
<!-- Before -->
<script type="module">
  await import('hyperclay.js?preset=standard');
  const { toast, savePage } = window.hyperclay;
</script>

<!-- After -->
<script type="module">
  const { toast, savePage } = await import('hyperclay.js?preset=standard');
</script>
```

### Module ID Renames

Update any `?features=` URLs with the new IDs:

| Old ID | New ID |
|--------|--------|
| save | save-system |
| options | option-visibility |
| editmode | edit-mode |
| events | event-attrs |
| ajax | ajax-elements |
| helpers | dom-helpers |
| inputs | input-helpers |
| prompts | dialogs |
| modals | modal |
| alljs | all-js |
| get-data-from-form | form-data |
| emmet-html | emmet |
| copy-to-clipboard | clipboard |
| query-parser | query-params |

### Window Exports Now Optional

Window exports (`window.hyperclay`, `window.toast`, etc.) require `export-to-window` in your features list. All presets include it by default.

```html
<!-- With window.hyperclay (presets include export-to-window) -->
<script type="module">
  const { toast } = await import('hyperclay.js?preset=standard');
  // window.hyperclay.toast also available
</script>

<!-- Without window.hyperclay -->
<script type="module">
  const { toast } = await import('hyperclay.js?features=toast');
  // window.hyperclay is undefined
</script>

<!-- Custom features WITH window.hyperclay -->
<script type="module">
  const { toast } = await import('hyperclay.js?features=toast,export-to-window');
  // window.hyperclay.toast available
</script>
```

### Removed: hyperclayReady

The `hyperclayReady` event/promise was removed. Use `await import()` instead:

```html
<!-- Before -->
<script type="module" src="hyperclay.js?preset=standard"></script>
<script type="module">
  await window.hyperclayReady;
  toast('Hello');
</script>

<!-- After -->
<script type="module">
  const { toast } = await import('hyperclay.js?preset=standard');
  toast('Hello');
</script>
```

### info() Merged into dialogs

The `info` module was merged into `dialogs`. Import `info` from dialogs:

```javascript
const { info, ask, tell } = await import('hyperclay.js?features=dialogs');
```

### Safari Minimum: 15.4+

Top-level await requires Safari 15.4+. Older versions are no longer supported.
