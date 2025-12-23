# onaftersave

Execute code after a successful page save.

## Usage

```html
<element onaftersave="code">
```

## this Context

`this` refers to the element with the `onaftersave` attribute.

## Event Object

The handler receives an `event` object with:

| Property | Type | Description |
|----------|------|-------------|
| `event.detail.status` | string | Always `'saved'` |
| `event.detail.msg` | string | Success message (e.g., `'Saved'`) |
| `event.detail.timestamp` | number | `Date.now()` when saved |

## How It Works

Listens for `hyperclay:save-saved` events on the document. When fired, all elements with `onaftersave` execute their code. Only fires on successful saves, not on errors.

## Example

```html
<!-- Cache-bust a stylesheet after save -->
<link href="styles.css" onaftersave="cacheBust(this)">

<!-- Show save status -->
<span onaftersave="this.textContent = event.detail.msg">
  Not saved
</span>

<!-- Update timestamp -->
<span onaftersave="this.textContent = new Date(event.detail.timestamp).toLocaleTimeString()">
  --:--:--
</span>

<!-- Trigger custom logic -->
<div onaftersave="analytics.track('page_saved')"></div>

<!-- Refresh preview after save -->
<iframe src="/preview" onaftersave="this.src = this.src"></iframe>
```
