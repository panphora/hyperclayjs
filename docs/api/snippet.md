# snippet

Display a modal with a code snippet and a copy-to-clipboard button.

## Signature

```js
snippet(title, content, extraContent)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | string | — | The modal heading |
| content | string | — | The code/text to display and copy |
| extraContent | string | `''` | Optional warning or info text below the copy button |

## Returns

`Promise<void>` - Resolves when modal is closed

## Example

```js
// Show embed code
snippet('Embed Code', '<iframe src="https://example.com"></iframe>');

// With a warning message
snippet(
  'API Key',
  'sk-1234567890abcdef',
  'Keep this key secret. Do not share it publicly.'
);

// Show configuration
const config = JSON.stringify({ theme: 'dark', lang: 'en' }, null, 2);
snippet('Your Settings', config);
```
