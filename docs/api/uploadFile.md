# uploadFile

Upload a file to the `/upload` endpoint with progress toasts and automatic clipboard copy of the resulting URL.

## Signature

```js
uploadFile(eventOrFile, callback, extraData)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| eventOrFile | Event\|File | — | File input change event or File object |
| callback | function | `() => {}` | Called with response on success |
| extraData | object | `{}` | Additional data to include in the request |

## Returns

`Promise<object>` - Resolves with server response containing URLs

## Limits

- Maximum file size: **10 MB**. Larger files are rejected with an error toast.

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

// With extra metadata
uploadFile(event, null, {
  folder: 'images',
  public: true
});

// Progress is shown automatically via toasts:
// "10% uploaded" → "50% uploaded" → "80% uploaded" → "Uploaded! URL copied"
```
