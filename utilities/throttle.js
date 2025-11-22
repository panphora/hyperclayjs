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

// Self-export to hyperclay only
window.hyperclay = window.hyperclay || {};
window.hyperclay.throttle = throttle;

export default throttle;