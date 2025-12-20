import { onSnapshot } from './snapshot.js';

// <input type="checkbox" persist>
export default function enablePersistentFormInputValues(filterBySelector = "[persist]") {
  const inputSelector = `input${filterBySelector}:not([type="password"]):not([type="hidden"]):not([type="file"])`;
  const textareaSelector = `textarea${filterBySelector}`;
  const selectSelector = `select${filterBySelector}`;

  // Use onSnapshot so form values are synced for both save AND live-sync
  onSnapshot((doc) => {
    // Sync text inputs
    const liveInputs = document.querySelectorAll(inputSelector);
    const clonedInputs = doc.querySelectorAll(inputSelector);
    clonedInputs.forEach((cloned, i) => {
      const live = liveInputs[i];
      if (live.type === 'checkbox' || live.type === 'radio') {
        if (live.checked) {
          cloned.setAttribute('checked', '');
        } else {
          cloned.removeAttribute('checked');
        }
      } else {
        cloned.setAttribute('value', live.value);
      }
    });

    // Sync textareas
    const liveTextareas = document.querySelectorAll(textareaSelector);
    const clonedTextareas = doc.querySelectorAll(textareaSelector);
    clonedTextareas.forEach((cloned, i) => {
      cloned.textContent = liveTextareas[i].value;
    });

    // Sync selects
    const liveSelects = document.querySelectorAll(selectSelector);
    const clonedSelects = doc.querySelectorAll(selectSelector);
    clonedSelects.forEach((cloned, i) => {
      const live = liveSelects[i];
      const clonedOptions = cloned.querySelectorAll('option');
      clonedOptions.forEach(opt => opt.removeAttribute('selected'));

      if (live.multiple) {
        Array.from(live.selectedOptions).forEach(opt => {
          const idx = Array.from(live.options).indexOf(opt);
          if (clonedOptions[idx]) clonedOptions[idx].setAttribute('selected', '');
        });
      } else if (live.selectedIndex >= 0 && clonedOptions[live.selectedIndex]) {
        clonedOptions[live.selectedIndex].setAttribute('selected', '');
      }
    });
  });
}

// Auto-initialize with default selector
export function init() {
  enablePersistentFormInputValues("[persist]");
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.enablePersistentFormInputValues = enablePersistentFormInputValues;
  window.h = window.hyperclay;
}

// Auto-init when module is imported
init();
