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

## Behavior details

- **Value source:** each field's value is `element.value || element.getAttribute('value')`. Clearing a field that also has a `value="…"` attribute therefore reports the attribute value, not an empty string.
- **Checkboxes:** the key is always present as an array; a value is pushed only when the box is checked, so an unchecked box yields `{ name: [] }`.
- **Buttons / submit / reset:** included only when they have both a `name` and a value.
- **Flat keys only:** names are used literally, with no nested-name parsing, so `name="a[b]"` becomes the key `"a[b]"`, not `{ a: { b } }`.
- **Last write wins** for duplicate non-array names.

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
