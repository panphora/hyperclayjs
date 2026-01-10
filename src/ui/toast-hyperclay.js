/**
 * Toast Hyperclay - Configure toast() to use Hyperclay platform styling
 *
 * When this module is loaded, it overrides the default toast styling so that
 * all toast() calls (including from save-toast) use Hyperclay styling.
 *
 * Also provides toastHyperclay() for backward compatibility.
 */

import {
  toastCore,
  injectToastStyles,
  setToastTheme,
  hyperclayStyles,
  hyperclayTemplates,
  hyperclayIcons
} from './toast.js';

// Configure the base toast() to use hyperclay styling
setToastTheme({
  styles: hyperclayStyles,
  templates: hyperclayTemplates,
  icons: hyperclayIcons,
  theme: 'hyperclay'
});

// Toast function with Hyperclay styling (kept for backward compatibility)
function toastHyperclay(message, messageType = "success") {
  injectToastStyles(hyperclayStyles, 'hyperclay');
  toastCore(message, messageType, {
    templates: hyperclayTemplates,
    icons: hyperclayIcons,
    theme: 'hyperclay'
  });
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.toastHyperclay = toastHyperclay;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.toastHyperclay = toastHyperclay;
  window.h = window.hyperclay;
}

export default toastHyperclay;
