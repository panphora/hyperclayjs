const query = Object.fromEntries(new URLSearchParams(window.location.search));

// Self-export to window and hyperclay
window.query = query;
window.hyperclay = window.hyperclay || {};
window.hyperclay.query = query;

export default query;