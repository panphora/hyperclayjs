function onDomReady (callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.onDomReady = onDomReady;
}

export default onDomReady;