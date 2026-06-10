import autosize from './autosize.esm.js';
import Mutation from '../utilities/mutation.js';

function init() {
  document.querySelectorAll('textarea[autosize]').forEach(autosize);

  // Size dynamically added textareas. Folded onto the single Mutation observer
  // (Phase 2 — was its own MutationObserver). Mutation expands added subtrees, so
  // the selectorFilter catches a textarea[autosize] whether it IS the added node
  // or sits inside one. require:'observed' (run everywhere except no-watch);
  // pausable:false so a morphed-in textarea still sizes; debounce:0 to size
  // immediately. Pure enhancer — its only DOM write is the textarea's own height.
  Mutation.onAddElement({
    selectorFilter: 'textarea[autosize]',
    require: 'observed',
    pausable: false,
    debounce: 0
  }, (changes) => {
    changes.forEach(({ element }) => autosize(element));
  });
}

export { init };
export default init;
