// Edit mode system - combines editmode toggle with page type setting
import { toggleEditMode } from './editmode.js';
import { init as initPageType } from './setPageTypeOnDocumentElement.js';

function init() {
  initPageType();
}

function exportToWindow() {
  if (!window.hyperclay) {
    window.hyperclay = {};
  }

  window.hyperclay.toggleEditMode = toggleEditMode;
}

export { init, exportToWindow };
export default { init, exportToWindow };
