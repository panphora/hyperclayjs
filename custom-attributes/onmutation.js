/*
   [onmutation] - Trigger code when this element or its children change

   Usage:
   <div onmutation="console.log('My content changed')">
     <span contenteditable>Edit me</span>
   </div>

   Unlike [onglobalmutation]/[onpagemutation] which fires on ANY DOM change,
   [onmutation] only fires when the element itself or its descendants mutate.
*/
import Mutation from "../utilities/mutation.js";

const observers = new WeakMap();

function setupMutationObserver(element) {
  if (observers.has(element)) return;

  const executeMutation = async () => {
    try {
      const code = element.getAttribute('onmutation');
      if (!code) return;
      const asyncFn = new Function(`return (async function() { ${code} })`)();
      await asyncFn.call(element);
    } catch (error) {
      console.error('Error in onmutation execution:', error);
    }
  };

  const observer = new MutationObserver(() => {
    executeMutation();
  });

  observer.observe(element, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });

  observers.set(element, observer);
}

function teardownMutationObserver(element) {
  const observer = observers.get(element);
  if (observer) {
    observer.disconnect();
    observers.delete(element);
  }
}

function init() {
  // Set up existing elements
  document.querySelectorAll('[onmutation]').forEach(setupMutationObserver);

  // Watch for dynamically added elements with onmutation
  Mutation.onAddElement({
    selectorFilter: '[onmutation]',
    debounce: 200
  }, (changes) => {
    changes.forEach(({ element }) => {
      setupMutationObserver(element);
    });
  });

  // Clean up when elements are removed
  Mutation.onRemoveElement({
    selectorFilter: '[onmutation]',
    debounce: 200
  }, (changes) => {
    changes.forEach(({ element }) => {
      teardownMutationObserver(element);
    });
  });

  // Watch for attribute removal
  Mutation.onAttribute({
    selectorFilter: '[onmutation]',
    debounce: 200
  }, (changes) => {
    changes.forEach(({ element, attribute, newValue }) => {
      if (attribute === 'onmutation' && newValue === null) {
        teardownMutationObserver(element);
      }
    });
  });
}

export { init };
export default init;
