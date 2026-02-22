import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import {beforeSave} from "./savePage.js";

const SELECTOR = '[editmode\\:onclick]';

export function disableOnClickBeforeSave () {
  beforeSave(docElem => {
    docElem.querySelectorAll(SELECTOR).forEach(resource => {
      const originalValue = resource.getAttribute("onclick");
      resource.setAttribute("inert-onclick", originalValue);
      resource.removeAttribute("onclick");
    });
  });
}

export function enableOnClickForAdminOnPageLoad () {
  if (!isEditMode) return;

  onDomReady(() => {
    enableOnClick();
  });
}

// Runtime toggle functions
export function enableOnClick() {
  document.querySelectorAll(SELECTOR).forEach(el => {
    const val = el.getAttribute("inert-onclick");
    if (val) {
      el.setAttribute("onclick", val);
      el.removeAttribute("inert-onclick");
    }
  });
}

export function disableOnClick() {
  document.querySelectorAll(SELECTOR).forEach(el => {
    const val = el.getAttribute("onclick");
    if (val) {
      el.setAttribute("inert-onclick", val);
      el.removeAttribute("onclick");
    }
  });
}

// Auto-initialize
export function init() {
  disableOnClickBeforeSave();
  enableOnClickForAdminOnPageLoad();
}

// Export to window
window.hyperclay = window.hyperclay || {};
window.hyperclay.enableOnClick = enableOnClick;
window.hyperclay.disableOnClick = disableOnClick;
window.h = window.hyperclay;
