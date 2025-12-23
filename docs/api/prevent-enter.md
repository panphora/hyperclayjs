# prevent-enter

Prevent the Enter key from creating newlines in an element.

## Usage

```html
<element prevent-enter>
```

## How It Works

A global keydown listener intercepts Enter key presses. If the event target (or any ancestor) has `prevent-enter`, the default action is prevented.

Works with:
- `contenteditable` elements
- `<textarea>` elements
- Any focusable element

## Example

```html
<!-- Single-line contenteditable heading -->
<h1 contenteditable prevent-enter>Edit this title</h1>

<!-- Single-line textarea (alternative to input) -->
<textarea prevent-enter placeholder="Single line only"></textarea>

<!-- Prevent Enter in a specific area -->
<div prevent-enter>
  <span contenteditable>Name</span>
  <span contenteditable>Email</span>
</div>
```

## Use Cases

- **Inline editable text**: Titles, labels, single-line fields
- **Form fields**: Where Enter should submit instead of add newlines
- **Chat inputs**: Combined with custom Enter-to-send logic
