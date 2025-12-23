# save-toast

Shows toast notifications for save lifecycle events.

## Events Handled

| Event | Toast Type | Default Message |
|-------|------------|-----------------|
| `hyperclay:save-saved` | success | "Saved" |
| `hyperclay:save-error` | error | "Failed to save" |
| `hyperclay:save-offline` | error | "No internet connection" |

## Usage

Include this module to automatically show toasts on save events:

```html
<script src="hyperclay.js?save-system,save-toast"></script>
```

No configuration needed. The module listens for save events from `save-system` and displays appropriate toasts.

## Example

When a save succeeds:
- A green success toast appears with "Saved" (or custom message from server)

When a save fails:
- A red error toast appears with "Failed to save" or the error message

When offline:
- A red error toast appears with "No internet connection"

## Customization

Toast appearance can be customized via CSS. See the `toast` module for styling options.

## Dependencies

Requires:
- `save-system` - Emits the save events
- `toast` - Displays the notifications
