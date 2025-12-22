/**
 * Insert styles into the document (inline CSS or external stylesheet).
 *
 * With a persistent DOM (i.e. hyperclay), we need a way to update styles.
 * This function always inserts the new styles first, then removes any
 * duplicates. This ensures:
 *   - No flickering: new styles are applied before old ones are removed
 *   - Always upgrades: we default to the new styles/approach
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
    const oldStyles = document.querySelectorAll(`style[data-name="${name}"]`);

    const style = document.createElement('style');
    style.dataset.name = name;
    style.textContent = css;
    if (callback) callback(style);
    document.head.appendChild(style);

    oldStyles.forEach(el => el.remove());
    return style;
  }

  // External stylesheet: insertStyles('/path/to/file.css', optionalCallback)
  const href = nameOrHref;
  const cb = typeof cssOrCallback === 'function' ? cssOrCallback : undefined;

  let identifier;
  try {
    const url = new URL(href, window.location.href);
    identifier = url.pathname.split('/').pop();
  } catch (e) {
    identifier = href;
  }

  const oldLinks = document.querySelectorAll(
    `link[href="${href}"], link[href*="${identifier}"]`
  );

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  if (cb) cb(link);
  document.head.appendChild(link);

  oldLinks.forEach(el => el.remove());
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
