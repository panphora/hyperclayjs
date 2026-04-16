/**
 * savePageCore.js — Network save functionality
 *
 * This module handles sending page contents to the server.
 * It uses snapshot.js for capturing the DOM state.
 *
 * For full save system with state management, use savePage.js instead.
 */

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
const saveEndpoint = '/save';

/**
 * Check if a save is currently in progress.
 * @returns {boolean}
 */
export function isSaveInProgress() {
  return saveInProgress;
}

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
 * Returns a Promise that resolves with {msg, msgType} — the same object
 * passed to the callback. Promise never rejects; errors resolve with
 * msgType: 'error', skipped early-returns resolve with msgType: 'skipped'.
 *
 * @param {Function} callback - Called with {msg, msgType} on completion
 *   msgType will be 'success', 'error', or 'skipped'
 * @returns {Promise<{msg: string, msgType: string}>}
 *
 * @example
 * // Callback form (unchanged)
 * savePage(({msg, msgType}) => {
 *   if (msgType === 'error') console.error('Save failed:', msg);
 * });
 *
 * @example
 * // Promise form
 * const {msg, msgType} = await savePage();
 * if (msgType === 'error') console.error('Save failed:', msg);
 */
export function savePage(callback = () => {}) {
  return new Promise((resolve) => {
    if (saveInProgress) {
      const skipped = { msg: 'Save already in progress', msgType: 'skipped' };
      callback(skipped);
      return resolve(skipped);
    }
    if (!isEditMode && !window.hyperclay?.testMode) {
      const skipped = { msg: 'Not in edit mode', msgType: 'skipped' };
      callback(skipped);
      return resolve(skipped);
    }

    let currentContents;
    try {
      currentContents = getContentsForSave();
    } catch (err) {
      console.error('savePage: getContentsForSave failed', err);
      const result = { msg: err.message, msgType: "error" };
      callback(result);
      return resolve(result);
    }
    saveInProgress = true;

    // Test mode: skip network request, return mock success
    if (window.hyperclay?.testMode) {
      setTimeout(() => {
        saveInProgress = false;
        const result = { msg: "Test mode: save skipped", msgType: "success" };
        if (typeof callback === 'function') {
          callback(result);
        }
        resolve(result);
      }, 0);
      return;
    }

    // Add timeout - abort if server doesn't respond within 12 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // Check if running on Hyperclay Local - send JSON with both versions for platform sync
    const isHyperclayLocal = window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1';

    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
      headers: { 'Page-URL': window.location.href }
    };

    if (isHyperclayLocal && window.__hyperclaySnapshotHtml) {
      // Send JSON with both stripped content and full snapshot for platform live sync
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify({
        content: currentContents,
        snapshotHtml: window.__hyperclaySnapshotHtml
      });
      // Clear after use to avoid stale data
      window.__hyperclaySnapshotHtml = null;
    } else {
      // Platform: send plain text as before
      fetchOptions.body = currentContents;
    }

    fetch(saveEndpoint, fetchOptions)
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
        const result = { msg: data.msg, msgType: data.msgType || 'success' };
        if (typeof callback === 'function') {
          callback(result);
        }
        resolve(result);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.error('Failed to save page:', err);

        const msg = err.name === 'AbortError'
          ? 'Server not responding'
          : 'Save failed';

        const result = { msg, msgType: "error" };
        if (typeof callback === 'function') {
          callback(result);
        }
        resolve(result);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        saveInProgress = false;
      });
  });
}

/**
 * Save specific HTML content to the server.
 *
 * Returns a Promise that resolves with {err, data} — same arguments
 * passed to the callback. Promise never rejects; errors resolve with
 * truthy err. Skipped early-returns resolve with data.msgType: 'skipped'.
 *
 * @param {string} html - HTML string to save
 * @param {Function} callback - Called with (err, data) on completion
 * @returns {Promise<{err: ?Error, data: ?{msg: string, msgType: string}}>}
 *
 * @example
 * // Callback form (unchanged)
 * saveHtml(myHtml, (err, data) => {
 *   if (err) console.error('Save failed:', err);
 * });
 *
 * @example
 * // Promise form
 * const {err, data} = await saveHtml(myHtml);
 * if (err) console.error('Save failed:', err);
 */
export function saveHtml(html, callback = () => {}) {
  return new Promise((resolve) => {
    if (!isEditMode || saveInProgress) {
      const data = {
        msg: saveInProgress ? 'Save already in progress' : 'Not in edit mode',
        msgType: 'skipped'
      };
      callback(null, data);
      return resolve({ err: null, data });
    }

    saveInProgress = true;

    // Test mode: skip network request, return mock success
    if (window.hyperclay?.testMode) {
      setTimeout(() => {
        saveInProgress = false;
        const data = { msg: "Test mode: save skipped", msgType: "success" };
        if (typeof callback === 'function') {
          callback(null, data);
        }
        resolve({ err: null, data });
      }, 0);
      return;
    }

    // Add timeout - abort if server doesn't respond within 12 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // Check if running on Hyperclay Local - send JSON with both versions for platform sync
    const isHyperclayLocal = window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1';

    const fetchOptions = {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
      headers: { 'Page-URL': window.location.href }
    };

    if (isHyperclayLocal && window.__hyperclaySnapshotHtml) {
      // Send JSON with both stripped content and full snapshot for platform live sync
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify({
        content: html,
        snapshotHtml: window.__hyperclaySnapshotHtml
      });
      // Clear after use to avoid stale data
      window.__hyperclaySnapshotHtml = null;
    } else {
      // Platform: send plain text as before
      fetchOptions.body = html;
    }

    fetch(saveEndpoint, fetchOptions)
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
          callback(null, data);
        }
        resolve({ err: null, data });
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.error('Failed to save page:', err);

        // Normalize timeout errors
        const error = err.name === 'AbortError'
          ? new Error('Server not responding')
          : err;

        if (typeof callback === 'function') {
          callback(error);
        }
        resolve({ err: error, data: null });
      })
      .finally(() => {
        clearTimeout(timeoutId);
        saveInProgress = false;
      });
  });
}

/**
 * Fetch HTML from a URL and save it to replace the current page.
 *
 * Returns a Promise that resolves with {err, data} — same arguments
 * passed to the callback. Promise never rejects.
 *
 * @param {string} url - URL to fetch HTML from
 * @param {Function} callback - Called with (err, data) on completion
 * @returns {Promise<{err: ?Error, data: ?{msg: string, msgType: string}}>}
 *
 * @example
 * // Callback form (unchanged)
 * replacePageWith('/templates/blog.html', (err, data) => {
 *   if (err) console.error('Failed:', err);
 *   else window.location.reload();
 * });
 *
 * @example
 * // Promise form
 * const {err, data} = await replacePageWith('/templates/blog.html');
 * if (!err) window.location.reload();
 */
export function replacePageWith(url, callback = () => {}) {
  return new Promise((resolve) => {
    if (!isEditMode || saveInProgress) {
      const data = {
        msg: saveInProgress ? 'Save already in progress' : 'Not in edit mode',
        msgType: 'skipped'
      };
      callback(null, data);
      return resolve({ err: null, data });
    }

    fetch(url)
      .then(res => res.text())
      .then(html => {
        saveHtml(html, (err, data) => {
          if (typeof callback === 'function') {
            callback(err, data);
          }
          resolve({ err: err || null, data: data || null });
        });
      })
      .catch(err => {
        console.error('Failed to fetch template:', err);
        if (typeof callback === 'function') {
          callback(err);
        }
        resolve({ err, data: null });
      });
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
