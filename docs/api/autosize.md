# autosize

Automatically grow textarea height to fit content.

## Usage

```html
<textarea autosize></textarea>
```

## How It Works

1. On page load, sets initial height to match content
2. On input, recalculates height based on `scrollHeight`
3. Hides vertical overflow to prevent scrollbar flicker

The textarea grows as you type and shrinks when content is deleted.

## Example

```html
<!-- Basic auto-growing textarea -->
<textarea autosize placeholder="Start typing..."></textarea>

<!-- With minimum height via CSS -->
<textarea autosize style="min-height: 100px;"></textarea>

<!-- Notes field that expands -->
<label>
  Notes
  <textarea autosize name="notes"></textarea>
</label>
```

## Styling Tips

```css
/* Set a minimum height */
textarea[autosize] {
  min-height: 80px;
}

/* Set a maximum height (enables scrolling beyond) */
textarea[autosize] {
  max-height: 300px;
  overflow-y: auto !important;
}
```
