# tell

Display an informational modal with a title and optional content paragraphs.

## Signature

```js
tell(promptText, ...content)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| promptText | string | — | The title/heading text |
| ...content | string[] | — | Additional content paragraphs (variadic) |

## Returns

`Promise<void>` - Resolves when user confirms, rejects on close

## Example

```js
// Simple message
await tell('Welcome!');

// With additional content
await tell(
  'About This App',
  'This is a collaborative editing platform.',
  'Changes are saved automatically.',
  'Press CMD+S to save manually.'
);

// Informational popup
tell('Tip', 'You can drag and drop items to reorder them.');
```
