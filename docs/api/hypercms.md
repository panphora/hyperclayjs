# hypercms

Live edit-in-place CMS sidebar. Reads a page through a [`hyper-html-api`](https://github.com/panphora/hyper-html-api) rules tag, builds a form from those rules, mounts it as a side panel, and streams edits back into the page DOM in real time.

The CMS only mutates the live DOM. Saving the page (Hyperclay Cmd+S or autosave) is what writes the file. The sidebar (`[data-hcms-shell]`, marked `save-ignore`/`save-remove`) and the `hcms-open` body class are stripped from the saved output.

Vendored from `@panphora/hyper-cms`. In the `smooth-sailing` and `everything` presets. Not in `minimal` or `standard`.

## CDN import

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/hyperclayjs@latest/src/hyperclay.js?preset=smooth-sailing"></script>
```

`window.hyperclay.hypercms` references the `cms` object once loaded (`export-to-window` is on by default in these presets). It is flattened, so call `window.hyperclay.hypercms.open()`, not `window.hyperclay.hypercms.cms.open()`.

## Hard requirement: `window.hyperclay.Mutation`

`cms.open()` throws if `window.hyperclay.Mutation` is missing. The full hyperclayjs library installs it automatically. For a standalone setup, side-effect import the utility first:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/hyperclayjs@latest/src/utilities/mutation.js"></script>
```

## The rules tag

`cms.open()` looks up a rules tag by the token `cms` (`script[data-rules-name~="cms"]`). One tag can carry several space-separated tokens (e.g. `data-rules-name="api cms collection"`).

```html
<script data-rules-name="cms" data-rules-version="1" type="application/json">
{
  "title": ".page-title",
  "products": [".product", { "name": ".name", "price": ".price@data-cents" }]
}
</script>
```

## Usage

```html
<button id="edit-btn">Edit</button>
<script type="module" src="https://cdn.jsdelivr.net/npm/hyperclayjs@latest/src/utilities/mutation.js"></script>
<script type="module">
  import { cms } from 'https://cdn.jsdelivr.net/npm/hyperclayjs@latest/src/vendor/hypercms.vendor.js'
  document.getElementById('edit-btn').addEventListener('click', () => cms.open())
</script>
```

With window exposure (default presets), no import is needed:

```html
<button onclick="window.hyperclay.hypercms.open()">Edit</button>
```

## Methods

| Method | Description |
|--------|-------------|
| `cms.open(opts?)` | Build the form and mount the sidebar. Warns and no-ops if already open. |
| `cms.close()` | Tear down the sidebar and restore focus. |
| `cms.refresh()` | Re-extract the page and morph the form to match. No-op when closed. |
| `cms.isOpen` | Getter, `true` while the sidebar is mounted. |

## `open(opts)` options

| Option | Default | Effect |
|--------|---------|--------|
| `rules` | `'cms'` | Rules source. A token string (`data-rules-name~="<token>"`), a literal rules object, or omitted for the default token. |
| `pageRoot` | `document.body` | Where extract and apply run. |
| `mountTo` | `document.body` | Where the shell DOM mounts. Can be a descendant of `pageRoot`. |
| `side` | `'right'` | `'right'` or `'left'`. |
| `overlay` | `false` | `true`: sidebar covers the page. `false`: page content gets a padding offset. |
| `showSaveButton` | `false` | Render a Save button in the shell footer. Clicking dispatches `hcms:save`. |
| `onChange(data, info)` | none | Per-commit callback. `info` is `{ path, structural }`. |
| `onError(err)` | none | Per-commit error callback. |
| `onSave(data)` | none | Save-button callback. |

```js
cms.open()                                // default token "cms"
cms.open({ rules: 'collection' })         // tag with data-rules-name~="collection"
cms.open({ rules: { title: '.title' } })  // literal rules object
cms.open({ side: 'left', overlay: true, showSaveButton: true })
cms.open({ onChange: (data, info) => console.log(info.path, data) })
```

## `cms.api`

Programmatic edits. All require the sidebar to be open. The mutating methods (`setValue`, `addItem`, `removeItem`) commit and dispatch `hcms:change`; `getData()` is a read-only snapshot.

| Method | Description |
|--------|-------------|
| `cms.api.getData()` | Current form data as a JS object. Returns `null` when closed. |
| `cms.api.setValue(path, value)` | Write a scalar leaf. Throws if the path is not a leaf scalar or has no field. |
| `cms.api.addItem(arrayPath)` | Push a new item onto an array. |
| `cms.api.removeItem(itemPath)` | Drop an item. Last path segment must be an integer index. |

```js
cms.api.getData()
cms.api.setValue('title', 'New title')
cms.api.setValue('products.0.name', 'Widget')
cms.api.addItem('products')
cms.api.removeItem('products.1')
cms.api.removeItem('products.0.variants.1')
```

### Path syntax

Dotted strings with integer indices for arrays, e.g. `products.0.variants.1.label`. Helpers live at `cms.path` (`fromString`, `toString`, `getRuleAtPath`).

## Events

All events dispatch on the shell root and bubble through the document.

| Event | Detail | When |
|-------|--------|------|
| `hcms:open` | `{ pageRoot }` | After mount, before first interaction. |
| `hcms:change` | `{ data, path, structural }` | Per successful commit. `structural` is `true` for add/remove/reorder. Cancelable. |
| `hcms:error` | `{ error, attemptedData }` | When apply throws (shape mismatch, missing template, etc.). |
| `hcms:save` | `{ data }` | Save button clicked. Cancelable. |
| `hcms:close` | `null` | Before teardown. |

```js
document.addEventListener('hcms:change', (e) => {
  console.log('changed', e.detail.path, e.detail.data, e.detail.structural)
})
document.addEventListener('hcms:save', (e) => save(e.detail.data))
```

## Page HTML attributes

| Attribute | On | Effect |
|-----------|----|--------|
| `save-ignore` | any element | Engine skips it during extract and apply. The shell sets this on itself. |
| `save-freeze`, `save-remove`, `mutations-ignore` | any element | Same observer-ignore behavior as `save-ignore`. |
| `cms-template` | an element matching a list rule | Treated as a seed template, not data. Lets a list grow from empty. |

### Template seeding

The engine grows a list by cloning an existing item. When a list hits zero items there is nothing to clone, and the engine throws `EmptyListInsert`. Mark one hidden seed element per growable list with `cms-template`:

```html
<div class="variants">
  <div class="variant">…real data…</div>
  <div class="variant" cms-template hidden>
    <strong class="variant-label"></strong>
    <em class="variant-stock"></em>
  </div>
</div>
```

`cms-template` elements are never read as data and never written into. When the list needs to grow from zero, the engine clones the seed, strips the attribute from the clone, and inserts it. The original stays in place.

## Custom form templates

Override the default form for a path or shape with a `<template>` anywhere in the page:

```html
<template data-hcms-tpl="products.*">
  <article class="my-product-card">
    <input data-hcms-field="name" />
    <input data-hcms-field="price" />
    <button data-hcms-action="remove">×</button>
  </article>
</template>
```

`data-hcms-tpl` resolves in order: exact path (`products.0.name`), wildcard path (`products.*`), then shape key (`@scalar`, `@object`, `@object-array`, `@scalar-array`).

### Template slots

| Marker | Purpose |
|--------|---------|
| `data-hcms-field` | Input/textarea/select holding a scalar. Use `data-hcms-field="name"` to bind by key inside an object template. |
| `data-hcms-label` | Where the field label is written. |
| `data-hcms-action="add"` | Add-item button for a list. |
| `data-hcms-action="remove"` | Remove-item button on an item. |
| `data-hcms-action="move-up"` / `"move-down"` | Reorder buttons. |
| `.hcms-object-fields` / `.hcms-card-fields` / `.hcms-array-items` | Slot where child fields/items render. Required on slotted (non-inline) templates. |

### Template count and lock attributes

Set on a `<template data-hcms-tpl>`. They project onto the rendered array container.

| Attribute | Effect |
|-----------|--------|
| `data-hcms-min-items="N"` | Refuse to remove below N items. Hides the remove button at the floor. |
| `data-hcms-max-items="N"` | Refuse to add above N items. Hides the add button at the ceiling. |
| `data-hcms-no-add` | No add button. |
| `data-hcms-no-remove` | No remove buttons. |
| `data-hcms-no-reorder` | No drag handles or move buttons. |

## Errors

Apply runs inside a try/catch. On failure the error renders inline in the shell, `hcms:error` is dispatched, structural commits roll back the affected subtree from a pre-apply snapshot, and `onError` fires.

| Name | Cause | Fix |
|------|-------|-----|
| `ShapeMismatch` | Form data shape does not match the rule shape. | Bug in form rendering, report it. |
| `EmptyListInsert` | List needs to grow but has zero items and no `cms-template`. | Add a `cms-template` seed per growable list, or set `data-hcms-min-items="1"`. |
| `MaxRuleDepthExceeded` | Rules nest beyond the engine depth limit. | Flatten the rules. |

## Drag-to-reorder

In hyperclayjs apps drag works out of the box: object-array templates carry the `[sortable]` attribute, which hyperclayjs upgrades. For standalone use, install `sortablejs` and upgrade `[sortable]` yourself, or replace the template with your own reorder UX. Add and remove still work without sortable.

## Standalone (without hyperclayjs)

```js
import { cms } from '@panphora/hyper-cms'
// Ensure window.hyperclay.Mutation exists before calling cms.open()
```
