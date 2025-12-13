# ask

Display a modal with an input field to prompt the user for text input.

## Signature

```js
ask(promptText, yesCallback, defaultValue, extraContent)
```

## Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| promptText | string | — | The question or prompt to display |
| yesCallback | function | — | Called with the input value when user confirms |
| defaultValue | string | `''` | Pre-filled value in the input field |
| extraContent | string | `''` | Additional HTML content to display below the input |

## Returns

`Promise<string>` - Resolves with the input value, rejects if user closes modal

## Example

```js
// Basic usage with async/await
const name = await ask('What is your name?');
console.log('Hello, ' + name);

// With a default value
const title = await ask('Enter title:', null, 'Untitled');

// With callback
ask('Enter your email:', (email) => {
  console.log('Email:', email);
});

// With extra content
ask('Confirm action:', null, '', '<p class="warning">This cannot be undone</p>');
```
