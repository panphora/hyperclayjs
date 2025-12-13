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
| fontFamily | string | system monospace | Font family for modal text |
| fontSize | string | `'18px'` | Base font size |
| inputFontSize | string | `'16px'` | Font size for inputs |
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
