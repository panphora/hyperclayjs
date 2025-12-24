/**
 * Insert styles into the document (inline CSS or external stylesheet).
 *
 * With a persistent DOM (i.e. hyperclay), we need a way to update styles.
 * This function reuses existing elements when possible:
 *   - Inline styles: matches by data-name, reuses if content matches
 *   - External stylesheets: matches by normalized full URL path
 *
 * This ensures:
 *   - No DOM churn: existing elements are reused when content/path matches
 *   - No duplicates: removes any duplicate style/link elements
 *   - Callback always runs: attributes can be updated on existing elements
 *
 * Usage:
 *   insertStyles('/path/to/file.css')                    // External stylesheet
 *   insertStyles('/path/to/file.css', (link) => { ... }) // With callback
 *   insertStyles('my-styles', '.foo { ... }')            // Inline CSS
 *   insertStyles('my-styles', '.foo { ... }', (style) => { ... }) // With callback
 */
function insertStyles(nameOrHref, cssOrCallback, callback) {
  if (typeof cssOrCallback === 'string') {
    // Inline style: insertStyles('my-styles', '.foo { ... }', optionalCallback)
    const name = nameOrHref;
    const css = cssOrCallback;
    const existingStyles = [...document.querySelectorAll(`style[data-name="${name}"]`)];

    // If exact match exists, just update attributes via callback and return it
    const exactMatch = existingStyles.find(el => el.textContent === css);
    if (exactMatch) {
      if (callback) callback(exactMatch);
      // Remove any duplicates
      existingStyles.filter(el => el !== exactMatch).forEach(el => el.remove());
      return exactMatch;
    }

    // Update first existing style in-place, or create new one
    let style;
    if (existingStyles.length > 0) {
      style = existingStyles[0];
      style.textContent = css;
      if (callback) callback(style);
      // Remove duplicates
      existingStyles.slice(1).forEach(el => el.remove());
    } else {
      style = document.createElement('style');
      style.dataset.name = name;
      style.textContent = css;
      if (callback) callback(style);
      document.head.appendChild(style);
    }

    return style;
  }

  // External stylesheet: insertStyles('/path/to/file.css', optionalCallback)
  const href = nameOrHref;
  const cb = typeof cssOrCallback === 'function' ? cssOrCallback : undefined;

  // Normalize href to full URL for comparison
  const normalizedHref = new URL(href, window.location.href).href;

  // Find all links with matching normalized path
  const existingLinks = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .filter(el => {
      try {
        return new URL(el.getAttribute('href'), window.location.href).href === normalizedHref;
      } catch {
        return false;
      }
    });

  // If match exists, just update attributes via callback and return it
  if (existingLinks.length > 0) {
    const link = existingLinks[0];
    if (cb) cb(link);
    // Remove any duplicates
    existingLinks.slice(1).forEach(el => el.remove());
    return link;
  }

  // Create new link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  if (cb) cb(link);
  document.head.appendChild(link);

  return link;
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.insertStyles = insertStyles;
  window.insertStyleTag = insertStyles; // backwards-compat alias
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.insertStyles = insertStyles;
  window.hyperclay.insertStyleTag = insertStyles; // backwards-compat alias
  window.h = window.hyperclay;
}

export { insertStyles };
export { insertStyles as insertStyleTag };  // backwards-compat alias
export default insertStyles;
