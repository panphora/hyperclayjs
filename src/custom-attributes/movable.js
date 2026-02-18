/*

   Make elements freely positionable by dragging

   How to use:
   - add `movable` attribute to an element to make it draggable
   - e.g. <div movable style="transform: translate(100px, 50px)">...</div>
   - add `movable-handle` to a child to restrict the grab zone
   - e.g. <div movable><div movable-handle>⠿</div>...</div>
   - without a handle, the entire element is grabbable

   Position is stored directly in the element's transform style.
   While dragging, the element gets a `movable-dragging` attribute.

*/
import { isEditMode } from "../core/isAdminOfCurrentResource.js";
import Mutation from "../utilities/mutation.js";

let drag = null;
let zIndex = 0;

function parseTranslate(el) {
  const match = el.style.transform?.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
  return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : { x: 0, y: 0 };
}

function onPointerDown(e) {
  const handle = e.target.closest('[movable-handle]');
  const movable = e.target.closest('[movable]');
  if (!movable) return;

  if (handle) {
    if (!movable.contains(handle)) return;
  } else {
    if (movable.querySelector('[movable-handle]')) return;
  }

  const pos = parseTranslate(movable);
  const scrollEl = movable.parentElement;

  drag = {
    el: movable,
    offsetX: e.clientX - pos.x + (scrollEl?.scrollLeft || 0),
    offsetY: e.clientY - pos.y + (scrollEl?.scrollTop || 0),
    scrollEl
  };

  movable.setAttribute('movable-dragging', '');
  movable.style.zIndex = ++zIndex;
  e.preventDefault();
}

function onPointerMove(e) {
  if (!drag) return;
  const x = Math.max(0, e.clientX - drag.offsetX + (drag.scrollEl?.scrollLeft || 0));
  const y = Math.max(0, e.clientY - drag.offsetY + (drag.scrollEl?.scrollTop || 0));
  drag.el.style.transform = `translate(${x}px, ${y}px)`;
}

function onPointerUp() {
  if (!drag) return;
  drag.el.removeAttribute('movable-dragging');
  drag = null;
}

function makeMovable(el) {
  if (!el.style.transform) {
    el.style.transform = 'translate(0px, 0px)';
  }
}

function init() {
  if (!isEditMode) return;

  document.querySelectorAll('[movable]').forEach(makeMovable);

  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
  document.addEventListener('pointercancel', onPointerUp);

  Mutation.onAddElement({
    selectorFilter: "[movable]",
    debounce: 200
  }, (changes) => {
    changes.forEach(({ element }) => makeMovable(element));
  });
}

init();

export { init };
export default init;
