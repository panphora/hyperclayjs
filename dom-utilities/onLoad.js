function onLoad (callback) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback);
  }
}

// Self-export to hyperclay only
window.hyperclay = window.hyperclay || {};
window.hyperclay.onLoad = onLoad;

export default onLoad;