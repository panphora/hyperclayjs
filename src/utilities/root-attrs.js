/**
 * root-attrs.js — the attributes that live on <html>, and who owns them.
 *
 * Three parties write to the root: the host at serve time, this library, and the
 * author. Only the author's belong to the document. The other two belong to one
 * response and one tab, which is why they are named here rather than inside the
 * modules that happen to read them — the observer has to ignore them, and a
 * peer's copy of them must never be applied.
 */

// One name, deliberately. §9 names exactly one save-token attribute.
//
// Save tokens ONLY. host-attrs.js returns the first of these it finds and puts it in
// the save URL, so any name added here becomes a credential in a path. A durable
// per-file identity (the spec's `documentid`, htmlclay's `htmlclayid`) is host-injected
// and wants the morph protection below, but it is not a credential and it does reach
// disk: add such a name to HOST_TOKEN_ATTRS, never here.
//
// Dropping the pre-rename spelling is a knowing break, not an oversight. htmlclay is
// the only host that mints a save token at all, it serves both spellings only from
// 1.9.0, and this library loads from a rolling CDN URL, so it updates itself inside
// documents whose host has not moved. Taken now because the cost only grows, and the
// alternative is a second credential name in the save path permanently.
//
// ⚠️ RELEASE ORDER: htmlclay 1.9.0, which injects both names, must publish BEFORE this.
export const SAVE_TOKEN_ATTRS = ["savetoken"];

// The pre-rename spelling. Never read as a credential, and never removed from
// HOST_TOKEN_ATTRS below, which is a different job: a name a host may inject has to go
// on being stripped before a save and kept out of a peer's morph, or a live token gets
// written into a document or handed to another tab.
export const LEGACY_SAVE_TOKEN_ATTRS = ["htmlclaytoken"];

// Injected by the host at serve time. Spec §9 bounds a save token to per-file and
// per-tab and makes the host strip it before writing, so it never reaches disk.
// But §9 bounds only the save path, and §10 fans a snapshot out to other editors'
// browsers, which is the hole this module closes.
//
// The durable per-file identity, in the spec's spelling and the pre-spec one, in
// the order a reader tries them. Host-injected but NOT a credential, which is why
// it lives here and not in SAVE_TOKEN_ATTRS: putting it there would make this
// library POST to /_/save/{id} whenever a host minted no token of its own.
//
// Both spellings are permanent. htmlclay serves `documentid` and reads either, but
// every .htmlclay file saved before that rename holds `htmlclayid` on disk forever,
// and this list is what a morph consults.
export const HOST_IDENTITY_ATTRS = ["documentid", "htmlclayid"];

// Derived from the lists above so they can never disagree about the token
// spellings, and kept separate so a name can join the morph protection without also
// becoming a save credential. What a host may inject is what must be stripped,
// whether or not this library still reads it.
export const HOST_TOKEN_ATTRS = [
  ...SAVE_TOKEN_ATTRS,
  ...LEGACY_SAVE_TOKEN_ATTRS,
  ...HOST_IDENTITY_ATTRS,
];

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
