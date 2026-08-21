/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost:4321/index.html"}
 *
 * The save body is the document, as text, on every host. There used to be a JSON
 * envelope {content, snapshotHtml, userDriven} sent to any page whose hostname was
 * localhost or 127.0.0.1, which is every page Hyperclay Local and HTML Clay serve.
 * It carried nothing the wire did not already have: the provenance bit is a header,
 * and the unstripped snapshot belongs to the live-sync relay, which live-sync.js
 * posts to on its own.
 *
 * The jsdom URL here is localhost on purpose. That was the exact condition that
 * used to switch the body shape, so this is the case that has to prove it no
 * longer does.
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

const opts = () => global.fetch.mock.calls[0][1];

describe('one body shape, on localhost too', () => {
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

  test('savePage sends the document as text, never JSON', async () => {
    expect(window.location.hostname).toBe('localhost');
    await savePage();

    expect(opts().headers['Content-Type']).toBeUndefined();
    expect(typeof opts().body).toBe('string');
    expect(opts().body).toBe('<html>captured</html>');
    expect(() => JSON.parse(opts().body)).toThrow();
  });

  test('saveHtml sends the document as text, never JSON', async () => {
    await saveHtml('<html>given</html>');

    expect(opts().headers['Content-Type']).toBeUndefined();
    expect(opts().body).toBe('<html>given</html>');
    expect(() => JSON.parse(opts().body)).toThrow();
  });

  test('the snapshot global the envelope read is never written', async () => {
    await savePage();
    expect(window.__hyperclaySnapshotHtml).toBeUndefined();
  });

  // Spec §9's name for the provenance bit. The host reads Save-Trigger first and
  // falls back to the pre-spec spelling, so this is safe to send on its own.
  test('the save trigger rides in a header, with the spec spelling', async () => {
    await savePage();
    expect(opts().headers['Save-Trigger']).toBe('auto');
    expect(opts().headers['X-Hyperclay-User-Driven']).toBeUndefined();
  });
});
