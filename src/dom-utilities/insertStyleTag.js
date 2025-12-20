/**
 * Insert styles into the document (inline CSS or external stylesheet).
 *
 * With a persistent DOM (i.e. hyperclay), we need a way to update styles.
 * This function always inserts the new styles first, then removes any
 * duplicates. This ensures:
 *   - No flickering: new styles are applied before old ones are removed
 *   - Always upgrades: we default to the new styles/approach
 */
function insertStyles(nameOrHref, css) {
  if (css !== undefined) {
    // Inline style: insertStyles('my-styles', '.foo { ... }')
    const name = nameOrHref;
    const oldStyles = document.querySelectorAll(`style[data-name="${name}"]`);

    const style = document.createElement('style');
    style.dataset.name = name;
    style.textContent = css;
    document.head.appendChild(style);

    oldStyles.forEach(el => el.remove());
    return style;
  }

  // External stylesheet: insertStyles('/path/to/file.css')
  const href = nameOrHref;

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
