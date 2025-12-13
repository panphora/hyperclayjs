# insertStyleTag

Dynamically inject a stylesheet link into the document head. Automatically prevents duplicate stylesheets.

## Signature

```js
insertStyleTag(href)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| href | string | — | URL of the stylesheet to inject |

## Returns

`void`

## Example

```js
// Load a CSS file
insertStyleTag('/styles/theme.css');

// Load from CDN
insertStyleTag('https://cdn.example.com/lib.css');

// Safe to call multiple times - duplicates are ignored
insertStyleTag('/styles/theme.css'); // No duplicate added
```
