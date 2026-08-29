/**
 * @jest-environment jsdom
 *
 * The save lane resolves the host's per-file token, and pairs the endpoint with the
 * right credential mode.
 *
 * Spec §9 names one attribute, `savetoken`, and that is now the only name read as a
 * credential. `htmlclaytoken` is the original spelling and is still STRIPPED before
 * every save and kept out of a peer's morph, because a host goes on injecting it
 * forever: a saved document is a frozen client that keeps reading whatever name the
 * library that wrote it read. Stripping it and accepting it are separate decisions,
 * and only the second one was reversed.
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
import { SAVE_TOKEN_ATTRS, HOST_TOKEN_ATTRS, HOST_IDENTITY_ATTRS, isTabLocalRootAttr } from '../src/utilities/root-attrs.js';

const pathOf = (url) => new URL(url, 'http://localhost').pathname;

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

    expect(pathOf(global.fetch.mock.calls[0][0])).toBe('/_/save/SPEC123');
  });

  // The pre-rename name is no longer a credential. A deliberate break: a document served by an
  // htmlclay at or below 1.8.0, which injects only the old name, posts to the bare route and gets a
  // 404 from a host that registers only POST /_/save/{token}. Taken knowingly while htmlclay is
  // days old, rather than carrying a second credential name in the save path forever, and
  // host-attrs.js warns in the console so the failure names its own cause.
  // ⚠️ htmlclay 1.9.0, which injects both names, must publish before this does.
  test('does not post to /_/save/{token} under the pre-rename name', async () => {
    document.documentElement.setAttribute('htmlclaytoken', 'OLD123');

    await savePage();

    expect(pathOf(global.fetch.mock.calls[0][0])).toBe('/_/save');
  });

  test('reads savetoken when a host still serves both spellings', async () => {
    document.documentElement.setAttribute('savetoken', 'SPEC123');
    document.documentElement.setAttribute('htmlclaytoken', 'OLD123');

    await savePage();

    expect(pathOf(global.fetch.mock.calls[0][0])).toBe('/_/save/SPEC123');
  });

  // An empty token is a host that minted none, and there is no second name to fall through to. The
  // bare route is right: it is the cookie-authenticated lane, so a host that meant to mint a token
  // and failed gets an honest refusal rather than a save posted under a stale credential.
  test('an empty savetoken means no token, with nothing to fall through to', async () => {
    document.documentElement.setAttribute('savetoken', '');
    document.documentElement.setAttribute('htmlclaytoken', 'OLD123');

    await savePage();

    expect(pathOf(global.fetch.mock.calls[0][0])).toBe('/_/save');
  });

  test('posts to the bare /_/save when the host minted no token', async () => {
    await savePage();

    expect(pathOf(global.fetch.mock.calls[0][0])).toBe('/_/save');
  });

  // saveHtml is the other entry point onto the same lane. The two used to call one
  // shared endpoint helper and must keep doing so; a fix applied to one only is the
  // same drift this item exists to close.
  test('saveHtml resolves the token the same way savePage does', async () => {
    document.documentElement.setAttribute('savetoken', 'SPEC123');

    await saveHtml('<html>direct</html>');

    expect(pathOf(global.fetch.mock.calls[0][0])).toBe('/_/save/SPEC123');
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
    document.documentElement.setAttribute('savetoken', 'OLD123');

    await saveHtml('<html>direct</html>');

    expect(global.fetch.mock.calls[0][1].credentials).toBe('omit');
  });
});

describe('the token list holds nothing but tokens', () => {
  // Any name in SAVE_TOKEN_ATTRS is returned by saveToken() and put straight into
  // the save URL, so a durable per-file identity in here would be posted as if it
  // were a credential. clayjs hit exactly that: one list served both the
  // token-resolution job and the morph-protection job, `htmlclayid` was appended
  // for the second, and it silently became a credential for the first. Both
  // libraries now keep two lists. Keep the guard structural rather than a comment.
  test('SAVE_TOKEN_ATTRS carries no durable identity attribute', () => {
    expect(SAVE_TOKEN_ATTRS).not.toContain('htmlclayid');
    expect(SAVE_TOKEN_ATTRS).not.toContain('documentid');
  });

  // The identity still needs the morph protection, under both spellings. htmlclay
  // serves `documentid` and reads either, and every file saved before that rename
  // holds `htmlclayid` on disk forever, so a list that knows one name leaves the
  // other unprotected: an incoming frame strips this tab's copy.
  test('both identity spellings are protected from a peer morph', () => {
    for (const name of ['documentid', 'htmlclayid']) {
      expect(HOST_IDENTITY_ATTRS).toContain(name);
      expect(HOST_TOKEN_ATTRS).toContain(name);
      expect(isTabLocalRootAttr(name, document.documentElement)).toBe(true);
    }
  });

  // The order is the contract for any reader taking the first name it finds: a
  // document carrying both must resolve to the current one.
  test('the current identity spelling is read first', () => {
    expect(HOST_IDENTITY_ATTRS[0]).toBe('documentid');
  });

  test('a durable identity in the DOM is never mistaken for a token', async () => {
    document.documentElement.setAttribute('htmlclayid', 'DURABLE-UUID');

    await savePage();

    expect(pathOf(global.fetch.mock.calls[0][0])).toBe('/_/save');
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
