/**
 * host-attrs.js — the attributes a host puts on <html>, and what they mean.
 *
 * These are ephemeral: the host injects them into the response and strips them
 * back out of whatever the client saves, so they never reach disk. This library
 * only reads them, and reads them here so the two spellings of the save token
 * cannot drift between the discovery lane and the save lane — which is exactly
 * what they did, with host-meta.js reading both names while the save lane read
 * only the older one.
 *
 * Same filename and same contract in clayjs, so the two reference clients stay
 * answerable by a single diff.
 */

import { SAVE_TOKEN_ATTRS, LEGACY_SAVE_TOKEN_ATTRS } from "../utilities/root-attrs.js";

let warnedAboutLegacyToken = false;

/**
 * Say so, once, when this response carries only the pre-rename save token.
 *
 * Dropping the old spelling is a deliberate break (see root-attrs.js), and its failure
 * mode is the kind worth spending five lines on: the host that serves the old name also
 * sets the edit-mode cookie, so the page stays editable and every save 404s. Without
 * this the reader sees a working page that quietly keeps nothing.
 */
function warnAboutLegacyToken() {
  if (warnedAboutLegacyToken) return;
  const carries = LEGACY_SAVE_TOKEN_ATTRS.some(
    (attr) => document.documentElement.getAttribute(attr)
  );
  if (!carries) return;
  warnedAboutLegacyToken = true;
  console.warn(
    "[hyperclay] This page was served with the pre-1.9.0 save token (" +
      LEGACY_SAVE_TOKEN_ATTRS.join(", ") +
      "), which this version no longer accepts. Saving will fail until the host is " +
      "updated. If this is HTML Clay, upgrade it to 1.9.0 or newer."
  );
}

/**
 * The per-document save token this response carries, or null.
 *
 * Returns the first spelling present, so SAVE_TOKEN_ATTRS must contain nothing
 * but save tokens: whatever comes back is put straight into the save URL.
 *
 * @returns {?string}
 */
export function saveToken() {
  if (typeof document === "undefined") return null;
  for (const attr of SAVE_TOKEN_ATTRS) {
    const value = document.documentElement.getAttribute(attr);
    if (value) return value;
  }
  warnAboutLegacyToken();
  return null;
}

/**
 * True when this response carries ONLY the pre-rename save token.
 *
 * That combination means the host is older than the rename and cannot be saved to by
 * this library: it sends the old name, which is no longer read, and it sets the owner
 * cookie, so nothing else on the page would notice. Edit mode consults this so the page
 * does not offer editing it cannot keep.
 *
 * @returns {boolean}
 */
export function servedStaleToken() {
  if (typeof document === "undefined") return false;
  if (saveToken() !== null) return false;
  return LEGACY_SAVE_TOKEN_ATTRS.some(
    (attr) => document.documentElement.getAttribute(attr)
  );
}
