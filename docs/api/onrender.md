# onrender

Execute code once when an element is rendered (added to the DOM).

## Usage

```html
<div onrender="code">...</div>
```

## this Context

`this` refers to the element with the `onrender` attribute.

## How It Works

Runs on two occasions:
1. **Page load**: All elements with `onrender` execute on initial page load
2. **Dynamic insertion**: When new elements with `onrender` are added to the DOM

The code supports async/await. Each element's `onrender` only fires once.

## Example

```html
<!-- Initialize a component on render -->
<div class="chart" onrender="initChart(this)">
  Loading chart...
</div>

<!-- Fetch and display data -->
<div onrender="this.innerHTML = await fetchUserProfile()">
  Loading profile...
</div>

<!-- Set initial state -->
<input type="text" onrender="this.value = localStorage.getItem('draft') || ''">

<!-- Focus first input in dynamically added forms -->
<form onrender="this.querySelector('input')?.focus()">
  <input type="text" placeholder="Name">
  <input type="email" placeholder="Email">
</form>

<!-- Load content lazily -->
<div class="lazy-section" onrender="
  const content = await fetch(this.dataset.src).then(r => r.text());
  this.innerHTML = content;
" data-src="/partials/sidebar.html">
  Loading...
</div>
```
