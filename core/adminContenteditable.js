import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import {beforeSave} from "./savePage.js";

export function disableContentEditableBeforeSave () {
  beforeSave(docElem => {
    docElem.querySelectorAll('[edit-mode-contenteditable]').forEach(resource => {
      const originalValue = resource.getAttribute("contenteditable");
      resource.setAttribute("inert-contenteditable", originalValue);
      resource.removeAttribute("contenteditable");
    });
  });
}

export function enableContentEditableForAdminOnPageLoad () {
  if (!isEditMode) return;

  onDomReady(() => {
    document.querySelectorAll('[edit-mode-contenteditable]').forEach(resource => {
      let originalValue = resource.getAttribute("inert-contenteditable");

      if (!["false", "plaintext-only"].includes(originalValue)) {
        originalValue = "true";
      }

      resource.setAttribute("contenteditable", originalValue);
      resource.removeAttribute("inert-contenteditable");
    });
  });
}

// Auto-initialize
export function init() {
  disableContentEditableBeforeSave();
  enableContentEditableForAdminOnPageLoad();
}