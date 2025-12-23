# option-visibility

Show or hide elements based on ancestor attribute values.

## Usage

```html
<element option:name="value">
```

The element is hidden by default. It becomes visible when any ancestor has `name="value"`.

## How It Works

1. Scans the DOM for `option:*` attributes
2. Generates CSS rules using `@layer` and `revert-layer`
3. Elements are hidden with `display: none !important`
4. When ancestor matches, `display: revert-layer !important` restores original display

This is pure CSS after initialization - no JS overhead for toggling.

## Example

```html
<!-- Show/hide based on edit mode -->
<html editmode="true">
  <body>
    <button option:editmode="true">Edit</button>   <!-- visible -->
    <button option:editmode="false">View</button>  <!-- hidden -->
  </body>
</html>

<!-- Theme-based visibility -->
<html theme="dark">
  <img option:theme="light" src="logo-dark.png">   <!-- hidden -->
  <img option:theme="dark" src="logo-light.png">   <!-- visible -->
</html>

<!-- Role-based UI -->
<div role="admin">
  <button option:role="admin">Delete All</button>  <!-- visible -->
  <button option:role="user">My Items</button>     <!-- hidden -->
</div>

<!-- Nested contexts -->
<div editmode="true">
  <div editmode="false">
    <span option:editmode="true">A</span>   <!-- hidden (nearest ancestor is false) -->
    <span option:editmode="false">B</span>  <!-- visible -->
  </div>
</div>
```

## Browser Support

Requires `@layer` and `revert-layer` support (95.18% of browsers, 2025). Falls back gracefully - elements remain visible if unsupported.

## API

```js
// Manual control (rarely needed)
optionVisibility.start();   // Start observing
optionVisibility.stop();    // Stop and remove styles
optionVisibility.update();  // Regenerate CSS rules
optionVisibility.debug = true;  // Enable logging
```
