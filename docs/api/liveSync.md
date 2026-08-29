# live-sync

Real-time DOM sync across browsers via SSE. Edit-mode tabs exchange working snapshots on the live lane as changes are captured. View-mode tabs receive durable documents on the saved lane after the host persists them. HyperMorph applies both in place. Works with Hyperclay Local app.

## Access

`liveSync` is import-only — it is not attached to `window.hyperclay`. Import the module (or load it via a preset/feature) to set callbacks. It auto-starts on DOM-ready; call `stop()` to disable.

## Methods

| Method | Description |
|--------|-------------|
| `liveSync.start(file?)` | Start syncing. Auto-detects file from URL if not provided |
| `liveSync.stop()` | Stop syncing and clean up SSE connection |

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| file | string | — | Optional. A presence guard and log label only; it does **not** select the sync channel. The current page URL selects the channel, sent as `Document-URL` on the spec POST and `document-url` on the spec GET. Older hosts use the discovered legacy wire. Auto-detected from the pathname when omitted |

## Example

```js
// Auto-start (default behavior when module is loaded)
await import('hyperclay.js?features=live-sync');

// Manual control
import liveSync from 'hyperclay.js/live-sync';
liveSync.start(); // the optional arg is a log label, not a channel selector

// Callbacks
liveSync.onConnect = () => console.log('Connected');
liveSync.onDisconnect = () => console.log('Disconnected');
liveSync.onUpdate = ({ html, sender }) => console.log('Update from', sender);
liveSync.onError = (err) => console.error(err);

// Stop syncing
liveSync.stop();
```

## Events

Besides the callbacks, live-sync dispatches `hyperclay:livesync-applied` on `document` (`detail.seq`) after a remote update is morphed in, and `hyperclay:notification` for server-pushed notifications.
