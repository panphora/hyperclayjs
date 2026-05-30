// Re-exports the vendored hyper-undo as window.hyperclay.undo, and
// auto-starts the singleton in edit mode so smooth-sailing apps "just work".
// The vendor file's wrapper attaches the public API to window.hyperclay.undo
// during evaluation (see hyper-undo/scripts/copy-to-hyperclayjs.js).

import { undo } from './vendor/hyper-undo.vendor.js'
import { isEditMode } from './core/isAdminOfCurrentResource.js'

function init() {
  if (!isEditMode) return
  // Defer until the body exists so the default scope (document.body) is valid.
  if (typeof document === 'undefined') return
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => undo.start({ bindKeys: true }))
  } else {
    undo.start({ bindKeys: true })
  }
}

init()

export { undo }
export default undo
