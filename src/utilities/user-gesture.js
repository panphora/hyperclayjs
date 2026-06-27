/**
 * user-gesture — the "was a human driving this write?" signal for the
 * data-clobber guard. Small and dedicated (NOT behaviorCollector, which is the
 * analytics collector).
 *
 * How it works (plan §"User-driven signal"): capture-phase listeners for
 * trusted user-intent events set a `gestureTaskActive` flag for the current
 * event-loop turn, cleared on the next macrotask (setTimeout 0). The Mutation
 * hub reads this flag SYNCHRONOUSLY in its MutationObserver callback — the same
 * turn as the gesture — so a DOM change a gesture made reads as user-driven,
 * while a setTimeout / fetch().then() / rAF mutation (a later turn, flag clear)
 * reads as background. Synthetic dispatchEvent clicks are isTrusted=false, so a
 * script can't fake a gesture.
 *
 * `navigator.userActivation.isActive` (native, ~5s window) is an UNSPOOFABLE
 * corroborator only: we never emit userDriven=true unless it also agrees (it's
 * too loose to be the positive signal alone). When the API is absent (older
 * engines) we don't drop the gesture — a missed positive only costs a baseline
 * bless, never a false alarm.
 *
 * The accumulated bit rides every save the page makes; the server splits a
 * UI-gestured save from a background-script save with it.
 */

const GESTURE_EVENTS = ['pointerdown', 'keydown', 'beforeinput', 'paste', 'drop', 'cut'];

let gestureTaskActive = false;
let lastTrustedGestureTs = 0;
let userDrivenSinceLastSave = false;
let installed = false;

function userActivationActive() {
  try {
    if (typeof navigator !== 'undefined' && navigator.userActivation) {
      return navigator.userActivation.isActive === true;
    }
  } catch {}
  return true; // API absent -> don't suppress (ties break silent server-side)
}

function markGestureTurn() {
  gestureTaskActive = true;
  lastTrustedGestureTs = Date.now();
  // Clear on the next macrotask. The MutationObserver microtask for any DOM
  // change made synchronously in this turn drains BEFORE this fires.
  setTimeout(() => { gestureTaskActive = false; }, 0);
}

function onGesture(e) {
  if (!e || !e.isTrusted) return;
  markGestureTurn();
}

/**
 * Install the capture-phase gesture listeners (idempotent). Call once in edit
 * mode (autosave.js init does this).
 */
export function initUserGesture() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  for (const type of GESTURE_EVENTS) {
    document.addEventListener(type, onGesture, true);
  }
}

/**
 * True iff we're in a turn a trusted gesture drove AND userActivation agrees.
 * The Mutation hub calls this synchronously per batch.
 */
export function isGestureActive() {
  return gestureTaskActive && userActivationActive();
}

/**
 * Record that an autosave-relevant change happened in a gesture-driven turn.
 * Called by the Mutation hub (per autosave-filtered batch) and by the [persist]
 * input path (a trusted input is itself the gesture+change).
 */
export function markUserDriven() {
  userDrivenSinceLastSave = true;
}

/**
 * Read-and-reset the accumulated bit. Called at the ACTUAL save send (not on a
 * save that never ships), so it survives the autosave debounce and coalescing.
 * @returns {boolean}
 */
export function consumeUserDriven() {
  const v = userDrivenSinceLastSave;
  userDrivenSinceLastSave = false;
  return v;
}

/** Test seam: force-reset state. */
export function _resetUserGesture() {
  gestureTaskActive = false;
  lastTrustedGestureTs = 0;
  userDrivenSinceLastSave = false;
}

/**
 * Test seam: open a gesture turn as a trusted event would, without a real
 * trusted event (jsdom can't forge isTrusted). Same semantics as onGesture: the
 * turn is active synchronously and cleared on the next macrotask.
 */
export function _simulateGestureTurn() {
  markGestureTurn();
}
