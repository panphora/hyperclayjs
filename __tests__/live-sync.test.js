/**
 * @jest-environment jsdom
 *
 * Tests for the rAF-paced single-flight queue in live-sync.js. Focus is on
 * the coalescing behavior of applyUpdate(): burst arrivals collapse to one
 * morph per frame against the freshest payload, and morphs serialize via the
 * in-flight flag.
 */

let mockMorphMock;
let mockMorphResolvers;
let mockMorphCalls;

// Mock HyperMorph: each morph returns a deferred promise so the test can
// control completion. Calls are recorded for assertion.
jest.mock('../src/vendor/hyper-morph.vendor.js', () => {
  return {
    HyperMorph: {
      morph: jest.fn((oldEl, newEl, opts) => {
        const call = { oldEl, newEl, opts, html: null };
        mockMorphCalls.push(call);
        return new Promise((resolve) => {
          mockMorphResolvers.push(resolve);
        });
      }),
    },
  };
});

// Mock Mutation so pause/resume don't try to manage real observers.
jest.mock('../src/utilities/mutation.js', () => ({
  __esModule: true,
  default: { pause: jest.fn(), resume: jest.fn() },
}));

import { LiveSync } from '../src/communication/live-sync.js';
import { HyperMorph } from '../src/vendor/hyper-morph.vendor.js';

