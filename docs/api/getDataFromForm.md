# getDataFromForm

Extract all form field values as a plain JavaScript object. Works with `<form>` elements or any container with named inputs.

## Signature

```js
getDataFromForm(container)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| container | HTMLFormElement\|Element | — | Form element or container with named inputs |

## Returns

`object` - Key-value pairs of field names and their values

## Supported Input Types

- Text inputs, textareas, selects
- Checkboxes (collected as arrays)
- Radio buttons (single value)
- Multi-select (collected as arrays)
- Disabled fields are skipped

## Example

```js
// From a form element
const form = document.querySelector('form');
const data = getDataFromForm(form);
// { username: 'john', email: 'john@example.com' }

// From any container
const container = document.querySelector('.filter-panel');
const filters = getDataFromForm(container);

// Checkbox handling
// <input type="checkbox" name="tags" value="js" checked>
// <input type="checkbox" name="tags" value="css" checked>
// Result: { tags: ['js', 'css'] }

// Use with fetch
const formData = getDataFromForm(form);
fetch('/api/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```
