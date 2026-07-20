/**
 * @jest-environment jsdom
 *
 * The server can answer a successful save with msgType 'warning' (htmlclay does
 * this when an outside process changed the file since the server last wrote it).
 * savePage must thread that severity onto the hyperclay:save-saved event so UI
 * layers can render it; dropping it makes the warning invisible.
 */

// On globalThis, not module scope: jest hoists the mock factories and the import
// above any let/const here, and savePage.js captures a baseline at import time.
globalThis.mockSaveResponse = { msg: 'Saved' };
globalThis.mockCounter = 0;

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

jest.mock('../src/core/savePageCore.js', () => ({
  saveHtml: jest.fn((html, cb) => cb(null, globalThis.mockSaveResponse)),
  getPageContents: jest.fn(() => '<html></html>'),
  replacePageWith: jest.fn(),
  beforeSave: jest.fn(),
  isSaveInProgress: jest.fn(() => false),
}));

jest.mock('../src/core/snapshot.js', () => ({
  captureForComparison: jest.fn(() => `snapshot-${globalThis.mockCounter}`),
  captureForSaveAndComparison: jest.fn(() => ({
    forSave: `save-${globalThis.mockCounter}`,
    forComparison: `snapshot-${globalThis.mockCounter}`,
  })),
}));

import { savePage, savePageForce } from '../src/core/savePage.js';

function saveOnce(fn) {
  globalThis.mockCounter += 1;
  const seen = [];
  const onSaved = (e) => seen.push(e.detail);
  document.addEventListener('hyperclay:save-saved', onSaved);
  return fn().then((result) => {
    document.removeEventListener('hyperclay:save-saved', onSaved);
    return { seen, result };
  });
}

describe('savePage — msgType on the save-saved event', () => {
  test("carries the server's warning msgType through to the event detail", async () => {
    globalThis.mockSaveResponse = { msg: 'Saved, but the file changed on disk', msgType: 'warning' };

    const { seen, result } = await saveOnce(savePage);

    expect(seen).toHaveLength(1);
    expect(seen[0].msg).toBe('Saved, but the file changed on disk');
    expect(seen[0].msgType).toBe('warning');
    expect(result.msgType).toBe('warning');
  });

  test('carries a success msgType through to the event detail', async () => {
    globalThis.mockSaveResponse = { msg: 'Saved', msgType: 'success' };

    const { seen } = await saveOnce(savePage);

    expect(seen[0]).toMatchObject({ msg: 'Saved', msgType: 'success' });
  });

  test('leaves msgType empty when the server sends none', async () => {
    globalThis.mockSaveResponse = { msg: 'Saved' };

    const { seen } = await saveOnce(savePage);

    expect(seen[0].msg).toBe('Saved');
    expect(seen[0].msgType).toBe('');
  });

  test('savePageForce threads msgType too', async () => {
    globalThis.mockSaveResponse = { msg: 'Saved, but the file changed on disk', msgType: 'warning' };

    const { seen } = await saveOnce(savePageForce);

    expect(seen[0].msgType).toBe('warning');
  });
});
