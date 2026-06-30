# uploadFile

Upload a file to the `/_/upload` endpoint with progress toasts and automatic clipboard copy of the resulting URL.

## Signature

```js
uploadFile(eventOrFile, callback, extraData)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| eventOrFile | Event\|File | — | File input change event or File object |
| callback | function | `() => {}` | Called with the response on success. Pass a function or omit it; passing `null` throws on completion |
| extraData | object | `{}` | Additional data to include in the request |

## Returns

`Promise<object>` - Resolves with server response containing URLs

## Limits

- Maximum file size: `window.env.MAX_UPLOAD_SIZE` when set, otherwise **10 MB**. Larger files are rejected with an error toast.

## Example

```js
// Handle file input
document.querySelector('input[type="file"]').onchange = (e) => {
  uploadFile(e, (response) => {
    console.log('Uploaded to:', response.urls);
  });
};

// Upload a File object directly
const file = new File(['content'], 'test.txt', { type: 'text/plain' });
uploadFile(file);

// With extra metadata (pass a function or omit the callback — do NOT pass null)
uploadFile(event, (response) => console.log(response.urls), {
  folder: 'images',
  public: true
});

// Progress is shown automatically via toasts:
// "10% uploaded" → "50% uploaded" → "80% uploaded" → "Uploaded! URL copied"
```
