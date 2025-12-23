# onmutation

Execute code when the element or its descendants change.

## Usage

```html
<div onmutation="code">...</div>
```

## this Context

`this` refers to the element with the `onmutation` attribute.

## How It Works

Creates a `MutationObserver` for each element with the attribute. The observer watches for:
- Child list changes (elements added/removed)
- Subtree changes (descendants)
- Character data changes (text content)
- Attribute changes

The code supports async/await. Observers are automatically cleaned up when elements are removed from the DOM.

## Example

```html
<!-- Update count when list changes -->
<div onmutation="All.count.textContent = this.children.length">
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</div>
<span count>2</span>

<!-- Auto-save when content is edited -->
<div contenteditable onmutation="await saveContent(this.innerHTML)">
  Edit this content...
</div>

<!-- Sync state with DOM changes -->
<div class="todo-list" onmutation="updateTodoState(this)">
  <div class="todo-item">Task 1</div>
  <div class="todo-item">Task 2</div>
</div>
```

## Comparison with onpagemutation

| Attribute | Fires when |
|-----------|------------|
| `onmutation` | This element or its descendants change |
| `onpagemutation` | Any element on the page changes |
