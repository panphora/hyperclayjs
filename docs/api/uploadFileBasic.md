# uploadFileBasic

Upload a file with custom progress, completion, and error callbacks. A lower-level alternative to `uploadFile` without automatic toasts.

## Signature

```js
uploadFileBasic(eventOrFile, options)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| eventOrFile | Event\|File | — | File input change event or File object |
| options | object | `{}` | Callback options |
| options.onProgress | function | `() => {}` | Called with percent complete (0-100) |
| options.onComplete | function | `() => {}` | Called with response on success |
| options.onError | function | `() => {}` | Called with error on failure |

## Returns

`Promise<object>` - Resolves with server response, rejects on error

## Example

```js
// With custom progress UI
uploadFileBasic(fileInput.files[0], {
  onProgress: (percent) => {
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';
  },
  onComplete: (response) => {
    progressBar.classList.add('complete');
    showSuccessMessage(response.urls[0]);
  },
  onError: (error) => {
    progressBar.classList.add('error');
    showErrorMessage(error.message);
  }
});

// Minimal usage
uploadFileBasic(event, {
  onComplete: (res) => console.log('Done:', res.urls)
});

// With async/await
try {
  const result = await uploadFileBasic(file, {
    onProgress: p => console.log(p + '%')
  });
  console.log('Uploaded:', result);
} catch (err) {
  console.error('Failed:', err);
}
```
