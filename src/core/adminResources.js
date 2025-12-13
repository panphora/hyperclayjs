import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import {beforeSave} from "./savePage.js";

export function disableAdminResourcesBeforeSave () {
  beforeSave(docElem => {
    docElem.querySelectorAll('[edit-mode-resource]:is(style, link, script)').forEach(resource => {
      const currentType = resource.getAttribute('type') || 'text/javascript';
      // Only add the inert/ prefix if it's not already there
      if (!currentType.startsWith('inert/')) {
        resource.setAttribute('type', `inert/${currentType}`);
      }
    });
  });
}

export function enableAdminResourcesOnPageLoad () {
  if (!isEditMode) return;

  onDomReady(() => {
    enableAdminResources();
  });
}

// Runtime toggle functions
export function enableAdminResources() {
  document.querySelectorAll('[edit-mode-resource]:is(style, link, script)[type^="inert/"]').forEach(resource => {
    resource.type = resource.type.replace(/inert\//g, '');
    resource.replaceWith(resource.cloneNode(true));
  });
}

export function disableAdminResources() {
  document.querySelectorAll('[edit-mode-resource]:is(style, link, script)').forEach(resource => {
    const currentType = resource.getAttribute('type') || 'text/javascript';
    if (!currentType.startsWith('inert/')) {
      resource.setAttribute('type', `inert/${currentType}`);
      resource.replaceWith(resource.cloneNode(true));
    }
  });
}

// Auto-initialize
export function init() {
  disableAdminResourcesBeforeSave();
  enableAdminResourcesOnPageLoad();
}

// Export to window
window.hyperclay = window.hyperclay || {};
window.hyperclay.enableAdminResources = enableAdminResources;
window.hyperclay.disableAdminResources = disableAdminResources;
window.h = window.hyperclay;