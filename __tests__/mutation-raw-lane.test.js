/**
 * @jest-environment jsdom
 *
 * Stage 1 of the undo-observer unification (D): the raw lane in mutation.js.
 *
 * `subscribeRaw(cb) -> { drain(), unsubscribe() }` gives undo the untransformed
 * MutationRecords (push) plus a synchronous pull (drain, replacing
 * takeRecords()). `createObserver(cb)` is a thin MutationObserver-shaped adapter
 * over it. The whole point: ONE browser observer can feed both the change lane
 * (sortable / autosave / …) and a raw subscriber, with no record lost, none
 * delivered twice, and no debounce:0 mutating subscriber firing synchronously
 * inside undo's commit boundary.
 *
 * These tests exercise the hub directly (no undo); the integration with the real
 * vendored undo lives in mutation-undo-bridge / undo-region-delegation.
 */

import Mutation from '../src/utilities/mutation.js';

const flush = () => new Promise(r => setTimeout(r, 0));

function hardReset() {
  Mutation._rawSubscribers.length = 0;
  for (const k of Object.keys(Mutation._callbacks)) Mutation._callbacks[k].length = 0;
  Mutation._recomputeHasNonPausable();
  Mutation._pauseDepth = 0;
  Mutation._deferredChangeRecords = null;
  Mutation._deferredChangeScheduled = false;
  document.body.innerHTML = '';
  if (Mutation._observer) Mutation._observer.takeRecords();
}

beforeEach(hardReset);
afterEach(async () => { await flush(); hardReset(); });

const isChildList = r => r.type === 'childList';

test('1. push timing: a raw cb sees records in the same observer turn as change subscribers (raw first)', async () => {
  const order = [];
  const raw = Mutation.subscribeRaw(() => order.push('raw'));
  const off = Mutation.onAnyChange({}, () => order.push('change'));

  document.body.appendChild(document.createElement('div'));
  await flush();

  expect(order[0]).toBe('raw');       // raw fan-out runs before the change lane
  expect(order).toContain('change');  // both fired in the one turn

  raw.unsubscribe(); off();
});

test('2. drain exactness: a same-tick drain returns the pending records and the push cb never re-receives them', async () => {
  const pushed = [];
  const raw = Mutation.subscribeRaw(recs => pushed.push(...recs));

  document.body.appendChild(document.createElement('div')); // sync; callback not yet fired
  const drained = raw.drain();
  expect(drained.filter(isChildList).length).toBe(1);

  await flush();
  expect(pushed.length).toBe(0); // takeRecords emptied the queue; no async re-delivery

  raw.unsubscribe();
});

test('3. two raw subscribers: X drains, Y still receives every record exactly once', async () => {
  const xPushed = [], yPushed = [];
  const x = Mutation.subscribeRaw(r => xPushed.push(...r));
  const y = Mutation.subscribeRaw(r => yPushed.push(...r));

  document.body.appendChild(document.createElement('div')); // sync
  const drained = x.drain();
  expect(drained.filter(isChildList).length).toBe(1); // X got it via drain return

  await flush();
  expect(yPushed.filter(isChildList).length).toBe(1);  // Y got the same record exactly once
  expect(xPushed.length).toBe(0);                      // X did NOT also get a push

  x.unsubscribe(); y.unsubscribe();
});

test('4. drain twice + a third drain in one tick returns only the records created between (mirrors commit())', async () => {
  const raw = Mutation.subscribeRaw(() => {});

  document.body.appendChild(document.createElement('div'));
  const d1 = raw.drain();
  expect(d1.filter(isChildList).length).toBe(1);

  document.body.appendChild(document.createElement('div'));
  const d2 = raw.drain();
  expect(d2.filter(isChildList).length).toBe(1); // only the new node, not d1's record again

  const d3 = raw.drain();
  expect(d3.length).toBe(0);                      // nothing new

  raw.unsubscribe();
  await flush();
});

test('5. §6.1: a debounce:0 change subscriber does NOT fire synchronously inside a raw drain; it fires on a microtask', async () => {
  const raw = Mutation.subscribeRaw(() => {});
  const changeCalls = [];
  const off = Mutation.onAnyChange({}, changes => changeCalls.push(...changes));

  document.body.appendChild(document.createElement('div')); // sync
  raw.drain();                                              // raw subscriber pulls
  expect(changeCalls.length).toBe(0);                       // not fired synchronously inside drain

  await flush();
  expect(changeCalls.length).toBeGreaterThan(0);            // delivered to the change lane on a microtask

  raw.unsubscribe(); off();
});

test('6. pause: raw cbs fed by both push and the resume boundary; non-pausable change subs get both', async () => {
  const rawRecords = [];
  const raw = Mutation.subscribeRaw(recs => rawRecords.push(...recs));
  const addedIds = [];
  const off = Mutation.onAddElement({ pausable: false }, changes => addedIds.push(...changes.map(c => c.element.id)));

  Mutation.pause();

  // (i) a record delivered async during the pause still reaches the raw lane (push).
  const a = document.createElement('div'); a.id = 'a';
  document.body.appendChild(a);
  await flush();
  expect(rawRecords.some(isChildList)).toBe(true);
  const afterPush = rawRecords.length;

  // (ii) a record still pending at resume() lands in the raw buffer (not lost),
  //      while the non-pausable change sub gets the boundary batch.
  const b = document.createElement('div'); b.id = 'b';
  document.body.appendChild(b);  // sync; not yet delivered
  Mutation.resume();             // boundary drain -> raw buffer + non-pausable change lane
  await flush();                 // raw buffer flush

  expect(rawRecords.length).toBeGreaterThan(afterPush);                 // boundary record not lost
  expect(addedIds).toEqual(expect.arrayContaining(['a', 'b']));         // non-pausable saw both

  raw.unsubscribe(); off();
});

test('7. unsubscribe()/disconnect() mid-stream: no further delivery, hub unaffected', async () => {
  const pushed = [];
  const raw = Mutation.subscribeRaw(recs => pushed.push(...recs));
  const addedIds = [];
  const off = Mutation.onAddElement({}, changes => addedIds.push(...changes.map(c => c.element.id)));

  const d1 = document.createElement('div'); d1.id = 'd1';
  document.body.appendChild(d1);
  await flush();
  expect(pushed.length).toBeGreaterThan(0);
  const before = pushed.length;

  raw.unsubscribe();

  const d2 = document.createElement('div'); d2.id = 'd2';
  document.body.appendChild(d2);
  await flush();
  expect(pushed.length).toBe(before);                 // raw got nothing after unsubscribe
  expect(addedIds).toContain('d2');                   // hub still delivers to change subs

  off();
});

test('8. createObserver().observe() before any change subscriber starts the hub; non-body target throws', async () => {
  // Force a fresh, non-observing hub to prove observe() forces _startObserving().
  if (Mutation._observer) Mutation._observer.disconnect();
  Mutation._observer = null;
  Mutation._observing = false;
  expect(Mutation._observing).toBe(false);

  const records = [];
  const obs = Mutation.createObserver(recs => records.push(...recs));
  obs.observe(document.body);
  expect(Mutation._observing).toBe(true);
  expect(Mutation._observer).not.toBeNull();

  document.body.appendChild(document.createElement('div'));
  await flush();
  expect(records.some(isChildList)).toBe(true); // observation actually started and delivers

  document.body.appendChild(document.createElement('div')); // sync
  expect(obs.takeRecords().filter(isChildList).length).toBe(1); // shim takeRecords = drain

  obs.disconnect();

  expect(() => Mutation.createObserver(() => {}).observe(document.createElement('div'))).toThrow();
});
