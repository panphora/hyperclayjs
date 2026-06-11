/**
 * @jest-environment jsdom
 *
 * [onmutation] folded onto the single shared observer: no per-element
 * MutationObservers, region-aware via the hub, ancestor-walk dispatch.
 */

import Mutation from '../src/utilities/mutation.js';
import { init as initOnmutation } from '../src/custom-attributes/onmutation.js';

const flush = (ms = 10) => new Promise(r => setTimeout(r, ms));

function hardReset() {
  for (const k of Object.keys(Mutation._callbacks)) Mutation._callbacks[k].length = 0;
  Mutation._rawSubscribers.length = 0;
  Mutation._recomputeHasNonPausable();
  Mutation._pauseDepth = 0;
  Mutation._deferredChangeRecords = null;
  Mutation._deferredChangeScheduled = false;
  document.body.innerHTML = '';
  if (Mutation._observer) Mutation._observer.takeRecords();
  window.__fires = {};
}

// onmutation code increments window.__fires[this.id] so tests can count firings.
const HOOK = id => `window.__fires.${id}=(window.__fires.${id}||0)+1`;

beforeEach(() => { hardReset(); initOnmutation(); });
afterEach(async () => { await flush(); });

test('a change inside an [onmutation] element fires its code', async () => {
  document.body.innerHTML = `<div id="a" onmutation="${HOOK('a')}"><span id="s">x</span></div>`;
  await flush();
  window.__fires = {};
  document.getElementById('s').textContent = 'changed';
  await flush();
  expect(window.__fires.a).toBeGreaterThanOrEqual(1);
});

test('nested [onmutation] elements both fire for a deep change', async () => {
  document.body.innerHTML =
    `<div id="outer" onmutation="${HOOK('outer')}"><div id="inner" onmutation="${HOOK('inner')}"><span id="s">x</span></div></div>`;
  await flush();
  window.__fires = {};
  document.getElementById('s').textContent = 'changed';
  await flush();
  expect(window.__fires.outer).toBeGreaterThanOrEqual(1);
  expect(window.__fires.inner).toBeGreaterThanOrEqual(1);
});

test('an attribute change on the [onmutation] element fires it', async () => {
  document.body.innerHTML = `<div id="a" onmutation="${HOOK('a')}">x</div>`;
  await flush();
  window.__fires = {};
  document.getElementById('a').setAttribute('data-x', '1');
  await flush();
  expect(window.__fires.a).toBeGreaterThanOrEqual(1);
});

test('an [onmutation] element is NOT fired by its own insertion', async () => {
  window.__fires = {};
  const d = document.createElement('div');
  d.id = 'a';
  d.setAttribute('onmutation', HOOK('a'));
  d.innerHTML = '<span>x</span>';
  document.body.appendChild(d);
  await flush();
  expect(window.__fires.a).toBeUndefined();
});

test('a change inside a [no-watch] region does NOT fire [onmutation] (region-aware via the hub)', async () => {
  document.body.innerHTML = `<div id="a" no-watch onmutation="${HOOK('a')}"><span id="s">x</span></div>`;
  await flush();
  window.__fires = {};
  document.getElementById('s').textContent = 'changed';
  await flush();
  expect(window.__fires.a).toBeUndefined();
});

test('removing the onmutation attribute stops it from firing (no per-element observer to leak)', async () => {
  document.body.innerHTML = `<div id="a" onmutation="${HOOK('a')}"><span id="s">x</span></div>`;
  await flush();
  document.getElementById('a').removeAttribute('onmutation');
  window.__fires = {};
  document.getElementById('s').textContent = 'changed';
  await flush();
  expect(window.__fires.a).toBeUndefined();
});

test('does NOT fire during a Mutation.pause() window, then fires normally after (live-sync loop guard)', async () => {
  document.body.innerHTML = `<div id="a" onmutation="${HOOK('a')}"><span id="s">x</span></div>`;
  await flush();
  window.__fires = {};

  // A live-sync morph happens inside pause()/resume(): the hook must stay silent
  // so its DOM writes can't kick off the cross-tab autosave→broadcast loop.
  Mutation.pause();
  document.getElementById('s').textContent = 'morphed';
  Mutation.resume();
  await flush();
  expect(window.__fires.a).toBeUndefined();

  // A normal local edit after the morph still fires it.
  document.getElementById('s').textContent = 'local';
  await flush();
  expect(window.__fires.a).toBeGreaterThanOrEqual(1);
});

test('a sibling subtree change does NOT fire an unrelated [onmutation] element', async () => {
  document.body.innerHTML =
    `<div id="a" onmutation="${HOOK('a')}"><span id="s">x</span></div><div id="b"><span id="t">y</span></div>`;
  await flush();
  window.__fires = {};
  document.getElementById('t').textContent = 'changed'; // inside #b, not #a
  await flush();
  expect(window.__fires.a).toBeUndefined();
});
