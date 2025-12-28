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
  beforeSave
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

// ============================================
// POST-SAVE BASELINE RECAPTURE
// ============================================
// After a successful save, onaftersave handlers may modify the live DOM
// (e.g., cacheBust updates ?v= query params). We recapture the baseline
// after these sync handlers complete to prevent false "unsaved changes" warnings.

document.addEventListener('hyperclay:save-saved', () => {
  // Use setTimeout(0) to run after all sync onaftersave handlers complete
  setTimeout(() => {
    // Store stripped version so comparisons are direct (no parsing needed)
    const contents = captureForComparison();
    lastSavedContents = contents;
    logBaseline('recaptured after onaftersave', `${contents.length} chars`);
  }, 0);
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

  // Single capture: clone once, get both versions
  // forComparison has [save-remove] and [save-ignore] stripped
  // forSave has only [save-remove] stripped
  const { forSave, forComparison } = captureForSaveAndComparison();

  // Compare directly - lastSavedContents is already stripped
  unsavedChanges = (forComparison !== lastSavedContents);
  logSaveCheck('savePage dirty check', !unsavedChanges);

  // Skip if content hasn't changed
  if (!unsavedChanges) {
    return;
  }

  // Start debounced 'saving' state (only shows if save takes >500ms)
  setSavingState();

  // Use saveHtml directly with our pre-captured content (avoids double capture)
  saveHtml(forSave, (err, data) => {
    if (!err) {
      // SUCCESS - store stripped version for future comparisons
      lastSavedContents = forComparison;
      unsavedChanges = false;
      setSaveState('saved', data?.msg || 'Saved');
      logBaseline('updated after save', `${lastSavedContents.length} chars`);
    } else {
      // FAILED - determine if it's offline or server error
      if (!navigator.onLine) {
        setSaveState('offline', err.message);
      } else {
        setSaveState('error', err.message);
      }
    }

    // Call user callback if provided (preserve server's msgType)
    if (typeof callback === 'function') {
      callback({
        msg: err?.message || data?.msg,
        msgType: err ? 'error' : (data?.msgType || 'success')
      });
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

  // Start settle observer - fires when no mutations for SETTLE_MS
  unsubscribeMutation = Mutation.onAnyChange(
    { debounce: SETTLE_MS, omitChangeDetails: true },
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
 * Save the page with throttling, for use with auto-save
 * Checks both baseline and last saved content to prevent saves from initial setup
 *
 * @param {Function} callback - Optional callback
 */
export function savePageThrottled(callback = () => {}) {
  if (!isEditMode) return;

  // For autosave: check both that content changed from baseline AND from last save
  // This prevents saves from initial setup mutations
  // Compare directly - stored versions are already stripped
  const currentForCompare = captureForComparison();
  const differsFromBaseline = currentForCompare !== baselineContents;
  const differsFromLastSave = currentForCompare !== lastSavedContents;

  logSaveCheck('throttled vs baseline', !differsFromBaseline);
  logSaveCheck('throttled vs lastSave', !differsFromLastSave);

  if (differsFromBaseline && differsFromLastSave) {
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
