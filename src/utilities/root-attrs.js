/**
 * root-attrs.js — the attributes that live on <html>, and who owns them.
 *
 * Three parties write to the root: the host at serve time, this library, and the
 * author. Only the author's belong to the document. The other two belong to one
 * response and one tab, which is why they are named here rather than inside the
 * modules that happen to read them — the observer has to ignore them, and a
 * peer's copy of them must never be applied.
 */

// The two spellings of the save token, in the order a reader tries them. Neither
// name ever goes away: `savetoken` is the spec's and `htmlclaytoken` the original,
// and a saved document is a frozen client hardcoding whichever library version
// wrote it, so hosts keep serving the old name to documents written years ago.
//
// Save tokens ONLY. host-attrs.js returns the first of these it finds and puts it
// in the save URL, so any name added here becomes a credential in a path. A
// durable per-file identity (the spec's `documentid`, htmlclay's `htmlclayid`) is
// host-injected and wants the morph protection below, but it is not a credential
// and it does reach disk: add such a name to HOST_TOKEN_ATTRS, never here.
export const SAVE_TOKEN_ATTRS = ["savetoken", "htmlclaytoken"];

// Injected by the host at serve time. Spec §9 bounds a save token to per-file and
// per-tab and makes the host strip it before writing, so it never reaches disk.
// But §9 bounds only the save path, and §10 fans a snapshot out to other editors'
// browsers, which is the hole this module closes.
//
// Derived from SAVE_TOKEN_ATTRS so the two lists can never disagree about the
// token spellings, and kept separate so a durable identity attribute can join the
// morph protection without also becoming a save credential.
export const HOST_TOKEN_ATTRS = [...SAVE_TOKEN_ATTRS];

// This library's own root state, and this tab's UI truth.
export const ROOT_LIBRARY_ATTRS = ["savestatus", "editmode", "pageowner"];

// Never copied between tabs: not written onto this root by an incoming morph, not
// sent out on a sync broadcast.
//
// Both directions matter, and each was found separately. Accepting a peer's token
// makes every later save go out as that peer, and keeps working after this tab's
// own access is revoked, because revocation cannot reach a token minted for
// somebody else. Accepting a peer's ABSENCE of one is the mirror failure logged in
// documentid.md §5: a token-stripped broadcast removes this tab's own token and it
// can no longer save at all.
export const TAB_LOCAL_ROOT_ATTRS = new Set([
  ...HOST_TOKEN_ATTRS,
  ...ROOT_LIBRARY_ATTRS,
]);

/**
 * True when an incoming morph must be kept away from this attribute.
 * Scoped to the root: the same names anywhere else are the author's business.
 */
export function isTabLocalRootAttr(name, element) {
  return element === document.documentElement && TAB_LOCAL_ROOT_ATTRS.has(name);
}
