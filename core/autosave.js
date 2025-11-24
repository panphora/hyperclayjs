/**
 * Auto-save system for Hyperclay
 *
 * Automatically saves page on DOM changes with throttling.
 * Warns before leaving page with unsaved changes.
 *
 * Requires the 'save' module to be loaded first.
 */

import toast from "../ui/toast.js";
import throttle from "../utilities/throttle.js";
import Mutation from "../utilities/mutation.js";
import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import { getPageContents } from "./savePageCore.js";
import {
  savePage,
  getUnsavedChanges,
  setUnsavedChanges,
  getLastSavedContents
} from "./savePage.js";

let baselineContents = '';

// Capture baseline after setup mutations settle
document.addEventListener('DOMContentLoaded', () => {
  if (isEditMode) {
    setTimeout(() => {
      baselineContents = getPageContents();
    }, 1500);
  }
});

/**
 * Throttled version of savePage for auto-save
 */
const throttledSave = throttle(savePage, 1200);

/**
 * Save the page with throttling, for use with auto-save
 * Checks both baseline and last saved content to prevent saves from initial setup
 *
 * @param {Function} callback - Optional callback
 */
export function savePageThrottled(callback = () => {}) {
  if (!isEditMode) return;

  const currentContents = getPageContents();
  // For autosave: check both that content changed from baseline AND from last save
  // This prevents saves from initial setup mutations
  if (currentContents !== baselineContents && currentContents !== getLastSavedContents()) {
    setUnsavedChanges(true);
    throttledSave(callback);
  }
}

/**
 * Initialize auto-save on DOM changes
 * Uses debounced mutation observer
 */
export function initSavePageOnChange() {
  Mutation.onAnyChange({
    debounce: 3333,
    omitChangeDetails: true
  }, () => {
    savePageThrottled(({msg, msgType} = {}) => {
      if (msg) toast(msg, msgType);
    });
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

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.savePageThrottled = savePageThrottled;
  window.hyperclay.initSavePageOnChange = initSavePageOnChange;
}

// Auto-init when module is imported
init();

export default init;
