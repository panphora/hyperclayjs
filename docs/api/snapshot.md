# snapshot

The source of truth for page state. Clones the live DOM, runs author hooks, and serializes it to the HTML string that gets saved or broadcast over live-sync. The save system and live-sync both build on this module.

## Import

```js
import { onSnapshot, onPrepareForSave, captureForSave } from 'hyperclayjs/core/snapshot';
```

CDN (loaded automatically when the module is included):

```html
<script src="https://hyperclay.com/public/js/hyperclay.js"></script>
```

When auto-export is enabled (default, unless `window.__hyperclayNoAutoExport` is set), a subset is also exposed on `window.hyperclay.*` (and the `window.h` alias): `captureSnapshot`, `captureForSave`, `captureBodyForSync`, `onSnapshot`, `onPrepareForSave`, `beforeSave`, and `getPageContents`. The remaining functions (`captureForComparison`, `captureForSaveAndComparison`, `isCodeMirrorPage`, `getCodeMirrorContents`) are module exports only.

## Presets

In every preset: `minimal`, `standard`, `smooth-sailing`, and `everything`. The save and live-sync paths both depend on it. It is edit-mode-only, so it is skipped in view mode under `view-mode-excludes-edit-modules`.

## The Pipeline

```
1. CLONE      document.documentElement.cloneNode(true)
2. SNAPSHOT   onSnapshot hooks + [onbeforesnapshot] + [snapshot-remove] + extension-noise strip
              ├─ used by SAVE and LIVE-SYNC
              └─ emits hyperclay:snapshot-ready
3. PREPARE    [onbeforesave] + [no-save] + onPrepareForSave hooks
              └─ used by SAVE only (live-sync stops at step 2)
4. SERIALIZE  "<!DOCTYPE html>" + clone.outerHTML  →  sent to server
```

`captureForComparison` and the compare half of `captureForSaveAndComparison` additionally strip every region whose autosave-trigger is off (`[no-trigger-autosave]`, plus `[no-save]`, `[freeze]`, and `[no-watch]`) so runtime-only elements do not trip dirty-checking. See [region attributes](./region-attributes.md); the legacy `save-*` / `mutations-ignore` markers are recognized as aliases.

## Hooks

| Function | Runs on | Description |
|----------|---------|-------------|
| `onSnapshot(callback)` | every snapshot (save AND live-sync) | Register a hook to sync runtime state into the clone, e.g. writing form values onto the cloned inputs |
| `onPrepareForSave(callback)` | save only | Register a hook to mutate the clone before serialization, e.g. stripping admin UI |
| `beforeSave(callback)` | save only | Backwards-compat alias for `onPrepareForSave` |

Each callback receives the cloned `<html>` element (`HTMLElement`) and mutates it in place. Hooks run in registration order. The snapshot clone is never the live DOM, so mutations here never affect the visible page.

## Capture Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `captureSnapshot()` | `HTMLElement` | Clones `<html>`, runs `onSnapshot` hooks, `[onbeforesnapshot]`, `[snapshot-remove]`, and strips extension noise. Nothing save-specific stripped yet |
| `captureForSave({ emitForSync = true })` | `string` | Full save pipeline. Emits `hyperclay:snapshot-ready`, then runs prepare phase. Returns `"<!DOCTYPE html>" + outerHTML` |
| `captureForComparison()` | `string` | Like the save path but also strips every region whose autosave-trigger is off (`[no-trigger-autosave]` and friends). For comparing current state against a baseline. Does not emit `snapshot-ready` |
| `captureForSaveAndComparison({ emitForSync = true })` | `{ forSave, forComparison }` | Single clone, then forks into a save string and a comparison string. Cheaper than calling both separately |
| `captureBodyForSync()` | `string` | `<body>` innerHTML with form values synced, no stripping. Prefer the `hyperclay:snapshot-ready` event instead |
| `getPageContents()` | `string` | Current page HTML for change detection. Calls `captureForSave({ emitForSync: false })`, so it never triggers live-sync |
| `isCodeMirrorPage()` | `boolean` | True when a `.CodeMirror` editor instance is present |
| `getCodeMirrorContents()` | `string` | The CodeMirror editor's value |

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `emitForSync` | boolean | `true` | When `true`, dispatch `hyperclay:snapshot-ready` so live-sync can broadcast the clone. Set `false` for read-only captures like change detection |

