# toast

Display a toast notification for success or error messages.

## Signature

```js
toast(message, messageType)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| message | string | — | The message to display |
| messageType | string | `'success'` | Either `'success'` or `'error'` |

## Returns

`void`

## Example

```js
// Show a success message
toast('Changes saved!', 'success');

// Show an error message
toast('Something went wrong', 'error');

// Success is the default type
toast('Uploaded successfully');
```
