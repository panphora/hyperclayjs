# persist

Sync form input values to the saved/synced page snapshot.

## Usage

```html
<input type="text" persist>
<input type="checkbox" persist>
<textarea persist></textarea>
<select persist>...</select>
```

## How It Works

Browser form values exist only in JavaScript (`.value`), not in the DOM attributes. Without `persist`, saving or syncing the page would lose user-entered data.

When a snapshot is captured (for save or live-sync), `persist` copies values from the live DOM to the snapshot clone:

| Element | What's synced |
|---------|--------------|
| `<input type="text">` | `.value` → `value` attribute |
| `<input type="checkbox/radio">` | `.checked` → `checked` attribute |
| `<textarea>` | `.value` → `textContent` |
| `<select>` | `.selectedIndex` → `selected` attribute on option |

The live DOM is unchanged - only the snapshot clone is modified.

## Excluded Types

These input types are automatically excluded:
- `type="password"` - security
- `type="hidden"` - typically set by JS
- `type="file"` - cannot be serialized

## Example

```html
<!-- Text input persists its value -->
<input type="text" persist placeholder="Your name">

<!-- Checkbox persists checked state -->
<label>
  <input type="checkbox" persist> Remember me
</label>

<!-- Textarea persists content -->
<textarea persist placeholder="Notes..."></textarea>

<!-- Select persists selection (including multiple) -->
<select persist>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>

<select multiple persist>
  <option value="1">One</option>
  <option value="2">Two</option>
  <option value="3">Three</option>
</select>
```
