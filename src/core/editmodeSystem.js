// Edit mode system - combines editmode toggle with page type setting
import { toggleEditMode } from './editmode.js';
import { isEditMode, isOwner } from './isAdminOfCurrentResource.js';
import { init as initPageType } from './setPageTypeOnDocumentElement.js';

function init() {
  initPageType();
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.toggleEditMode = toggleEditMode;
  window.hyperclay.isEditMode = isEditMode;
  window.hyperclay.isOwner = isOwner;
  window.h = window.hyperclay;
}

// Auto-init when module is imported
init();

export { init, toggleEditMode, isEditMode, isOwner };
export default { init, toggleEditMode, isEditMode, isOwner };
