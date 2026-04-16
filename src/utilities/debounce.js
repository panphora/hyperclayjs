// debounce.js
function debounce(callback, delay) {
  let timeoutId;
  let pendingResolvers = [];

  return function (...args) {
    const ctx = this;
    clearTimeout(timeoutId);

    return new Promise((resolve) => {
      pendingResolvers.push(resolve);

      timeoutId = setTimeout(() => {
        const resolvers = pendingResolvers;
        pendingResolvers = [];
        Promise.resolve(callback.apply(ctx, args))
          .then(value => { for (const r of resolvers) r(value); });
      }, delay);
    });
  };
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.debounce = debounce;
  window.h = window.hyperclay;
}

export default debounce;
