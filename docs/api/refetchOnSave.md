# refetch-on-save

Flash-free refetch of any element's `href` or `src` after a successful save. The old resource stays visible until the new one has fully loaded, preventing FOUC.

## Usage

```html
<element refetch-on-save>
```

Add `refetch-on-save` to any element with an `href` or `src` attribute. After every save, the resource is re-fetched with a cache-busted URL and swapped in without a flash.

## How It Works

1. Listens for `hyperclay:save-saved` events
2. For each `[refetch-on-save]` element, creates a clone with a fresh `?v={timestamp}` on the URL
3. Inserts the new element right after the old one (both coexist briefly)
4. When the new element finishes loading (`onload`), removes the old one
5. Fallback: if `onload` doesn't fire within 2 seconds, removes the old element anyway

The new element keeps the `refetch-on-save` attribute so it works on subsequent saves. It's also marked `save-ignore` so it doesn't trigger dirty-checking.

## Example

```html
<!-- Reload Tailwind CSS after save (classes may have changed) -->
<link rel="stylesheet" href="/tailwindcss/mysite.css" refetch-on-save>

<!-- Reload any stylesheet -->
<link rel="stylesheet" href="/styles/theme.css" refetch-on-save>

<!-- Reload a script -->
<script src="/public/js/config.js" refetch-on-save></script>

<!-- Reload a preview image -->
<img src="/preview.png" refetch-on-save>
```

## Comparison with cacheBust

| Approach | FOUC? | How |
|----------|-------|-----|
| `refetch-on-save` | No | Swaps old/new element, old stays until new loads |
| `onaftersave="cacheBust(this)"` | Yes | Updates `href`/`src` in-place, brief unstyled flash |

Use `refetch-on-save` for stylesheets where a flash matters. Use `cacheBust` for resources where a brief flash is acceptable.
