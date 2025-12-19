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

/**
 * Initialize auto-save on DOM changes
 * Uses debounced mutation observer
 */
function initSavePageOnChange() {
  Mutation.onAnyChange({
    debounce: 3333,
    omitChangeDetails: true
  }, () => {
    savePageThrottled();
  });
}

function init() {
  if (!isEditMode) return;
  initSavePageOnChange();
}

// No window exports - savePageThrottled is exported from save-system

// Auto-init when module is imported
init();

export default init;
