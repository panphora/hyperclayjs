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

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.toast = toast;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.toast = toast;
}

export default toast;
