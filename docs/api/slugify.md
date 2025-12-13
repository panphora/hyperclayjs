# slugify

Convert text into a URL-friendly slug. Handles accents, spaces, and special characters.

## Signature

```js
slugify(text)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| text | string | — | The text to convert to a slug |

## Returns

`string` - URL-friendly slug

## Example

```js
slugify('Hello World');
// 'hello-world'

slugify('Café & Restaurant');
// 'cafe-restaurant'

slugify('  Multiple   Spaces  ');
// 'multiple-spaces'

slugify('Ñoño with Accénts');
// 'nono-with-accents'

// Use for URLs
const title = 'My Blog Post Title!';
const url = `/posts/${slugify(title)}`;
// '/posts/my-blog-post-title'
```
