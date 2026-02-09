# autosave

Automatically saves the page when DOM changes are detected. Debounces at 3.3s after last change, throttles saves to max once per 1.2s. Only saves if content actually changed.

## Methods

| Method | Description |
|--------|-------------|
| `MutationObserver` | Watches for any DOM mutations automatically |
| `savePageThrottled()` | Called internally after debounce completes |

## Example

```html
<!-- Basic auto-save -->
<script src="hyperclay.js?save-system,autosave"></script>

<!-- With toast notifications -->
<script src="hyperclay.js?save-system,autosave,save-toast"></script>

<!-- Full save stack -->
<script src="hyperclay.js?save-system,autosave,unsaved-warning,save-toast"></script>
```
