# upgrade

One-click template upgrades. When a forked page's `<meta name="hyper-source">` points at a template whose `<meta name="hyper-version">` is newer than the page's own, the owner can migrate the page's keyed data into the new template and save. The mechanism (version check, pristine fetch, optional transform tag, keyed apply) is `hyper-html-api`'s upgrade engine vendored into hyperclayjs and re-exported as `window.hyperclay.upgrade`; hyperclayjs adds the owner-only popover UI, save, and reload.

## Presets

In `smooth-sailing` and `everything`. With any other preset add `&features=upgrade`. The module auto-runs on load and shows its popover only for the owner in edit mode.

## Auto-start

On load (owner + edit mode only) it calls `checkForUpdate()`. If an update is available and not previously dismissed, it shows a bottom-right "Update available" popover with Upgrade / Later / Skip. Upgrade runs the migration, saves with `saveHtml()`, and reloads.

## Methods

`window.hyperclay.upgrade` (also the module's default export):

| Method | Description |
|--------|-------------|
| `checkForUpdate(opts?)` | Compare the page version to the source's. Resolves `null` when inert (no `hyper-source`, self-pointing, unreachable, or unparseable), else `{ available, currentVersion, sourceVersion, sourceUrl }`. Result is cached 24h per source+version; pass `{ force: true }` to bypass |
| `run(opts?)` | Run the full migration without an iframe: pack keyed data, fetch the source's pristine HTML, apply its optional `text/hyper-upgrade` transform, return `{ html, fromVersion, toVersion, summary }`. Does **not** save |
| `extractAll(root?)` | Read every named rules tag under `root` into `{ dataByName, version }` |
| `shapeMatch(rules, data)` | Carry `data` across a rules shape, returning `{ data, summary }` (`summary` counts `carriedOver` / `discarded` / `listItems`) |

`run()` throws `UpgradeSourceUnreachable`, `UpgradeSourceHasNoRules`, `UpgradeTransformInvalid`, or `UpgradeMultipleTransforms` on the respective failures.

## Requirements

- `<meta name="hyper-source" content="…">` and `<meta name="hyper-version" content="…">` on the page.
- A reachable source page that carries at least one `script[data-rules-name][data-rules-version="1"]` tag (and optionally one `script[type="text/hyper-upgrade"]` transform that `export default`s a `(dataByName, { fromVersion, toVersion }) => dataByName` function).
- The popover appears only for the owner in edit mode. `run()` returns HTML; the caller persists it (the popover calls `saveHtml()` then reloads).

## Example

```js
const info = await hyperclay.upgrade.checkForUpdate();
if (info?.available) {
  const { html, summary } = await hyperclay.upgrade.run();
  console.log(`carried ${summary.totals.carriedOver} field(s)`);
  await hyperclay.saveHtml(html); // then reload
}
```
