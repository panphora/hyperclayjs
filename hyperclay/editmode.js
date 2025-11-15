import { isEditMode, isOwner } from "./isAdminOfCurrentResource.js";

export function toggleEditMode() {
  const url = new URL(window.location.href);
  const newMode = isEditMode ? "false" : "true";
  url.searchParams.set('editmode', newMode);
  window.location.href = url.toString();
}