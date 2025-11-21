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

// Re-export toast with legacy config already applied
export default toast;

// Export to window for global access
export function exportToWindow() {
  if (!window.hyperclay) {
    window.hyperclay = {};
  }
  window.hyperclay.toast = toast;
}
