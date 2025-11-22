function onDomReady (callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Self-export to hyperclay only
window.hyperclay = window.hyperclay || {};
window.hyperclay.onDomReady = onDomReady;

export default onDomReady;