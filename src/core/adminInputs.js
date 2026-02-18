import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import { beforeSave } from "./savePage.js";

const SELECTOR_DISABLED = '[edit-mode-input], [viewmode\\:disabled]';
const SELECTOR_READONLY = '[viewmode\\:readonly]';
const SELECTOR_ALL = '[edit-mode-input], [viewmode\\:disabled], [viewmode\\:readonly]';

export function disableAdminInputsBeforeSave() {
  beforeSave(docElem => {
    docElem.querySelectorAll(SELECTOR_DISABLED).forEach(input => {
      if (input.hasAttribute('viewmode:disabled')) {
        input.setAttribute('disabled', '');
      } else if (supportsReadonly(input)) {
        input.setAttribute('readonly', '');
      } else {
        input.setAttribute('disabled', '');
      }
    });
    docElem.querySelectorAll(SELECTOR_READONLY).forEach(input => {
      input.setAttribute('readonly', '');
    });
  });
}

export function enableAdminInputsOnPageLoad() {
  if (!isEditMode) return;

  onDomReady(() => {
    enableAdminInputs();
  });
}

// Runtime toggle functions
export function enableAdminInputs() {
  document.querySelectorAll(SELECTOR_DISABLED).forEach(input => {
    if (input.hasAttribute('viewmode:disabled')) {
      input.removeAttribute('disabled');
    } else if (supportsReadonly(input)) {
      input.removeAttribute('readonly');
    } else {
      input.removeAttribute('disabled');
    }
  });
  document.querySelectorAll(SELECTOR_READONLY).forEach(input => {
    input.removeAttribute('readonly');
  });
}

export function disableAdminInputs() {
  document.querySelectorAll(SELECTOR_DISABLED).forEach(input => {
    if (input.hasAttribute('viewmode:disabled')) {
      input.setAttribute('disabled', '');
    } else if (supportsReadonly(input)) {
      input.setAttribute('readonly', '');
    } else {
      input.setAttribute('disabled', '');
    }
  });
  document.querySelectorAll(SELECTOR_READONLY).forEach(input => {
    input.setAttribute('readonly', '');
  });
}

// Input types that support the readonly attribute
const readonlyTypes = ['text', 'search', 'url', 'tel', 'email', 'password', 'date', 'month', 'week', 'time', 'datetime-local', 'number'];

function supportsReadonly(element) {
  const tagName = element.tagName?.toUpperCase();

  if (tagName === 'TEXTAREA') return true;
  if (tagName === 'SELECT' || tagName === 'BUTTON' || tagName === 'FIELDSET') return false;

  if (tagName === 'INPUT') {
    const type = element.type || 'text';
    return readonlyTypes.includes(type);
  }

  return false;
}

// Auto-initialize
export function init() {
  disableAdminInputsBeforeSave();
  enableAdminInputsOnPageLoad();
}

// Export to window
window.hyperclay = window.hyperclay || {};
window.hyperclay.enableAdminInputs = enableAdminInputs;
window.hyperclay.disableAdminInputs = disableAdminInputs;
window.h = window.hyperclay;
