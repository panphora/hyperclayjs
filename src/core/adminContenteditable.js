import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import {beforeSave} from "./savePage.js";

const SELECTOR = '[editmode\\:contenteditable]';

export function disableContentEditableBeforeSave () {
  beforeSave(docElem => {
    docElem.querySelectorAll(SELECTOR).forEach(resource => {
      const originalValue = resource.getAttribute("contenteditable");
      resource.setAttribute("inert-contenteditable", originalValue);
      resource.removeAttribute("contenteditable");
    });
  });
}

export function enableContentEditableForAdminOnPageLoad () {
  if (!isEditMode) return;

  onDomReady(() => {
    enableContentEditable();
  });
}

// Runtime toggle functions
export function enableContentEditable() {
  document.querySelectorAll(SELECTOR).forEach(el => {
    let val = el.getAttribute("inert-contenteditable");
    if (!["false", "plaintext-only"].includes(val)) val = "true";
    el.setAttribute("contenteditable", val);
    el.removeAttribute("inert-contenteditable");
  });
}

export function disableContentEditable() {
  document.querySelectorAll(SELECTOR).forEach(el => {
    const val = el.getAttribute("contenteditable") || "true";
    el.setAttribute("inert-contenteditable", val);
    el.removeAttribute("contenteditable");
  });
}

// Auto-initialize
export function init() {
  disableContentEditableBeforeSave();
  enableContentEditableForAdminOnPageLoad();
}

// Export to window
window.hyperclay = window.hyperclay || {};
window.hyperclay.enableContentEditable = enableContentEditable;
window.hyperclay.disableContentEditable = disableContentEditable;
window.h = window.hyperclay;
