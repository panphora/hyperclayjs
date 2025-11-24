/**
 * Toast Hyperclay - Legacy toast for Hyperclay platform
 *
 * This is a wrapper that loads the toast module and automatically
 * calls toast.useLegacy() to enable the legacy Hyperclay platform styling.
 *
 * This is a hidden feature not exposed in the UI - used internally by
 * the Hyperclay platform for backward compatibility.
 */

import toast from './toast.js';

// Automatically apply legacy styling for Hyperclay platform
toast.useLegacy();

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.toast = toast;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.toast = toast;
  window.h = window.hyperclay;
}

export default toast;
