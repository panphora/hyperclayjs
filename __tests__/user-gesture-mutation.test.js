/**
 * @jest-environment jsdom
 *
 * Integration of the user-gesture signal with the real Mutation hub. A DOM change
 * made in a trusted-gesture turn must mark the pending save user-driven whether
 * the change lane runs synchronously (no undo) OR is deferred to a microtask
 * (undo present). A change made a turn LATER but within the recency window (a
 * click handler, a confirm-modal delete whose mutation runs a macrotask after the
 * Confirm gesture) must also read user-driven — this is the cross-turn case the
 * recency window exists for. A change with no recent gesture reads background.
 * ensureObserving() must make attribution work with zero change subscribers.
 */
import Mutation from '../src/utilities/mutation.js';
import {
  initUserGesture,
  consumeUserDriven,
  _resetUserGesture,
  _simulateGestureTurn,
} from '../src/utilities/user-gesture.js';

const macrotask = () => new Promise((r) => setTimeout(r, 0));

function hardReset() {
  for (const k of Object.keys(Mutation._callbacks)) Mutation._callbacks[k].length = 0;
  Mutation._rawSubscribers.length = 0;
  Mutation._recomputeHasNonPausable();
  Mutation._pauseDepth = 0;
  Mutation._deferredChangeRecords = null;
  Mutation._deferredChangeScheduled = false;
  document.body.innerHTML = '';
  if (Mutation._observer) {
    Mutation._observer.takeRecords();
    Mutation._observer.disconnect();
  }
  Mutation._observing = false; // cold-start each test so ensureObserving is exercised
  _resetUserGesture();
}

beforeAll(() => initUserGesture());
beforeEach(hardReset);
afterEach(async () => { jest.restoreAllMocks(); await macrotask(); });

test('undo absent: a gesture-driven change marks the save user-driven (synchronous change lane)', async () => {
  Mutation.onAnyChange({ require: 'autosave' }, () => {});
  _simulateGestureTurn();
  document.body.appendChild(document.createElement('div')); // autosave-relevant change
  await macrotask(); // MO callback (microtask) ran before the gesture clear (macrotask)
  expect(consumeUserDriven()).toBe(true);
});

test('undo present: the gesture flag survives the microtask-deferred change lane', async () => {
  Mutation.onAnyChange({ require: 'autosave' }, () => {});
  const raw = Mutation.subscribeRaw(() => {}); // stand-in for undo's raw recorder
  _simulateGestureTurn();
  document.body.appendChild(document.createElement('div'));
  // Undo commits synchronously in the gesture turn: it drains the queue, which
  // defers the change lane to a microtask (_deferChangeLane) instead of the
  // synchronous MO callback.
  raw.drain();
  await macrotask(); // the deferred microtask ran before the macrotask gesture clear
  expect(consumeUserDriven()).toBe(true);
  raw.unsubscribe();
});

test('cross-turn within window: a change a turn after the gesture is user-driven (the confirm-modal delete case)', async () => {
  let t = 1000;
  jest.spyOn(performance, 'now').mockImplementation(() => t);
  Mutation.onAnyChange({ require: 'autosave' }, () => {});
  _simulateGestureTurn();   // stamp 1000, flag set
  await macrotask();        // flag cleared — models the deferred-resolve modal / click-handler turn
  t = 1100;                 // 100ms later, inside the 500ms window
  document.body.appendChild(document.createElement('div')); // the deferred delete mutation
  await macrotask();
  expect(consumeUserDriven()).toBe(true);
});

test('background: a change past the recency window is not user-driven', async () => {
  let t = 1000;
  jest.spyOn(performance, 'now').mockImplementation(() => t);
  Mutation.onAnyChange({ require: 'autosave' }, () => {});
  _simulateGestureTurn();   // stamp 1000
  await macrotask();        // gesture flag cleared
  t = 2000;                 // 1s later — outside the 500ms window
  document.body.appendChild(document.createElement('div'));
  await macrotask();
  expect(consumeUserDriven()).toBe(false);
});

test('ensureObserving starts the singleton observer and is idempotent', () => {
  expect(Mutation._observing).toBe(false); // hardReset left it cold
  Mutation.ensureObserving();
  expect(Mutation._observing).toBe(true);
  Mutation.ensureObserving();              // no-op
  expect(Mutation._observing).toBe(true);
});

test('ensureObserving alone (no change subscriber) attributes a gesture-driven change', async () => {
  Mutation.ensureObserving();   // start the observer with zero subscribers — the chip's path
  _simulateGestureTurn();
  document.body.appendChild(document.createElement('div')); // autosave-relevant change
  await macrotask();
  expect(consumeUserDriven()).toBe(true);
});
