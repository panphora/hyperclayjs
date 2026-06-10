/**
 * @jest-environment jsdom
 *
 * Stage 4 of the undo-observer unification (D): the REAL vendored undo sourcing
 * its records from the REAL shared hub via the raw-lane shim. Importing all
 * three modules wires window.hyperclay.{Mutation, region, undo}, so undo.start()
 * on document.body takes the createObserver path — one browser observer feeds
 * both undo and the change lane.
 *
 * Covers: the page runs one observer; morph exclusion end-to-end (§6.3); the
 * commit boundary with a live debounce:0 attribute-writing subscriber (the
 * autosize hazard, §6.1); C×D (no-undo / no-watch skipped through the shim); and
 * pins for the three recently-fixed undo bugs (§6.6) on the shimmed path.
 */

import Mutation from '../src/utilities/mutation.js';
import '../src/utilities/region-policy.js';            // sets window.hyperclay.region
import { undo } from '../src/vendor/hyper-undo.vendor.js'; // sets window.hyperclay.undo

const flush = (ms = 0) => new Promise(r => setTimeout(r, ms));

afterEach(async () => {
  try { undo.stop(); } catch {}
  await flush(0);
  Mutation._pauseDepth = 0;
  Mutation._rawSubscribers.length = 0;
  Mutation._deferredChangeRecords = null;
  Mutation._deferredChangeScheduled = false;
  for (const k of Object.keys(Mutation._callbacks)) Mutation._callbacks[k].length = 0;
  Mutation._recomputeHasNonPausable();
  if (Mutation._observer) Mutation._observer.takeRecords();
  document.body.innerHTML = '';
});

test('undo on document.body sources records from the shared hub (one raw subscription, no own observer)', () => {
  expect(typeof window.hyperclay.Mutation.createObserver).toBe('function');
  expect(typeof window.hyperclay.undo).toBe('object');

  undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });
  // The shim registered exactly one raw subscriber on the hub — undo did NOT
  // spin up its own MutationObserver.
  expect(Mutation._rawSubscribers.length).toBe(1);
});

test('§6.3 morph exclusion end-to-end: pause/morph/resume is not undoable; pre- and post-morph edits are', async () => {
  document.body.innerHTML = '<h1 id="h">Hi</h1>';
  const h = document.getElementById('h');
  undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });
  undo.clear();

  h.textContent = 'Hello';            // pre-morph local edit
  await flush(30);
  const beforeMorph = undo.history.length;
  expect(beforeMorph).toBe(1);

  Mutation.pause();                   // live-sync morph window (bridges undo.pause())
  const remote = document.createElement('p'); remote.id = 'remote'; remote.textContent = 'remote';
  document.body.appendChild(remote); // remote content morphed in (a different node than the local edits)
  Mutation.resume();
  await flush(30);
  expect(undo.history.length).toBe(beforeMorph);   // the morph left the undo stack untouched

  h.textContent = 'After';            // post-morph local edit records normally
  await flush(30);
  expect(undo.history.length).toBe(beforeMorph + 1);

  undo.undo();                        // reverts only the local edit...
  expect(h.textContent).toBe('Hello');
  expect(document.getElementById('remote')).not.toBeNull(); // ...the morphed-in content is NOT an undo step
});

test('§6.1 commit boundary with a live debounce:0 attribute-writing subscriber (autosize model)', async () => {
  document.body.innerHTML = '<textarea id="t"></textarea>';
  const t = document.getElementById('t');

  let firedDuringCommit = false;
  let inCommit = false;
  // Model autosize: a debounce:0, pausable:false subscriber that WRITES an inline
  // style attribute when the textarea changes. Under D it must defer to a
  // microtask, never fire synchronously inside undo's commit drain.
  const off = Mutation.onAttribute({ pausable: false, debounce: 0 }, changes => {
    if (inCommit) firedDuringCommit = true;
    changes.forEach(c => {
      if (c.element === t && c.attribute !== 'style') t.style.height = '40px';
    });
  });

  undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });
  undo.clear();

  inCommit = true;
  undo.commit('Edit', () => { t.setAttribute('data-rows', '3'); });
  inCommit = false;

  expect(firedDuringCommit).toBe(false);  // §6.1: no synchronous re-entry inside the commit
  expect(undo.history.length).toBe(1);    // the commit landed intact as one step
  expect(undo.history[0].label).toBe('Edit');

  await flush(30);
  expect(t.style.height).toBe('40px');    // the subscriber DID run, just deferred to a microtask

  off();
});

test('C×D: a [no-undo] region is not recorded even though records flow through the shim; a normal region is', async () => {
  document.body.innerHTML = '<div no-undo><span id="s">x</span></div><h1 id="h">Hi</h1>';
  undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });
  expect(Mutation._rawSubscribers.length).toBe(1);  // confirm the shim path is live
  undo.clear();

  document.getElementById('s').textContent = 'changed';   // inside no-undo
  await flush(30);
  expect(undo.history.length).toBe(0);

  document.getElementById('h').textContent = 'changed';   // normal region
  await flush(30);
  expect(undo.history.length).toBe(1);
});

test('C×D: a [no-watch] region is not recorded through the shim', async () => {
  document.body.innerHTML = '<div no-watch><span id="s">x</span></div>';
  undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });
  undo.clear();

  document.getElementById('s').textContent = 'changed';
  await flush(30);
  expect(undo.history.length).toBe(0);
});

test('§6.6 pin (D3-1): recordValue still works on the shimmed path (record() bypasses the observer)', async () => {
  document.body.innerHTML = '<input id="i">';
  const i = document.getElementById('i');
  undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });
  undo.clear();

  i.value = 'abc';
  undo.recordValue(i, { prop: 'value', oldValue: '', newValue: 'abc' });
  await flush(30);
  expect(undo.history.length).toBe(1);

  undo.undo();
  expect(i.value).toBe('');   // property write reverted
});

test('§6.6 pin (A2-2): extension marker attribute noise is still filtered through the shim', async () => {
  document.body.innerHTML = '<div id="d">x</div>';
  const d = document.getElementById('d');
  undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });
  undo.clear();

  d.setAttribute('data-1p-watching', 'true');  // password-manager marker — must be ignored
  await flush(30);
  expect(undo.history.length).toBe(0);

  d.setAttribute('data-real', '1');            // a real attribute IS recorded
  await flush(30);
  expect(undo.history.length).toBe(1);
});

test('§6.6 pin (focused-field resync): undo/redo events are still emitted on the shimmed path', async () => {
  document.body.innerHTML = '<h1 id="h">Hi</h1>';
  const h = document.getElementById('h');
  undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });
  undo.clear();

  const events = [];
  undo.on('undo', () => events.push('undo'));
  undo.on('redo', () => events.push('redo'));

  h.textContent = 'Hello';
  await flush(30);
  undo.undo();
  undo.redo();
  expect(events).toEqual(['undo', 'redo']);
});
