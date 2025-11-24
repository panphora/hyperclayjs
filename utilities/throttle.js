function throttle(callback, delay, executeFirst = true) {
  let lastCall = executeFirst ? 0 : Date.now();
  let timeoutId = null;

  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      clearTimeout(timeoutId);
      lastCall = now;
      return callback.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        callback.apply(this, args);
      }, remaining);
    }
  };
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.throttle = throttle;
  window.h = window.hyperclay;
}

export default throttle;