describe('LiveSync applyUpdate (rAF-paced queue)', () => {
  let sync;
  let pendingFrames;
  let originalRaf;
  let originalCaf;

  beforeEach(() => {
    mockMorphCalls = [];
    mockMorphResolvers = [];
    pendingFrames = [];

    // Replace rAF with a manual flusher so the test controls frame timing.
    originalRaf = window.requestAnimationFrame;
    originalCaf = window.cancelAnimationFrame;
    window.requestAnimationFrame = (cb) => {
      const handle = pendingFrames.length + 1;
      pendingFrames.push({ handle, cb });
      return handle;
    };
    window.cancelAnimationFrame = (handle) => {
      pendingFrames = pendingFrames.filter((f) => f.handle !== handle);
    };

    HyperMorph.morph.mockClear();
    sync = new LiveSync();
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    window.cancelAnimationFrame = originalCaf;
    sync.stop();
  });

  function flushFrame() {
    const next = pendingFrames.shift();
    if (next) next.cb();
  }

  // Resolve the most recent in-flight morph and yield until any chained
  // microtasks (the post-morph isPaused-clear setTimeout) have settled.
  async function completeNextMorph() {
    const resolve = mockMorphResolvers.shift();
    expect(resolve).toBeDefined();
    resolve();
    // Two macrotasks: one for the morph await, one for the setTimeout(0)
    // inside _doApplyUpdate's finally block.
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  }

  test('single update runs one morph on next frame', async () => {
    sync.applyUpdate('<html><body>v1</body></html>', 1);

    // No morph yet: rAF is pending.
    expect(HyperMorph.morph).not.toHaveBeenCalled();
    expect(pendingFrames.length).toBe(1);

    flushFrame();
    // Morph started; await microtask so the in-flight promise registers.
    await Promise.resolve();

    expect(HyperMorph.morph).toHaveBeenCalledTimes(1);
    await completeNextMorph();
    // No follow-up frame queued when nothing else is pending.
    expect(pendingFrames.length).toBe(0);
  });

  test('burst before any frame collapses to one morph against the latest payload', async () => {
    sync.applyUpdate('<html><body>v1</body></html>', 1);
    sync.applyUpdate('<html><body>v2</body></html>', 2);
    sync.applyUpdate('<html><body>v3</body></html>', 3);

    // Three updates queued, but only one rAF: the first overwrites the
    // second and third's pending slot, so when rAF fires we morph v3 only.
    expect(pendingFrames.length).toBe(1);
    expect(HyperMorph.morph).not.toHaveBeenCalled();

    flushFrame();
    await Promise.resolve();

    expect(HyperMorph.morph).toHaveBeenCalledTimes(1);
    // morph receives newDoc.documentElement (the <html>); textContent
    // descends into the body.
    const htmlEl = HyperMorph.morph.mock.calls[0][1];
    expect(htmlEl.textContent).toBe('v3');

    await completeNextMorph();
  });

  test('updates arriving during an in-flight morph coalesce to one follow-up morph', async () => {
    sync.applyUpdate('<html><body>v1</body></html>', 1);
    flushFrame();
    await Promise.resolve();

    // v1 morph is now in flight. Burst three more updates before resolving.
    expect(HyperMorph.morph).toHaveBeenCalledTimes(1);
    sync.applyUpdate('<html><body>v2</body></html>', 2);
    sync.applyUpdate('<html><body>v3</body></html>', 3);
    sync.applyUpdate('<html><body>v4</body></html>', 4);

    // No new rAF scheduled while morph is in flight.
    expect(pendingFrames.length).toBe(0);
    expect(HyperMorph.morph).toHaveBeenCalledTimes(1);

    // Resolve v1's morph; queue should reschedule for the latest pending.
    await completeNextMorph();
    expect(pendingFrames.length).toBe(1);

    flushFrame();
    await Promise.resolve();

    // Second morph runs against v4 (v2 and v3 were dropped).
    expect(HyperMorph.morph).toHaveBeenCalledTimes(2);
    const secondHtmlEl = HyperMorph.morph.mock.calls[1][1];
    expect(secondHtmlEl.textContent).toBe('v4');

    await completeNextMorph();
  });

  test('cleanup cancels a pending frame', () => {
    sync.applyUpdate('<html><body>v1</body></html>', 1);
    expect(pendingFrames.length).toBe(1);

    sync.cleanup();
    expect(pendingFrames.length).toBe(0);

    // No morph runs even if a frame is fired by something else.
    flushFrame();
    expect(HyperMorph.morph).not.toHaveBeenCalled();
  });

  test('applyUpdate is a no-op after stop', () => {
    sync.stop();
    sync.applyUpdate('<html><body>v1</body></html>', 1);
    expect(pendingFrames.length).toBe(0);
  });

  test('applyUpdate forwards identityMap into the morph call', async () => {
    sync.applyUpdate(
      '<html><body><p>v1</p></body></html>',
      1,
      { '': 'alice:1', '1': 'alice:2' }
    );
    flushFrame();
    await Promise.resolve();

    expect(HyperMorph.morph).toHaveBeenCalledTimes(1);
    const opts = HyperMorph.morph.mock.calls[0][2];
    expect(typeof opts.key).toBe('function');
    expect(opts.callbacks && typeof opts.callbacks.afterNodeMorphed).toBe('function');

    await completeNextMorph();
  });

  test('parsedWeakMap → liveWeakMap transfer happens via afterNodeMorphed', async () => {
    sync.applyUpdate(
      '<html><body><p>v1</p></body></html>',
      1,
      { '': 'alice:1', '1': 'alice:2' }
    );
    flushFrame();
    await Promise.resolve();

    const opts = HyperMorph.morph.mock.calls[0][2];
    const parsedHtml = HyperMorph.morph.mock.calls[0][1];
    // documentElement.children = [head, body] — body is index 1.
    const parsedBody = parsedHtml.children[1];

    // Simulate hyper-morph pairing the live <html> with the parsed <html>
    // and the live <body> with the parsed <body>.
    opts.callbacks.afterNodeMorphed(document.documentElement, parsedHtml);
    opts.callbacks.afterNodeMorphed(document.body, parsedBody);

    // After the transfer, the live elements carry the sender's IDs.
    expect(sync.liveWeakMap.get(document.documentElement)).toBe('alice:1');
    expect(sync.liveWeakMap.get(document.body)).toBe('alice:2');

    await completeNextMorph();
  });

  test('key resolver prefers liveWeakMap, falls back to parsedWeakMap, then data-id, then id', async () => {
    // Seed liveWeakMap so we can verify priority.
    document.body.innerHTML = '<div id="dom-id">x</div><span data-id="dx">y</span>';
    const liveDiv = document.body.querySelector('#dom-id');
    const liveSpan = document.body.querySelector('[data-id]');
    sync.liveWeakMap.set(liveDiv, 'synth:42');

    sync.applyUpdate('<html><body></body></html>', 1, { '': 'a:1' });
    flushFrame();
    await Promise.resolve();

    const opts = HyperMorph.morph.mock.calls[0][2];
    const key = opts.key;

    // Synthetic ID wins.
    expect(key(liveDiv)).toBe('synth:42');
    // data-id used when no synthetic.
    expect(key(liveSpan)).toBe('dx');
    // id used when no data-id.
    const elNoId = document.createElement('div');
    elNoId.id = 'pure-id';
    expect(key(elNoId)).toBe('pure-id');
    // Nothing → null.
    const bare = document.createElement('div');
    expect(key(bare)).toBe(null);

    await completeNextMorph();
    document.body.innerHTML = '';
  });

  test('missing identityMap falls back to data-id / id only', async () => {
    sync.applyUpdate('<html><body></body></html>', 1);
    flushFrame();
    await Promise.resolve();

    const opts = HyperMorph.morph.mock.calls[0][2];
    expect(typeof opts.key).toBe('function');
    // No synthetic IDs were seeded, so an unrelated bare element resolves to null.
    const bare = document.createElement('div');
    expect(opts.key(bare)).toBe(null);

    await completeNextMorph();
  });

  test('malformed identityMap (array, string, null) is ignored without throwing', async () => {
    for (const bad of [null, '{}', ['a', 'b']]) {
      HyperMorph.morph.mockClear();
      sync.applyUpdate('<html><body></body></html>', 1, bad);
      flushFrame();
      await Promise.resolve();
      expect(HyperMorph.morph).toHaveBeenCalledTimes(1);
      await completeNextMorph();
    }
  });

  test('_buildIdentityMap mints stable IDs and reuses them across calls', () => {
    document.body.innerHTML = '<div><span>a</span></div>';
    const liveRoot = document.documentElement;

    // Use the live tree as its own clone for the test (no [snapshot-remove]
    // divergence here).
    const map1 = sync._buildIdentityMap(liveRoot, liveRoot);
    const map2 = sync._buildIdentityMap(liveRoot, liveRoot);

    // Same elements → same IDs across calls.
    expect(map2).toEqual(map1);

    // Path keys cover root, head, body, body's div, div's span.
    expect(typeof map1['']).toBe('string');
    expect(map1[''].startsWith(sync.clientId + ':')).toBe(true);
    expect(map1['1']).toBeDefined();   // body
    expect(map1['1.0']).toBeDefined(); // div
    expect(map1['1.0.0']).toBeDefined(); // span

    document.body.innerHTML = '';
  });

  test('_buildIdentityMap skips [snapshot-remove] elements', () => {
    document.body.innerHTML = '<div snapshot-remove>removed</div><div>kept</div>';

    // Synthesize a clone matching what captureSnapshot would produce
    // (snapshot-remove stripped). We just remove the matching element
    // from a deep clone of documentElement.
    const clone = document.documentElement.cloneNode(true);
    for (const el of clone.querySelectorAll('[snapshot-remove]')) el.remove();

    const map = sync._buildIdentityMap(document.documentElement, clone);

    // body has 1 child after filtering snapshot-remove from live; clone
    // also has 1 child. Lockstep walks both into "1.0".
    expect(map['1.0']).toBeDefined();
    // No "1.1" — snapshot-remove element was filtered out before recursion.
    expect(map['1.1']).toBeUndefined();

    document.body.innerHTML = '';
  });

  test('_buildIdentityMap skips subtree on lockstep child-count mismatch', () => {
    document.body.innerHTML = '<div><span>a</span><span>b</span></div>';

    // Clone with one fewer child to simulate an onbeforesnapshot handler
    // removing a sibling.
    const clone = document.documentElement.cloneNode(true);
    const div = clone.querySelector('div');
    div.removeChild(div.lastElementChild);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    sync.debug = true;
    const map = sync._buildIdentityMap(document.documentElement, clone);

    // Root, head, body all assigned. The div itself is reached, but its
    // children are skipped because counts diverge (live=2, clone=1).
    expect(map['']).toBeDefined();
    expect(map['1']).toBeDefined();
    expect(map['1.0']).toBeDefined();
    expect(map['1.0.0']).toBeUndefined();
    expect(map['1.0.1']).toBeUndefined();

    sync.debug = false;
    consoleSpy.mockRestore();
    document.body.innerHTML = '';
  });

  test('_mintId persists counter to sessionStorage', () => {
    sessionStorage.setItem('livesync-id-counter', '0');
    const fresh = new LiveSync();
    fresh._mintId();
    fresh._mintId();
    expect(sessionStorage.getItem('livesync-id-counter')).toBe('2');
    fresh.stop();

    // A new instance reloads the counter and resumes from there.
    const reborn = new LiveSync();
    expect(reborn.idCounter).toBe(2);
    const id = reborn._mintId();
    expect(id.endsWith(':3')).toBe(true);
    reborn.stop();
  });

  test('errors in morph are caught and do not break the queue', async () => {
    // Override the default deferred behavior for this test only.
    HyperMorph.morph.mockImplementationOnce(() => Promise.reject(new Error('boom')));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    sync.applyUpdate('<html><body>v1</body></html>', 1);
    flushFrame();
    // Wait for the rejected morph + isPaused setTimeout to settle.
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('applyUpdate failed'),
      expect.any(Error)
    );

    // Queue is healthy: a follow-up update still schedules and runs.
    sync.applyUpdate('<html><body>v2</body></html>', 2);
    expect(pendingFrames.length).toBe(1);
    flushFrame();
    await Promise.resolve();
    expect(HyperMorph.morph).toHaveBeenCalledTimes(2);

    await completeNextMorph();
    consoleSpy.mockRestore();
  });
});
