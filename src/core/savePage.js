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
import Mutation from "../utilities/mutation.js";
import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import {
  saveHtml,
  getPageContents,
  replacePageWith as replacePageWithCore,
  beforeSave,
  isSaveInProgress,
  whenSaveIdle
} from "./savePageCore.js";
import { captureForComparison, captureForSaveAndComparison } from "./snapshot.js";
import { logSaveCheck, logBaseline } from "../utilities/autosaveDebug.js";

// Reset savestatus to 'saved' in snapshots (each module cleans up its own attrs)
beforeSave(clone => {
  clone.setAttribute('savestatus', 'saved');
});

// ============================================
// SAVE STATE MANAGEMENT
// ============================================

let savingTimeout = null;

// A busy lane needs one follow-up, captured after the current request settles.
// That single capture contains the latest DOM after any number of queued calls.
// Force is sticky because weakening a queued force request to a dirty-checked
// save would discard the caller's reason for bypassing the check.
let pendingSave = null;
let pendingDrainScheduled = false;

function queuePendingSave(mode) {
  if (mode === 'force' || pendingSave === null) {
    pendingSave = mode;
  }

  if (pendingDrainScheduled) return;
  pendingDrainScheduled = true;
  whenSaveIdle().then((claim) => {
    pendingDrainScheduled = false;
    // The write that just landed replaced the document with bytes that did not
    // come from this page, and its caller reloads next: upgrade.js and
    // replacePageWith both do exactly that. Capturing the live DOM now would post
    // the pre-replacement page over the new one and silently undo it. Dropping
    // the follow-up instead leaves the baseline untouched, so the page stays
    // dirty, the close warning stays armed, and the next mutation saves normally.
    if (claim?.replacesDocument) {
      pendingSave = null;
      return;
    }
    drainPendingSave();
  });
}

function drainPendingSave() {
  const mode = pendingSave;
  pendingSave = null;

  if (mode === 'force') {
    savePageForce();
  } else if (mode === 'normal') {
    savePage();
  }
}

/**
 * Sets the save status on <html> and dispatches an event.
 *
 * @param {string} state - One of: 'saving', 'saved', 'offline', 'error'
 * @param {string} msg - Optional message (e.g., error details)
 * @param {string} msgType - Optional severity from the server (e.g., 'warning')
 */
