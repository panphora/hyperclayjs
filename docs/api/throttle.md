# throttle

Limit how often a function can be called. The function executes at most once per specified delay period.

## Signature

```js
throttle(callback, delay, executeFirst)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| callback | function | — | The function to throttle |
| delay | number | — | Minimum time between calls in milliseconds |
| executeFirst | boolean | `true` | Execute immediately on first call |

## Returns

`function` - Throttled version of the callback

## Example

```js
// Throttle scroll handler to once per 100ms
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', handleScroll);

// Throttle resize handler
const handleResize = throttle(() => {
  recalculateLayout();
}, 200);

window.addEventListener('resize', handleResize);

// Don't execute immediately on first call
const lazyUpdate = throttle(updateUI, 500, false);
```
