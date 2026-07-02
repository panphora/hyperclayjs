/**
 * @jest-environment jsdom
 *
 * Live surfacing WITHOUT livesync: the panel re-checks its own GET /_/data-loss
 * when this tab fires `hyperclay:save-saved`, so a clobber caused by the tab's
 * own save surfaces with no live-sync module and no reload. Covers the
 * unconditional re-check (including when the save deleted the `api` island
 * itself), the guard-race backoff, the degraded->ready upgrade (a chip first
 * shown before the whole-file backup landed), same-id freshness (no downgrade),
 * UI-state preservation across a rebuild, the dg-busy skip, and the stale-GET
 * generation guard.
 *
 * data-loss-panel.js runs init() as an import-time side effect, gated on the
 * `isEditMode` const. Per repo convention (see undo-init.test.js) we mock that
 * module to force edit mode on, and stub the init() side-effect deps
 * (user-gesture, mutation) so the test stays hermetic.
 *
 * The onSaveSaved backoff schedule is [300, 1200, 3000]ms; the tests advance
 * fake timers past those points.
 *
 * The jest.mock factory may only reference variables prefixed with `mock`.
 */

jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({
  __esModule: true,
  isEditMode: true,
  isOwner: true,
}));

jest.mock('../src/utilities/user-gesture.js', () => ({
  __esModule: true,
  initUserGesture: jest.fn(),
  isUserDrivenNow: () => false,
  markUserDriven: jest.fn(),
}));

jest.mock('../src/utilities/mutation.js', () => ({
  __esModule: true,
  default: { ensureObserving: jest.fn() },
}));

// Import at file-load so init() installs the `hyperclay:save-saved` listener once.
const { mount, unmount } = require('../src/ui/data-loss-panel.js');

const ROOT_ID = 'hyperclay-data-loss-guard';
const getRoot = () => document.getElementById(ROOT_ID);
const revertBtn = () => getRoot().querySelector('[data-dg="revert"]');
const panel = () => getRoot().querySelector('.dg-panel');
// Drain the fetch().then(json).then(mount) microtask chain under fake timers.
const tick = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

function apiEvent(overrides = {}) {
  return {
    id: 'evt-live-1',
    fieldCount: 1,
    preview: [{ key: 'title', now: '— empty —', yours: 'My Title' }],
    restorable: true,
    canRevert: true,
    droppedAdditions: 0,
    lastWriteAt: 1000,
    lossSummary: { provenance: 'ui-background' },
    ...overrides,
  };
}
const jsonRes = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

function saveSaved() {
  document.dispatchEvent(new CustomEvent('hyperclay:save-saved', { detail: {} }));
}
function notify(detail) {
  document.dispatchEvent(new CustomEvent('hyperclay:notification', { detail }));
}

beforeEach(() => {
  jest.useFakeTimers();
  unmount();
  document.body.innerHTML = '';
  window.toast = jest.fn();
});

afterEach(() => {
  unmount();
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('save-saved re-checks /_/data-loss and mounts the chip', async () => {
  global.fetch = jest.fn(() => jsonRes({ event: apiEvent() }));

  saveSaved();
  jest.advanceTimersByTime(350); // fires the first (~300ms) check
  await tick();

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][0]).toContain('/_/data-loss');
  expect(getRoot()).not.toBeNull();
});

test('island deleted: a save that removed the api tag still surfaces the chip', async () => {
  // The clobber deleted the whole api island, so the DOM no longer carries it.
  // The server still fires (inc === null) and pins recovery data; the chip must
  // appear anyway — the re-check is unconditional, not DOM-gated.
  document.body.innerHTML = '<div>the api island was just deleted</div>';
  global.fetch = jest.fn(() => jsonRes({ event: apiEvent() }));

  saveSaved();
  jest.advanceTimersByTime(350);
  await tick();

  expect(global.fetch).toHaveBeenCalled();
  expect(getRoot()).not.toBeNull();
});

test('guard-race backoff: a slow guard commit still surfaces on a later check', async () => {
  let call = 0;
  global.fetch = jest.fn(() => {
    call += 1;
    return jsonRes({ event: call === 1 ? null : apiEvent() });
  });

  saveSaved();
  jest.advanceTimersByTime(350); // 300ms check: guard not committed yet
  await tick();
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(getRoot()).toBeNull();

  jest.advanceTimersByTime(900); // 1200ms check finds the event
  await tick();
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(getRoot()).not.toBeNull();
});

