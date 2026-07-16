# sortable

Enable drag-and-drop sorting on child elements.

## Usage

```html
<ul sortable>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

## Attributes

| Attribute | Description |
|-----------|-------------|
| `sortable` | Enable sorting. Optional value sets group name for cross-list dragging. |
| `sortable-handle` | Restrict dragging to this element |
| `onsorting` | Code to run during drag |
| `onsorted` | Code to run after drop |

## Edit Mode Only

Sortable.js (~45KB) is only loaded in edit mode. Sortable.js is dynamically `import()`-ed only in edit mode (no persisted script tag).

## Example

```html
<!-- Basic sortable list -->
<ul sortable>
  <li>Drag me</li>
  <li>And me</li>
  <li>Me too</li>
</ul>

<!-- With drag handle -->
<ul sortable>
  <li>
    <span sortable-handle>⋮⋮</span>
    Item with handle
  </li>
  <li>
    <span sortable-handle>⋮⋮</span>
    Another item
  </li>
</ul>

<!-- Grouped lists (drag between) -->
<div style="display: flex; gap: 1rem;">
  <ul sortable="shared">
    <li>List A - Item 1</li>
    <li>List A - Item 2</li>
  </ul>
  <ul sortable="shared">
    <li>List B - Item 1</li>
    <li>List B - Item 2</li>
  </ul>
</div>

<!-- With callbacks -->
<ul sortable onsorted="console.log('Reordered!'); savePage()">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<ul sortable onsorting="this.classList.add('dragging')"
             onsorted="this.classList.remove('dragging')">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

## Callback Context

Both `onsorting` and `onsorted` receive:
- `this` - the sortable container element
- `evt` - the Sortable.js event object

```html
<ul sortable onsorted="console.log('Moved', evt.item, 'to index', evt.newIndex)">
  ...
</ul>
```

## Events

On every drop, `sortable` dispatches a bubbling `clay:sorted` event on the container. This is the self-documenting signal that the DOM order changed; reactive libraries (e.g. Sap) and your own code listen for it without `sortable` needing to know about them. It fires only in edit mode, since `sortable` only initializes there.

```js
document.addEventListener('clay:sorted', (evt) => {
  const { item, from, to, oldIndex, newIndex } = evt.detail;
});
```

| `detail` key | Description |
|-----------|-------------|
| `item` | The dragged element |
| `from` | The list the item was dragged from |
| `to` | The list the item was dropped into (same as `from` for an in-list reorder) |
| `oldIndex` | The item's index before the move |
| `newIndex` | The item's index after the move |

> A deprecated synthetic `input` event also fires on the container right after `clay:sorted`, for backward compatibility with older code. Prefer `clay:sorted`; the `input` shim is slated for removal in the next major version.
