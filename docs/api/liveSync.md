# live-sync

Real-time DOM sync across browsers. When one user saves, all connected browsers see the changes instantly. Works with Hyperclay Local app as well.

## Usage

```js
// Include in your preset
await import('hyperclay.js?features=live-sync');
```

Syncing starts automatically.

## Behavior

- Syncs `<body>` content between browsers
- Reloads the page when `<head>` changes (stylesheets, scripts, etc.)
- Preserves focus on active inputs during sync
- Uses Idiomorph for smooth DOM updates without flicker
