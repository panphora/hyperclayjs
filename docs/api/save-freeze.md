# save-freeze

Freeze an element's innerHTML for save purposes. The live DOM can change freely at runtime, but the saved HTML always contains the original content from when the element first appeared.

## Usage

```html
<div save-freeze>Content that JS will modify at runtime</div>
```

## How It Works

1. On page load, the original `innerHTML` of every `[save-freeze]` element is captured
2. For elements added dynamically after load, the content is captured when they enter the DOM
3. At save time, the clone's innerHTML is replaced with the stored original

Changes inside `[save-freeze]` elements do not trigger autosave dirty checks.

## Example

```html
<!-- Live counter that doesn't persist -->
<span save-freeze>0</span>
<script>
  setInterval(() => {
    document.querySelector('[save-freeze]').textContent = Date.now();
  }, 1000);
</script>

<!-- Interactive demo that resets on save -->
<div save-freeze>
  <div contenteditable>Try editing this — it won't save.</div>
  <select>
    <option selected>Default</option>
    <option>Changed</option>
  </select>
</div>
```

## Comparison with Other Save Attributes

| Attribute | Effect |
|-----------|--------|
| `save-remove` | Element is removed from saved HTML entirely |
| `save-ignore` | Element is excluded from dirty-checking but still saved as-is |
| `save-freeze` | Element is saved with its original content, ignoring runtime changes |

## Edit Mode Only

This module only runs in edit mode. In view mode, no capturing or freezing occurs.
