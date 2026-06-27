/**
 * region-policy.js — the region capability model.
 *
 * A region declares how it participates in the framework via a small set of
 * orthogonal naked attributes (set on an element; they apply to it and its
 * descendants):
 *
 *   no-save               — not written to the saved file (stripped). Live at runtime.
 *   no-trigger-autosave   — saved, but editing it doesn't trigger an autosave / mark dirty.
 *   no-undo               — edits here are not recorded in the undo stack.
 *   no-watch              — invisible to the whole mutation system (high-churn regions). Still saved.
 *   freeze                — saved as authored (runtime changes not persisted). Live at runtime.
 *
 * Four legacy markers map onto bundles of the above for back-compat. They all
 * additionally gain "watched" (behaviors now run inside them):
 *
 *   mutations-ignore  ->  no-watch
 *   save-remove       ->  no-save  no-undo
 *   save-ignore       ->  no-trigger-autosave  no-undo
 *   save-freeze       ->  freeze  no-undo
 *
 * Separately, a snapshot-layer marker controls whether an element appears in any
 * snapshot at all (save file, live-sync broadcast, and dirty-comparison):
 *
 *   snapshot-remove / no-snapshot  — removed from every snapshot. Runtime-only
 *     local chrome. hyper-morph also treats it as sync-ignored, so a live-sync
 *     receiver preserves its own copy instead of deleting it. Handled in
 *     snapshot.js, not by the policy axes below; no-snapshot is the consistent
 *     alias for the original snapshot-remove.
 *
 * resolveRegionPolicy() walks an element's self-or-ancestor chain once and
 * returns the four independent axes the rest of the framework keys off:
 *   { watched, autosaveTriggered, undoable, persist, extension }
 */

import { EXTENSION_NODE_SELECTOR } from './extension-noise.js';

export const PERSIST = { FULL: 'full', FROZEN: 'frozen', NONE: 'none' };

// The new naked attributes (the canonical model).
export const REGION_ATTRS = ['no-save', 'no-trigger-autosave', 'no-undo', 'no-watch', 'freeze'];

// Serializer selectors (recognize both new + legacy spellings).
export const STRIP_FROM_SAVE = '[no-save], [save-remove]';
export const FREEZE_SELECTOR = '[freeze], [save-freeze]';
// forComparison additionally strips every region whose autosave-trigger is off,
// so their churn never marks the page dirty — including the no-watch /
// mutations-ignore footgun (their content stays in the saved file, but is no
// longer counted as a change).
export const STRIP_FROM_COMPARISON =
  '[no-save], [save-remove], [no-trigger-autosave], [save-ignore], [freeze], [save-freeze], [no-watch], [mutations-ignore]';

// Snapshot-layer marker: removed from EVERY snapshot (save, live-sync broadcast,
// dirty-comparison) in snapshot.js. `no-snapshot` is the consistent alias for the
// original `snapshot-remove`; hyper-morph treats both as sync-ignored so a
// live-sync receiver keeps its own local copy instead of deleting it.
export const SNAPSHOT_REMOVE_SELECTOR = '[snapshot-remove], [no-snapshot]';

export function isSnapshotRemoved(el) {
  return el.hasAttribute('snapshot-remove') || el.hasAttribute('no-snapshot');
}

const PERSIST_RANK = { full: 0, frozen: 1, none: 2 };
const RANK_PERSIST = ['full', 'frozen', 'none'];

function startElement(node) {
  return node && node.nodeType !== 1 ? node.parentElement : node;
}

/**
 * Walk an element's self-or-ancestor chain once and resolve its region axes.
 *
 * @param {Node} node
 * @returns {{watched:boolean, autosaveTriggered:boolean, undoable:boolean, persist:string, extension:boolean}}
 */
