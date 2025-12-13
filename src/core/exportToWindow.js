/**
 * Export to Window Module
 *
 * When loaded FIRST by the loader, this flips the __hyperclayNoAutoExport flag
 * to false, allowing subsequent modules to self-export to window.hyperclay.
 *
 * This module is included in all presets by default.
 * Exclude it if you prefer ES module-only imports (no window pollution).
 */

// Flip the flag so modules will auto-export
window.__hyperclayNoAutoExport = false;

export default true;
