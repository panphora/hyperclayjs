# live-sync

Real-time DOM sync across browsers via SSE. When one user saves, all connected browsers see the changes instantly via HyperMorph. Works with Hyperclay Local app.

## Methods

| Method | Description |
|--------|-------------|
| `liveSync.start(file?)` | Start syncing. Auto-detects file from URL if not provided |
| `liveSync.stop()` | Stop syncing and clean up SSE connection |

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| file | string | — | Site identifier to sync (e.g. `'index'`, `'about'`). Auto-detected from URL pathname if omitted |

## Example

```js
// Auto-start (default behavior when module is loaded)
await import('hyperclay.js?features=live-sync');

// Manual control
import liveSync from 'hyperclay.js/live-sync';
liveSync.start('my-page');

// Callbacks
liveSync.onConnect = () => console.log('Connected');
liveSync.onDisconnect = () => console.log('Disconnected');
liveSync.onUpdate = ({ html, sender }) => console.log('Update from', sender);
liveSync.onError = (err) => console.error(err);

// Stop syncing
liveSync.stop();
```
