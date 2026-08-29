/**
 * @jest-environment jsdom
 *
 * The save URL is pinned to the real origin, so an authored <base href> cannot
 * redirect a save.
 *
 * fetch resolves a relative URL against the DOCUMENT's base URL, which `<base
 * href>` sets. A malleable document is arbitrary author HTML that gets forked and
 * shared, so a root-relative save path let a document send its own save, and the
 * per-document token sitting in that path, to an origin the document chose.
 *
 * The companion file save-url-file-origin.test.js covers the other half: pinning
 * must not throw on a document that has no real origin.
 */

jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({
  isEditMode: true,
}));

jest.mock('../src/core/snapshot.js', () => ({
  captureForSave: jest.fn(() => '<html>captured</html>'),
  isCodeMirrorPage: jest.fn(() => false),
  getCodeMirrorContents: jest.fn(() => ''),
  beforeSave: jest.fn(),
  getPageContents: jest.fn(),
  onSnapshot: jest.fn(),
  onPrepareForSave: jest.fn(),
}));

import { savePage } from '../src/core/savePageCore.js';

const ORIGIN = window.location.origin;

describe('an authored <base href> cannot move the save', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ msg: 'Saved', msgType: 'success' }),
      })
    );
    document.head.innerHTML = '<base href="https://evil.example/">';
    document.documentElement.removeAttribute('savetoken');
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('savetoken');
  });

  test('the base tag really does move a relative URL, which is why this matters', () => {
    expect(document.baseURI).toBe('https://evil.example/');
    expect(new URL('/_/save/TOK', document.baseURI).href)
      .toBe('https://evil.example/_/save/TOK');
  });

  test('a token save still goes to the real origin', async () => {
    document.documentElement.setAttribute('savetoken', 'SECRET-TOKEN');

    await savePage();

    const url = global.fetch.mock.calls[0][0];
    expect(url).toBe(`${ORIGIN}/_/save/SECRET-TOKEN`);
    expect(url).not.toContain('evil.example');
  });

  test('a tokenless save is pinned too', async () => {
    await savePage();

    expect(global.fetch.mock.calls[0][0]).toBe(`${ORIGIN}/_/save`);
  });
});
