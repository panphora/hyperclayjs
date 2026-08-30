import cookie from "../utilities/cookie.js";
import query from "../string-utilities/query.js";
import { servedStaleToken } from "./host-attrs.js";

// Edit-mode precedence: an explicit ?editmode=true|false URL param wins, then an
// opt-in window.__hyperclayEditMode global, then the platform's
// isAdminOfCurrentResource cookie. The global is for standalone uses (demos,
// htmlclay, any self-saving file) that are always editable and have no owner
// cookie; setting it before hyperclayjs loads turns on the edit-only modules.
const forcedEditMode =
  typeof window !== "undefined" && window.__hyperclayEditMode != null
    ? Boolean(window.__hyperclayEditMode)
    : null;

// A host older than the save-token rename takes edit mode off the table, above the
// global and the cookie. Such a host sends the pre-rename token, which this library no
// longer reads, AND sets the owner cookie, so without this the page opens fully
// editable and every save 404s against a route that host does not have. An editable
// page that keeps nothing is worse than a read-only one.
//
// Only an explicit ?editmode=true outranks it: that is a person asking for it on this
// load, not a decision baked into a document by an author who could not have known.
//
// The on-page half of this lives in clayjs (core/stale-host-notice.js). Here it stays a
// console line plus this: the documents that reach a token-minting host through THIS
// library are the tail of a library being retired, and a new UI surface in it would
// itself be frozen into every page still loading it.
const isEditMode = query.editmode
  ? query.editmode === "true" // takes precedence over the global and cookie
  : servedStaleToken()
    ? false
    : forcedEditMode != null
      ? forcedEditMode
      : Boolean(cookie.get("isAdminOfCurrentResource"));

const isOwner = Boolean(cookie.get("isAdminOfCurrentResource"));

export {
  isEditMode,
  isOwner
}