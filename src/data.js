// Re-exports the vendored hyper-html-api data sugar as window.hyperclay
// .extractData / .applyData. The vendor file's wrapper attaches the public API
// to window.hyperclay during evaluation (see
// hyper-html-api/scripts/copy-to-hyperclayjs.js), so importing it is enough.
// No import-map entry needed — relative vendor import, same as undo.js. This is
// a core read/write primitive, so it is NOT edit-mode-only.

import { extractData, applyData, engine } from './vendor/hyper-html-api.vendor.js'

export { extractData, applyData, engine }
