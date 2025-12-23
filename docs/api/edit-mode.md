# edit-mode

Provides edit mode detection and toggling for page editing.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isEditMode` | boolean | True if currently in edit mode |
| `isOwner` | boolean | True if user owns the current resource |

## Methods

| Method | Description |
|--------|-------------|
| `toggleEditMode()` | Toggle edit mode on/off (reloads page) |

## How It Works

Edit mode is determined by:
1. `?editmode=true` query parameter (takes precedence)
2. `isAdminOfCurrentResource` cookie (fallback)

Ownership is determined solely by the cookie.

## Example

```js
// Check if in edit mode
if (hyperclay.isEditMode) {
  // Show edit UI
}

// Check if user owns the resource
if (hyperclay.isOwner) {
  // Show owner-only controls
}

// Toggle edit mode (reloads page with ?editmode=true/false)
hyperclay.toggleEditMode();
```

```html
<!-- Toggle button -->
<button onclick="hyperclay.toggleEditMode()">
  Toggle Edit Mode
</button>

<!-- Conditional visibility with option-visibility -->
<button option:editmode="true">Edit</button>
<span option:editmode="false">Read Only</span>
```

## URL Behavior

`toggleEditMode()` modifies the URL's `editmode` query parameter and reloads:
- If edit mode is on → sets `?editmode=false`
- If edit mode is off → sets `?editmode=true`
