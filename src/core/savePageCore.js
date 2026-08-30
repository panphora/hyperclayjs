/**
 * savePageCore.js — Network save functionality
 *
 * This module handles sending page contents to the server.
 * It uses snapshot.js for capturing the DOM state.
 *
 * For full save system with state management, use savePage.js instead.
 */

import { isEditMode } from "./isAdminOfCurrentResource.js";
import { saveToken } from "./host-attrs.js";
import { consumeUserDriven, markUserDriven } from "../utilities/user-gesture.js";
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
let saveIdlePromise = Promise.resolve({});
let resolveSaveIdle = null;
let laneClaim = {};
const saveEndpoint = '/_/save';

// `claim` describes the write, not the caller. The only field that matters so far
// is replacesDocument: these bytes did not come from the live page, and whoever
// sent them reloads next. A coalesced follow-up must not capture the live DOM
// across one of those, or it posts the pre-replacement page over the new one.
function startSave(claim = {}) {
  saveInProgress = true;
  laneClaim = claim;
  saveIdlePromise = new Promise(resolve => {
    resolveSaveIdle = resolve;
  });
}

function finishSave() {
  saveInProgress = false;
  const claim = laneClaim;
  laneClaim = {};
  if (resolveSaveIdle) {
    resolveSaveIdle(claim);
    resolveSaveIdle = null;
  }
}

/**
 * Hand a result to a caller's callback without letting their exception become
 * this save's problem. A page's [onaftersave] code is arbitrary and can throw;
 * that is their bug to see in the console, not a reason to report a save that
 * landed as failed or to leave this promise unsettled.
 */
function runCallback(callback, ...args) {
  if (typeof callback !== 'function') return;
  try {
    callback(...args);
  } catch (err) {
    console.error('save: completion callback threw', err);
  }
}

/**
 * Check if a save is currently in progress.
 * @returns {boolean}
 */
export function isSaveInProgress() {
  return saveInProgress;
}

/**
 * Resolve when the current save lane becomes idle, with the finished write's
 * claim (see startSave). Resolves immediately when nothing is in flight.
 *
 * @returns {Promise<{replacesDocument?: boolean}>}
 */
export function whenSaveIdle() {
  return saveIdlePromise;
}

/**
 * Where this save goes, and what identity it carries. One decision, because the
 * two answers have to agree.
 *
 * A host that sandboxes its documents cannot authenticate them by cookie, so it
 * mints a per-file token and carries it in the URL path, where the same token
 * works for fetch and EventSource. Spec §9 names that attribute `savetoken`;
 * `htmlclaytoken` is the original spelling, still read because a saved document
 * is a frozen client that keeps sending what it was written with.
 *
 * On such a host the document's origin is opaque, so the save is cross-origin,
 * and a credentialed cross-origin request needs `Access-Control-Allow-Credentials`
 * back. A token-minting host must never send that header, because `Origin: null`
 * is forgeable and must not buy ambient authority. Asking for cookies there gets
 * the response blocked after the save has already landed, reporting a failure
 * that did not happen. So a token save sends no cookie: the token is the identity.
 *
 * Without a token the host authenticates by cookie (the platform, Hyperclay
 * Local), and the request is same-origin, where `same-origin` and the `include`
 * this used to send behave identically.
 *
 * @returns {{url: string, credentials: string}}
 */
function saveTarget() {
  const token = saveToken();
  return token
    ? { url: resolveSaveUrl(`${saveEndpoint}/${token}`), credentials: 'omit' }
    : { url: resolveSaveUrl(saveEndpoint), credentials: 'same-origin' };
}

/**
 * The absolute URL a save goes to.
 *
 * A relative path is resolved by fetch against the DOCUMENT's base URL, which
 * `<base href>` sets and the author of a malleable document controls. Left
 * relative, a `<base href="https://elsewhere.example/">` sends the document and
 * the per-document token in the path to an origin the document picked. Pinning to
 * the real origin is the whole fix.
 *
 * The guard is not defensive noise. `window.location.origin` is the STRING "null"
 * on a file:// document, and `new URL(path, "null")` throws a TypeError, which
 * would escape synchronously into a save whose promise is contracted never to
 * reject. Documents opened from disk are a first-class case (an exported app is
 * just a file), and there is no origin to pin to and no host to save to there
 * anyway, so the relative path is both the honest answer and the one that cannot
 * throw.
 *
 * @param {string} path - Root-relative save path
 * @returns {string}
 */
