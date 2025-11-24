/**
 * Save system for Hyperclay
 *
 * Manual save with change detection, toast notifications,
 * keyboard shortcuts, and save button support.
 *
 * For auto-save on DOM changes, also load the 'autosave' module.
 *
 * Built on top of savePageCore.js
 */

import toast from "../ui/toast.js";
import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import {
  savePage as savePageCore,
  getPageContents,
  replacePageWith as replacePageWithCore,
  beforeSave
} from "./savePageCore.js";

// Re-export from core for backward compatibility
export { beforeSave, getPageContents };

let unsavedChanges = false;
let lastSavedContents = '';

// State accessors for autosave module
export function getUnsavedChanges() { return unsavedChanges; }
export function setUnsavedChanges(val) { unsavedChanges = val; }
export function getLastSavedContents() { return lastSavedContents; }
export function setLastSavedContents(val) { lastSavedContents = val; }

// Initialize lastSavedContents on page load to match what's on disk
// This prevents unnecessary save attempts when content hasn't changed
document.addEventListener('DOMContentLoaded', () => {
  if (isEditMode) {
    // Capture initial state immediately for comparison
    lastSavedContents = getPageContents();
  }
});

/**
 * Save the current page with change detection and toast notifications
 *
 * @param {Function} callback - Optional callback for custom handling
 */
export function savePage(callback = () => {}) {
  if (!isEditMode) {
    return;
  }

  const currentContents = getPageContents();

  // Track whether there are unsaved changes
  unsavedChanges = (currentContents !== lastSavedContents);

  // Skip if content hasn't changed
  if (!unsavedChanges) {
    return;
  }

  savePageCore(({msg, msgType}) => {
    // Update tracking on success
    if (msgType !== 'error') {
      lastSavedContents = currentContents;
      unsavedChanges = false;
    }

    // Call user callback if provided
    if (typeof callback === 'function' && msg) {
      callback({msg, msgType});
    }
  });
}

/**
 * Fetch HTML from a URL and save it, then reload
 * Shows toast notifications
 *
 * @param {string} url - URL to fetch from
 */
export function replacePageWith(url) {
  if (!isEditMode) {
    return;
  }

  replacePageWithCore(url, (err, data) => {
    if (err) {
      // Show error toast if save failed
      toast(err.message || "Failed to save template", "error");
    } else {
      // Only reload if save was successful
      window.location.reload();
    }
  });
}

/**
 * Initialize keyboard shortcut for save (CMD/CTRL+S)
 */
export function initSaveKeyboardShortcut() {
  document.addEventListener("keydown", function(event) {
    let isMac = window.navigator.platform.match("Mac");
    let metaKeyPressed = isMac ? event.metaKey : event.ctrlKey;
    if (metaKeyPressed && event.keyCode == 83) {
      event.preventDefault();
      savePage(({msg, msgType} = {}) => {
        if (msg) toast(msg, msgType);
      });
    }
  });
}

/**
 * Initialize save button handler
 * Looks for elements with [trigger-save] attribute
 */
export function initHyperclaySaveButton() {
  document.addEventListener("click", event => {
    if (event.target.closest("[trigger-save]")) {
      savePage(({msg, msgType} = {}) => {
        if (msg) toast(msg, msgType);
      });
    }
  });
}

/**
 * Initialize the save system (keyboard shortcut and save button)
 * For auto-save, also load the 'autosave' module
 */
export function init() {
  if (!isEditMode) return;

  initSaveKeyboardShortcut();
  initHyperclaySaveButton();
}

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.savePage = savePage;
  window.hyperclay.beforeSave = beforeSave;
  window.hyperclay.replacePageWith = replacePageWith;
  window.hyperclay.initHyperclaySaveButton = initHyperclaySaveButton;
  window.hyperclay.initSaveKeyboardShortcut = initSaveKeyboardShortcut;
}

// Auto-init when module is imported
init();

export default savePage;
