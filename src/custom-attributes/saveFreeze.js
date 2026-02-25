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

import { onPrepareForSave } from "../core/snapshot.js";
import { isEditMode } from "../core/isAdminOfCurrentResource.js";

const originals = new WeakMap();

function capture(el) {
  if (!originals.has(el)) {
    originals.set(el, el.innerHTML);
  }
}

function captureAll() {
  for (const el of document.querySelectorAll('[save-freeze]')) {
    capture(el);
  }
}

function init() {
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

  onPrepareForSave(clone => {
    const liveElements = document.querySelectorAll('[save-freeze]');
    const cloneElements = clone.querySelectorAll('[save-freeze]');

    for (let i = 0; i < cloneElements.length; i++) {
      const liveEl = liveElements[i];
      if (liveEl && originals.has(liveEl)) {
        cloneElements[i].innerHTML = originals.get(liveEl);
      }
    }
  });
}

init();

export default init;
