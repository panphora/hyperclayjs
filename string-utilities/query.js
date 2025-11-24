const query = Object.fromEntries(new URLSearchParams(window.location.search));

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.query = query;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.query = query;
}

export default query;