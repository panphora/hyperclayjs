# edit-mode-helpers

Sets `editmode` and `pageowner` attributes on `<html>` for CSS-based conditional styling.

## Attributes Set

| Attribute | Value | Description |
|-----------|-------|-------------|
| `editmode` | `"true"` / `"false"` | Whether edit mode is active |
| `pageowner` | `"true"` / `"false"` | Whether user owns the resource |

## How It Works

1. On page load: sets both attributes based on current state
2. Before save: sets both to `"false"` so saved pages show viewer state

## Example

```html
<!-- In edit mode as owner -->
<html editmode="true" pageowner="true">
  ...
</html>

<!-- Viewing as non-owner -->
<html editmode="false" pageowner="false">
  ...
</html>
```

```css
/* Show edit controls only in edit mode */
html[editmode="false"] .edit-toolbar {
  display: none;
}

/* Owner-only features */
html[pageowner="false"] .delete-btn {
  display: none;
}
```

## Exports

Re-exports from `edit-mode`:
- `toggleEditMode()`
- `isEditMode`
- `isOwner`

## Usage

```html
<script src="hyperclay.js?edit-mode-helpers"></script>
```
