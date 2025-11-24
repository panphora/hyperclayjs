// debounce.js
function debounce(callback, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.debounce = debounce;
}

export default debounce;