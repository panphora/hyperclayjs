# unsaved-warning

Warns users before leaving the page if there are unsaved changes. On `beforeunload`, compares current page content to last saved content and shows the browser's native dialog if different.

## Methods

| Method | Description |
|--------|-------------|
| `beforeunload` | Fires automatically when user tries to leave with unsaved changes |
| `getPageContents()` | Used internally to compare current vs saved state |

## Example

```html
<!-- Basic setup -->
<script src="hyperclay.js?save-system,unsaved-warning"></script>

<!-- Full save stack -->
<script src="hyperclay.js?save-system,autosave,unsaved-warning,save-toast"></script>
```
