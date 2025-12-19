// cacheBust.js
// Cache-bust an element's href or src attribute by adding/updating a version query param

function cacheBust(el) {
  const attr = el.href !== undefined ? 'href' : 'src';
  const url = new URL(el[attr], location.href);
  url.searchParams.set('v', Date.now());
  el[attr] = url.href;
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.cacheBust = cacheBust;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.cacheBust = cacheBust;
  window.h = window.hyperclay;
}

export default cacheBust;
