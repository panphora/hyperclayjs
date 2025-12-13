/**
 * Save Toast Module
 *
 * Listens for save lifecycle events and shows toast notifications.
 * This is opt-in - only included if you want toast notifications.
 *
 * Events handled:
 * - hyperclay:save-saved   → success toast
 * - hyperclay:save-error   → error toast
 * - hyperclay:save-offline → error toast (treated as error for notifications)
 */

import toast from "../ui/toast.js";
import { isEditMode } from "./isAdminOfCurrentResource.js";

function init() {
  if (!isEditMode) return;

  document.addEventListener('hyperclay:save-saved', (e) => {
    const msg = e.detail?.msg || 'Saved';
    toast(msg, 'success');
  });

  document.addEventListener('hyperclay:save-error', (e) => {
    const msg = e.detail?.msg || 'Failed to save';
    toast(msg, 'error');
  });

  document.addEventListener('hyperclay:save-offline', (e) => {
    const msg = e.detail?.msg || 'No internet connection';
    toast(msg, 'error');
  });
}

init();

export default init;
