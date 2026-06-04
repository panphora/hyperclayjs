# edit-mode-helpers

Wires up admin-only edit behaviors driven by colon-namespaced attributes. These behaviors activate only in edit mode and are neutralized before save, so saved pages stay inert for viewers.

## Attributes

| Attribute | Active in edit mode | Neutralized before save |
|-----------|---------------------|-------------------------|
| `editmode:contenteditable` | Element becomes editable (`contenteditable` set from the attribute's value, defaulting to `"true"`) | `contenteditable` is stashed in `inert-contenteditable` and removed |
| `editmode:onclick` | The handler in the attribute fires on click | `onclick` is stashed in `inert-onclick` and removed |
| `editmode:resource` (on `style`, `link`, `script`) | Resource runs/loads | `type` is rewritten to `inert/<type>` so the browser ignores it |
| `viewmode:disabled` | Input is enabled | `disabled` is set on the input |
| `viewmode:readonly` | Input is editable | `readonly` is set on the input |

## How It Works

This feature combines four admin modules: `adminContenteditable`, `adminOnClick`, `adminResources`, and `adminInputs`. Each one runs the same two-step pattern:

1. On page load: if currently in edit mode (`isEditMode`), enable the behavior once the DOM is ready. When not in edit mode, nothing is enabled and the attributes stay inert.
2. Before save: register a `beforeSave` hook that neutralizes the behavior on the document about to be written, so the saved HTML is safe to serve to viewers.

The `editmode:` attributes (`contenteditable`, `onclick`, `resource`) grant owner-only editing affordances. The `viewmode:` attributes (`disabled`, `readonly`) lock inputs back down for the saved/viewer state.

## Example

```html
<!-- Editable only in edit mode, plain text when saved -->
<h1 editmode:contenteditable="plaintext-only">Title</h1>

<!-- Click handler that only fires in edit mode -->
<button editmode:onclick="addRow()">Add Row</button>

<!-- Script that runs in edit mode but is inert in the saved file -->
<script editmode:resource>setupEditorTools();</script>

<!-- Input editable in edit mode, disabled for viewers -->
<input viewmode:disabled value="Owner only">
```

## Runtime Helpers

Each module also exposes manual enable/disable helpers on `window.hyperclay` (aliased as `h`):

- `enableContentEditable()` / `disableContentEditable()`
- `enableOnClick()` / `disableOnClick()`
- `enableAdminResources()` / `disableAdminResources()`
- `enableAdminInputs()` / `disableAdminInputs()`

## Usage

```html
<script src="hyperclay.js?edit-mode-helpers"></script>
```
