# unsaved-warning

Warns users before leaving the page if there are unsaved changes.

## How It Works

On `beforeunload`, compares current page content to the last saved content. If different, shows the browser's native "unsaved changes" dialog.

## Usage

```html
<script src="hyperclay.js?save-system,unsaved-warning"></script>
```

No configuration needed. The warning appears automatically when:
1. User is in edit mode AND owns the resource
2. Current content differs from last saved content
3. User tries to leave the page (close tab, navigate away, refresh)

## Example

User makes edits → tries to close tab → browser shows:

```
Changes you made may not be saved.
[Leave] [Cancel]
```

## Dependencies

Requires `save-system` for:
- `isOwner` - Check if user owns the resource
- `isEditMode` - Check if in edit mode
- `getPageContents()` - Get current page state
- `getLastSavedContents()` - Get last saved state

## Notes

- Works independently of autosave
- No mutation observer needed during editing
- Only compares content when user tries to leave
- Silent if content matches last save
