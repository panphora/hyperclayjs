/**
 * @jest-environment jsdom
 *
 * A save requested while an older snapshot is on the wire must cause one more
 * send of the latest state. The deferred public call still resolves `skipped`
 * for backward compatibility; the queued send is an internal follow-up.
 */

import { jest } from '@jest/globals';

jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({
  isEditMode: true,
  isOwner: true,
}));

jest.mock('../src/utilities/mutation.js', () => ({
  __esModule: true,
  default: { onAnyChange: jest.fn(() => () => {}) },
}));

jest.mock('../src/utilities/autosaveDebug.js', () => ({
  logSaveCheck: jest.fn(),
  logBaseline: jest.fn(),
}));

import {
  getLastSavedContents,
  savePage,
  savePageForce,
  setLastSavedContents,
} from '../src/core/savePage.js';
import { saveHtml, savePage as coreSavePage } from '../src/core/savePageCore.js';
import { captureForComparison } from '../src/core/snapshot.js';
import {
  _resetUserGesture,
  markUserDriven,
} from '../src/utilities/user-gesture.js';

function response() {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({ msg: 'Saved' }),
    text: async () => JSON.stringify({ msg: 'Saved' }),
  };
}

function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}

async function settle() {
  await Promise.resolve();
  await new Promise(resolve => setTimeout(resolve, 0));
  await Promise.resolve();
}

function content() {
  return document.getElementById('content');
}

