import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import {beforeSave} from "./savePage.js";

export function setViewerPageTypeBeforeSave () {
  beforeSave(docElem => {
    docElem.setAttribute("editmode", "false");
    docElem.setAttribute("pageowner", "false");
  });
}

export function setPageTypeOnPageLoad () {
  onDomReady(() => {
    document.documentElement.setAttribute("editmode", isEditMode ? "true" : "false");
    document.documentElement.setAttribute("pageowner", isOwner ? "true" : "false");
  });
}

// Auto-initialize
export function init() {
  setViewerPageTypeBeforeSave();
  setPageTypeOnPageLoad();
}