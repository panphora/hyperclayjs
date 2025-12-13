# All

A lightweight DOM manipulation library with jQuery-like syntax. Select elements, chain methods, handle events with delegation, and more.

## Signature

```js
All(selector)
All(selector, context)
All(element)
All(elements)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| selector | string | — | CSS selector to match elements |
| context | string\|Element | document | Limit search to within this context |
| element | Element | — | Wrap a single DOM element |
| elements | Element[] | — | Wrap an array of DOM elements |

## Returns

`Proxy<Element[]>` - A proxied array of elements with chainable methods

## Core Features

### Selection
```js
// By selector
All('.card')
All('#header')
All('button[type="submit"]')

// By attribute or class shorthand
All.myAttribute  // same as All('[myAttribute], .myAttribute')

// With context
All('li', '.menu')  // find li elements within .menu
```

### Chaining DOM Methods
```js
// All native DOM methods work and chain
All('.item')
  .classList.add('active')
  .setAttribute('data-ready', 'true')
  .style.opacity = '1';
```

### Event Handling
```js
// Direct binding
All('button').onclick(e => console.log('clicked'));

// Event delegation
All('.list').onclick('li', function(e) {
  console.log('clicked:', this.textContent);
});

// Multiple delegated handlers
All('.container').onclick({
  '.edit-btn': (e) => edit(e.target),
  '.delete-btn': (e) => remove(e.target)
});
```

### Built-in Methods

| Method | Description |
|--------|-------------|
| `eq(index)` | Get element at index (supports negative), returns wrapped array |
| `at(index)` | Get raw element at index (supports negative) |
| `prop(obj)` | Set multiple properties: `All('input').prop({ disabled: true })` |
| `css(obj)` | Set multiple styles: `All('.box').css({ color: 'red' })` |
| `pluck(attr)` | Get array of attribute values |
| `unique()` | Remove duplicate elements |
| `sortBy(fn\|attr)` | Sort elements by function or attribute |

### Array Methods
All standard array methods work and maintain chainability for element arrays:
```js
All('li').filter(el => el.classList.contains('active'))
All('.item').map(el => el.id)
All('p').forEach(el => console.log(el.textContent))
```

## Example

```js
// Toggle visibility on all cards
All('.card').classList.toggle('hidden');

// Get values from all inputs
const values = All('input').map(el => el.value);

// Event delegation for dynamic content
All(document).onclick('.dynamic-btn', function() {
  console.log('Button clicked:', this.dataset.id);
});

// Chained operations
All('.notification')
  .classList.add('fade-out')
  .style.opacity = '0';

// Iterate with for...of
for (const el of All('.item')) {
  el.textContent = 'Updated';
}
```
