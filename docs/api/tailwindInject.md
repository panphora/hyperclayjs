# tailwind-inject

Injects a Tailwind CSS stylesheet for the current resource and cache-busts it on every save. Edit-mode only.

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| currentResource | cookie | — | Read from `currentResource` cookie. Determines the CSS path: `/tailwindcss/{currentResource}.css` |

## Example

```html
<!-- Include with other save features -->
<script type="module">
  await import('hyperclay.js?features=tailwind-inject,save-system');
</script>

<!-- Or use the everything preset -->
<script type="module">
  await import('hyperclay.js?preset=everything');
</script>
```