beforeEach(() => {
  document.documentElement.setAttribute('savestatus', 'saved');
  document.body.innerHTML = '<div id="content">baseline</div>';
  setLastSavedContents(captureForComparison());
  _resetUserGesture();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('three requests during one slow save become one follow-up with the latest state', async () => {
  const firstResponse = deferred();
  global.fetch = jest.fn()
    .mockImplementationOnce(() => firstResponse.promise.then(response))
    .mockResolvedValue(response());

  content().textContent = 'first bytes';
  const firstSave = savePage();
  await Promise.resolve();

  content().textContent = 'second bytes';
  const secondResult = await savePage();
  content().textContent = 'latest bytes';
  const thirdResult = await savePage();

  expect(secondResult).toEqual({ msg: 'Save already in progress', msgType: 'skipped' });
  expect(thirdResult).toEqual({ msg: 'Save already in progress', msgType: 'skipped' });
  expect(global.fetch).toHaveBeenCalledTimes(1);

  firstResponse.resolve();
  await firstSave;
  await settle();

  const bodies = global.fetch.mock.calls.map(([, options]) => options.body);
  expect(bodies).toHaveLength(2);
  expect(bodies[0]).toContain('first bytes');
  expect(bodies[1]).toContain('latest bytes');
  expect(bodies[1]).not.toContain('second bytes');
});

test('a queued force save stays forced and later normal requests cannot downgrade it', async () => {
  const firstResponse = deferred();
  global.fetch = jest.fn()
    .mockImplementationOnce(() => firstResponse.promise.then(response))
    .mockResolvedValue(response());

  content().textContent = 'already captured';
  const firstSave = savePage();
  await Promise.resolve();

  await savePage();
  const forceResult = await savePageForce();
  await savePage();

  expect(forceResult.msgType).toBe('skipped');

  firstResponse.resolve();
  await firstSave;
  await settle();

  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(global.fetch.mock.calls[1][1].body).toContain('already captured');
});

test('a state save queued behind direct saveHtml still drains when the lane clears', async () => {
  const firstResponse = deferred();
  global.fetch = jest.fn()
    .mockImplementationOnce(() => firstResponse.promise.then(response))
    .mockResolvedValue(response());

  const directSave = saveHtml('<!DOCTYPE html><html><body>direct payload</body></html>');
  await Promise.resolve();

  content().textContent = 'latest DOM state';
  const queuedResult = await savePage();
  expect(queuedResult.msgType).toBe('skipped');

  firstResponse.resolve();
  await directSave;
  await settle();

  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(global.fetch.mock.calls[1][1].body).toContain('latest DOM state');
});

test('an edit made during a save stays dirty until the debounce requests another save', async () => {
  const firstResponse = deferred();
  global.fetch = jest.fn()
    .mockImplementationOnce(() => firstResponse.promise.then(response))
    .mockResolvedValue(response());

  content().textContent = 'sent bytes';
  const firstSave = savePage();
  await Promise.resolve();

  content().textContent = 'typed before debounce';
  firstResponse.resolve();
  await firstSave;
  await settle();

  expect(getLastSavedContents()).toContain('sent bytes');
  expect(getLastSavedContents()).not.toContain('typed before debounce');

  await savePage();
  await settle();
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(global.fetch.mock.calls[1][1].body).toContain('typed before debounce');
});

test('a failed follow-up never advances the baseline to its unsaved bytes', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  const firstResponse = deferred();
  global.fetch = jest.fn()
    .mockImplementationOnce(() => firstResponse.promise.then(response))
    .mockRejectedValueOnce(new Error('network down'));

  content().textContent = 'first bytes';
  const firstSave = savePage();
  await Promise.resolve();

  content().textContent = 'unsaved latest bytes';
  await savePage();

  firstResponse.resolve();
  await firstSave;
  await settle();

  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(getLastSavedContents()).toContain('first bytes');
  expect(getLastSavedContents()).not.toContain('unsaved latest bytes');
});

test('a user-driven edit queued behind a background save keeps its attribution', async () => {
  const firstResponse = deferred();
  global.fetch = jest.fn()
    .mockImplementationOnce(() => firstResponse.promise.then(response))
    .mockResolvedValue(response());

  content().textContent = 'background bytes';
  const firstSave = savePage();
  await Promise.resolve();

  markUserDriven();
  content().textContent = 'user bytes';
  await savePage();

  firstResponse.resolve();
  await firstSave;
  await settle();

  const triggers = global.fetch.mock.calls.map(([, options]) => options.headers['Save-Trigger']);
  expect(triggers).toEqual(['auto', 'user']);
});

test('a background edit queued behind a user-driven save does not inherit attribution', async () => {
  const firstResponse = deferred();
  global.fetch = jest.fn()
    .mockImplementationOnce(() => firstResponse.promise.then(response))
    .mockResolvedValue(response());

  markUserDriven();
  content().textContent = 'user bytes';
  const firstSave = savePage();
  await Promise.resolve();

  content().textContent = 'background bytes';
  await savePage();

  firstResponse.resolve();
  await firstSave;
  await settle();

  const triggers = global.fetch.mock.calls.map(([, options]) => options.headers['Save-Trigger']);
  expect(triggers).toEqual(['user', 'auto']);
});

// savePage checks the lane, then runs synchronous page hooks — beforeSave
// callbacks and hyperclay:snapshot-ready listeners, both inside
// captureForSaveAndComparison — before it sends. A hook that saves takes the lane
// in that gap, so savePage's own saveHtml is REFUSED and answers
// (null, {msgType:'skipped'}), which is not an error. Reading that as success
// recorded bytes that never left the browser as saved; dropping it instead lost
// them, because the entry check the coalescer hangs off had already passed.
test('a save refused after its snapshot was taken is parked, not dropped', async () => {
  global.fetch = jest.fn().mockResolvedValue(response());

  const takeLane = () => {
    document.removeEventListener('hyperclay:snapshot-ready', takeLane);
    saveHtml('<html>hook bytes</html>');
  };
  document.addEventListener('hyperclay:snapshot-ready', takeLane);

  const before = getLastSavedContents();
  content().textContent = 'never sent';

  const result = await savePage();
  expect(result.msgType).toBe('skipped');
  // Refused, so nothing of ours is on the wire yet and the baseline must not move.
  expect(global.fetch.mock.calls.map(call => call[1].body)).toEqual([
    '<html>hook bytes</html>',
  ]);
  expect(getLastSavedContents()).toBe(before);

  await settle();

  // The hook released the lane, so the follow-up carries the person's bytes.
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(global.fetch.mock.calls[1][1].body).toContain('never sent');
  expect(getLastSavedContents()).toContain('never sent');

  // The debounced 'saving' state was armed before the refusal. Nothing on the wire
  // answered it, so without an explicit cancel the page flips to 'saving' and stays.
  await new Promise(resolve => setTimeout(resolve, 600));
  expect(document.documentElement.getAttribute('savestatus')).not.toBe('saving');
});

// The recapture that absorbs onaftersave churn used to run on a setTimeout(0), so
// anything the browser scheduled between the save-saved event and that timer got
// absorbed too, including a mutation no request ever carried.
test('a save-saved handler mutating in a microtask does not poison the baseline', async () => {
  global.fetch = jest.fn().mockResolvedValue(response());

  const poison = () => {
    document.removeEventListener('hyperclay:save-saved', poison);
    queueMicrotask(() => { content().textContent = 'never sent'; });
  };
  document.addEventListener('hyperclay:save-saved', poison);

  content().textContent = 'sent bytes';
  await savePage();
  await settle();

  expect(global.fetch.mock.calls[0][1].body).not.toContain('never sent');
  expect(getLastSavedContents()).not.toContain('never sent');
  // Still dirty, so the next autosave sends it rather than comparing equal.
  expect(captureForComparison()).not.toBe(getLastSavedContents());
});

// A hook that starts its own save during capture used to leave the outer save
// claiming the lane anyway, putting two requests on the wire at once.
test('the core save refuses rather than claiming a lane taken during capture', async () => {
  global.fetch = jest.fn().mockResolvedValue(response());

  const takeLane = () => {
    document.removeEventListener('hyperclay:snapshot-ready', takeLane);
    saveHtml('<html>hook bytes</html>');
  };
  document.addEventListener('hyperclay:snapshot-ready', takeLane);

  const result = await coreSavePage();
  await settle();

  expect(result.msgType).toBe('skipped');
  expect(global.fetch.mock.calls.map(call => call[1].body)).toEqual([
    '<html>hook bytes</html>',
  ]);
});

// upgrade.js and replacePageWith write a document that did not come from this
// page and then reload. A follow-up that captures the live DOM across one of them
// posts the pre-replacement page over the new one, so the person clicks Upgrade,
// is told it worked, and lands back on the version they started from.
test('a save queued behind a document replacement is dropped, not sent over it', async () => {
  const replacement = deferred();
  global.fetch = jest.fn()
    .mockImplementationOnce(() => replacement.promise.then(response))
    .mockResolvedValue(response());

  content().textContent = 'stale local edit';
  const replacing = saveHtml('<html>BRAND NEW TEMPLATE</html>', undefined, {
    replacesDocument: true,
  });

  savePage();

  replacement.resolve();
  await replacing;
  await settle();

  expect(global.fetch.mock.calls.map(call => call[1].body)).toEqual([
    '<html>BRAND NEW TEMPLATE</html>',
  ]);
  // Dropped, not absorbed: the page is still dirty so the close warning holds.
  expect(getLastSavedContents()).not.toContain('stale local edit');
});

// A page's [onaftersave] code is arbitrary and can throw. That used to land in the
// same handler as a failed request: the caller heard the save failed when it had
// landed, heard it twice, and the "a human did this" marker was re-armed, so the
// NEXT background save reached the server claiming a person made it. The server
// decides how carefully to guard an overwrite with that marker.
test('a completion callback that throws does not turn a landed save into a failed one', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = jest.fn().mockResolvedValue(response());

  markUserDriven();
  const seen = [];
  const { err, data } = await saveHtml('<html>bytes</html>', (callbackErr, callbackData) => {
    seen.push({ callbackErr, callbackData });
    throw new Error('page handler blew up');
  });

  expect(seen).toHaveLength(1);
  expect(seen[0].callbackErr).toBe(null);
  expect(err).toBe(null);
  expect(data.msg).toBe('Saved');
  expect(global.fetch.mock.calls[0][1].headers['Save-Trigger']).toBe('user');

  // The lane is released in a .finally that runs after the await above resolves.
  await settle();

  await saveHtml('<html>later bytes</html>');
  expect(global.fetch.mock.calls[1][1].headers['Save-Trigger']).toBe('auto');
});
