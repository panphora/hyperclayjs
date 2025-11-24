const query = Object.fromEntries(new URLSearchParams(window.location.search));

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.query = query;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.query = query;
  window.h = window.hyperclay;
}

export default query;
