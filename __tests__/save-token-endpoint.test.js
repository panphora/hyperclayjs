/**
 * @jest-environment jsdom
 *
 * The save lane resolves the host's per-file token under BOTH of its spellings,
 * and pairs the endpoint with the right credential mode.
 *
 * Spec §9 names the attribute `savetoken`; `htmlclaytoken` is the original name.
 * The save lane used to read only the old one while host-meta.js read both, so a
 * host serving the spec's spelling got a save posted to the bare `/_/save` with no
 * identity on it. Neither name may ever be dropped: a saved document is a frozen
 * client that keeps sending whatever library version wrote it, so a host still
 * serves the old name to documents written years ago.
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

import { savePage, saveHtml } from '../src/core/savePageCore.js';
import { SAVE_TOKEN_ATTRS, HOST_TOKEN_ATTRS } from '../src/utilities/root-attrs.js';

const ALL_NAMES = ['savetoken', 'htmlclaytoken', 'htmlclayid'];

function clearTokens() {
  for (const name of ALL_NAMES) document.documentElement.removeAttribute(name);
}

describe('save token resolution', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ msg: 'Saved', msgType: 'success' }),
      })
    );
    clearTokens();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clearTokens();
  });

  test('posts to /_/save/{token} when the spec-named savetoken is present', async () => {
    document.documentElement.setAttribute('savetoken', 'SPEC123');

    await savePage();

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save/SPEC123');
  });

  test('still posts to /_/save/{token} under the original htmlclaytoken name', async () => {
    document.documentElement.setAttribute('htmlclaytoken', 'OLD123');

    await savePage();

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save/OLD123');
  });

  test('prefers savetoken when a host serves both spellings', async () => {
    document.documentElement.setAttribute('savetoken', 'SPEC123');
    document.documentElement.setAttribute('htmlclaytoken', 'OLD123');

    await savePage();

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save/SPEC123');
  });

  test('falls through an empty savetoken to the older spelling', async () => {
    document.documentElement.setAttribute('savetoken', '');
    document.documentElement.setAttribute('htmlclaytoken', 'OLD123');

    await savePage();

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save/OLD123');
  });

  test('posts to the bare /_/save when the host minted no token', async () => {
    await savePage();

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save');
  });

  // saveHtml is the other entry point onto the same lane. The two used to call one
  // shared endpoint helper and must keep doing so; a fix applied to one only is the
  // same drift this item exists to close.
  test('saveHtml resolves the token the same way savePage does', async () => {
    document.documentElement.setAttribute('savetoken', 'SPEC123');

    await saveHtml('<html>direct</html>');

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save/SPEC123');
  });
});

describe('save credentials follow the endpoint', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ msg: 'Saved', msgType: 'success' }),
      })
    );
    clearTokens();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clearTokens();
  });

  // A host that mints tokens sandboxes its documents, so the save is cross-origin
  // from an opaque origin. It must never answer Access-Control-Allow-Credentials
  // there (`Origin: null` is forgeable), so asking for cookies gets the response
  // blocked AFTER the save has landed: the client reports a failure that did not
  // happen and drives a retry. The token is the identity; send no cookie with it.
  test('a token save asks for no cookies', async () => {
    document.documentElement.setAttribute('savetoken', 'SPEC123');

    await savePage();

    expect(global.fetch.mock.calls[0][1].credentials).toBe('omit');
  });

  test('a tokenless save still carries the cookie that authenticates it', async () => {
    await savePage();

    expect(global.fetch.mock.calls[0][1].credentials).toBe('same-origin');
  });

  test('saveHtml pairs credentials with the endpoint too', async () => {
    document.documentElement.setAttribute('htmlclaytoken', 'OLD123');

    await saveHtml('<html>direct</html>');

    expect(global.fetch.mock.calls[0][1].credentials).toBe('omit');
  });
});

describe('the token list holds nothing but tokens', () => {
  // This is the mistake clayjs made and is still carrying: its one list serves both
  // the token-resolution job and the morph-protection job, so `htmlclayid` was
  // appended for the second and silently became a credential for the first. Any
  // name in SAVE_TOKEN_ATTRS is returned by saveToken() and put straight into the
  // save URL, so a durable per-file identity in here would be posted as if it were
  // a credential. Keep the guard structural rather than a comment: clayjs has the
  // comment.
  test('SAVE_TOKEN_ATTRS carries no durable identity attribute', () => {
    expect(SAVE_TOKEN_ATTRS).not.toContain('htmlclayid');
    expect(SAVE_TOKEN_ATTRS).not.toContain('documentid');
  });

  test('a durable identity in the DOM is never mistaken for a token', async () => {
    document.documentElement.setAttribute('htmlclayid', 'DURABLE-UUID');

    await savePage();

    expect(global.fetch.mock.calls[0][0]).toBe('/_/save');
  });

  // The morph-protection list may grow past the token list, but the two must never
  // disagree about the token spellings themselves.
  test('the morph-protection list covers every token spelling', () => {
    for (const name of SAVE_TOKEN_ATTRS) expect(HOST_TOKEN_ATTRS).toContain(name);
  });

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ msg: 'Saved', msgType: 'success' }),
      })
    );
    clearTokens();
  });

  afterEach(() => {
    jest.clearAllMocks();
    clearTokens();
  });
});
