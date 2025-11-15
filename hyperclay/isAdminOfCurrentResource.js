import cookie from "../browser/cookie.js";
import query from "../browser/query.js";

const isEditMode = query.editmode 
  ? query.editmode === "true" // takes precedence over cookie
  : Boolean(cookie.get("isAdminOfCurrentResource"));

const isOwner = Boolean(cookie.get("isAdminOfCurrentResource"));

export {
  isEditMode,
  isOwner
}