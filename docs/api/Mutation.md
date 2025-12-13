# Mutation

A lightweight wrapper around MutationObserver for watching DOM changes. Provides methods to observe element additions, removals, and attribute changes.

## Signature

```js
Mutation.onAnyChange(options, callback)
Mutation.onAddOrRemove(options, callback)
Mutation.onAddElement(options, callback)
Mutation.onRemoveElement(options, callback)
Mutation.onAttribute(options, callback)
```

## Methods

All methods share the same signature and return an unsubscribe function.

| Method | Description |
|--------|-------------|
| `onAnyChange` | Watch all DOM changes |
| `onAddOrRemove` | Watch element additions and removals |
| `onAddElement` | Watch only element additions |
| `onRemoveElement` | Watch only element removals |
| `onAttribute` | Watch attribute changes |

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| options | object | `{}` | Configuration options |
| options.debounce | number | `0` | Debounce delay in milliseconds |
| options.selectorFilter | string\|function | — | Filter changes to matching elements |
| options.omitChangeDetails | boolean | `false` | Call callback without change data |
| callback | function | — | Called with array of changes |

## Change Object

```js
{
  type: 'add' | 'remove' | 'attribute',
  element: Element,
  parent: Element,
  previousSibling: Element | null,
  nextSibling: Element | null,
  // For attribute changes:
  attribute: string,
  oldValue: string,
  newValue: string
}
```

## Returns

`function` - Call to stop observing

## Example

```js
// Watch for any DOM changes (debounced)
const unsubscribe = Mutation.onAnyChange({ debounce: 200 }, (changes) => {
  changes.forEach(change => {
    console.log(change.type, change.element);
  });
});

// Watch for new elements matching a selector
Mutation.onAddElement({ selectorFilter: '.card' }, (changes) => {
  changes.forEach(({ element }) => {
    initializeCard(element);
  });
});

// Watch for attribute changes
Mutation.onAttribute({ debounce: 100 }, (changes) => {
  changes.forEach(({ element, attribute, oldValue, newValue }) => {
    console.log(`${attribute} changed from ${oldValue} to ${newValue}`);
  });
});

// Simple debounced callback without change details
Mutation.onAnyChange({ debounce: 500, omitChangeDetails: true }, () => {
  console.log('DOM changed');
});

// Stop observing
unsubscribe();
```
