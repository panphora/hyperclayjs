/**
 * Toast Hyperclay - Toast with Hyperclay platform styling
 *
 * Provides toastHyperclay() function with Hyperclay platform styling.
 * Use this alongside toast() if you need both styles in the same project.
 *
 * This is a hidden feature not exposed in the UI - used internally by
 * the Hyperclay platform for backward compatibility.
 */

import {
  toastCore,
  injectToastStyles,
  hyperclayStyles,
  hyperclayTemplates,
  hyperclayIcons
} from './toast.js';

// Toast function with Hyperclay styling
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
