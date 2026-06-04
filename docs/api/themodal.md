# themodal

A flexible modal window creation system. Configure and display custom modals with full control over content and behavior.

## Signature

```js
themodal.html = content;
themodal.yes = buttonContent;
themodal.no = buttonContent;
themodal.open();
themodal.close();
```

## Properties

| Name | Type | Default | Description |
|------|------|---------|-------------|
| html | string | `''` | Main content HTML |
| yes | string | `''` | Confirm button HTML (hidden if empty) |
| no | string | `''` | Cancel button HTML (hidden if empty) |
| closeHtml | string | `''` | Close button HTML |
| zIndex | string | `'100'` | CSS z-index for the modal |
| disableFocus | boolean | `false` | Disable auto-focus on first input |
| disableScroll | boolean | `true` | Disable body scroll when modal is open |
| isShowing | boolean | `false` | Whether modal is currently visible (read-only) |

## Methods

| Method | Description |
|--------|-------------|
| `open()` | Show the modal |
| `close()` | Close the modal (triggers onNo callbacks) |
| `onYes(callback)` | Add callback for confirm action. Return `false` to prevent closing |
| `onNo(callback)` | Add callback for cancel/close action |
| `onOpen(callback)` | Add callback for when modal opens |

## Styling

Font sizing is controlled with CSS custom properties, not JavaScript properties. Set these variables on the page (or scoped to `.micromodal`) to override the defaults.

| Variable | Default | Description |
|----------|---------|-------------|
| `--hyperclay-modal-font-family` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | Font family for modal text |
| `--hyperclay-modal-font-size` | `18px` | Base font size |
| `--hyperclay-modal-input-font-size` | `16px` | Font size for inputs |
| `--hyperclay-modal-title-font-size` | `20px` (`22px` at `min-width: 640px`) | Font size for the tell title |
| `--hyperclay-modal-code-font-family` | `--hyperclay-modal-font-family`, then `monospace` | Font family for code blocks |

## Example

```js
// Basic custom modal
themodal.html = '<h2>Custom Title</h2><p>Your content here</p>';
themodal.yes = 'Confirm';
themodal.no = 'Cancel';

themodal.onYes(() => {
  console.log('User confirmed');
});

themodal.onNo(() => {
  console.log('User cancelled');
});

themodal.open();

// Modal with form validation
themodal.html = '<input class="micromodal__input" type="email" required>';
themodal.yes = 'Submit';

themodal.onYes(() => {
  const email = document.querySelector('.micromodal__input').value;
  if (!email.includes('@')) {
    toast('Invalid email', 'error');
    return false; // Prevent modal from closing
  }
  processEmail(email);
});

themodal.open();
```
