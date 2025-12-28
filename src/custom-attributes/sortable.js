/*

   Make elements drag-and-drop sortable

   How to use:
   - add `sortable` attribute to an element to make children sortable
   - e.g. <div sortable></div>
   - add `onsorting` attribute to execute code during drag
   - e.g. <ul sortable onsorting="console.log('Dragging!')"></ul>
   - add `onsorted` attribute to execute code when items are sorted
   - e.g. <ul sortable onsorted="console.log('Items reordered!')"></ul>

   This wrapper conditionally loads the full Sortable.js vendor script (~118KB)
   only when in edit mode. The script is injected with save-remove so it's
   stripped from the page before saving.

*/
import { isEditMode } from "../core/isAdminOfCurrentResource.js";
import Mutation from "../utilities/mutation.js";
import { loadVendorScript, getVendorUrl } from "../utilities/loadVendorScript.js";

function makeSortable(sortableElem, Sortable) {
  let options = {};

  // Check if Sortable instance already exists
  if (Sortable.get(sortableElem)) return;

  const groupName = sortableElem.getAttribute('sortable');
  if (groupName) options.group = groupName;

  // Check for handles, but exclude those inside nested sortable elements
  const handles = sortableElem.querySelectorAll('[sortable-handle]');
  const nestedSortables = sortableElem.querySelectorAll('[sortable]');

  // Check if any handle is NOT inside a nested sortable
  const hasDirectHandle = Array.from(handles).some(handle => {
    return !Array.from(nestedSortables).some(nested => nested.contains(handle));
  });

  if (hasDirectHandle) {
    options.handle = '[sortable-handle]';
  }

  // Add onsorting callback if attribute exists (fires during drag)
  const onsortingCode = sortableElem.getAttribute('onsorting');
  if (onsortingCode) {
    options.onMove = function(evt) {
      try {
        const asyncFn = new Function(`return (async function(evt) { ${onsortingCode} })`)();
        asyncFn.call(sortableElem, evt);
      } catch (error) {
        console.error('Error in onsorting execution:', error);
      }
    };
  }

  // Add onsorted callback if attribute exists (fires after drop)
  const onsortedCode = sortableElem.getAttribute('onsorted');
  if (onsortedCode) {
    options.onEnd = function(evt) {
      try {
        const asyncFn = new Function(`return (async function(evt) { ${onsortedCode} })`)();
        asyncFn.call(sortableElem, evt);
      } catch (error) {
        console.error('Error in onsorted execution:', error);
      }
    };
  }

  Sortable.create(sortableElem, options);
}

async function init() {
  if (!isEditMode) return;

  // Load the vendor script
  const vendorUrl = getVendorUrl(import.meta.url, '../vendor/Sortable.vendor.js');
  const Sortable = await loadVendorScript(vendorUrl, 'Sortable');

  // Auto-export to window unless suppressed by loader
  if (!window.__hyperclayNoAutoExport) {
    window.Sortable = Sortable;
    window.hyperclay = window.hyperclay || {};
    window.hyperclay.Sortable = Sortable;
    window.h = window.hyperclay;
  }

  // Set up sortable on page load
  document.querySelectorAll('[sortable]').forEach(el => makeSortable(el, Sortable));

  // Set up listener for dynamically added elements
  Mutation.onAddElement({
    selectorFilter: "[sortable]",
    debounce: 200
  }, (changes) => {
    changes.forEach(({ element }) => {
      makeSortable(element, Sortable);
    });
  });
}

// Auto-init when module is imported
init();

export { init };
export default init;
