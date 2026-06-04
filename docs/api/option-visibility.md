# option-visibility

Show or hide elements based on ancestor attribute values.

## Usage

```html
<element option:name="value">
```

The element is hidden by default. It becomes visible when any ancestor has `name="value"`.

### Inverse: `option-not:name="value"`

Use `option-not:` to show an element when an ancestor has the `name` attribute but its value is NOT `value`:

```html
<element option-not:name="value">
```

The element becomes visible when an ancestor has `name` set to anything other than `value`. If multiple values are listed (see below), the element shows only when the ancestor matches none of them.

### OR values: `option:name="a|b|c"`

Separate multiple values with a pipe to match any of them:

```html
<element option:name="a|b|c">   <!-- visible when an ancestor has name="a", name="b", or name="c" -->
```

This works for both `option:` and `option-not:`. For `option-not:name="a|b"`, the element shows only when an ancestor has `name` set but its value is neither `a` nor `b`.

Note: the pipe character `|` is reserved as the OR delimiter, so it cannot be used as a literal value.

## How It Works

1. Scans the DOM for `option:*` and `option-not:*` attributes
2. Generates a single conditional-hide CSS rule per pattern using `:is()` and `:not()` with selector lists
3. An element is hidden with `display: none !important` only when it is NOT inside a matching ancestor scope
4. When the condition is met, the hide rule simply does not match, so the author's original display value (flex, grid, block, etc.) applies. There is no revert-layer recovery.

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

Requires `:is()` and `:not()` with selector lists (~96% of browsers, 2021+). Falls back gracefully - elements remain visible if unsupported.

## API

```js
// Manual control (rarely needed)
optionVisibility.start();   // Start observing
optionVisibility.stop();    // Stop and remove styles
optionVisibility.update();  // Regenerate CSS rules
optionVisibility.debug = true;  // Enable logging
```
