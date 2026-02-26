import { onSnapshot } from './snapshot.js';

// Persistent Form Input Values
//
// Problem: Browser form values (.value, .checked, .selectedIndex) live in JS
// memory, not in DOM attributes. When Hyperclay serializes the page via
// cloneNode() or outerHTML, those JS-only values are lost. This module syncs
// them back to the DOM so they survive saves, live-sync, and cloning.
//
// Strategy: sync to the DOM immediately on every user interaction, not just at
// snapshot time. This means cloneNode() always gets current values.
//
// Why this is safe for each element type:
//
//   <input type="text">  — setAttribute("value", ...) updates the DOM attribute
//     but does NOT change the displayed text or cursor position. The browser's
//     "dirty value flag" (WHATWG spec) means that once a user has typed into an
//     input, the browser ignores attribute changes for display purposes. The
//     attribute and the live .value property become independent surfaces.
//
//   <select>  — Setting/removing the "selected" attribute on <option> elements
//     has no side effects on display or interaction.
//
//   <input type="checkbox/radio">  — Setting/removing the "checked" attribute
//     has no side effects.
//
//   <textarea>  — The hard case. Unlike <input>, a textarea stores its default
//     value as child text nodes, not an attribute. Writing textContent while
//     focused destroys cursor position, scroll, and selection. So instead, we
//     write to a harmless "data-value" attribute on every keystroke (completely
//     inert — no cursor, scroll, or reflow). At snapshot time, the onSnapshot
//     hook reads data-value from the cloned textarea, writes it into the
//     clone's textContent, and strips the attribute. The saved HTML is clean.
//
// The onSnapshot hook also serves as a safety net for all types, catching any
// values that weren't synced by the live listeners (e.g., a textarea that was
// never typed into but had its value set programmatically).
//
// Synergy with onclone (custom-attributes/onclone.js):
// When event-attrs is loaded, its cloneNode() intercept (onclone.js) patches
// data-value into textContent on cloned textareas automatically.

export default function enablePersistentFormInputValues(filterBySelector = "[persist]") {
  const inputSelector = `input${filterBySelector}:not([type="password"]):not([type="hidden"]):not([type="file"])`;
  const textareaSelector = `textarea${filterBySelector}`;
  const selectSelector = `select${filterBySelector}`;

  // --- Live DOM sync: keep attributes in sync on every user interaction ---

  document.addEventListener('input', (e) => {
    const el = e.target;

    // Text-like inputs: setAttribute("value") is safe — dirty flag prevents display change
    if (el.matches(inputSelector) && el.type !== 'checkbox' && el.type !== 'radio') {
      el.setAttribute('value', el.value);
      return;
    }

    // Textareas: write to data-value (inert, no cursor/scroll disruption)
    if (el.matches(textareaSelector)) {
      el.setAttribute('data-value', el.value);
      return;
    }
  }, true);

  document.addEventListener('change', (e) => {
    const el = e.target;

    // Checkboxes and radios
    if (el.matches(inputSelector) && (el.type === 'checkbox' || el.type === 'radio')) {
      el.checked ? el.setAttribute('checked', '') : el.removeAttribute('checked');
      return;
    }

    // Selects: sync selected attribute on options
    if (el.matches(selectSelector)) {
      const options = el.querySelectorAll('option');
      options.forEach(opt => opt.removeAttribute('selected'));
      if (el.multiple) {
        Array.from(el.selectedOptions).forEach(opt => {
          const idx = Array.from(el.options).indexOf(opt);
          if (options[idx]) options[idx].setAttribute('selected', '');
        });
      } else if (el.selectedIndex >= 0 && options[el.selectedIndex]) {
        options[el.selectedIndex].setAttribute('selected', '');
      }
      return;
    }
  }, true);

  // --- Snapshot hook: final safety net at serialize time ---

  onSnapshot((doc) => {
    // Guard: if another onSnapshot hook mutated the clone, lists may diverge
    const liveInputs = document.querySelectorAll(inputSelector);
    const clonedInputs = doc.querySelectorAll(inputSelector);
    clonedInputs.forEach((cloned, i) => {
      const live = liveInputs[i];
      if (!live) return;
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

    // Always read the live .value — it's the true source of truth.
    // data-value is useful for cloneNode() outside of snapshots, but here
    // we must use .value because code may have set textarea.value directly
    // without firing an input event (which would leave data-value stale).
    const liveTextareas = document.querySelectorAll(textareaSelector);
    const clonedTextareas = doc.querySelectorAll(textareaSelector);
    clonedTextareas.forEach((cloned, i) => {
      const live = liveTextareas[i];
      if (!live) return;
      cloned.textContent = live.value;
      cloned.removeAttribute('data-value');
    });

    const liveSelects = document.querySelectorAll(selectSelector);
    const clonedSelects = doc.querySelectorAll(selectSelector);
    clonedSelects.forEach((cloned, i) => {
      const live = liveSelects[i];
      if (!live) return;
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
