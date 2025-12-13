# nearest

Search for elements matching a CSS selector by exploring outward from a starting point. Unlike `element.closest()` which only searches ancestors, this explores siblings, cousins, and nearby elements in visual proximity.

## Signature

```js
nearest(startElem, selector, elementFoundReturnValue)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| startElem | Element | — | Starting element for the search |
| selector | string | — | CSS selector to match |
| elementFoundReturnValue | function | `x => x` | Transform function for the found element |

## Returns

`Element | any | null` - Found element (or transformed value), or `null` if not found

## Search Order

1. Current element
2. All children (deeply)
3. Previous siblings and their descendants
4. Next siblings and their descendants
5. Move to parent and repeat

## Example

```js
// Find the nearest button
const btn = nearest(clickedElement, 'button');

// Find nearest input field from a label
const input = nearest(label, 'input');

// Find nearest and get its value
const value = nearest(el, '[data-value]', el => el.dataset.value);

// Find related UI elements
const card = nearest(deleteBtn, '.card');
card.remove();

// Find next input in reading order
const nextInput = nearest(currentInput, 'input:not(:disabled)');
nextInput?.focus();
```
