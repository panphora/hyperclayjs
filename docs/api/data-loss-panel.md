# data-loss-panel

The recovery UI for the data-clobber guard. When the server reports that a save overwrote previously-saved island data, this mounts a small fixed chip offering to restore the overwritten data, revert the page, or dismiss. Include the module; there is no function to call from app code.

## Presets

In `standard`, `cms`, `smooth-sailing`, and `everything`. Not in `minimal`. It auto-initializes on import and is edit-mode only (silent for viewers).

## How it works

- On load it fetches `GET /_/data-loss?file=<page-url>`; if the server reports a clobber, the chip mounts.
- Live, on its own: when this tab fires `hyperclay:save-saved`, the panel re-checks `GET /_/data-loss` on a short bounded backoff (`[300, 1200, 3000]ms`, 3 attempts), racing the server's async guard. This surfaces a clobber caused by the tab's *own* save (a background script, a deliberate big delete, or deleting the `api` island outright) without livesync and without a reload — so it works in every preset that ships the chip. Polling upgrades a chip first shown before the whole-file backup landed (Revert enables once it does) and clears one the server has resolved or self-healed, then stops once settled; a resolve cancels the rest, and a failed resolve re-arms it. On a very large page whose backup lands after the last attempt (~3s), Revert surfaces on the next save or a reload. Each materially-changed payload rebuilds the chip while a stale or identical one is ignored, preserving the user's expand + "view changes" state.
- Live, accelerator: it also listens for the `hyperclay:notification` event with `msgType: 'data-loss'`. That event is only dispatched by `live-sync` (the `everything` preset), so it's an optional accelerator, not the load-bearing path.
- External / cross-device clobbers (another device, a CLI tool, a raw disk edit) produce no `save-saved` here, so on non-livesync presets they surface on the next reload (the page-load `GET`). Hyperclay Local's sync watcher reloads the page on external change, which re-runs that check.
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
