/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost:4321/index.html"}
 *
 * Which document a save is for rides in a header, and section 3 of the Malleable
 * HTML File specification names that header `Document-URL`.
 *
 * This library sent only `Page-URL`, the pre-spec spelling. Nothing broke, because
 * both Hyperclay hosts read `Document-URL` first and fall back to `Page-URL`, so
 * the gap was invisible from inside this workspace. It is not invisible from
 * outside it: a third-party host that implements the specification and nothing
 * else reads one header, and would have refused every save this library sent.
 *
 * Both names go out. Dropping the old one is the mirror mistake, since stored
 * customer documents hardcode a client that sends it and can never be updated.
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

const headers = () => global.fetch.mock.calls[0][1].headers;

describe('a save says which document it is for', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ msg: 'Saved', msgType: 'success' }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('savePage sends Document-URL, and Page-URL beside it', async () => {
    await savePage();

    expect(headers()['Document-URL']).toBe(window.location.href);
    expect(headers()['Page-URL']).toBe(window.location.href);
  });

  test('saveHtml sends Document-URL, and Page-URL beside it', async () => {
    await saveHtml('<html>given</html>');

    expect(headers()['Document-URL']).toBe(window.location.href);
    expect(headers()['Page-URL']).toBe(window.location.href);
  });
});
