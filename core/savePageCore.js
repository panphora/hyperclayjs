/**
 * Core save functionality for Hyperclay
 *
 * This is the minimal save system - just the basic save function you can call yourself.
 * No toast notifications, no auto-save, no keyboard shortcuts.
 *
 * Use this if you want full control over save behavior and notifications.
 * For the full save system with conveniences, use savePage.js instead.
 */

import cookie from "../utilities/cookie.js";
import { isEditMode } from "./isAdminOfCurrentResource.js";

let beforeSaveCallbacks = [];
let saveInProgress = false;
const saveEndpoint = `/save/${cookie.get("currentResource")}`;

/**
 * Register a callback to run before saving
 * Callbacks receive the cloned document element
 *
 * @param {Function} cb - Callback function(docElem)
 */
export function beforeSave(cb) {
  beforeSaveCallbacks.push(cb);
}

/**
 * Get the current page contents as HTML
 * Handles CodeMirror pages, runs [onbeforesave] attributes, removes [save-ignore] elements
 *
 * @returns {string} HTML string of current page
 */
export function getPageContents() {
  const isCodeMirrorPage = !!document.querySelector('.CodeMirror')?.CodeMirror;

  if (!isCodeMirrorPage) {
    let docElem = document.documentElement.cloneNode(true);

    // Run onbeforesave callbacks
    docElem.querySelectorAll('[onbeforesave]').forEach(el =>
      new Function(el.getAttribute('onbeforesave')).call(el)
    );

    // Remove elements marked save-ignore
    docElem.querySelectorAll('[save-ignore]').forEach(el =>
      el.remove()
    );

    // Run registered beforeSave callbacks
    beforeSaveCallbacks.forEach(cb => cb(docElem));

    return "<!DOCTYPE html>" + docElem.outerHTML;
  } else {
    // For CodeMirror pages, get value from editor
    return document.querySelector('.CodeMirror').CodeMirror.getValue();
  }
}

/**
 * Save the current page contents to the server
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
  if (!isEditMode || saveInProgress) {
    return;
  }

  const currentContents = getPageContents();
  saveInProgress = true;

  // Test mode: skip network request, return mock success
  if (window.hyperclay?.testMode) {
    setTimeout(() => {
      saveInProgress = false;
      if (typeof callback === 'function') {
        callback({msg: "Test mode: save skipped", msgType: "success"});
      }
    }, 0);
    return;
  }

  fetch(saveEndpoint, {
    method: 'POST',
    credentials: 'include',
    body: currentContents
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
      callback({msg: data.msg, msgType: data.msgType || 'success'});
    }
  })
  .catch(err => {
    console.error('Failed to save page:', err);
    if (typeof callback === 'function') {
      callback({msg: err.message || "Failed to save", msgType: "error"});
    }
  })
  .finally(() => {
    saveInProgress = false;
  });
}

/**
 * Save specific HTML content to the server
 *
 * @param {string} html - HTML string to save
 * @param {Function} callback - Called with (err, data) on completion
 *   err will be null on success, Error object on failure
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
        callback(null, {msg: "Test mode: save skipped", msgType: "success"});
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
      callback(null, data); // Success: no error
    }
  })
  .catch(err => {
    console.error('Failed to save page:', err);
    if (typeof callback === 'function') {
      callback(err); // Pass error
    }
  })
  .finally(() => {
    saveInProgress = false;
  });
}

/**
 * Fetch HTML from a URL and save it to replace the current page
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

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.savePage = savePage;
  window.hyperclay.saveHtml = saveHtml;
  window.hyperclay.replacePageWith = replacePageWith;
  window.hyperclay.beforeSave = beforeSave;
  window.hyperclay.getPageContents = getPageContents;
}
