# data

Read structured data out of the live DOM and write a JS object back into it. The `extractData` / `applyData` helpers mirror the hyper-html-api engine in the browser. They operate on the LOCAL DOM only and do not write to the server.

## Methods

| Method | Description |
|--------|-------------|
| `extractData(source?)` | Read values out of the DOM under `document` into a JS object |
| `extractData(el, source?)` | Read values out of the DOM under `el` |
| `applyData(root, data, source?)` | Write `data` into the live DOM under `root`, mutate it, return `root` |
| `engine.bind(root, source, opts?)` | Lower-level primitive: returns `{ get(), set(data) }` bound to `root` |

`source` resolves a set of extraction rules:
- omitted: auto-detect the page's single `<script data-rules-name … data-rules-version="1" type="application/json">` rules tag
- a token string (e.g. `'api'`): use `<script data-rules-name~="token">`
- an object literal: use it directly as inline rules

## Presets

In `standard`, `smooth-sailing`, and `everything`. Not in `minimal`. This is a core read/write primitive, so it is NOT edit-mode-only.

## Exposure

Exposed as `window.hyperclay.extractData` / `window.hyperclay.applyData` (and the `window.h` alias). The vendored module attaches these during evaluation, so loading hyperclayjs at a preset that includes `data` is enough.

## Browser import (without hyperclayjs)

Import the LEAN `src/data.js` entry, not the full package entry:

```js
import { extractData, applyData } from 'https://cdn.jsdelivr.net/npm/hyper-html-api@0.4.0/src/data.js';
```

The full `hyper-html-api.js` entry pulls in `cms`, which references a bare `hyper-morph` specifier that does not resolve over jsdelivr. Use the lean entry above.

## The engine object

`engine` is the lower-level, DOM-bound API behind `extractData` / `applyData`. It is import-only — the vendor wrapper attaches only `extractData`/`applyData` to `window.hyperclay`, so reach `engine` via `import { engine } from '…/src/data.js'`. Beyond `bind`, it exposes:

| Member | Description |
|--------|-------------|
| `engine.extract(root, rules, opts?)` | Extract with an explicit rules object |
| `engine.apply(root, rules, data, opts?)` | Apply with an explicit rules object |
| `engine.findRules(root, source)` | Resolve a rules source (token or object) to `{ rules, tagNode }` (or `null`) |
| `engine.findRulesIn(root, token)` | Find the `data-rules-name~="token"` tag in `root`'s document |
| `engine.bind(root, source, opts?)` | Returns `{ rules, tagNode, get(), set(data) }` bound to `root` |
| `engine.parseStrict` / `engine.parseRelaxed` | Rule-JSON parsers (relaxed accepts unquoted keys, single quotes, trailing commas) |
| `engine.errors` | The engine's error classes (`ShapeMismatch`, `RuleTargetReadOnly`, `UnknownRulesVersion`, `EmptyListInsert`, …) |
| `engine.DOM_PROPERTIES` | The list of `@attr` names read/written as DOM properties (see Rules grammar) |

## Rules grammar

Rules are JSON (relaxed: unquoted keys, single quotes, and trailing commas are accepted). A rule is a string selector, an object, or a two-element array.

| Form | Meaning |
|------|---------|
| `"selector"` | element text (`textContent`). `null` if no match |
| `"selector@attr"` | attribute or DOM property of the first match |
| `"@attr"` | attribute or property of the current element |
| `"selector@value"` | input value (`value` is a DOM property) |
| `"."` | text of the current element (useful inside arrays) |
| `"selector[]"` | scalar array: text of every match |
| `["selector", { shape }]` | object array: extract `shape` from each match, selectors scoped per match |
| `{ key: rule, … }` | nested object |

`@value`, `@checked`, `@selected`, `@disabled`, `@readOnly`, `@type`, `@innerHTML`, `@textContent`, `@id`, `@className`, `@title`, and `@outerHTML` are read and written via DOM properties. `@href`, `@src`, `@action`, and anything else go through attributes. A bare selector always reads text, so reading an input value needs `@value`. Read-only properties (e.g. `@tagName`, `@offsetWidth`) throw on write.

## Examples

```html
<div id="card">
  <h1 class="title">Hello</h1>
  <a class="link" href="/about">About</a>
  <input class="email" value="a@b.com">
  <ul>
    <li class="tag">js</li>
    <li class="tag">html</li>
  </ul>
</div>

<script type="application/json" data-rules-name="card" data-rules-version="1">
{
  title: ".title",
  link: ".link@href",
  email: ".email@value",
  tags: ".tag[]"
}
</script>
```

```js
// Auto-detect the single rules tag, read from the whole document.
const data = extractData();
// { title: "Hello", link: "/about", email: "a@b.com", tags: ["js", "html"] }

// Scope to a root element, auto-detect rules (head-mounted tag still found).
const data = extractData(document.getElementById('card'));

// Named rules tag.
const data = extractData('card');

// Inline rules, no tag needed.
const data = extractData({ title: ".title", tags: ".tag[]" });

// Explicit root + named source.
const data = extractData(document.getElementById('card'), 'card');
```

```js
// Write back into the live DOM under #card using the page's rules tag.
applyData(document.getElementById('card'), {
  title: "Updated",
  link: "/contact",
  email: "x@y.com",
  tags: ["js", "html", "css"]
});

// Inline rules.
applyData(document.body, { title: "Updated" }, { title: ".title" });

// Returns the root, so it chains.
const el = applyData(card, { title: "Hi" });
```

```js
// Lower-level: bind once, get/set repeatedly. Token resolution searches the
// whole ownerDocument; get/set stay scoped to root.
const card = document.getElementById('card');
const binding = engine.bind(card, 'card');
const current = binding.get();
binding.set({ ...current, title: "Hi" });
```

## Object arrays

```html
<div class="products">
  <div class="product" data-id="1">
    <h3 class="name">Widget A</h3>
    <span class="price">$19.99</span>
  </div>
  <div class="product" data-id="2">
    <h3 class="name">Widget B</h3>
    <span class="price">$29.99</span>
  </div>
</div>

<script type="application/json" data-rules-name="catalog" data-rules-version="1">
{
  products: [".product", { id: "@data-id", name: ".name", price: ".price" }]
}
</script>
```

```js
extractData('catalog');
// { products: [
//   { id: "1", name: "Widget A", price: "$19.99" },
//   { id: "2", name: "Widget B", price: "$29.99" }
// ] }
```

## Notes

- `applyData` and `set()` MUTATE the local DOM. They do not save to the server. Call `savePage()` (or rely on autosave) to persist.
- `applyData` validates the shape of `data` against the rules and throws on a mismatch (e.g. an object where a scalar is expected). A key omitted from `data` (`undefined`) leaves that part of the DOM untouched; `null` or `""` clears a scalar target.
- Auto-detect requires exactly one rules tag on the page. Zero tags or more than one throws with a clear message; pass a name or inline rules to disambiguate.
- The rules tag must carry `data-rules-version="1"`. Any other version throws.

## Server endpoint

The same rules tag also powers a public, read-only HTTP endpoint. A `GET /_/api/<folderPath>/<sitename>.html` returns bare JSON (with CORS) extracted from the site's `<script data-rules-name~="api" data-rules-version="1">` tag. This runs server-side against the saved HTML and is independent of the browser helpers.

This is distinct from the URL-driven Data Extraction API (`?data=…`), where the rules live in the query string and the page is scraped from outside, read-only.
