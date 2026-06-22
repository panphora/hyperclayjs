/**
 * @jest-environment jsdom
 *
 * Real-hub integration: the re-vendored sapjs co-loaded with the actual Mutation hub.
 * The sapjs unit tests only approximate the hub's suppression with a hand-built
 * mini-hub; this exercises the real _drainBrowserQueue / takeRecords routing. It proves
 * the universal-reactivity bridge (1) re-derives on a mutation made by ANY means via the
 * hub's onAnyChange lane, and (2) does not loop — the hub's pause/drain routes sapjs's
 * own paints to non-pausable consumers only, so they never re-trigger sapjs.
 */
import Mutation from '../src/utilities/mutation.js';
import { Sap } from '../src/vendor/sapjs.vendor.js';

const flush = (ms = 25) => new Promise(r => setTimeout(r, ms));

beforeEach(() => {
  for (const k of Object.keys(Mutation._callbacks)) Mutation._callbacks[k].length = 0;
  Mutation._rawSubscribers.length = 0;
  Mutation._recomputeHasNonPausable();
  Mutation._pauseDepth = 0;
  Mutation._deferredChangeRecords = null;
  Mutation._deferredChangeScheduled = false;
  if (Mutation._observer) Mutation._observer.takeRecords();
  document.body.innerHTML = '';
  Sap._reset();
});

test('sapjs subscribes to the real hub (not a native observer) when co-loaded', () => {
  document.body.innerHTML = `<main sap state="m=hi"><span text="state.m"></span></main>`;
  Sap.mount(document.querySelector('[sap]'));
  // The hub now has a pausable change-lane callback registered (the sap bridge).
  const callbackCount = Object.values(Mutation._callbacks).reduce((n, arr) => n + arr.length, 0);
  expect(callbackCount).toBeGreaterThan(0);
});

test('an external attribute change re-derives sapjs via the real hub', async () => {
  document.body.innerHTML = `<main sap state="m=hi"><span id="out" text="state.m"></span></main>`;
  const root = document.querySelector('[sap]');
  Sap.mount(root);
  expect(root.querySelector('#out').textContent).toBe('hi');

  root.setAttribute('m', 'bye'); // external mutation, fires no sap delegated event
  await flush();
  expect(root.querySelector('#out').textContent).toBe('bye');
});

test('an externally injected bound node is painted by the re-derive (real hub add)', async () => {
  document.body.innerHTML = `<main sap state="m=hi"></main>`;
  const root = document.querySelector('[sap]');
  Sap.mount(root);
  const span = document.createElement('span');
  span.id = 'late';
  span.setAttribute('text', 'state.m');
  root.appendChild(span); // injected by any means, fires no sap event
  await flush();
  expect(root.querySelector('#late').textContent).toBe('hi');
});

test('an effect writing every pass does not run away (real hub drain is the loop guard)', async () => {
  document.body.innerHTML =
    `<main sap><span id="e" effect="el.setAttribute('data-n', String((+el.getAttribute('data-n')||0)+1))"></span></main>`;
  const root = document.querySelector('[sap]');
  Sap.mount(root);
  root.setAttribute('data-x', '1'); // one external trigger
  await flush();
  const n = +root.querySelector('#e').getAttribute('data-n');
  expect(n).toBeLessThan(5); // bounded — the effect's own writes are drained away from sap
  expect(Sap.report().errors.map(e => e.code)).not.toContain('E26');
});