function setSaveState(state, msg = '', msgType = '') {
  if (savingTimeout) {
    clearTimeout(savingTimeout);
    savingTimeout = null;
  }

  document.documentElement.setAttribute('savestatus', state);

  const event = new CustomEvent(`hyperclay:save-${state}`, {
    detail: { msg, msgType, timestamp: Date.now() }
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
  // A nested save can arm this while an outer one is mid-capture. Overwriting the
  // handle would strand the earlier timer, which then flips the page to 'saving'
  // with no request left to answer it.
  if (savingTimeout) clearTimeout(savingTimeout);
  savingTimeout = setTimeout(() => {
    setSaveState('saving');
  }, 500);
}

/**
 * Disarm the debounced 'saving' state for a save that was armed and then never
 * reached the wire. With no request in flight to answer it, the timer would flip
 * the page to 'saving' and leave it there.
 */
function cancelSavingState() {
  if (!savingTimeout) return;
  clearTimeout(savingTimeout);
  savingTimeout = null;
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

/**
 * Record one landed save: adopt its bytes as the baseline, announce it, then
 * absorb whatever the synchronous onaftersave handlers did to the live page.
 *
 * ORDER MATTERS, all three steps. setSaveState dispatches hyperclay:save-saved,
 * and dispatchEvent runs every listener before it returns — including the
 * [onaftersave] broadcaster, which calls each inline handler synchronously. So the
 * moment it returns, the churn those handlers make (cacheBust rewriting ?v= query
 * params) is in the DOM and is the ONLY difference from the bytes we sent. Reading
 * the live page right there absorbs exactly that and nothing else, which is what
 * stops a false "unsaved changes" warning.
 *
 * The absorb is allowed only when the page still matched the sent bytes BEFORE
 * those handlers ran. If it had already moved on, a person typed while the request
 * was on the wire. That edit is genuinely unsaved, and adopting it would record
 * bytes that never left the browser as stored, leaving both autosave and the close
 * warning in unsavedWarning.js silent about it.
 *
 * This used to run on a setTimeout(0) after the event instead, which let anything
 * the browser scheduled in between be absorbed the same way: a microtask queued by
 * another save-saved listener, or a keystroke.
 */
function commitSavedBaseline(forComparison, data, label) {
  let liveMatchedSent = false;
  try {
    liveMatchedSent = captureForComparison() === forComparison;
  } catch (err) {
    console.error('savePage: post-save comparison failed', err);
  }

  lastSavedContents = forComparison;
  unsavedChanges = !liveMatchedSent;

  setSaveState('saved', data?.msg || 'Saved', data?.msgType);

  if (liveMatchedSent) {
    try {
      lastSavedContents = captureForComparison();
    } catch (err) {
      console.error('savePage: post-save recapture failed', err);
    }
  }

  logBaseline(label, `${lastSavedContents.length} chars`);
}

// State accessors for autosave module
export function getUnsavedChanges() { return unsavedChanges; }
export function setUnsavedChanges(val) { unsavedChanges = val; }
export function getLastSavedContents() { return lastSavedContents; }
export function setLastSavedContents(val) { lastSavedContents = val; }

/**
 * Save the current page with change detection and state management.
 *
 * Returns a Promise that resolves with {msg, msgType} — the same object
 * passed to the callback. Promise never rejects; errors resolve with
 * msgType: 'error', skipped early-returns resolve with msgType: 'skipped'.
 *
 * @param {Function} callback - Optional callback for custom handling
 * @returns {Promise<{msg: string, msgType: string}>}
 */
export function savePage(callback = () => {}) {
  return new Promise((resolve) => {
    if (!isEditMode && !window.hyperclay?.testMode) {
      const skipped = { msg: 'Not in edit mode', msgType: 'skipped' };
      callback(skipped);
      return resolve(skipped);
    }

    // Don't start a new save if one is already in progress
    if (isSaveInProgress()) {
      queuePendingSave('normal');
      const skipped = { msg: 'Save already in progress', msgType: 'skipped' };
      callback(skipped);
      return resolve(skipped);
    }

    // Check if offline - set DOM state immediately for UI feedback
    // but still try the fetch (navigator.onLine can be wrong)
    const wasOffline = !navigator.onLine;
    if (wasOffline) {
      setOfflineStateQuiet();
    }

    // Single capture: clone once, get both versions
    // forSave strips non-persisted regions ([no-save]/[save-remove])
    // forComparison additionally strips every autosave-off region
    let forSave, forComparison;
    try {
      ({ forSave, forComparison } = captureForSaveAndComparison());
    } catch (err) {
      console.error('savePage: captureForSaveAndComparison failed', err);
      setSaveState('error', err.message);
      const result = { msg: err.message, msgType: 'error' };
      if (typeof callback === 'function') {
        callback(result);
      }
      return resolve(result);
    }

    // Compare directly - lastSavedContents is already stripped
    unsavedChanges = (forComparison !== lastSavedContents);
    logSaveCheck('savePage dirty check', !unsavedChanges);

    // Skip if content hasn't changed
    if (!unsavedChanges) {
      const skipped = { msg: 'No changes to save', msgType: 'skipped' };
      callback(skipped);
      return resolve(skipped);
    }

    // Start debounced 'saving' state (only shows if save takes >500ms)
    setSavingState();

    // Use saveHtml directly with our pre-captured content (avoids double capture)
    saveHtml(forSave, (err, data) => {
      // saveHtml answers a refusal as (null, {msgType:'skipped'}): a beforeSave
      // hook or a hyperclay:snapshot-ready listener saved on its own and took the
      // lane between the check above and this send. Those bytes never reached the
      // wire, so the baseline must not advance and no 'saved' may be announced —
      // recording unsent content as stored is the defect this file exists to fix,
      // one layer down.
      const landed = !err && data?.msgType !== 'skipped';
      if (landed) {
        // SUCCESS - store stripped version for future comparisons
        commitSavedBaseline(forComparison, data, 'updated after save');
      } else if (err) {
        // FAILED - determine if it's offline or server error
        if (!navigator.onLine) {
          setSaveState('offline', err.message);
        } else {
          setSaveState('error', err.message);
        }
      } else {
        // Refused, not failed. The bytes we captured are still unsaved, so park a
        // follow-up exactly as a busy lane at entry does. Without this the request
        // is dropped, which is the defect this file exists to fix, reached through
        // the one door the entry check cannot cover.
        queuePendingSave('normal');
        cancelSavingState();
      }

      // Call user callback if provided (preserve server's msgType)
      const result = {
        msg: err?.message || data?.msg,
        msgType: err ? 'error' : (data?.msgType || 'success')
      };
      if (typeof callback === 'function') {
        callback(result);
      }
      resolve(result);
    });
  });
}

/**
 * Force-save the current page (skips dirty check).
 *
 * @param {Function} callback - Optional callback for custom handling
 * @returns {Promise<{msg: string, msgType: string}>}
 */
export function savePageForce(callback = () => {}) {
  return new Promise((resolve) => {
    if (!isEditMode && !window.hyperclay?.testMode) {
      const skipped = { msg: 'Not in edit mode', msgType: 'skipped' };
      callback(skipped);
      return resolve(skipped);
    }

    if (isSaveInProgress()) {
      queuePendingSave('force');
      const skipped = { msg: 'Save already in progress', msgType: 'skipped' };
      callback(skipped);
      return resolve(skipped);
    }

    const wasOffline = !navigator.onLine;
    if (wasOffline) {
      setOfflineStateQuiet();
    }

    let forSave, forComparison;
    try {
      ({ forSave, forComparison } = captureForSaveAndComparison());
    } catch (err) {
      console.error('savePageForce: captureForSaveAndComparison failed', err);
      setSaveState('error', err.message);
      const result = { msg: err.message, msgType: 'error' };
      if (typeof callback === 'function') {
        callback(result);
      }
      return resolve(result);
    }

    setSavingState();

    saveHtml(forSave, (err, data) => {
      // A refusal comes back as (null, {msgType:'skipped'}); see savePage above.
      const landed = !err && data?.msgType !== 'skipped';
      if (landed) {
        commitSavedBaseline(forComparison, data, 'updated after force save');
      } else if (err) {
        if (!navigator.onLine) {
          setSaveState('offline', err.message);
        } else {
          setSaveState('error', err.message);
        }
      } else {
        // Refused; see savePage above. Parked as a force, so the follow-up still
        // skips the dirty check this call asked it to skip.
        queuePendingSave('force');
        cancelSavingState();
      }

      const result = {
        msg: err?.message || data?.msg,
        msgType: err ? 'error' : (data?.msgType || 'success')
      };
      if (typeof callback === 'function') {
        callback(result);
      }
      resolve(result);
    });
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

// ============================================
// BASELINE CAPTURE (Settled Signal)
// ============================================
//
// WHY SETTLED SIGNAL:
// Modules run on load and mutate the DOM (add styles, modify attributes).
// A fixed delay (e.g., 1500ms) is arbitrary and either too short (misses slow
// mutations) or too long (delays baseline). Instead, we wait for mutations to
// stop, meaning all modules have finished their setup work.
//
// WHY IMMEDIATE + CONDITIONAL UPDATE:
// We set baseline immediately as a safety net. If the user edits or saves
// before settle completes, we don't overwrite their work. The settled snapshot
// only replaces baseline if nothing changed (lastSavedContents === immediateContents).

const SETTLE_MS = 500;        // Wait for no mutations for this long
const MAX_SETTLE_MS = 3000;   // Max time to wait before forcing capture

function initBaselineCapture() {
  if (!isEditMode) return;

  let userEdited = false;
  let settled = false;
  let unsubscribeMutation = null;

  // Take immediate snapshot and set as baseline right away
  // This ensures saves during settle window work correctly
  // Store stripped version so comparisons are direct (no parsing needed)
  const immediateContents = captureForComparison();
  lastSavedContents = immediateContents;
  baselineContents = immediateContents;
  logBaseline('immediate capture', `${immediateContents.length} chars`);

  // Track user edits to avoid overwriting real changes
  const userEditEvents = ['input', 'change', 'paste'];
  const markUserEdited = (e) => {
    const target = e.target;
    const isEditable = target.isContentEditable ||
                       target.tagName === 'INPUT' ||
                       target.tagName === 'TEXTAREA' ||
                       target.tagName === 'SELECT';
    if (isEditable) userEdited = true;
  };
  userEditEvents.forEach(evt => document.addEventListener(evt, markUserEdited, true));

  // Called when mutations settle OR max timeout reached
  const captureBaseline = () => {
    if (settled) return;
    settled = true;

    // Cleanup listeners
    if (unsubscribeMutation) unsubscribeMutation();
    userEditEvents.forEach(evt => document.removeEventListener(evt, markUserEdited, true));

    // Only update if no user edits AND no saves occurred during settle
    // (if a save happened, lastSavedContents would differ from immediateContents)
    if (!userEdited && lastSavedContents === immediateContents) {
      // Store stripped version so comparisons are direct (no parsing needed)
      const contents = captureForComparison();
      lastSavedContents = contents;
      baselineContents = contents;
      logBaseline('settled capture', `${contents.length} chars`);
    } else {
      logBaseline('settled skipped', userEdited ? 'user edited' : 'save occurred during settle');
    }

    document.documentElement.setAttribute('savestatus', 'saved');
  };

  // Start settle observer - fires when no mutations for SETTLE_MS.
  // require:'autosave' so churn in no-save / save-* / no-watch regions doesn't
  // keep resetting the settle timer or count toward the baseline.
  unsubscribeMutation = Mutation.onAnyChange(
    { debounce: SETTLE_MS, omitChangeDetails: true, require: 'autosave' },
    captureBaseline
  );

  // Max timeout fallback
  setTimeout(() => {
    if (!settled) captureBaseline();
  }, MAX_SETTLE_MS);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBaselineCapture);
} else {
  initBaselineCapture();
}

/**
 * Save the page with throttling, for use with auto-save.
 * Checks both baseline and last saved content to prevent saves from initial setup.
 *
 * Returns a Promise resolving with {msg, msgType}. Within-throttle-window calls
 * piggyback on the trailing-edge save and resolve with its result.
 *
 * @param {Function} callback - Optional callback
 * @returns {Promise<{msg: string, msgType: string}>}
 */
export function savePageThrottled(callback = () => {}) {
  if (!isEditMode) {
    const skipped = { msg: 'Not in edit mode', msgType: 'skipped' };
    callback(skipped);
    return Promise.resolve(skipped);
  }

  // For autosave: check both that content changed from baseline AND from last save
  // This prevents saves from initial setup mutations
  // Compare directly - stored versions are already stripped
  const currentForCompare = captureForComparison();
  const differsFromBaseline = currentForCompare !== baselineContents;
  const differsFromLastSave = currentForCompare !== lastSavedContents;

  logSaveCheck('throttled vs baseline', !differsFromBaseline);
  logSaveCheck('throttled vs lastSave', !differsFromLastSave);

  if (!(differsFromBaseline && differsFromLastSave)) {
    const skipped = { msg: 'No changes to save', msgType: 'skipped' };
    callback(skipped);
    return Promise.resolve(skipped);
  }

  unsavedChanges = true;
  return throttledSave(callback);
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
  window.hyperclay.savePageForce = savePageForce;
  window.hyperclay.savePageThrottled = savePageThrottled;
  window.hyperclay.beforeSave = beforeSave;
  window.hyperclay.replacePageWith = replacePageWith;
  window.h = window.hyperclay;
}

// Auto-init when module is imported
init();

export default savePage;
