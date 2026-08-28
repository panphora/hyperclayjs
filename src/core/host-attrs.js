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

import { SAVE_TOKEN_ATTRS } from "../utilities/root-attrs.js";

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
  return null;
}
