# onclickchildren

Execute code when any direct child of the element is clicked.

## Usage

```html
<div onclickchildren="code">...</div>
```

## this Context

`this` refers to the direct child that was clicked (or contains the clicked element). If a nested element is clicked, `this` is set to the immediate child of the `onclickchildren` element.

## How It Works

Uses `event.composedPath()` to find the direct child of the parent that contains the click target. This means clicking a `<span>` inside a `<button>` will set `this` to the `<button>` if the button is the direct child.

## Example

```html
<!-- Hide menu when any menu item is clicked -->
<div menu class="dropdown" onclickchildren="All.menu.classList.add('hidden')">
  <button>Option 1</button>
  <button>Option 2</button>
  <button>Option 3</button>
</div>

<!-- Handle click on list items, even with nested content -->
<ul onclickchildren="console.log('Clicked:', this.dataset.id)">
  <li data-id="1"><span>Item 1</span></li>
  <li data-id="2"><span>Item 2</span></li>
  <li data-id="3"><span>Item 3</span></li>
</ul>

<!-- Delegate actions based on which child was clicked -->
<nav onclickchildren="this.classList.add('active'); All('nav > *').not(this).classList.remove('active')">
  <a href="#home">Home</a>
  <a href="#about">About</a>
  <a href="#contact">Contact</a>
</nav>
```
