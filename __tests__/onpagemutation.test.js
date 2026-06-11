/**
 * @jest-environment jsdom
 *
 * [onpagemutation] / [onglobalmutation] fire on ANY page change, but must stay
 * silent during a live-sync morph (pausable) so their DOM writes can't start the
 * cross-tab autosave→broadcast→morph feedback loop.
 */

import Mutation from '../src/utilities/mutation.js';
import { init as initOnpagemutation } from '../src/custom-attributes/onpagemutation.js';

const flush = (ms = 260) => new Promise(r => setTimeout(r, ms)); // > the 200ms debounce

function hardReset() {
  for (const k of Object.keys(Mutation._callbacks)) Mutation._callbacks[k].length = 0;
  Mutation._rawSubscribers.length = 0;
  Mutation._recomputeHasNonPausable();
  Mutation._pauseDepth = 0;
  Mutation._deferredChangeRecords = null;
  Mutation._deferredChangeScheduled = false;
  document.body.innerHTML = '';
  if (Mutation._observer) Mutation._observer.takeRecords();
  window.__pm = 0;
}

beforeEach(() => { hardReset(); initOnpagemutation(); });
afterEach(async () => { await flush(); });

test('fires (debounced) on a normal page change', async () => {
  document.body.innerHTML = `<span onglobalmutation="window.__pm=(window.__pm||0)+1">0</span><ul></ul>`;
  await flush();
  window.__pm = 0;
  document.querySelector('ul').appendChild(document.createElement('li'));
  await flush();
  expect(window.__pm).toBeGreaterThanOrEqual(1);
});

test('does NOT fire during a Mutation.pause() morph window, then fires after', async () => {
  document.body.innerHTML = `<span onglobalmutation="window.__pm=(window.__pm||0)+1">0</span><ul></ul>`;
  await flush();
  window.__pm = 0;

  Mutation.pause();
  document.querySelector('ul').appendChild(document.createElement('li')); // morphed-in content
  Mutation.resume();
  await flush();
  expect(window.__pm).toBe(0);

  document.querySelector('ul').appendChild(document.createElement('li')); // local change
  await flush();
  expect(window.__pm).toBeGreaterThanOrEqual(1);
});
