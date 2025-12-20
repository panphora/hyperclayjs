# insertStyles

Insert styles into the document — either an external stylesheet or inline CSS. With a persistent DOM (hyperclay), new styles are inserted first, then duplicates are removed to prevent flickering.

## Signature

```js
insertStyles(href)
insertStyles(name, css)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| href | string | — | URL of the stylesheet to inject (1-arg form) |
| name | string | — | Unique name for inline styles, used as data-name attribute (2-arg form) |
| css | string | — | CSS content to inject inline (2-arg form) |

## Returns

`HTMLElement` — The created link or style element

## Example

```js
// External stylesheet
insertStyles('/styles/theme.css');

// Load from CDN
insertStyles('https://cdn.example.com/lib.css');

// Inline CSS with a name (for deduplication)
insertStyles('my-theme', `
  .dark-mode { background: #1a1a1a; color: #fff; }
`);

// Safe to call multiple times - old duplicates are removed
insertStyles('/styles/theme.css'); // Replaces previous
```
