/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "file:///tmp/exported-app.html"}
 *
 * Pinning the save URL to the origin must not throw on a document opened from
 * disk.
 *
 * `window.location.origin` is the STRING "null" on a file:// document, not the
 * value null, and `new URL(path, "null")` raises a TypeError. Building the URL
 * happens before fetch and outside the promise chain, so an unguarded pin would
 * throw synchronously out of a save whose contract says it never rejects.
 *
 * This is not a hypothetical environment. Downloading an app as a standalone HTML
 * file is a headline feature, so a document running from disk is ordinary. There
 * is no origin to pin to and no host to save to there, which is exactly why the
 * relative path is the right answer rather than a fallback that papers over a bug.
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

describe('a document opened from disk', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ msg: 'Saved', msgType: 'success' }),
      })
    );
    document.documentElement.removeAttribute('savetoken');
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.documentElement.removeAttribute('savetoken');
  });

  // The precondition. If this ever stops holding, the tests below stop testing
  // anything and would pass against an unguarded pin.
  test('reports the string "null" as its origin, which is what breaks new URL()', () => {
    expect(window.location.origin).toBe('null');
    // Not toThrow(TypeError): jsdom's URL comes from another realm, so the error
    // it raises is not this realm's TypeError even though a browser's is.
    expect(() => new URL('/_/save/TOK', window.location.origin)).toThrow();
  });

  test('a token save resolves without throwing and keeps the relative path', async () => {
    document.documentElement.setAttribute('savetoken', 'TOK');

    await expect(savePage()).resolves.toBeDefined();

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save/TOK');
  });

  test('a tokenless save resolves without throwing', async () => {
    await expect(savePage()).resolves.toBeDefined();

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save');
  });
});
