# data-loss-panel

The recovery UI for the data-clobber guard. When the server reports that a save overwrote previously-saved island data, this mounts a small fixed chip offering to restore the overwritten data, revert the page, or dismiss. Include the module; there is no function to call from app code.

## Presets

In `standard`, `cms`, `smooth-sailing`, and `everything`. Not in `minimal`. It auto-initializes on import and is edit-mode only (silent for viewers).

## How it works

- On load it fetches `GET /_/data-loss?file=<page-url>`; if the server reports a clobber, the chip mounts.
- Live, it listens for the `hyperclay:notification` event with `msgType: 'data-loss'` and mounts/unmounts accordingly.
- A user choice POSTs to `POST /_/data-loss/<id>` with `{ choice, file }`. Restore and revert reload the page (~350ms) after success.
- On init it also calls `initUserGesture()` (so save provenance is correct even in presets without autosave) and `Mutation.ensureObserving()`.
- The chip's root carries `no-save` and `snapshot-remove`, so it never reaches a saved file. Feedback uses `window.toast`.

## Requirements

- A server implementing `GET /_/data-loss` and `POST /_/data-loss/<id>` (the Hyperclay platform and Hyperclay Local both do).
- The owner in edit mode. It stays silent in view mode.

## Methods

| Method | Description |
|--------|-------------|
| default export `init()` | Auto-called on import; installs listeners and does the first check. Apps do not call it |
| `mount(event)` | Mount the chip for a data-loss event. Exported for tests |
| `unmount()` | Remove the chip. Exported for tests |

## Example

```html
<!-- No code needed: load a preset that includes it, e.g. -->
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=standard';
</script>
```
