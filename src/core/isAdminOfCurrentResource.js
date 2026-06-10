import cookie from "../utilities/cookie.js";
import query from "../string-utilities/query.js";

// Edit-mode precedence: an explicit ?editmode=true|false URL param wins, then an
// opt-in window.__hyperclayEditMode global, then the platform's
// isAdminOfCurrentResource cookie. The global is for standalone uses (demos,
// htmlclay, any self-saving file) that are always editable and have no owner
// cookie; setting it before hyperclayjs loads turns on the edit-only modules.
const forcedEditMode =
  typeof window !== "undefined" && window.__hyperclayEditMode != null
    ? Boolean(window.__hyperclayEditMode)
    : null;

const isEditMode = query.editmode
  ? query.editmode === "true" // takes precedence over the global and cookie
  : forcedEditMode != null
    ? forcedEditMode
    : Boolean(cookie.get("isAdminOfCurrentResource"));

const isOwner = Boolean(cookie.get("isAdminOfCurrentResource"));

export {
  isEditMode,
  isOwner
}