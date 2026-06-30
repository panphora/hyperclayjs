# insertStyles

Insert or update styles in the document, either an external stylesheet or inline CSS. With a persistent DOM (hyperclay) it reuses a matching element in place rather than creating a new one, so it never churns the DOM or trips a false "unsaved changes" diff. External stylesheets are matched by normalized base URL (the `?v=` query is ignored); inline styles are matched by `name` (the `data-name` attribute). An optional callback runs on the resolved element every call.

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
| callback | function | — | Optional. Runs on the resolved element (existing or new) every call, so you can update its attributes |

## Returns

`HTMLElement` — The resolved link or style element (reused in place if a match already exists, otherwise created in `<head>`)

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

// Safe to call multiple times — reuses the existing element in place
insertStyles('/styles/theme.css'); // Updates, does not duplicate

// Pass a callback to tweak the resolved element every call
insertStyles('/styles/theme.css', (link) => { link.media = 'print'; });
```
