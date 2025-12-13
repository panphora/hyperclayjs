# onDomReady

Execute a callback when the DOM is ready. If the DOM is already loaded, the callback runs immediately.

## Signature

```js
onDomReady(callback)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| callback | function | — | Function to execute when DOM is ready |

## Returns

`void`

## Example

```js
// Initialize app when DOM is ready
onDomReady(() => {
  initializeApp();
  setupEventListeners();
});

// Safe to call after page load - runs immediately
onDomReady(() => {
  console.log('This runs right away if DOM is already loaded');
});
```
