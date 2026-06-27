/**
 * Auto-save system for Hyperclay
 *
 * Automatically saves page on DOM changes with throttling.
 *
 * Requires the 'save-system' module to be loaded first.
 *
 * Recommended companion modules:
 *   - 'unsaved-warning' - Warn before leaving with unsaved changes (required for beforeunload)
 *   - 'save-toast' - Show toast notifications on save events
 */

import Mutation from "../utilities/mutation.js";
import { isEditMode } from "./isAdminOfCurrentResource.js";
import { savePageThrottled } from "./savePage.js";
import { initUserGesture, markUserDriven } from "../utilities/user-gesture.js";

/**
 * Initialize auto-save on DOM changes
 * Uses debounced mutation observer
 */
function initSavePageOnChange() {
  Mutation.onAnyChange({
    debounce: 1500,
    omitChangeDetails: true,
    require: 'autosave'
  }, () => {
    savePageThrottled();
  });
}

/**
 * Initialize auto-save on input events for [persist] elements
 * Form input values don't trigger DOM mutations, so we listen for input events
 */
let inputSaveTimer = null;
function initSaveOnPersistInput() {
  document.addEventListener('input', (e) => {
    if (!e.target.closest('[persist]')) return;
    // A trusted input on a [persist] field is itself a user-driven change the
    // Mutation hub can't see (form values aren't DOM mutations). Attribute it.
    if (e.isTrusted) markUserDriven();
    clearTimeout(inputSaveTimer);
    inputSaveTimer = setTimeout(savePageThrottled, 1500);
  }, true);
}

function init() {
  if (!isEditMode) return;
  initUserGesture();
  initSavePageOnChange();
  initSaveOnPersistInput();
}

// No window exports - savePageThrottled is exported from save-system

// Auto-init when module is imported
init();

export default init;
