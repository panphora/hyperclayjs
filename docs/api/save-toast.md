# save-toast

Shows toast notifications for save lifecycle events. No configuration needed.

## Methods

| Method | Description |
|--------|-------------|
| `hyperclay:save-saved` | Green success toast with "Saved" |
| `hyperclay:save-error` | Red error toast with "Failed to save" |
| `hyperclay:save-offline` | Red error toast with "No internet connection" |

## Example

```html
<!-- Basic setup -->
<script src="hyperclay.js?save-system,save-toast"></script>

<!-- Full save stack with auto-save and notifications -->
<script src="hyperclay.js?save-system,autosave,save-toast"></script>
```
