import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";
import onDomReady from "../dom/onDomReady.js";
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
    document.querySelectorAll('[edit-mode-resource]:is(style, link, script)[type^="inert/"]').forEach(resource => {
      // works for js and css
      resource.type = resource.type.replace(/inert\//g, '');
      resource.replaceWith(resource.cloneNode(true));
    });
  });
}