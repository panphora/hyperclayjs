/**
 * savePageCore.js — Network save functionality
 *
 * This module handles sending page contents to the server.
 * It uses snapshot.js for capturing the DOM state.
 *
 * For full save system with state management, use savePage.js instead.
 */

import cookie from "../utilities/cookie.js";
import { isEditMode } from "./isAdminOfCurrentResource.js";
import {
  captureForSave,
  isCodeMirrorPage,
  getCodeMirrorContents,
  beforeSave,
  getPageContents,
  onSnapshot,
  onPrepareForSave
} from "./snapshot.js";

// =============================================================================
// STATE
// =============================================================================

let saveInProgress = false;
const saveEndpoint = `/save/${cookie.get("currentResource")}`;

// =============================================================================
// RE-EXPORTS FROM SNAPSHOT (for backwards compat)
// =============================================================================

export { beforeSave, getPageContents, onSnapshot, onPrepareForSave };

// =============================================================================
// INTERNAL: GET PAGE CONTENTS
// =============================================================================

/**
 * Get the current page contents as HTML string for saving.
 * Handles both normal pages and CodeMirror editor pages.
 * Emits snapshot-ready event for live-sync (normal pages only).
 *
 * @returns {string} HTML string of current page
 */
function getContentsForSave() {
  if (isCodeMirrorPage()) {
    // CodeMirror pages don't emit snapshot-ready - no live-sync for code editors
    return getCodeMirrorContents();
  }
  // Emit for live-sync when actually saving
  return captureForSave({ emitForSync: true });
}

// =============================================================================
// SAVE FUNCTIONS
// =============================================================================

/**
 * Save the current page contents to the server.
 *
 * @param {Function} callback - Called with {msg, msgType} on completion
 *   msgType will be 'success' or 'error'
 *
 * @example
 * savePage(({msg, msgType}) => {
 *   if (msgType === 'error') {
 *     console.error('Save failed:', msg);
 *   } else {
 *     console.log('Saved:', msg);
 *   }
 * });
 */
export function savePage(callback = () => {}) {
  if (saveInProgress) {
    return;
  }
  if (!isEditMode && !window.hyperclay?.testMode) {
    return;
  }

  let currentContents;
  try {
    currentContents = getContentsForSave();
  } catch (err) {
    console.error('savePage: getContentsForSave failed', err);
    callback({ msg: err.message, msgType: "error" });
    return;
  }
  saveInProgress = true;

  // Test mode: skip network request, return mock success
  if (window.hyperclay?.testMode) {
    setTimeout(() => {
      saveInProgress = false;
      if (typeof callback === 'function') {
        callback({ msg: "Test mode: save skipped", msgType: "success" });
      }
    }, 0);
    return;
  }

  // Add timeout - abort if server doesn't respond within 12 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('Save timeout'), 12000);

  fetch(saveEndpoint, {
    method: 'POST',
    credentials: 'include',
    body: currentContents,
    signal: controller.signal
  })
    .then(res => {
      clearTimeout(timeoutId);
      return res.json().then(data => {
        if (!res.ok) {
          throw new Error(data.msg || data.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        return data;
      });
    })
    .then(data => {
      if (typeof callback === 'function') {
        callback({ msg: data.msg, msgType: data.msgType || 'success' });
      }
    })
    .catch(err => {
      clearTimeout(timeoutId);
      console.error('Failed to save page:', err);

      const msg = err.name === 'AbortError'
        ? 'Server not responding'
        : 'Save failed';

      if (typeof callback === 'function') {
        callback({ msg, msgType: "error" });
      }
    })
    .finally(() => {
      clearTimeout(timeoutId);
      saveInProgress = false;
    });
}

/**
 * Save specific HTML content to the server.
 *
 * @param {string} html - HTML string to save
 * @param {Function} callback - Called with (err, data) on completion
 *
 * @example
 * saveHtml(myHtml, (err, data) => {
 *   if (err) {
 *     console.error('Save failed:', err);
 *   } else {
 *     console.log('Saved:', data);
 *   }
 * });
 */
export function saveHtml(html, callback = () => {}) {
  if (!isEditMode || saveInProgress) {
    return;
  }

  saveInProgress = true;

  // Test mode: skip network request, return mock success
  if (window.hyperclay?.testMode) {
    setTimeout(() => {
      saveInProgress = false;
      if (typeof callback === 'function') {
        callback(null, { msg: "Test mode: save skipped", msgType: "success" });
      }
    }, 0);
    return;
  }

  fetch(saveEndpoint, {
    method: 'POST',
    credentials: 'include',
    body: html
  })
    .then(res => {
      return res.json().then(data => {
        if (!res.ok) {
          throw new Error(data.msg || data.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        return data;
      });
    })
    .then(data => {
      if (typeof callback === 'function') {
        callback(null, data);
      }
    })
    .catch(err => {
      console.error('Failed to save page:', err);
      if (typeof callback === 'function') {
        callback(err);
      }
    })
    .finally(() => {
      saveInProgress = false;
    });
}

/**
 * Fetch HTML from a URL and save it to replace the current page.
 *
 * @param {string} url - URL to fetch HTML from
 * @param {Function} callback - Called with (err, data) on completion
 *
 * @example
 * replacePageWith('/templates/blog.html', (err, data) => {
 *   if (err) {
 *     console.error('Failed:', err);
 *   } else {
 *     window.location.reload();
 *   }
 * });
 */
export function replacePageWith(url, callback = () => {}) {
  if (!isEditMode || saveInProgress) {
    return;
  }

  fetch(url)
    .then(res => res.text())
    .then(html => {
      saveHtml(html, (err, data) => {
        if (typeof callback === 'function') {
          callback(err, data);
        }
      });
    })
    .catch(err => {
      console.error('Failed to fetch template:', err);
      if (typeof callback === 'function') {
        callback(err);
      }
    });
}

// =============================================================================
// WINDOW EXPORTS
// =============================================================================

if (!window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.savePage = savePage;
  window.hyperclay.saveHtml = saveHtml;
  window.hyperclay.replacePageWith = replacePageWith;
  window.hyperclay.beforeSave = beforeSave;
  window.hyperclay.getPageContents = getPageContents;
  window.h = window.hyperclay;
}
