/**
 * snapshot.js — The source of truth for page state
 *
 * THE SAVE/SYNC PIPELINE:
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  1. CLONE         document.documentElement.cloneNode()  │
 *   └─────────────────────────────────────────────────────────┘
 *                              │
 *                              ▼
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  2. SNAPSHOT HOOKS       onSnapshot callbacks           │
 *   │                          (form value sync)              │
 *   │                                                         │
 *   │     ✓ Used by: SAVE and LIVE-SYNC                       │
 *   └─────────────────────────────────────────────────────────┘
 *                              │
 *              ┌───────────────┴───────────────┐
 *              ▼                               ▼
 *   ┌─────────────────────────┐     ┌─────────────────────────┐
 *   │  3a. PREPARE HOOKS      │     │  3b. DONE               │
 *   │  onPrepareForSave       │     │  (live-sync stops here) │
 *   │  [onbeforesave]         │     │                         │
 *   │  [save-ignore]          │     │  → emits snapshot-ready │
 *   │                         │     └─────────────────────────┘
 *   │  ✓ Used by: SAVE only   │
 *   └─────────────────────────┘
 *              │
 *              ▼
 *   ┌─────────────────────────┐
 *   │  4. SERIALIZE           │
 *   │  "<!DOCTYPE html>"      │
 *   │  + outerHTML            │
 *   │                         │
 *   │  → sent to server       │
 *   └─────────────────────────┘
 */

// =============================================================================
// HOOK REGISTRIES
// =============================================================================

const snapshotHooks = [];       // Phase 2: Always run (form sync)
const prepareForSaveHooks = []; // Phase 3a: Save only (strip admin)

/**
 * Register a hook that runs on EVERY snapshot (save AND sync).
 * Use for: syncing form values to the clone.
 *
 * @param {Function} callback - Receives the cloned document element
 */
export function onSnapshot(callback) {
  snapshotHooks.push(callback);
}

/**
 * Register a hook that runs ONLY when preparing for save.
 * Use for: stripping admin elements, cleanup.
 *
 * @param {Function} callback - Receives the cloned document element
 */
export function onPrepareForSave(callback) {
  prepareForSaveHooks.push(callback);
}

// Backwards compat alias
export const beforeSave = onPrepareForSave;

// =============================================================================
// CAPTURE FUNCTIONS
// =============================================================================

/**
 * PHASE 1-2: Clone the DOM and run snapshot hooks.
 *
 * This is the "canonical" state — form values synced, nothing stripped.
 * Used as the base for both saving and syncing.
 *
 * @returns {HTMLElement} Cloned document element with snapshot hooks applied
 */
export function captureSnapshot() {
  const clone = document.documentElement.cloneNode(true);

  for (const hook of snapshotHooks) {
    hook(clone);
  }

  return clone;
}

/**
 * Prepare an already-captured snapshot for saving.
 * Mutates the clone — only call once per snapshot.
 *
 * @param {HTMLElement} clone - A snapshot from captureSnapshot()
 * @returns {string} Full HTML string ready for server
 */
function prepareCloneForSave(clone) {
  // Run inline [onbeforesave] handlers
  for (const el of clone.querySelectorAll('[onbeforesave]')) {
    new Function(el.getAttribute('onbeforesave')).call(el);
  }

  // Remove elements that shouldn't be saved
  for (const el of clone.querySelectorAll('[save-ignore]')) {
    el.remove();
  }

  // Run registered prepare hooks
  for (const hook of prepareForSaveHooks) {
    hook(clone);
  }

  return "<!DOCTYPE html>" + clone.outerHTML;
}

/**
 * PHASE 1-4: Full pipeline for saving to server.
 *
 * Captures snapshot, emits for live-sync, then prepares for save.
 * This is the main entry point for the save process.
 *
 * @param {Object} options
 * @param {boolean} options.emitForSync - Whether to emit snapshot-ready event (default: true)
 * @returns {string} Full HTML string ready for server
 */
export function captureForSave({ emitForSync = true } = {}) {
  const clone = captureSnapshot();

  // Emit for live-sync before stripping admin elements
  if (emitForSync) {
    const bodyForSync = clone.querySelector('body').innerHTML;
    document.dispatchEvent(new CustomEvent('hyperclay:snapshot-ready', {
      detail: { body: bodyForSync }
    }));
  }

  return prepareCloneForSave(clone);
}

/**
 * PHASE 1-2 (body only): For live-sync between admin users.
 *
 * Includes admin elements — no stripping.
 * Note: Prefer listening to 'hyperclay:snapshot-ready' event instead,
 * which reuses the save's clone.
 *
 * @returns {string} Body innerHTML with form values synced
 */
export function captureBodyForSync() {
  const clone = captureSnapshot();
  return clone.querySelector('body').innerHTML;
}

/**
 * Get page contents for change detection.
 * Does NOT emit snapshot-ready event (safe for comparison).
 *
 * For CodeMirror pages, returns editor content directly.
 * For normal pages, returns full HTML via snapshot pipeline.
 */
export function getPageContents() {
  if (isCodeMirrorPage()) {
    return getCodeMirrorContents();
  }
  return captureForSave({ emitForSync: false });
}

// =============================================================================
// CODEMIRROR SUPPORT
// =============================================================================

/**
 * Check if this is a CodeMirror editor page.
 * CodeMirror pages bypass the normal snapshot pipeline.
 */
export function isCodeMirrorPage() {
  return !!document.querySelector('.CodeMirror')?.CodeMirror;
}

/**
 * Get CodeMirror editor contents.
 * @returns {string} Editor contents
 */
export function getCodeMirrorContents() {
  return document.querySelector('.CodeMirror').CodeMirror.getValue();
}

// =============================================================================
// WINDOW EXPORTS
// =============================================================================

if (!window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.captureSnapshot = captureSnapshot;
  window.hyperclay.captureForSave = captureForSave;
  window.hyperclay.captureBodyForSync = captureBodyForSync;
  window.hyperclay.onSnapshot = onSnapshot;
  window.hyperclay.onPrepareForSave = onPrepareForSave;
  window.hyperclay.beforeSave = beforeSave;
  window.hyperclay.getPageContents = getPageContents;
  window.h = window.hyperclay;
}
