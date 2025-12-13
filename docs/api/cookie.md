# cookie

Utility object for reading and removing browser cookies.

## Signature

```js
cookie.get(name)
cookie.remove(name)
```

## Methods

### cookie.get(name)

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | Name of the cookie to retrieve |

**Returns:** `any` - Parsed JSON value, decoded string, or `null` if not found

### cookie.remove(name)

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | Name of the cookie to remove |

**Returns:** `void`

Removes the cookie from current path, current domain, and apex domain.

## Example

```js
// Get a cookie value
const userId = cookie.get('userId');

// Get JSON cookie (auto-parsed)
const preferences = cookie.get('userPrefs');
// { theme: 'dark', lang: 'en' }

// Check if cookie exists
if (cookie.get('authToken')) {
  showLoggedInUI();
}

// Remove a cookie
cookie.remove('sessionId');

// Clear authentication
cookie.remove('authToken');
cookie.remove('userId');
```
