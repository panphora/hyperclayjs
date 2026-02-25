# save-system

Manual save with change detection, state management, keyboard shortcuts, and save button support.

## Methods

| Function | Description |
|----------|-------------|
| `savePage(callback?)` | Save page if content changed |
| `savePageThrottled(callback?)` | Throttled save for auto-save use |
| `replacePageWith(url)` | Fetch HTML from URL and save it |
| `beforeSave(fn)` | Register a hook to modify content before saving |
| `getPageContents()` | Get current page HTML as string |

## Save States

The `<html>` element gets a `savestatus` attribute:

| State | Description |
|-------|-------------|
| `saving` | Save in progress (shows after 500ms delay) |
| `saved` | Save completed successfully |
| `offline` | No network connection |
| `error` | Save failed |

## Events

| Event | Description |
|-------|-------------|
| `hyperclay:save-saving` | Fired when save starts |
| `hyperclay:save-saved` | Fired on successful save |
| `hyperclay:save-offline` | Fired when offline |
| `hyperclay:save-error` | Fired on save error |

## Example

```js
// Manual save
hyperclay.savePage();

// Save with callback
hyperclay.savePage(({msg, msgType}) => {
  if (msgType === 'error') {
    console.error('Save failed:', msg);
  }
});

// Register before-save hook
hyperclay.beforeSave((clone) => {
  // Modify the snapshot clone before saving
  clone.querySelectorAll('.temp').forEach(el => el.remove());
});

// Replace page with template
hyperclay.replacePageWith('/templates/blog.html');
```

```html
<!-- Save button -->
<button trigger-save>Save</button>

<!-- Keyboard shortcut: Cmd/Ctrl+S is enabled automatically -->

<!-- Style based on save state -->
<style>
  html[savestatus="saving"] .save-indicator { color: orange; }
  html[savestatus="saved"] .save-indicator { color: green; }
  html[savestatus="error"] .save-indicator { color: red; }
</style>
```

## Change Detection

- Tracks content changes since last save
- Skips save if content hasn't changed
- Compares against baseline captured after page load (1.5s delay)

## Save Lifecycle Attributes

| Attribute | Effect |
|-----------|--------|
| `save-remove` | Element is removed from saved HTML entirely |
| `save-ignore` | Element is excluded from dirty-checking but still saved as-is |
| `save-freeze` | Element is saved with its original content, ignoring runtime changes |
| `onbeforesave` | Inline JS that runs on the snapshot clone before save |
| `onaftersave` | Inline JS that runs on the live DOM after a successful save |
| `trigger-save` | Click triggers a save |

## Related Modules

- `autosave` - Auto-save on DOM changes
- `save-freeze` - Freeze element content for saves
- `save-toast` - Toast notifications for save events
- `unsaved-warning` - Warn before leaving with unsaved changes
