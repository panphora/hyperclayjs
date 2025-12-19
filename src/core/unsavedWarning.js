/**
 * Unsaved Warning Module
 *
 * Warns users before leaving the page if there are unsaved changes.
 * Self-contained: compares current page content to last saved content on beforeunload.
 *
 * Works independently of autosave - no mutation observer needed during editing,
 * just a single comparison when the user tries to leave.
 *
 * Requires the 'save-system' module (automatically included as dependency).
 */

import { isOwner, isEditMode } from "./isAdminOfCurrentResource.js";
import { getPageContents, getLastSavedContents } from "./savePage.js";

window.addEventListener('beforeunload', (event) => {
  if (!isOwner || !isEditMode) return;

  const currentContents = getPageContents();
  const lastSaved = getLastSavedContents();

  if (currentContents !== lastSaved) {
    event.preventDefault();
    event.returnValue = '';
  }
});