function resolveSaveUrl(path) {
  const origin = window.location.origin;
  if (!origin || origin === 'null') return path;
  return new URL(path, origin).href;
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

    // The capture above dispatches hyperclay:snapshot-ready synchronously, so a
    // page listener can start its own save and take the lane in that window.
    // Claiming it unconditionally here would put two requests on the wire at once
    // and hand the second one's release to whichever finished first.
    if (saveInProgress) {
      const skipped = { msg: 'Save already in progress', msgType: 'skipped' };
      callback(skipped);
      return resolve(skipped);
    }

    startSave();

    // Test mode: skip network request, return mock success
    if (window.hyperclay?.testMode) {
      setTimeout(() => {
        finishSave();
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

    // Read-and-reset the data-guard provenance bit at the ACTUAL send (past the
    // early returns above), so it's never consumed on a save that never ships.
    const userDriven = consumeUserDriven();

    // The body is the document, as text, on every host. Everything else about
    // the save rides in a header. There used to be a JSON envelope here carrying
    // an unstripped snapshot alongside the document, sent to any page whose
    // hostname was localhost; the snapshot's home is the live-sync relay, which
    // live-sync.js already posts it to.
    const target = saveTarget();
    const fetchOptions = {
      method: 'POST',
      credentials: target.credentials,
      signal: controller.signal,
      headers: {
        // Spec §3's name for the header that says which document this save is for.
        'Document-URL': window.location.href,
        // The older spelling of the same header. Stored customer documents hardcode it
        // and both Hyperclay hosts read Document-URL first and fall back to this one,
        // so sending both is what lets a spec-conforming third-party host accept a
        // save from this library without breaking the documents already out there.
        'Page-URL': window.location.href,
        'Save-Trigger': userDriven ? 'user' : 'auto'
      },
      body: currentContents
    };

    fetch(target.url, fetchOptions)
      .then(res => {
        clearTimeout(timeoutId);
        // The body is read as text and parsed defensively BEFORE the status is
        // consulted, which is what clayjs already does. Calling res.json() first made a
        // 200 with an empty body report a failure over a save that had landed, and
        // turned an intermediary's HTML error page into "Unexpected token '<'" instead
        // of the status that actually came back. The status is what is authoritative;
        // the body may not even be the host's.
        return res.text().then(text => {
          let data = {};
          if (text) {
            try {
              data = JSON.parse(text);
            } catch (err) {
              if (res.ok) throw new Error('Server sent a response that was not JSON');
            }
          }
          if (!res.ok) {
            throw new Error(data.msg || data.error || `HTTP ${res.status}: ${res.statusText}`);
          }
          return data;
        });
      })
      // Two handlers on ONE .then, not .then().catch(). A throw inside the success
      // handler must not reach the failure handler: the request landed, and treating
      // the caller's own crash as a failed save reported a save that worked as
      // broken, called the caller a second time, and re-armed the user-driven bit so
      // the NEXT background save reached the server claiming a human made it.
      .then(
        data => {
          const result = { msg: data.msg, msgType: data.msgType || 'success' };
          runCallback(callback, result);
          resolve(result);
        },
        err => {
          clearTimeout(timeoutId);
          console.error('Failed to save page:', err);

          // The save never landed: re-arm the user-driven bit so the next (retry)
          // save still reports the human gesture instead of reading as background.
          if (userDriven) markUserDriven();

          const msg = err.name === 'AbortError'
            ? 'Server not responding'
            : 'Save failed';

          const result = { msg, msgType: "error" };
          runCallback(callback, result);
          resolve(result);
        }
      )
      .finally(() => {
        clearTimeout(timeoutId);
        finishSave();
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
export function saveHtml(html, callback = () => {}, { replacesDocument = false } = {}) {
  return new Promise((resolve) => {
    if (!isEditMode || saveInProgress) {
      const data = {
        msg: saveInProgress ? 'Save already in progress' : 'Not in edit mode',
        msgType: 'skipped'
      };
      callback(null, data);
      return resolve({ err: null, data });
    }

    startSave({ replacesDocument });

    // Test mode: skip network request, return mock success
    if (window.hyperclay?.testMode) {
      setTimeout(() => {
        finishSave();
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

    const userDriven = consumeUserDriven();

    // The body is the document, as text, on every host. See saveHTML above.
    const target = saveTarget();
    const fetchOptions = {
      method: 'POST',
      credentials: target.credentials,
      signal: controller.signal,
      headers: {
        // Spec §3's name for the header that says which document this save is for.
        'Document-URL': window.location.href,
        // The older spelling of the same header. Stored customer documents hardcode it
        // and both Hyperclay hosts read Document-URL first and fall back to this one,
        // so sending both is what lets a spec-conforming third-party host accept a
        // save from this library without breaking the documents already out there.
        'Page-URL': window.location.href,
        'Save-Trigger': userDriven ? 'user' : 'auto'
      },
      body: html
    };

    fetch(target.url, fetchOptions)
      .then(res => {
        clearTimeout(timeoutId);
        // The body is read as text and parsed defensively BEFORE the status is
        // consulted, which is what clayjs already does. Calling res.json() first made a
        // 200 with an empty body report a failure over a save that had landed, and
        // turned an intermediary's HTML error page into "Unexpected token '<'" instead
        // of the status that actually came back. The status is what is authoritative;
        // the body may not even be the host's.
        return res.text().then(text => {
          let data = {};
          if (text) {
            try {
              data = JSON.parse(text);
            } catch (err) {
              if (res.ok) throw new Error('Server sent a response that was not JSON');
            }
          }
          if (!res.ok) {
            throw new Error(data.msg || data.error || `HTTP ${res.status}: ${res.statusText}`);
          }
          return data;
        });
      })
      // Two handlers on one .then; see savePage above for why not .then().catch().
      .then(
        data => {
          runCallback(callback, null, data);
          resolve({ err: null, data });
        },
        err => {
          clearTimeout(timeoutId);
          console.error('Failed to save page:', err);

          // The save never landed: re-arm the user-driven bit so the next (retry)
          // save still reports the human gesture instead of reading as background.
          if (userDriven) markUserDriven();

          // Normalize timeout errors
          const error = err.name === 'AbortError'
            ? new Error('Server not responding')
            : err;

          runCallback(callback, error);
          resolve({ err: error, data: null });
        }
      )
      .finally(() => {
        clearTimeout(timeoutId);
        finishSave();
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
        // The template supersedes the live DOM and this call's callers reload, so
        // a save coalesced across it must be dropped rather than captured.
        saveHtml(html, (err, data) => {
          if (typeof callback === 'function') {
            callback(err, data);
          }
          resolve({ err: err || null, data: data || null });
        }, { replacesDocument: true });
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
