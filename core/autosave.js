/**
 * Auto-save system for Hyperclay
 *
 * Automatically saves page on DOM changes with throttling.
 * Warns before leaving page with unsaved changes.
 *
 * Requires the 'save-system' module to be loaded first.
 * For toast notifications, also load the 'save-toast' module.
 */

import Mutation from "../utilities/mutation.js";
import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import {
  savePageThrottled,
  getUnsavedChanges
} from "./savePage.js";

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

/**
 * Warn before leaving page with unsaved changes
 */
window.addEventListener('beforeunload', (event) => {
  if (getUnsavedChanges() && isOwner) {
    event.preventDefault();
    event.returnValue = '';
  }
});

function init() {
  if (!isEditMode) return;
  initSavePageOnChange();
}

// No window exports - savePageThrottled is exported from save-system

// Auto-init when module is imported
init();

export default init;