test('backoff stops early once the event is fully recoverable (canRevert:true)', async () => {
  global.fetch = jest.fn(() => jsonRes({ event: apiEvent() }));

  saveSaved();
  jest.advanceTimersByTime(350);
  await tick();
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(getRoot()).not.toBeNull();

  jest.advanceTimersByTime(3000); // settled → remaining timers were cancelled
  await tick();
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('a chip first shown with canRevert:false upgrades on a later backoff tick', async () => {
  let call = 0;
  global.fetch = jest.fn(() => {
    call += 1;
    // 300ms: event committed but whole-file backup not persisted yet
    // (canRevert:false); 1200ms: backup landed (canRevert:true).
    return jsonRes({ event: apiEvent({ canRevert: call < 2 ? false : true }) });
  });

  saveSaved();
  jest.advanceTimersByTime(350); // 300ms: degraded
  await tick();
  expect(revertBtn().disabled).toBe(true);
  expect(global.fetch).toHaveBeenCalledTimes(1);

  jest.advanceTimersByTime(900); // 1200ms: upgrade
  await tick();
  expect(revertBtn().disabled).toBe(false);
  expect(global.fetch).toHaveBeenCalledTimes(2);

  jest.advanceTimersByTime(3000); // now settled → no further fetches
  await tick();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('a re-arriving same-id event refreshes the chip affordances', () => {
  // First payload: whole-file backup not persisted yet → Revert disabled.
  mount(apiEvent({ id: 'evt-x', canRevert: false }));
  expect(revertBtn().disabled).toBe(true);

  // Same incident id, backup now landed → the chip must rebuild and enable Revert,
  // not short-circuit on the matching id.
  mount(apiEvent({ id: 'evt-x', canRevert: true }));
  expect(revertBtn().disabled).toBe(false);
});

test('a stale same-id payload does not downgrade a fresher one', () => {
  mount(apiEvent({ id: 'evt-y', canRevert: true }));
  expect(revertBtn().disabled).toBe(false);

  // A late/stale GET carrying canRevert:false for the same incident (same
  // lastWriteAt) must not re-disable Revert.
  mount(apiEvent({ id: 'evt-y', canRevert: false }));
  expect(revertBtn().disabled).toBe(false);

  // An older lastWriteAt for the same incident is also ignored.
  mount(apiEvent({ id: 'evt-y', canRevert: false, lastWriteAt: 500 }));
  expect(revertBtn().disabled).toBe(false);
});

test('open + view-changes state survive a same-id rebuild', () => {
  mount(apiEvent({ id: 'evt-z', canRevert: false }));
  getRoot().classList.add('is-open');
  panel().classList.add('show-changes');

  mount(apiEvent({ id: 'evt-z', canRevert: true }));
  expect(getRoot().classList.contains('is-open')).toBe(true);
  expect(panel().classList.contains('show-changes')).toBe(true);
});

test('a rebuild is skipped while a resolve POST is in flight (dg-busy)', () => {
  mount(apiEvent({ id: 'evt-b', canRevert: false })); // degraded
  const node = getRoot();
  node.classList.add('dg-busy'); // simulate an in-flight resolve

  // An upgraded payload would normally rebuild, but the busy shield must skip it
  // so an in-flight resolve isn't disrupted (no double-submit surface).
  mount(apiEvent({ id: 'evt-b', canRevert: true }));
  expect(getRoot()).toBe(node);            // not rebuilt
  expect(revertBtn().disabled).toBe(true); // still the degraded render
  expect(getRoot().classList.contains('dg-busy')).toBe(true);
});

test('an identical same-id payload does not rebuild the chip node', () => {
  mount(apiEvent({ id: 'evt-id' }));
  const node = getRoot();

  // Same id + lastWriteAt + canRevert + restorable → nothing rendered changed.
  mount(apiEvent({ id: 'evt-id' }));
  expect(getRoot()).toBe(node);

  // A materially-changed payload (restorable flips) rebuilds.
  mount(apiEvent({ id: 'evt-id', restorable: false }));
  expect(getRoot()).not.toBe(node);
});

test('a mounted chip is cleared when a later GET reports no pending event', async () => {
  let call = 0;
  global.fetch = jest.fn(() => {
    call += 1;
    return jsonRes({ event: call === 1 ? apiEvent() : null });
  });

  saveSaved();
  jest.advanceTimersByTime(350); // mounts (canRevert:true → backoff settles)
  await tick();
  expect(getRoot()).not.toBeNull();

  // A later save's poll finds the loss resolved/self-healed → clear the stale chip.
  saveSaved();
  jest.advanceTimersByTime(350);
  await tick();
  expect(getRoot()).toBeNull();
});

test('a failed resolve re-arms the backoff to reconcile the chip', async () => {
  mount(apiEvent({ id: 'evt-f', canRevert: false })); // degraded
  expect(revertBtn().disabled).toBe(true);

  global.fetch = jest.fn((url, opts) => (opts && opts.method === 'POST')
    ? Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'nope' }) })
    : jsonRes({ event: apiEvent({ id: 'evt-f', canRevert: true }) }));

  getRoot().querySelector('[data-dg="dismiss"]').click(); // POST fails → re-arm
  await tick();
  expect(getRoot()).not.toBeNull();

  jest.advanceTimersByTime(350); // re-armed poll returns the upgraded event
  await tick();
  expect(revertBtn().disabled).toBe(false);
});

test('a resolved notification with nothing mounted does not cancel a pending backoff', async () => {
  global.fetch = jest.fn(() => jsonRes({ event: apiEvent() }));

  saveSaved(); // schedules the backoff; nothing mounted yet (currentEvent null)
  // A stale resolved notice for a different incident must NOT cancel the backoff.
  notify({ msgType: 'data-loss', action: 'resolved', data: { id: 'other-incident' } });

  jest.advanceTimersByTime(350);
  await tick();
  expect(getRoot()).not.toBeNull();
});

test('a GET that resolves after unmount does not re-mount the chip', async () => {
  let resolveJson;
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => new Promise((r) => { resolveJson = r; }),
  }));

  saveSaved();
  jest.advanceTimersByTime(350); // 300ms check fires; its json() stays pending
  await tick();
  expect(getRoot()).toBeNull();

  unmount(); // user dismisses/resolves — bumps the fetch generation

  resolveJson({ event: apiEvent() }); // the stale in-flight GET now resolves
  await tick();
  expect(getRoot()).toBeNull(); // dropped by the generation guard
});
