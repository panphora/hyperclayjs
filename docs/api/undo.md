# undo

DOM-state undo/redo for self-editing pages. A single `MutationObserver` records primitive DOM mutations with computable inverses, batches them into labelled commits, and replays them backward (undo) or forward (redo). Removed subtrees are kept by reference, so undo restores the same live nodes: event listeners, focus, scroll position, and custom-attribute wiring all survive. This is `hyper-undo` vendored into hyperclayjs and re-exported as `window.hyperclay.undo`.

## Import

```js
// Recommended: smooth-sailing or everything preset auto-starts undo in edit mode
await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=smooth-sailing');
hyperclay.undo.commit('Add product', () => addProduct());

// Other presets: add the feature explicitly
await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=standard&features=undo');
```

The `undo` module ships in the `smooth-sailing` and `everything` presets. With any other preset, add `&features=undo`. Exposed as `window.hyperclay.undo`.

## Auto-start

In a Hyperclay app the singleton auto-starts on `document.body` in edit mode only, with `bindKeys: true`. Cmd+Z works out of the box. Save does not clear the stack.

## Methods

| Method | Description |
|--------|-------------|
| `undo.start(opts?)` | Start the singleton on `opts.scope` (default `document.body`). Returns the scope |
| `undo.stop()` | Disconnect observer, remove key bindings, clear stacks |
| `undo.undo()` | Navigate one step back |
| `undo.redo()` | Re-apply the undone step |
| `undo.commit(label, fn)` | Run synchronous `fn`, push its mutations as one labelled step. Throws if `fn` returns a Promise |
| `undo.commitCaptured(label)` | Drain `observer.takeRecords()` and push as one commit (pause-before / commit-on-success pattern) |
| `undo.discardCaptured()` | Drain and throw away captured records (failure-path companion) |
| `undo.flush()` | Force-close the current idle batch as its own commit |
| `undo.record(primitive)` | Record a raw primitive the observer never delivers |
| `undo.recordValue(target, opts?)` | Record an element property write (`input.value`, `checkbox.checked`) |
| `undo.clear()` | Clear both stacks |
| `undo.pause()` | Recorder skips while paused |
| `undo.resume()` | Resume recording |
| `undo.on(event, fn)` | Subscribe to a lifecycle event |
| `undo.off(event, fn)` | Unsubscribe |
| `undo.create(opts?)` | Create a separate scope for advanced multi-scope use |

## Getters

| Getter | Type | Description |
|--------|------|-------------|
| `undo.canUndo` | boolean | Whether there is a step to undo |
| `undo.canRedo` | boolean | Whether there is a step to redo |
| `undo.isPaused` | boolean | Whether recording is paused |
| `undo.history` | array | `[{ label, timestamp }, ...]`, oldest first. `timestamp` is `Date.now()` millis |
| `undo.defaults` | object | `{ shadowKeydownIn: [...] }` |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `scope` | `document.body` | Element to observe |
| `maxHistory` | `100` | Older commits drop off the back; dropped commits release their removed-node references |
| `idleWindowMs` | `500` | How long to wait before auto-closing a batch |
| `idleLabel` | `'Edit'` | Label for auto-closed batches |
| `bindKeys` | `true` (singleton), `false` (`create`) | Install the global Cmd+Z handler |
| `shadowKeydownIn` | code-editor selectors (see below) | When `event.target.closest(selector)` matches, the global handler bails without `preventDefault` |
| `ignoreAttribute` | `null` | Predicate `(attrName, element) => boolean`; return true to skip recording that attribute mutation |
| `debug` | `false` | `console.log` internal state transitions |

## recordValue parameters

`undo.recordValue(target, { prop, oldValue, newValue })`

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `prop` | string | `'value'` | Property name to write (`'value'`, `'checked'`) |
| `oldValue` | any | — | Value before the write. No-op if equal to `newValue` |
| `newValue` | any | — | Value after the write |

## Events

`undo.on(event, fn)` / `undo.off(event, fn)`. The generic `change` event was removed in 0.2.0.

| Event | Fires when |
|-------|------------|
| `undo` | After an undo navigate |
| `redo` | After a redo navigate |
| `commit` | After a new commit is pushed |
| `clear` | After the stacks are reset |

## Keyboard shortcuts

`bindKeys: true` installs a `window` keydown capture-phase listener.

| Combo | Action |
|-------|--------|
| Cmd+Z / Ctrl+Z | undo |
| Cmd+Shift+Z / Ctrl+Shift+Z | redo |
| Cmd+Y / Ctrl+Y | redo (Windows convention) |

