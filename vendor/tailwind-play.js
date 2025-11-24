/*
  Tailwind Play - Live Tailwind CSS editing in edit mode

  This is a lightweight wrapper that conditionally loads the full Tailwind Play
  script (~370KB) only when in edit mode. The script is injected with save-ignore
  so it's stripped from the page before saving.

  Usage: Just include this module - it auto-initializes if in edit mode.
*/

import { isEditMode } from "../core/isAdminOfCurrentResource.js";
import { loadVendorScript, getVendorUrl } from "../utilities/loadVendorScript.js";

function init() {
  if (!isEditMode) return;
  loadVendorScript(getVendorUrl(import.meta.url, 'tailwind-play.vendor.js'), { module: true });
}

// Auto-init when module is imported
init();

export { init };
export default init;