export function resolveRegionPolicy(node) {
  let element = startElement(node);

  // Browser-extension injected content is never page content, for any consumer.
  if (element && element.closest && element.closest(EXTENSION_NODE_SELECTOR)) {
    return { watched: false, autosaveTriggered: false, undoable: false, persist: PERSIST.FULL, extension: true };
  }

  let watched = true;
  let undoable = true;
  let autosaveOff = false;
  let persistRank = 0;

  while (element && element.nodeType === 1) {
    if (element.hasAttribute) {
      // new naked attributes
      if (element.hasAttribute('no-watch')) watched = false;
      if (element.hasAttribute('no-trigger-autosave')) autosaveOff = true;
      if (element.hasAttribute('no-undo')) undoable = false;
      if (element.hasAttribute('no-save')) persistRank = Math.max(persistRank, PERSIST_RANK.none);
      if (element.hasAttribute('freeze')) persistRank = Math.max(persistRank, PERSIST_RANK.frozen);
      // legacy markers -> bundles
      if (element.hasAttribute('mutations-ignore')) watched = false;
      if (element.hasAttribute('save-remove')) { persistRank = Math.max(persistRank, PERSIST_RANK.none); undoable = false; }
      if (element.hasAttribute('save-ignore')) { autosaveOff = true; undoable = false; }
      if (element.hasAttribute('save-freeze')) { persistRank = Math.max(persistRank, PERSIST_RANK.frozen); undoable = false; }
    }
    element = element.parentElement;
  }

  // Implication rules (no-save wins over freeze automatically via Math.max above):
  //   no-watch  ⟹ no autosave + no undo (can't track what isn't watched)
  //   no-save / freeze ⟹ no autosave (nothing live to persist)
  if (!watched) { autosaveOff = true; undoable = false; }
  if (persistRank > 0) autosaveOff = true;

  return {
    watched,
    autosaveTriggered: !autosaveOff,
    undoable,
    persist: RANK_PERSIST[persistRank],
    extension: false,
  };
}

/**
 * Cheap intake-level check: is a node invisible to EVERY consumer?
 *
 * Only no-watch / mutations-ignore (and extension noise) qualify — they're the
 * one universal drop, so the observer can skip walking those subtrees entirely.
 * All other region attributes are resolved per-consumer in Mutation._notify.
 *
 * @param {Node} node
 * @returns {boolean}
 */
export function isInert(node) {
  let element = startElement(node);
  if (element && element.closest && element.closest(EXTENSION_NODE_SELECTOR)) return true;
  while (element && element.nodeType === 1) {
    if (element.hasAttribute &&
        (element.hasAttribute('no-watch') || element.hasAttribute('mutations-ignore'))) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}

/**
 * Combine two resolved policies into the stricter of each axis. Used to merge a
 * removed (detached) element's own markers with its still-attached parent's.
 */
export function strictestPolicy(a, b) {
  return {
    watched: a.watched && b.watched,
    autosaveTriggered: a.autosaveTriggered && b.autosaveTriggered,
    undoable: a.undoable && b.undoable,
    persist: PERSIST_RANK[a.persist] >= PERSIST_RANK[b.persist] ? a.persist : b.persist,
    extension: a.extension || b.extension,
  };
}

// Literal `skip:[...]` escape-hatch tokens -> axis predicate.
const SKIP_TOKEN_PREDICATES = {
  'no-watch': p => !p.watched,
  'mutations-ignore': p => !p.watched,
  'no-save': p => p.persist === PERSIST.NONE,
  'save-remove': p => p.persist === PERSIST.NONE,
  'freeze': p => p.persist === PERSIST.FROZEN,
  'save-freeze': p => p.persist === PERSIST.FROZEN,
  'no-trigger-autosave': p => !p.autosaveTriggered,
  'save-ignore': p => !p.autosaveTriggered,
  'no-undo': p => !p.undoable,
};

/**
 * Should a consumer skip a change in this region?
 *
 * @param {object} policy   resolved region policy
 * @param {string} [require] axis the consumer needs: 'observed' | 'autosave' | 'undo'
 * @param {string[]} [skip]  literal attribute escape-hatch (any match -> skip)
 * @returns {boolean}
 */
export function skipForPolicy(policy, require, skip) {
  if (policy.extension) return true;
  if (skip && skip.length) {
    return skip.some(tok => SKIP_TOKEN_PREDICATES[tok]?.(policy) || false);
  }
  switch (require) {
    case 'observed': return !policy.watched;
    case 'autosave': return !policy.autosaveTriggered;
    case 'undo': return !policy.undoable;
    default:
      // No require declared: preserve the legacy four-marker skip so unmodified
      // consumers behave exactly as before. (Undo-only opt-outs still pass.)
      return !policy.watched || !policy.autosaveTriggered || policy.persist !== PERSIST.FULL;
  }
}

// Expose the canonical region API on window so the vendored hyper-undo (a
// separate bundle that can't import this module) can delegate "is this
// undoable?" to the SAME resolver instead of hand-mirroring the marker list —
// the two can no longer drift. Standalone undo (no hyperclay) keeps its own
// fallback list. Guarded like the other modules' auto-exports.
if (typeof window !== 'undefined' && !window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.region = {
    resolveRegionPolicy,
    isInert,
    skipForPolicy,
    strictestPolicy,
    PERSIST,
    REGION_ATTRS,
    STRIP_FROM_SAVE,
    FREEZE_SELECTOR,
    STRIP_FROM_COMPARISON,
  };
  window.h = window.hyperclay;
}
