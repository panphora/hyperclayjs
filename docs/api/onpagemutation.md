# onpagemutation

Execute code when any element on the page changes. Also available as `onglobalmutation`.

## Usage

```html
<span onpagemutation="code">...</span>
<span onglobalmutation="code">...</span>
```

## this Context

`this` refers to the element with the attribute.

## How It Works

Uses a global `MutationObserver` on the document. When any DOM change occurs (element added/removed, attribute changed, text modified), all elements with `onpagemutation` or `onglobalmutation` execute their code. Changes are debounced at 200ms to prevent excessive execution.

The code supports async/await.

## Example

```html
<!-- Live counter that updates when items change -->
<span onpagemutation="this.textContent = All('li').length">0</span>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Update totals when table data changes -->
<tfoot>
  <tr>
    <td onglobalmutation="this.textContent = calculateTotal()">$0</td>
  </tr>
</tfoot>

<!-- Sync badge count with notifications -->
<span class="badge" onpagemutation="this.textContent = All('.notification:not(.read)').length">
  0
</span>
```

## Comparison with onmutation

| Attribute | Fires when |
|-----------|------------|
| `onpagemutation` | Any element on the page changes |
| `onmutation` | Only the specific element or its descendants change |

Use `onpagemutation` for global reactive values. Use `onmutation` for scoped reactions.
