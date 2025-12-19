# cacheBust

Cache-bust an element's href or src attribute by adding or updating a version query parameter. Useful for reloading stylesheets or scripts after dynamic changes.

## Signature

```js
cacheBust(element)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| element | HTMLElement | — | Element with href or src attribute to cache-bust |

## Returns

`void`

## Example

```js
// Cache-bust a stylesheet link
const link = document.querySelector('link[rel="stylesheet"]');
cacheBust(link);
// href="/styles.css" becomes "/styles.css?v=1702847291234"

// Cache-bust an image
const img = document.querySelector('img');
cacheBust(img);
// src="/photo.jpg?v=123" becomes "/photo.jpg?v=1702847291234"

// Use with onaftersave to reload Tailwind CSS after save
// <link href="/tailwindcss/mysite.css" onaftersave="cacheBust(this)">
```
