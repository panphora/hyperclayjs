/**
 * Export to Window Module
 *
 * When loaded FIRST by the loader, this flips the __hyperclayNoAutoExport flag
 * to false, allowing subsequent modules to self-export to window.hyperclay.
 *
 * It also owns the readiness contract. Plugins vendored into this client cannot
 * tell "the platform is absent" from "the platform has not published that
 * capability yet", because the rest wave evaluates concurrently. `ready` is the
 * intentional signal: it resolves once, after every requested module has loaded.
 * clayjs already exposes the same pair as clay.ready / clay:ready.
 *
 * This module is included in all presets by default.
 * Exclude it if you prefer ES module-only imports (no window pollution).
 */

window.__hyperclayNoAutoExport = false;
window.hyperclay = window.hyperclay || {};
window.h = window.hyperclay;

let settleReady = null;
if (!window.hyperclay.ready || typeof window.hyperclay.ready.then !== 'function') {
  const ready = new Promise((resolve, reject) => {
    settleReady = { resolve, reject };
  });
  ready.catch(() => {});
  window.hyperclay.ready = ready;
}

export function markReady() {
  if (settleReady) {
    settleReady.resolve(window.hyperclay);
    settleReady = null;
  }
  try {
    document.dispatchEvent(new CustomEvent('hyperclay:ready', {
      detail: { hyperclay: window.hyperclay }
    }));
  } catch {}
}

export function markFailed(error) {
  if (!settleReady) return;
  settleReady.reject(error);
  settleReady = null;
}

export default true;
