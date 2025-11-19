/**
 * Full save system for Hyperclay
 *
 * This includes all the conveniences: change detection, toast notifications,
 * auto-save, keyboard shortcuts, and more.
 *
 * Built on top of savePageCore.js
 */

import toast from "../ui/toast.js";
import throttle from "../utilities/throttle.js";
import Mutation from "../utilities/mutation.js";
import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import {
  savePage as savePageCore,
  getPageContents,
  replacePageWith as replacePageWithCore
} from "./savePageCore.js";

// Re-export beforeSave from core for backward compatibility
export { beforeSave } from "./savePageCore.js";

let unsavedChanges = false;
let lastSavedContents = '';
let baselineContents = ''; // State after initial setup, used to prevent autosave from setup mutations

// Initialize lastSavedContents on page load to match what's on disk
// This prevents unnecessary save attempts when content hasn't changed
document.addEventListener('DOMContentLoaded', () => {
  if (isEditMode) {
    // Capture initial state immediately for comparison
    lastSavedContents = getPageContents();

    // Also capture baseline after setup for autosave detection
    setTimeout(() => {
      baselineContents = getPageContents();
    }, 1500);
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
  if (currentContents !== baselineContents && currentContents !== lastSavedContents) {
    unsavedChanges = true;
    throttledSave(callback);
  }
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
  if (unsavedChanges && isOwner) {
    event.preventDefault();
    event.returnValue = '';
  }
});

/**
 * Initialize the full save system
 */
export function init() {
  if (!isEditMode) return;

  initSaveKeyboardShortcut();
  initHyperclaySaveButton();
  initSavePageOnChange();
}

/**
 * Export save functions to window.hyperclay
 */
export function exportToWindow() {
  if (!window.hyperclay) {
    window.hyperclay = {};
  }

  window.hyperclay.savePage = savePage;
  window.hyperclay.replacePageWith = replacePageWith;
}
