# sendMessage

Send form data or a custom object to the `/message` endpoint. Automatically collects form data, includes behavior tracking, and handles success/error toasts.

## Signature

```js
sendMessage(eventOrObj, successMessage, callback)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| eventOrObj | Event\|object | — | Form submit event, click event, or data object to send |
| successMessage | string | `'Successfully sent'` | Toast message on success |
| callback | function | — | Called with response data on success |

## Returns

`Promise<object>` - Resolves with server response, rejects on error

## Example

```js
// Handle form submission
document.querySelector('form').onsubmit = (e) => {
  sendMessage(e, 'Message sent!');
};

// Event outside a form (sends behavior data only)
document.querySelector('#contact-btn').onclick = (e) => {
  sendMessage(e, 'Contact request sent!');
};

// Send custom data object
sendMessage({
  name: 'John',
  email: 'john@example.com'
}, 'Contact form submitted');

// With async/await
try {
  const result = await sendMessage(formEvent);
  redirectToThankYou();
} catch (error) {
  console.error('Failed:', error);
}
```
