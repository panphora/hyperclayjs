// Edit mode system - combines editmode toggle with page type setting
import { toggleEditMode } from './editmode.js';
import { isEditMode, isOwner } from './isAdminOfCurrentResource.js';
import { init as initPageType } from './setPageTypeOnDocumentElement.js';

function init() {
  initPageType();
}

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.toggleEditMode = toggleEditMode;
  window.hyperclay.isEditMode = isEditMode;
  window.hyperclay.isOwner = isOwner;
}

// Auto-init when module is imported
init();

export { init, toggleEditMode, isEditMode, isOwner };
export default { init, toggleEditMode, isEditMode, isOwner };
