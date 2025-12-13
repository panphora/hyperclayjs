# query

An object containing parsed URL query parameters from the current page URL.

## Signature

```js
query
```

## Type

`object` - Key-value pairs of URL search parameters

## Example

```js
// URL: https://example.com/page?name=john&page=2&active=true

query.name;    // 'john'
query.page;    // '2'
query.active;  // 'true'

// Check if parameter exists
if (query.debug) {
  enableDebugMode();
}

// Use with defaults
const page = query.page || '1';
const sort = query.sort || 'date';

// Destructure parameters
const { name, page, sort = 'date' } = query;
```
