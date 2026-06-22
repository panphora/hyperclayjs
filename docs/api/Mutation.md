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
| options.require | `'observed'`\|`'autosave'`\|`'undo'` | — | Region-policy axis: only deliver changes inside a region that opts into this concern (e.g. `'observed'` skips no-watch regions and extension noise). Unset uses the legacy four-marker skip. |
| options.pausable | boolean | `true` | When `true` (default) the callback is silenced inside a `Mutation.pause()` window and its queued changes are dropped on resume. Set `false` only for pure enhancers that never save, record, or rebroadcast (e.g. `autosize`, `sortable`) so they keep firing through a morph or live-sync pause. |
| callback | function | — | Called with array of changes |

## The sanctioned lane for an external reactive consumer

A library that wants to react to *every* DOM change (regardless of who made it) — for example **sapjs**, which re-derives its state on any mutation — should subscribe through `onAnyChange({ require: 'observed' })`. This is the supported, region-aware, pause-gated lane:

- `require: 'observed'` makes it skip no-watch regions and platform-internal extension noise automatically.
- Leaving `pausable` at its default (`true`) is load-bearing: it is what lets such a consumer suppress its *own* derived writes. By wrapping its write phase in `Mutation.pause()` / `Mutation.resume()`, the consumer's writes are vacuumed on resume and routed only to non-pausable consumers, so they never loop back to re-trigger it.

The raw fan-out lane (`subscribeRaw` / `createObserver`) is **internal to hyperclayjs** and not part of the public contract. It fires before-and-after the pause bridge and is reserved for the hub's own undo/region plumbing; external consumers should not use it.

## Change Object

```js
{
  type: 'add' | 'remove' | 'attribute' | 'characterData',
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

Text-content changes surface through `onAnyChange` callbacks with `type: 'characterData'`. These carry `oldValue` and `newValue`, and `element` is the parent of the changed text node. Typed callbacks (`onAddElement`, `onRemoveElement`, `onAttribute`) do not receive them.

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
