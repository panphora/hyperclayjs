# createFile

Create and upload a file from text content. Automatically detects content type (HTML, CSS, JS, JSON, etc.) and adjusts the file extension.

## Signature

```js
createFile(eventOrData)
createFile(fileName, fileBody)
```

## Parameters

### From event:
| Name | Type | Description |
|------|------|-------------|
| eventOrData | Event | Form submit event with `file_name` and `file_body` inputs |

### From object:
| Name | Type | Description |
|------|------|-------------|
| eventOrData | object | `{ fileName: string, fileBody: string }` |

### From arguments:
| Name | Type | Description |
|------|------|-------------|
| fileName | string | Name for the file |
| fileBody | string | Content of the file |

## Returns

`Promise<object>` - Resolves with server response containing URLs

## Example

```js
// From form submission
document.querySelector('#create-file-form').onsubmit = (e) => {
  createFile(e);
};

// From object
createFile({
  fileName: 'styles.css',
  fileBody: '.container { max-width: 1200px; }'
});

// From arguments
createFile('config.json', JSON.stringify({ theme: 'dark' }));

// Content type auto-detection:
// - HTML content → .html
// - CSS content → .css
// - JavaScript → .js
// - Valid JSON → .json
// - Unknown → .txt
```