## Save Lifecycle Attributes

These markup hooks are processed during capture. Inline attribute handlers run via `new Function(...)` with `this` bound to the element on the clone.

| Attribute | Phase | Effect |
|-----------|-------|--------|
| `onbeforesnapshot` | snapshot (save + sync) | Inline JS runs on the cloned element before any stripping |
| `snapshot-remove` | snapshot (save + sync) | Element is removed from every snapshot, so it never reaches a save, a comparison, or a live-sync broadcast |
| `onbeforesave` | prepare (save + compare) | Inline JS runs on the cloned element before save-specific stripping |
| `no-save` | prepare (save + compare) | Element is removed from the saved HTML entirely (legacy alias: `save-remove`) |
| `no-trigger-autosave` | comparison only | Element is excluded from dirty-checking but still saved as-is (legacy alias: `save-ignore`) |

The first two are part of the [region attributes](./region-attributes.md) model.

## Events

| Event | Target | Detail | When |
|-------|--------|--------|------|
| `hyperclay:snapshot-ready` | `document` | `{ documentElement }` | After the snapshot clone is built, before save-specific stripping. The cloned `<html>` is passed so live-sync can extract head and body |

## CodeMirror Pages

When `isCodeMirrorPage()` is true, the capture functions bypass the DOM snapshot pipeline entirely and return the editor's text via `getCodeMirrorContents()`. CodeMirror pages do not emit `hyperclay:snapshot-ready`, so they are not live-synced.

## Hyperclay Local

On `localhost` / `127.0.0.1`, `captureForSaveAndComparison` stores the full unstripped snapshot HTML on `window.__hyperclaySnapshotHtml`. The save system sends both the stripped content and this full snapshot as JSON so the desktop platform can mirror the page exactly. The value is cleared after each send.

## Undo Flush

`captureSnapshot()` calls `window.hyperclay.undo.flush()` first (when the undo module is loaded) so a save fired mid-typing closes the pending idle batch on a clean boundary. This keeps Cmd+Z after a save from rewinding past the last saved state. No-op when undo is not loaded.

## Example

```js
import { onSnapshot, onPrepareForSave, captureForSave } from 'hyperclayjs/core/snapshot';

// Runs on save AND live-sync: copy a runtime value onto the clone
onSnapshot((clone) => {
  clone.querySelector('#editor-state')?.setAttribute('data-mode', currentMode);
});

// Runs on save only: strip admin-only UI from the saved file
onPrepareForSave((clone) => {
  clone.querySelectorAll('.admin-toolbar').forEach(el => el.remove());
});

// Get the exact HTML that would be saved, without triggering live-sync
const html = captureForSave({ emitForSync: false });
```

```html
<!-- Markup-level hooks -->
<div onbeforesnapshot="this.dataset.snappedAt = Date.now()">...</div>
<div snapshot-remove>Never appears in any snapshot</div>
<button no-save>Hidden from the saved file</button>
<div no-trigger-autosave>Saved as-is but skipped by dirty-checking</div>
```

```js
// Live-sync listens for the snapshot clone instead of recapturing
document.addEventListener('hyperclay:snapshot-ready', (e) => {
  const html = e.detail.documentElement;
  // broadcast html.querySelector('body').innerHTML, etc.
});
```

## Related Modules

- `save-system` - Manual save, change detection, save events
- `live-sync` - Real-time DOM sync, consumes `hyperclay:snapshot-ready`
- `onaftersave` - Run code on the live DOM after a successful save
- `onclone` - Run code when an element is cloned
- `autosave` - Auto-save on DOM changes