The global Cmd+Z intercepts even inside plain `<input>`/`<textarea>`, so native char-level input undo no longer fires there. That is intentional: page-state undo is what users expect on a self-editing page. Pass `bindKeys: false` to opt out and bind your own handler.

### In-page editors

The handler short-circuits (without `preventDefault`) when `event.target` is inside any selector in `shadowKeydownIn`, so an embedded editor's own keymap handles the key. The default list covers CodeMirror v5/v6, Monaco, Ace, Quill, Tiptap, and ProseMirror:

```js
['.CodeMirror', '.cm-editor', '.monaco-editor', '.ace_editor', '.ql-editor', '.tiptap', '.ProseMirror']
```

Extend it for your own editor:

```js
hyperclay.undo.start({ shadowKeydownIn: [...hyperclay.undo.defaults.shadowKeydownIn, '.my-editor'] });
```

## Batching

Raw mutation records are too fine-grained (typing "hello" is five `characterData` records). Two batching modes share one collector:

- **Explicit commit** - `undo.commit(label, fn)` wraps a synchronous chunk into one labelled commit. Throws if `fn()` returns a Promise (mutations after the first `await` would land in a different commit).
- **Idle auto-batch** - mutations made outside an explicit commit collect until the scope is idle for `idleWindowMs`, then close into one commit labelled `idleLabel` (default `'Edit'`).

## Primitives

Each MutationRecord becomes one or more inverse-able primitives: `attr-add`, `attr-set`, `attr-remove`, `text`, and childList `add` / `remove`. A `value` primitive (element property write) is created only via `record` / `recordValue`, since property writes emit no MutationRecord.

## Ignored mutations

A mutation is excluded from recording when its region resolves to non-undoable, i.e. its target's ancestor chain carries `no-undo` or `no-watch`. The legacy markers `mutations-ignore`, `save-remove`, `save-ignore`, and `save-freeze` all imply `no-undo`, so they are excluded too. See [region attributes](./region-attributes.md). Browser-extension DOM is also filtered out.

## Example

```js
await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=smooth-sailing');

// Group several DOM edits into one undoable step
hyperclay.undo.commit('Add row', () => {
  const row = document.createElement('li');
  row.textContent = 'New item';
  document.querySelector('ul').appendChild(row);
});

// Record a property write the observer can't see (no [persist])
const input = document.querySelector('#title');
const oldValue = input.value;
input.value = 'New title';
hyperclay.undo.recordValue(input, { oldValue, newValue: input.value });

// Lifecycle events
hyperclay.undo.on('undo', () => console.log('undone:', hyperclay.undo.history));
hyperclay.undo.on('commit', () => updateToolbar());

// Programmatic navigation
if (hyperclay.undo.canUndo) hyperclay.undo.undo();
if (hyperclay.undo.canRedo) hyperclay.undo.redo();
```

## Form input typing (known gap)

Pure-property `<input>`/`<textarea>` value changes are not `MutationRecord`s, so raw typing into a field is not directly observable. Coverage:

- **CMS form fields** flow through the engine, which mutates the page DOM, so the recorder sees the page mutation.
- **`[persist]` inputs** mirror `el.value` to the `value` attribute; **`[persist]` textareas** mirror to `data-value`. The recorder sees the attribute mutation.
- **Plain `<input>`/`<textarea>` without `[persist]`** do NOT mirror; their typing is invisible to the recorder.

For an unmirrored field, do one of: add `[persist]`, call `undo.recordValue(input, ...)` after the write, wrap the handler in `undo.commit(label, fn)`, or accept that raw typing is not undoable for that field.

## Multi-scope (advanced)

Only one scope can own the global Cmd+Z binding at a time. Call `start()` again with a different scope and it throws; use `create` for additional scopes.

```js
const pageUndo = hyperclay.undo.start();                              // singleton on document.body, owns Cmd+Z
const editorUndo = hyperclay.undo.create({ scope: editorRoot, bindKeys: false });
editorUndo.start();
// editorUndo.undo() / .redo() called manually; Cmd+Z still routes to pageUndo
```

## Limitations

No persistence across reloads, no cross-tab or collaborative undo, no semantic diffs (it records DOM ops, the label is the only semantic), no tracking of non-DOM state, no revert-to-saved checkpoint. History is capped at `maxHistory` (~100 steps).

## Standalone

Outside hyperclayjs, install `hyper-undo` directly:

```bash
npm install hyper-undo
```

```js
import { undo } from 'hyper-undo';

undo.start({ scope: document.body, maxHistory: 100, bindKeys: true });
undo.commit('User edited title', () => {
  document.querySelector('h1').textContent = 'New title';
});
undo.undo();
undo.redo();
```
