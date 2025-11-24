/**
 * Export to Window Module
 *
 * When loaded, calls exportToWindow() on all loaded modules,
 * populating window.hyperclay and window globals.
 *
 * This module is included in all presets by default.
 * Exclude it if you prefer to use ES module imports only.
 */

export function init() {
  // Initialize window.hyperclay namespace
  window.hyperclay = window.hyperclay || {};

  // Iterate through all loaded modules and call their exportToWindow()
  const modules = window.hyperclayModules || {};
  for (const [name, module] of Object.entries(modules)) {
    if (typeof module.exportToWindow === 'function') {
      module.exportToWindow();
    }
  }

  // Create h alias
  window.h = window.hyperclay;
}

// Auto-init when module is imported
init();

export default init;
