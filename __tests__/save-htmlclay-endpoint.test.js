/**
 * @jest-environment jsdom
 *
 * savePageCore routes saves to htmlclay's per-file token endpoint
 * (/_/save/{token}) when the htmlclaytoken attribute is present on <html>, and
 * to the bare /_/save otherwise. htmlclay carries the token in the URL path so
 * the same credential works for fetch and (future) EventSource live-sync, where
 * custom headers are not available.
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

describe('savePage — htmlclay endpoint routing', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ msg: 'Saved', msgType: 'success' }),
      })
    );
    document.documentElement.removeAttribute('htmlclaytoken');
    delete window.__hyperclaySnapshotHtml;
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.documentElement.removeAttribute('htmlclaytoken');
  });

  test('posts to /_/save/{token} with a plain-text body when htmlclaytoken is present', async () => {
    document.documentElement.setAttribute('htmlclaytoken', 'TOK123');

    const result = await savePage();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('/_/save/TOK123');
    expect(opts.body).toBe('<html>captured</html>');
    expect(opts.headers['Content-Type']).toBeUndefined();
    expect(result).toEqual({ msg: 'Saved', msgType: 'success' });
  });

  test('posts to bare /_/save when htmlclaytoken is absent', async () => {
    await savePage();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toBe('/_/save');
  });
});
