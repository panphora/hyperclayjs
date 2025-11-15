/* 

   Make elements drag-and-drop sortable
   
   How to use:
   - add `sortable` attribute to an element to make children sortable
   - e.g. <div sortable></div>
   
*/
import { isEditMode, isOwner } from "../core/isAdminOfCurrentResource.js";
import Mutation from "../utilities/mutation.js";
import Sortable from '../vendor/Sortable.js';

function makeSortable (sortableElem) {
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

  Sortable.create(sortableElem, options);
}

export default function init () {
  if (!isEditMode) return;

  // Set up sortable on page load
  document.querySelectorAll('[sortable]').forEach(makeSortable);

  // Set up listener for dynamically added elements
  Mutation.onAddElement({
    selectorFilter: "[sortable]",
    debounce: 200
  }, (changes) => {
    changes.forEach(({ element }) => {
      makeSortable(element);
    });
  });

  // ❗️re-initializing sortable on parent elements isn't necessary
  // sortable.js handles this automatically
  // ❌ onElementAdded(newElem => makeSortable(newElem.closest('[sortable]')))
}



