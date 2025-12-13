# copyToClipboard

Copy text to the system clipboard.

## Signature

```js
copyToClipboard(text)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| text | string | — | The text to copy to clipboard |

## Returns

`void`

## Example

```js
// Copy a URL
copyToClipboard('https://example.com/share/123');

// Copy with user feedback
copyToClipboard(embedCode);
toast('Copied to clipboard!');

// Copy from an element
const code = document.querySelector('pre').textContent;
copyToClipboard(code);
```
