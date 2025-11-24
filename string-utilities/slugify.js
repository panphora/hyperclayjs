// e.g. "Hello there" → "hello-there"
function slugify (text) {
  return text.toString().toLowerCase()
    .normalize('NFD') // separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w\-]+/g, '') // remove all non-word chars
    .replace(/\-\-+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text
}

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.slugify = slugify;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.slugify = slugify;
}

export default slugify;