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
| messageType | string | `'success'` | One of `'success'`, `'error'`, `'warning'`, or `'info'`. An unknown value falls back to `'success'` |

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

## Notes

- `message` is inserted as HTML (`innerHTML`), so do not pass untrusted user input.
- A toast auto-dismisses after ~6.6s and is also click-to-dismiss. Its container and styles carry `save-remove`/`snapshot-remove`, so they never reach a saved file.

## toastPersistent

A sticky variant that does **not** auto-dismiss: it adds a close button and only closes on click. Calling it again with the same `message` replaces the existing toast (de-duped) instead of stacking.

```js
toastPersistent(message, messageType)
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| message | string | — | The message to display (inserted as HTML) |
| messageType | string | `'warning'` | One of `'success'`, `'error'`, `'warning'`, `'info'` |

```js
// A standing warning the user must dismiss
toastPersistent('You are offline. Changes will not save.', 'warning');
```

Both `toast` and `toastPersistent` are exported from the `toast` module (`window.toast` / `window.toastPersistent`, plus the `window.hyperclay.*` aliases).

## Theme

The optional `toast-hyperclay` module (not in any preset; add with `?features=toast-hyperclay`) switches every toast to the "hyperclay" theme app-wide, as a side effect of being imported.
