import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import { beforeSave } from "./savePage.js";

const SELECTOR_DISABLED = '[viewmode\\:disabled]';
const SELECTOR_READONLY = '[viewmode\\:readonly]';

export function disableAdminInputsBeforeSave() {
  beforeSave(docElem => {
    docElem.querySelectorAll(SELECTOR_DISABLED).forEach(input => {
      input.setAttribute('disabled', '');
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

export function enableAdminInputs() {
  document.querySelectorAll(SELECTOR_DISABLED).forEach(input => {
    input.removeAttribute('disabled');
  });
  document.querySelectorAll(SELECTOR_READONLY).forEach(input => {
    input.removeAttribute('readonly');
  });
}

export function disableAdminInputs() {
  document.querySelectorAll(SELECTOR_DISABLED).forEach(input => {
    input.setAttribute('disabled', '');
  });
  document.querySelectorAll(SELECTOR_READONLY).forEach(input => {
    input.setAttribute('readonly', '');
  });
}

export function init() {
  disableAdminInputsBeforeSave();
  enableAdminInputsOnPageLoad();
}

window.hyperclay = window.hyperclay || {};
window.hyperclay.enableAdminInputs = enableAdminInputs;
window.hyperclay.disableAdminInputs = disableAdminInputs;
window.h = window.hyperclay;
