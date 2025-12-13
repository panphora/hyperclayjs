# onLoad

Execute a callback when the window load event fires (all resources loaded). If already loaded, the callback runs immediately.

## Signature

```js
onLoad(callback)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| callback | function | — | Function to execute when window is fully loaded |

## Returns

`void`

## Example

```js
// Wait for all images and resources to load
onLoad(() => {
  initializeImageGallery();
  calculateLayoutDimensions();
});

// Difference from onDomReady:
// - onDomReady: DOM structure ready, images may still be loading
// - onLoad: Everything loaded including images, fonts, iframes
```
