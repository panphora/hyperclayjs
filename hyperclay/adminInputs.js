import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom/onDomReady.js";
import { beforeSave } from "./savePage.js";

export function disableAdminInputsBeforeSave() {
  beforeSave(docElem => {
    docElem.querySelectorAll('[edit-mode-input]').forEach(input => {
      if (supportsReadonly(input)) {
        input.setAttribute('readonly', '');
      } else {
        input.setAttribute('disabled', '');
      }
    });
  });
}

export function enableAdminInputsOnPageLoad() {
  if (!isEditMode) return;

  onDomReady(() => {
    document.querySelectorAll('[edit-mode-input]').forEach(input => {
      if (supportsReadonly(input)) {
        input.removeAttribute('readonly');
      } else {
        input.removeAttribute('disabled');
      }
    });
  });
}

// Input types that support the readonly attribute
const readonlyTypes = ['text', 'search', 'url', 'tel', 'email', 'password', 'date', 'month', 'week', 'time', 'datetime-local', 'number'];

function supportsReadonly(element) {
  // Handle different element types
  const tagName = element.tagName?.toUpperCase();

  // TEXTAREA supports readonly
  if (tagName === 'TEXTAREA') return true;

  // SELECT, BUTTON, FIELDSET use disabled
  if (tagName === 'SELECT' || tagName === 'BUTTON' || tagName === 'FIELDSET') return false;

  // For INPUT elements, check the type
  if (tagName === 'INPUT') {
    const type = element.type || 'text';
    return readonlyTypes.includes(type);
  }

  // Default to disabled for unknown elements
  return false;
}