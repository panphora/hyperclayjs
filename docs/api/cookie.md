# cookie

Utility object for reading and removing browser cookies.

## Signature

```js
cookie.get(name)
cookie.remove(name)
```

## Methods

| Method | Description |
|--------|-------------|
| `get(name)` | Get cookie value. Returns parsed JSON if valid, otherwise decoded string, or `null` if not found. |
| `remove(name)` | Remove cookie from current path, host domain, and apex domain. |

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
