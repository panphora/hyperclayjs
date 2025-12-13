# consent

Display a confirmation modal to get user consent before an action.

## Signature

```js
consent(promptText, yesCallback, extraContent)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| promptText | string | — | The question or prompt to display |
| yesCallback | function | — | Called when user confirms |
| extraContent | string | `''` | Additional HTML content to display |

## Returns

`Promise<void>` - Resolves when user confirms, rejects if user closes modal

## Example

```js
// Basic usage with async/await
try {
  await consent('Delete this item?');
  deleteItem();
} catch (e) {
  // User cancelled
}

// With callback
consent('Are you sure?', () => {
  performAction();
});

// With extra content
consent('Publish changes?', null, '<p>This will be visible to all users.</p>');
```
