# onclickaway

Execute code when a click occurs outside the element.

## Usage

```html
<div onclickaway="code">...</div>
```

## this Context

`this` refers to the element with the `onclickaway` attribute.

## How It Works

A global click listener checks if the click target is outside each element with `onclickaway`. If the click is outside (not on the element or any of its descendants), the attribute code executes.

## Example

```html
<!-- Close dropdown when clicking outside -->
<div class="dropdown" onclickaway="this.classList.add('hidden')">
  <button>Menu</button>
  <ul class="dropdown-items">
    <li>Option 1</li>
    <li>Option 2</li>
  </ul>
</div>

<!-- Close modal when clicking backdrop -->
<div class="modal-backdrop" onclickaway="All.modal.remove()">
  <div class="modal">Modal content</div>
</div>
```
