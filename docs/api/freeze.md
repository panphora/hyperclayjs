# freeze

Freeze an element's innerHTML for save purposes. The live DOM can change freely at runtime, but the saved HTML always contains the original content from when the element first appeared.

`freeze` is one of the [region attributes](./region-attributes.md). The legacy alias `save-freeze` still works (it additionally implies `no-undo`).

## Usage

```html
<div freeze>Content that JS will modify at runtime</div>
```

## How It Works

1. On page load, the original `innerHTML` of every `[freeze]` element is captured
2. For elements added dynamically after load, the content is captured when they enter the DOM
3. At save time, the clone's innerHTML is replaced with the stored original

Changes inside `[freeze]` elements do not trigger autosave dirty checks.

## Example

```html
<!-- Live counter that doesn't persist -->
<span freeze>0</span>
<script>
  setInterval(() => {
    document.querySelector('[freeze]').textContent = Date.now();
  }, 1000);
</script>

<!-- Interactive demo that resets on save -->
<div freeze>
  <div contenteditable>Try editing this — it won't save.</div>
  <select>
    <option selected>Default</option>
    <option>Changed</option>
  </select>
</div>
```

## Related region attributes

See [region attributes](./region-attributes.md) for the full model. The ones most often paired with `freeze`:

| Attribute | Effect |
|-----------|--------|
| `no-save` | Element is removed from saved HTML entirely (legacy alias: `save-remove`) |
| `no-trigger-autosave` | Element is excluded from dirty-checking but still saved as-is (legacy alias: `save-ignore`) |
| `freeze` | Element is saved with its original content, ignoring runtime changes (legacy alias: `save-freeze`) |

## Edit Mode Only

This module only runs in edit mode. In view mode, no capturing or freezing occurs.
