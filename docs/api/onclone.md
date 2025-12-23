# onclone

Execute code when an element is cloned via `cloneNode()`.

## Usage

```html
<div onclone="code">...</div>
```

## this Context

`this` refers to the newly cloned element (not the original).

## How It Works

Patches `Node.prototype.cloneNode` to detect when elements with `onclone` are cloned. The attribute code runs on the clone immediately after cloning, allowing you to modify the clone before it's inserted into the DOM.

## Example

```html
<!-- Generate unique IDs for cloned elements -->
<template id="item-template">
  <div class="item" onclone="this.id = 'item-' + Date.now()">
    <input type="text">
  </div>
</template>

<!-- Clear input values in cloned forms -->
<form onclone="All('input', this).value = ''">
  <input type="text" value="default">
  <button type="submit">Submit</button>
</form>

<!-- Initialize cloned components -->
<div class="widget" onclone="this.dataset.initialized = 'false'; initWidget(this)">
  Widget content
</div>
```
