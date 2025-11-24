/**
 * Info dialog - now an alias for tell()
 *
 * This module re-exports tell() as info() for backward compatibility.
 * The functionality has been merged into prompts.js.
 */

import { tell as info, init } from "./prompts.js";

// Re-export everything
export { info, init };

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.info = info;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.info = info;
  window.h = window.hyperclay;
}
