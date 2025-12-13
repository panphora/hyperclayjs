# debounce

Delay function execution until after a period of inactivity. The timer resets each time the function is called.

## Signature

```js
debounce(callback, delay)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| callback | function | — | The function to debounce |
| delay | number | — | Wait time in milliseconds after last call |

## Returns

`function` - Debounced version of the callback

## Example

```js
// Debounce search input
const searchInput = document.querySelector('#search');
const handleSearch = debounce((query) => {
  fetchSearchResults(query);
}, 300);

searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// Debounce window resize
const handleResize = debounce(() => {
  recalculateLayout();
}, 250);

window.addEventListener('resize', handleResize);

// Auto-save after user stops typing
const autoSave = debounce(() => {
  saveDraft();
}, 1000);
```
