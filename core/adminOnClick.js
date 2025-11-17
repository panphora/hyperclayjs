import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import {beforeSave} from "./savePage.js";

export function disableOnClickBeforeSave () {
  beforeSave(docElem => {
    docElem.querySelectorAll('[edit-mode-onclick]').forEach(resource => {
      const originalValue = resource.getAttribute("onclick");
      resource.setAttribute("inert-onclick", originalValue);
      resource.removeAttribute("onclick");
    });
  });
}

export function enableOnClickForAdminOnPageLoad () {
  if (!isEditMode) return;

  onDomReady(() => {
    document.querySelectorAll('[edit-mode-onclick]').forEach(resource => {
      const originalValue = resource.getAttribute("inert-onclick");
      resource.setAttribute("onclick", originalValue);
      resource.removeAttribute("inert-onclick");
    });
  });
}

// Auto-initialize
export function init() {
  disableOnClickBeforeSave();
  enableOnClickForAdminOnPageLoad();
}