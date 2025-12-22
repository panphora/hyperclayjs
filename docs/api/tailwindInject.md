# tailwind-inject

Automatically injects the Tailwind CSS link with cache-busting on save.

## What It Does

1. Reads the `currentResource` cookie to determine the CSS file path
2. Injects `<link href="/tailwindcss/{currentResource}">` via `insertStyles()`
3. Adds `onaftersave="cacheBust(this)"` so styles refresh after each save

## Usage

Include in the `everything` preset or add manually:

```html
<script type="module">
  await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=everything');
</script>
```

Or with custom features:

```html
<script type="module">
  await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?features=tailwind-inject,cache-bust,onaftersave');
</script>
```

## Requirements

The `currentResource` cookie must be set (e.g., `currentResource=mysite.css`).

## How It Works

When the module loads, it:

1. Reads `currentResource` from cookies
2. Constructs href as `/tailwindcss/${currentResource}`
3. Injects the link with `onaftersave="cacheBust(this)"`
4. On save, the CSS file is cache-busted and styles refresh

## Edit Mode Only

This module is marked as `isEditModeOnly: true`. When using `view-mode-excludes-edit-modules`, it will be skipped in view mode since viewers don't need CSS cache-busting.

## Dependencies

- `style-injection` - provides `insertStyles()`
- `cookie` - provides `cookie.get()`
- `cache-bust` - provides `cacheBust()` function
- `onaftersave` - enables the `onaftersave` attribute
