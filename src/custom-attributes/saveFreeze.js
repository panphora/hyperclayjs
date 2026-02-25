/**
 * [save-freeze] Custom Attribute
 *
 * Freezes an element's innerHTML for save purposes.
 * The live DOM can change freely, but the saved HTML always
 * contains the original content captured when the element first appeared.
 *
 * Usage:
 *   <div save-freeze>Content that JS will modify at runtime</div>
 *
 * The original innerHTML is captured:
 *   - On page load, for all existing [save-freeze] elements
 *   - On DOM insertion, for dynamically added [save-freeze] elements
 *
 * At save time, the clone's innerHTML is replaced with the stored original.
 * Changes inside [save-freeze] elements do not trigger autosave dirty checks.
 */

import { onSnapshot, onPrepareForSave } from "../core/snapshot.js";
import { isEditMode } from "../core/isAdminOfCurrentResource.js";

const originals = new WeakMap();

const saveFreeze = { debug: false };

function log(...args) {
  if (saveFreeze.debug) console.log('[save-freeze]', ...args);
}

function capture(el) {
  if (!originals.has(el)) {
    originals.set(el, el.innerHTML);
    log('captured original', el.innerHTML.substring(0, 80) + '...');
  }
}

function captureAll() {
  const els = document.querySelectorAll('[save-freeze]');
  log('captureAll found', els.length, 'elements');
  for (const el of els) {
    capture(el);
  }
}

function freezeClone(clone) {
  const liveElements = document.querySelectorAll('[save-freeze]');
  const cloneElements = clone.querySelectorAll('[save-freeze]');

  log('freezing clone — live:', liveElements.length, 'clone:', cloneElements.length);

  for (let i = 0; i < cloneElements.length; i++) {
    const liveEl = liveElements[i];
    const hasOriginal = liveEl && originals.has(liveEl);
    if (hasOriginal) {
      const original = originals.get(liveEl);
      const current = cloneElements[i].innerHTML;
      if (original !== current) {
        log('element', i, '— restoring original');
        cloneElements[i].innerHTML = original;
      }
    }
  }
}

function init() {
  log('init, isEditMode:', isEditMode);
  if (!isEditMode) return;

  captureAll();

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.hasAttribute?.('save-freeze')) capture(node);
        for (const el of node.querySelectorAll?.('[save-freeze]') || []) {
          capture(el);
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Phase 2: Freeze in snapshot — before snapshot-ready fires.
  // This prevents live-sync from writing unfrozen content to disk.
  onSnapshot(freezeClone);

  // Phase 3a: Freeze again in prepare — belt-and-suspenders.
  // Catches any modifications made between phase 2 and 3a (e.g., onbeforesave handlers).
  onPrepareForSave(freezeClone);
}

init();

export default saveFreeze;
