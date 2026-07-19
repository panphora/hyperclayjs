/**
 * @jest-environment jsdom
 *
 * Integration tests for script-tag JSON merging through the live-sync
 * receive path, using the REAL vendored HyperMorph (no morph mock): an
 * incoming save must merge mergeable script tags ([merge] and rules tags)
 * against lastHtml instead of clobbering unsaved local keys.
 */

jest.mock('../src/utilities/mutation.js', () => ({
  __esModule: true,
  default: { pause: jest.fn(), resume: jest.fn() },
}));

import { LiveSync } from '../src/communication/live-sync.js';

function docHtml(bodyInner) {
  return `<html><head><title>t</title></head><body>${bodyInner}<p>x</p></body></html>`;
}

function storeTag(json) {
  return `<script type="application/json" merge="store">${json}</script>`;
}

describe('LiveSync script-tag JSON merge (real HyperMorph)', () => {
  let sync;

  beforeEach(() => {
    window.scrollTo = jest.fn();
    sync = new LiveSync();
  });

  function setLiveDocument(bodyInner) {
    document.documentElement.innerHTML = `<head><title>t</title></head><body>${bodyInner}<p>x</p></body>`;
  }

  test('unsaved local keys survive an incoming save, element identity preserved', async () => {
    setLiveDocument(storeTag('{"a": 1, "b": 1, "mine": true}'));
    const script = document.querySelector('script[merge]');

    sync.lastHtml = docHtml(storeTag('{"a": 1, "b": 1}'));
    const remote = docHtml(storeTag('{"a": 2, "b": 1}'));

    await sync._doApplyUpdate(remote, 1);

    expect(document.querySelector('script[merge]')).toBe(script);
    expect(JSON.parse(script.textContent)).toEqual({ a: 2, b: 1, mine: true });
    expect(sync.lastHtml).toBe(remote);
  });

  test('remote deletions propagate when lastHtml provides the base', async () => {
    setLiveDocument(storeTag('{"a": 1, "gone": 1, "mine": true}'));
    const script = document.querySelector('script[merge]');

    sync.lastHtml = docHtml(storeTag('{"a": 1, "gone": 1}'));
    await sync._doApplyUpdate(docHtml(storeTag('{"a": 1}')), 2);

    expect(JSON.parse(script.textContent)).toEqual({ a: 1, mine: true });
  });

  test('merge tags accept relaxed JSON by default (unquoted keys, trailing commas)', async () => {
    setLiveDocument(storeTag("{a: 1, b: 1, mine: 'yes',}"));
    const script = document.querySelector('script[merge]');

    sync.lastHtml = docHtml(storeTag('{a: 1, b: 1,}'));
    await sync._doApplyUpdate(docHtml(storeTag('{a: 2, b: 1,}')), 1);

    expect(document.querySelector('script[merge]')).toBe(script);
    expect(JSON.parse(script.textContent)).toEqual({ a: 2, b: 1, mine: 'yes' });
  });

  test('rules tags merge with relaxed JSON bodies', async () => {
    const rulesTag = (body) =>
      `<script type="application/json" data-rules-name="cms" data-rules-version="1">${body}</script>`;

    setLiveDocument(rulesTag("{'Title': '#t', 'Local': '#l'}"));
    const script = document.querySelector('script[data-rules-name]');

    sync.lastHtml = docHtml(rulesTag("{'Title': '#t'}"));
    await sync._doApplyUpdate(
      docHtml(rulesTag("{'Title': '#t', 'Remote': '#r'}")),
      3,
    );

    expect(document.querySelector('script[data-rules-name]')).toBe(script);
    expect(JSON.parse(script.textContent)).toEqual({
      Title: '#t',
      Local: '#l',
      Remote: '#r',
    });
  });

  test('rules tags with different versions do not pair (replace behavior)', async () => {
    const rulesTag = (version, body) =>
      `<script type="application/json" data-rules-name="cms" data-rules-version="${version}">${body}</script>`;

    setLiveDocument(rulesTag('1', '{"Title": "#t", "Local": "#l"}'));
    sync.lastHtml = docHtml(rulesTag('1', '{"Title": "#t"}'));
    await sync._doApplyUpdate(docHtml(rulesTag('2', '{"Title": "#z"}')), 4);

    const script = document.querySelector('script[data-rules-name]');
    expect(JSON.parse(script.textContent)).toEqual({ Title: '#z' });
  });

  test('malformed incoming merge tag keeps the local data and warns', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    setLiveDocument(storeTag('{"a": 1, "mine": true}'));
    const script = document.querySelector('script[merge]');

    sync.lastHtml = docHtml(storeTag('{"a": 1}'));
    await sync._doApplyUpdate(docHtml(storeTag('{broken')), 5);

    expect(JSON.parse(script.textContent)).toEqual({ a: 1, mine: true });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('first update without lastHtml still keeps local-only keys (two-way)', async () => {
    setLiveDocument(storeTag('{"a": 1, "mine": true}'));
    const script = document.querySelector('script[merge]');

    expect(sync.lastHtml).toBeNull();
    await sync._doApplyUpdate(docHtml(storeTag('{"a": 2}')), 6);

    expect(JSON.parse(script.textContent)).toEqual({ a: 2, mine: true });
  });
});
