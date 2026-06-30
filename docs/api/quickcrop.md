# quickcrop

Open an image-crop modal and get back a cropped image. Handy in upload flows: crop first, then upload the resulting Blob. Uses `themodal` when available, otherwise it brings its own built-in modal.

## Signature

```js
quickcrop(file, options)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| file | File\|Blob | — | The image to crop |
| options | object | `{}` | See below |
| options.aspect | number\|null | `null` | Lock the crop ratio. `null` = free crop |
| options.type | string | source type | Output MIME type. Falls back to `image/png` when the source type is not encodable |
| options.quality | number | `0.92` | Encode quality for `image/jpeg` and `image/webp` |
| options.maxWidth | number\|null | `null` | Cap the output width |
| options.maxHeight | number\|null | `null` | Cap the output height |
| options.minSize | number | `40` | Minimum crop-box size in px |
| options.labels | object | `{ confirm: 'Crop' }` | Button labels |
| options.modal | string\|object | `'auto'` | `'auto'` uses `themodal` when present else built-in; `'builtin'`; a themodal instance; or any adapter object with an `open()` method |

## Returns

`Promise<{ blob, dataURL, width, height } | null>` — resolves with the crop on confirm, resolves `null` on cancel, and rejects only on bad input or a decode/encode failure.

## Presets

In `smooth-sailing` and `everything`. Exposed as `window.hyperclay.quickcrop`.

## Notes

- Single-instance: a second concurrent call rejects with `"quickcrop: already open"`.
- Branch on `result === null` to detect a cancel.
- `image/jpeg` output is flattened onto a white background. Very large images are area-capped and downscaled to avoid blank canvases on iOS Safari.

## Example

```js
const result = await quickcrop(file, { aspect: 1, maxWidth: 512 });
if (result) {
  await uploadFile(result.blob); // null means the user cancelled
}
```
