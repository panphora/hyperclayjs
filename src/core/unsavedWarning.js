/**
 * Unsaved Warning Module
 *
 * Warns users before leaving the page if there are unsaved changes.
 * Self-contained: compares current page content to last saved content on beforeunload.
 *
 * Works independently of autosave - no mutation observer needed during editing,
 * just a single comparison when the user tries to leave.
 *
 * Elements are stripped before comparison:
 * - [save-remove]: Stripped from saved HTML entirely, so must be stripped from current
 * - [save-ignore]: Kept in saved HTML but excluded from comparison (e.g., cache-bust params)
 *
 * Requires the 'save-system' module (automatically included as dependency).
 */

import { isOwner, isEditMode } from "./isAdminOfCurrentResource.js";
import { captureForComparison } from "./snapshot.js";
import { getLastSavedContents, stripForComparison } from "./savePage.js";
import { logUnloadDiffSync, preloadIfEnabled } from "../utilities/autosaveDebug.js";

// Pre-load diff library if debug mode is on (so it's ready for unload)
preloadIfEnabled();

window.addEventListener('beforeunload', (event) => {
  if (!isOwner || !isEditMode) return;

  // Use captureForComparison() for current (avoids serialize→parse round-trip)
  // stripForComparison() for stored lastSaved string
  const currentForCompare = captureForComparison();
  const lastSavedForCompare = stripForComparison(getLastSavedContents());

  if (currentForCompare !== lastSavedForCompare) {
    // Debug: log what's different before showing the warning
    logUnloadDiffSync(currentForCompare, lastSavedForCompare);

    event.preventDefault();
    event.returnValue = '';
  }
});
