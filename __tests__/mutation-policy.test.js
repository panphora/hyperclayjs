/**
 * @jest-environment jsdom
 *
 * Region capability model: the resolver + per-consumer Mutation policy + the
 * snapshot serializer's recognition of the new naked attributes.
 */

import Mutation from '../src/utilities/mutation.js';
import {
  resolveRegionPolicy,
  isInert,
  skipForPolicy,
} from '../src/utilities/region-policy.js';
import { captureForSave, captureForComparison } from '../src/core/snapshot.js';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

// Build a detached element from a snippet (resolver walks parentElement, which
// works on detached trees too).
function el(html) {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  return wrap.firstElementChild;
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

describe('resolveRegionPolicy — axes per new attribute', () => {
  test('plain region: everything on', () => {
    expect(resolveRegionPolicy(el('<div></div>'))).toMatchObject({
      watched: true, autosaveTriggered: true, undoable: true, persist: 'full', extension: false,
    });
  });

  test('no-save: stripped, no autosave, still watched + undoable', () => {
    expect(resolveRegionPolicy(el('<div no-save></div>'))).toMatchObject({
      watched: true, autosaveTriggered: false, undoable: true, persist: 'none',
    });
  });

  test('no-trigger-autosave: saved, no autosave, watched + undoable', () => {
    expect(resolveRegionPolicy(el('<div no-trigger-autosave></div>'))).toMatchObject({
      watched: true, autosaveTriggered: false, undoable: true, persist: 'full',
    });
  });

  test('no-undo: undo off, everything else on', () => {
    expect(resolveRegionPolicy(el('<div no-undo></div>'))).toMatchObject({
      watched: true, autosaveTriggered: true, undoable: false, persist: 'full',
    });
  });

  test('no-watch: implies no autosave + no undo, still persisted', () => {
    expect(resolveRegionPolicy(el('<div no-watch></div>'))).toMatchObject({
      watched: false, autosaveTriggered: false, undoable: false, persist: 'full',
    });
  });

  test('freeze: persisted frozen, no autosave, watched + undoable', () => {
    expect(resolveRegionPolicy(el('<div freeze></div>'))).toMatchObject({
      watched: true, autosaveTriggered: false, undoable: true, persist: 'frozen',
    });
  });
});

describe('resolveRegionPolicy — legacy markers map to bundles', () => {
  test('mutations-ignore -> no-watch', () => {
    expect(resolveRegionPolicy(el('<div mutations-ignore></div>'))).toMatchObject({
      watched: false, autosaveTriggered: false, undoable: false, persist: 'full',
    });
  });
  test('save-remove -> no-save + no-undo', () => {
    expect(resolveRegionPolicy(el('<div save-remove></div>'))).toMatchObject({
      watched: true, autosaveTriggered: false, undoable: false, persist: 'none',
    });
  });
  test('save-ignore -> no-trigger-autosave + no-undo', () => {
    expect(resolveRegionPolicy(el('<div save-ignore></div>'))).toMatchObject({
      watched: true, autosaveTriggered: false, undoable: false, persist: 'full',
    });
  });
  test('save-freeze -> freeze + no-undo', () => {
    expect(resolveRegionPolicy(el('<div save-freeze></div>'))).toMatchObject({
      watched: true, autosaveTriggered: false, undoable: false, persist: 'frozen',
    });
  });
});

describe('resolveRegionPolicy — implications + precedence', () => {
  test('no-save + freeze -> no-save wins (persist none)', () => {
    expect(resolveRegionPolicy(el('<div no-save freeze></div>')).persist).toBe('none');
  });
  test('descendant inherits ancestor no-watch', () => {
    const root = el('<div no-watch><span></span></div>');
    expect(resolveRegionPolicy(root.querySelector('span')).watched).toBe(false);
  });
  test('descendant inherits ancestor no-save', () => {
    const root = el('<div no-save><span></span></div>');
    expect(resolveRegionPolicy(root.querySelector('span')).persist).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// isInert (intake drop) + skipForPolicy (per-consumer)
// ---------------------------------------------------------------------------

describe('isInert — the single intake drop', () => {
  test('no-watch / mutations-ignore are inert', () => {
    expect(isInert(el('<div no-watch></div>'))).toBe(true);
    expect(isInert(el('<div mutations-ignore></div>'))).toBe(true);
  });
  test('no-save / save-ignore / freeze are NOT inert (resolved per-consumer)', () => {
    expect(isInert(el('<div no-save></div>'))).toBe(false);
    expect(isInert(el('<div save-ignore></div>'))).toBe(false);
    expect(isInert(el('<div freeze></div>'))).toBe(false);
  });
});

describe('skipForPolicy — require axes', () => {
  const skip = (node, require, lit) => skipForPolicy(resolveRegionPolicy(node), require, lit);

  test("'observed' skips only no-watch", () => {
    expect(skip(el('<div no-watch></div>'), 'observed')).toBe(true);
    expect(skip(el('<div no-save></div>'), 'observed')).toBe(false);
    expect(skip(el('<div no-trigger-autosave></div>'), 'observed')).toBe(false);
    expect(skip(el('<div freeze></div>'), 'observed')).toBe(false);
    expect(skip(el('<div save-ignore></div>'), 'observed')).toBe(false);
  });

  test("'autosave' skips every autosave-off region", () => {
    expect(skip(el('<div no-save></div>'), 'autosave')).toBe(true);
    expect(skip(el('<div no-trigger-autosave></div>'), 'autosave')).toBe(true);
    expect(skip(el('<div freeze></div>'), 'autosave')).toBe(true);
    expect(skip(el('<div no-watch></div>'), 'autosave')).toBe(true);
    expect(skip(el('<div></div>'), 'autosave')).toBe(false);
    expect(skip(el('<div no-undo></div>'), 'autosave')).toBe(false); // no-undo still triggers autosave
  });

  test("'undo' skips no-watch + no-undo but NOT no-trigger-autosave (capability #3)", () => {
    expect(skip(el('<div no-undo></div>'), 'undo')).toBe(true);
    expect(skip(el('<div no-watch></div>'), 'undo')).toBe(true);
    expect(skip(el('<div no-trigger-autosave></div>'), 'undo')).toBe(false); // autosave-off yet undoable
    expect(skip(el('<div></div>'), 'undo')).toBe(false);
  });

  test('default (no require) preserves the legacy four-marker skip', () => {
    expect(skip(el('<div mutations-ignore></div>'))).toBe(true);
    expect(skip(el('<div save-remove></div>'))).toBe(true);
    expect(skip(el('<div save-ignore></div>'))).toBe(true);
    expect(skip(el('<div save-freeze></div>'))).toBe(true);
    expect(skip(el('<div></div>'))).toBe(false);
    expect(skip(el('<div no-undo></div>'))).toBe(false); // undo-only opt-out still passes through
  });

  test('literal skip array escape hatch', () => {
    expect(skip(el('<div no-undo></div>'), undefined, ['no-undo'])).toBe(true);
    expect(skip(el('<div></div>'), undefined, ['no-undo'])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// End-to-end: the one observer delivers per-consumer
// ---------------------------------------------------------------------------

describe('Mutation — per-consumer delivery', () => {
  let unsubs = [];
  afterEach(async () => {
    unsubs.forEach(u => u && u());
    unsubs = [];
    Mutation._pauseDepth = 0;
    document.body.innerHTML = '';
    await flush();
  });

  const parentsSeen = fn => fn.mock.calls.flatMap(c => c[0]).map(ch => ch.element.parentElement?.id);

  test("require:'observed' receives adds inside save-ignore / no-save but NOT inside no-watch", async () => {
    document.body.innerHTML =
      '<div id="ignore" save-ignore></div><div id="nosave" no-save></div><div id="watch" no-watch></div>';
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAddElement({ debounce: 0, require: 'observed' }, fn));

    document.getElementById('ignore').appendChild(document.createElement('span'));
    document.getElementById('nosave').appendChild(document.createElement('span'));
    document.getElementById('watch').appendChild(document.createElement('span'));
    await flush();

    const parents = parentsSeen(fn);
    expect(parents).toContain('ignore'); // the bug fix: behaviors run inside save-* regions
    expect(parents).toContain('nosave');
    expect(parents).not.toContain('watch'); // no-watch is the one intake drop
  });

  test("require:'autosave' skips no-save / no-trigger-autosave regions", async () => {
    document.body.innerHTML =
      '<div id="plain"></div><div id="nta" no-trigger-autosave></div><div id="nosave" no-save></div>';
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAddElement({ debounce: 0, require: 'autosave' }, fn));

    document.getElementById('plain').appendChild(document.createElement('span'));
    document.getElementById('nta').appendChild(document.createElement('span'));
    document.getElementById('nosave').appendChild(document.createElement('span'));
    await flush();

    const parents = parentsSeen(fn);
    expect(parents).toContain('plain');
    expect(parents).not.toContain('nta');
    expect(parents).not.toContain('nosave');
  });

  test("require:'undo' delivers no-trigger-autosave adds but skips no-undo (capability #3)", async () => {
    document.body.innerHTML = '<div id="nta" no-trigger-autosave></div><div id="nu" no-undo></div>';
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAddElement({ debounce: 0, require: 'undo' }, fn));

    document.getElementById('nta').appendChild(document.createElement('span'));
    document.getElementById('nu').appendChild(document.createElement('span'));
    await flush();

    const parents = parentsSeen(fn);
    expect(parents).toContain('nta');
    expect(parents).not.toContain('nu');
  });
});

describe('Mutation — detached removes recover their ancestor region', () => {
  // The subtle path: a node REMOVED from inside an ignored region is detached,
  // so resolveRegionPolicy(element) alone can't see the ancestor markers. The
  // change.parent (still attached, inside the region) merge must recover them —
  // else autosave/default consumers would wrongly fire on removals in the panel.
  let unsubs = [];
  afterEach(async () => {
    unsubs.forEach(u => u && u());
    unsubs = [];
    document.body.innerHTML = '';
    await flush();
  });

  test("require:'autosave' does NOT receive a node removed from inside a save-ignore region", async () => {
    document.body.innerHTML = '<div id="panel" save-ignore><span id="item"></span></div>';
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onRemoveElement({ debounce: 0, require: 'autosave' }, fn));

    document.getElementById('item').remove();
    await flush();

    expect(fn).not.toHaveBeenCalled();
  });

  test("require:'observed' DOES receive a remove from inside save-ignore (behaviors/teardown see the panel)", async () => {
    document.body.innerHTML = '<div id="panel" save-ignore><span id="item"></span></div>';
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onRemoveElement({ debounce: 0, require: 'observed' }, fn));

    document.getElementById('item').remove();
    await flush();

    const removed = fn.mock.calls.flatMap(c => c[0]).map(ch => ch.element.id);
    expect(removed).toContain('item');
  });

  test('default consumer does NOT receive any node of a nested subtree removed from inside save-remove', async () => {
    document.body.innerHTML =
      '<div id="panel" save-remove><div id="branch"><span id="leaf"></span></div></div>';
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onRemoveElement({ debounce: 0 }, fn)); // no require => legacy default skip

    document.getElementById('branch').remove(); // removes #branch AND #leaf
    await flush();

    expect(fn).not.toHaveBeenCalled();
  });
});

describe('Mutation — pausable', () => {
  let unsubs = [];
  afterEach(async () => {
    unsubs.forEach(u => u && u());
    unsubs = [];
    Mutation._pauseDepth = 0;
    document.body.innerHTML = '';
    await flush();
  });

  test('pausable:false fires during pause; pausable:true does not', async () => {
    const box = document.createElement('div');
    document.body.appendChild(box);
    await flush();

    const nonPausable = jest.fn();
    const pausable = jest.fn();
    unsubs.push(Mutation.onAddElement({ debounce: 0, require: 'observed', pausable: false }, nonPausable));
    unsubs.push(Mutation.onAddElement({ debounce: 0, require: 'observed' }, pausable));

    Mutation.pause();
    box.appendChild(document.createElement('span'));
    await flush();

    expect(nonPausable).toHaveBeenCalled();
    expect(pausable).not.toHaveBeenCalled();

    Mutation.resume();
  });

  test('pausable:false receives the resume-boundary batch', async () => {
    const box = document.createElement('div');
    document.body.appendChild(box);
    await flush();

    const nonPausable = jest.fn();
    unsubs.push(Mutation.onAddElement({ debounce: 0, require: 'observed', pausable: false }, nonPausable));

    Mutation.pause();
    box.appendChild(document.createElement('span'));
    // Resume before the observer's async callback runs: the pending record is
    // drained by resume() and routed to the non-pausable callback.
    Mutation.resume();
    await flush();

    expect(nonPausable).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Snapshot serializer
// ---------------------------------------------------------------------------

describe('snapshot serializer — region attributes', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('forSave strips [no-save] + legacy [save-remove], keeps [freeze] + plain', () => {
    document.body.innerHTML =
      '<div id="keep">k</div><div id="ns" no-save>n</div><div id="sr" save-remove>r</div><div id="fz" freeze>f</div>';
    const html = captureForSave({ emitForSync: false });
    expect(html).toContain('id="keep"');
    expect(html).not.toContain('id="ns"');
    expect(html).not.toContain('id="sr"');
    expect(html).toContain('id="fz"'); // freeze regions ARE saved (just frozen)
  });

  test('forComparison strips every autosave-off region', () => {
    document.body.innerHTML =
      '<div id="keep">k</div><div id="nta" no-trigger-autosave>n</div><div id="fz" freeze>f</div>' +
      '<div id="nw" no-watch>w</div><div id="si" save-ignore>i</div>';
    const html = captureForComparison();
    expect(html).toContain('id="keep"');
    expect(html).not.toContain('id="nta"');
    expect(html).not.toContain('id="fz"');
    expect(html).not.toContain('id="nw"');
    expect(html).not.toContain('id="si"');
  });
});
