/**
 * Save system for Hyperclay
 *
 * Manual save with change detection, state management,
 * keyboard shortcuts, and save button support.
 *
 * For auto-save on DOM changes, also load the 'autosave' module.
 * For toast notifications, also load the 'save-toast' module.
 *
 * Built on top of savePageCore.js
 */

import throttle from "../utilities/throttle.js";
import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import {
  savePage as savePageCore,
  getPageContents,
  replacePageWith as replacePageWithCore,
  beforeSave
} from "./savePageCore.js";

// ============================================
// SAVE STATE MANAGEMENT
// ============================================

let savingTimeout = null;

/**
 * Sets the save status on <html> and dispatches an event.
 *
 * @param {string} state - One of: 'saving', 'saved', 'offline', 'error'
 * @param {string} msg - Optional message (e.g., error details)
 */
function setSaveState(state, msg = '') {
  if (savingTimeout) {
    clearTimeout(savingTimeout);
    savingTimeout = null;
  }

  document.documentElement.setAttribute('savestatus', state);

  const event = new CustomEvent(`hyperclay:save-${state}`, {
    detail: { msg, timestamp: Date.now() }
  });
  document.dispatchEvent(event);
}

/**
 * Sets DOM state to 'offline' immediately, but does NOT fire an event.
 * Used for instant UI feedback before we know the final state.
 */
function setOfflineStateQuiet() {
  if (savingTimeout) {
    clearTimeout(savingTimeout);
    savingTimeout = null;
  }
  document.documentElement.setAttribute('savestatus', 'offline');
}

/**
 * Starts a debounced 'saving' state.
 * Only shows 'saving' if the save takes longer than 500ms.
 * This prevents UI flicker on fast saves.
 */
function setSavingState() {
  savingTimeout = setTimeout(() => {
    setSaveState('saving');
  }, 500);
}

// ============================================
// OFFLINE DETECTION
// ============================================

window.addEventListener('offline', () => {
  setOfflineStateQuiet();
});

window.addEventListener('online', () => {
  if (document.documentElement.getAttribute('savestatus') === 'offline') {
    savePage();
  }
});

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
    // Set initial save status to 'saved'
    document.documentElement.setAttribute('savestatus', 'saved');
  }
});

/**
 * Save the current page with change detection and state management
 *
 * @param {Function} callback - Optional callback for custom handling
 */
export function savePage(callback = () => {}) {
  if (!isEditMode && !window.hyperclay?.testMode) {
    return;
  }

  // Check if offline - set DOM state immediately for UI feedback
  // but still try the fetch (navigator.onLine can be wrong)
  const wasOffline = !navigator.onLine;
  if (wasOffline) {
    setOfflineStateQuiet();
  }

  const currentContents = getPageContents();

  // Track whether there are unsaved changes
  unsavedChanges = (currentContents !== lastSavedContents);

  // Skip if content hasn't changed
  if (!unsavedChanges) {
    return;
  }

  // Start debounced 'saving' state (only shows if save takes >500ms)
  setSavingState();

  savePageCore(({msg, msgType}) => {
    if (msgType !== 'error') {
      // SUCCESS
      lastSavedContents = currentContents;
      unsavedChanges = false;
      setSaveState('saved', msg);
    } else {
      // FAILED - determine if it's offline or server error
      if (!navigator.onLine) {
        setSaveState('offline', msg);
      } else {
        setSaveState('error', msg);
      }
    }

    // Call user callback if provided
    if (typeof callback === 'function' && msg) {
      callback({msg, msgType});
    }
  });
}

/**
 * Fetch HTML from a URL and save it, then reload
 * Emits error event if save fails
 *
 * @param {string} url - URL to fetch from
 */
export function replacePageWith(url) {
  if (!isEditMode) {
    return;
  }

  replacePageWithCore(url, (err, data) => {
    if (err) {
      // Emit error event (save-toast will show toast if loaded)
      setSaveState('error', err.message || "Failed to save template");
    } else {
      // Only reload if save was successful
      window.location.reload();
    }
  });
}

// Throttled version of savePage for auto-save
const throttledSave = throttle(savePage, 1200);

// Baseline for autosave comparison
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
 * Initialize keyboard shortcut for save (CMD/CTRL+S)
 */
export function initSaveKeyboardShortcut() {
  document.addEventListener("keydown", function(event) {
    let isMac = window.navigator.platform.match("Mac");
    let metaKeyPressed = isMac ? event.metaKey : event.ctrlKey;
    if (metaKeyPressed && event.keyCode == 83) {
      event.preventDefault();
      savePage();
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
      savePage();
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

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.savePage = savePage;
  window.hyperclay.savePageThrottled = savePageThrottled;
  window.hyperclay.beforeSave = beforeSave;
  window.hyperclay.replacePageWith = replacePageWith;
  window.h = window.hyperclay;
}

// Auto-init when module is imported
init();

export default savePage;
