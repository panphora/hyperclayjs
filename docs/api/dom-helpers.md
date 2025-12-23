# dom-helpers

Adds convenience methods to all HTML elements for finding and manipulating nearby elements. Built on top of the `nearest` utility.

## Properties

| Property | Description |
|----------|-------------|
| `el.nearest.name` | Find nearest element with `[name]` attribute or `.name` class |
| `el.val.name` | Get/set value of nearest element (form value or attribute) |
| `el.text.name` | Get/set innerText of nearest element |
| `el.exec.name()` | Execute code from `name` attribute on nearest element |

## Methods

| Method | Description |
|--------|-------------|
| `el.cycle(order, attr)` | Replace element with next element having same attribute |
| `el.cycleAttr(order, setAttr, lookupAttr?)` | Cycle through attribute values |

## Example

```js
// Find nearest element with [project] or .project
const projectEl = this.nearest.project;

// Get/set values (smart: uses .value for form elements, attribute otherwise)
const projectName = this.val.project;
this.val.project = "New Name";

// Get/set innerText
const label = this.text.title;
this.text.title = "Updated Title";

// Execute code from an attribute
// If <div sync_out="savePage()"> exists nearby, this runs savePage()
this.exec.sync_out();

// Cycle through elements
// Replaces current element with next element having [variant] attribute
this.cycle(1, 'variant');   // forward
this.cycle(-1, 'variant');  // backward

// Cycle through attribute values
// Sets theme to next value found on any [theme] element
this.cycleAttr(1, 'theme');

// Cycle with different lookup attribute
// Sets color based on values from [option:color] elements
this.cycleAttr(1, 'color', 'option:color');
```

## How It Works

All properties use `nearest()` to search outward from the element, checking siblings, children, and ancestors. The search pattern finds visually nearby elements first.

### val Behavior

- For `<input>`, `<select>`, `<textarea>`: uses the `.value` property
- For other elements: uses the attribute value

### cycle vs cycleAttr

- `cycle()` replaces the entire element with a clone of the next matching element
- `cycleAttr()` only changes an attribute value on the current element
