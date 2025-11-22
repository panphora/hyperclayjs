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

// Self-export to hyperclay only
window.hyperclay = window.hyperclay || {};
window.hyperclay.debounce = debounce;

export default debounce;