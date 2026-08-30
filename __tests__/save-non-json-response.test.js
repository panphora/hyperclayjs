/**
 * @jest-environment jsdom
 *
 * The HTTP status is authoritative, and the body may not be the host's at all.
 *
 * A proxy, tunnel or captive portal answers with an HTML error page. Parsing that as
 * JSON first turned a plain "502 Bad Gateway" into "Unexpected token '<'", which names
 * the parser rather than the thing that went wrong, and sent whoever hit it looking in
 * the wrong place. The mirror case is a 200 with an empty body: json() rejects, so a
 * save that had actually landed was reported as failed.
 *
 * clayjs has read the body as text and parsed it defensively for a while
 * (src/core/save-core.js). This is the same shape, brought across.
 */

jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({ isEditMode: true }));

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

const respond = (fields) => {
  global.fetch = jest.fn(() => Promise.resolve(fields));
};

let logged;

beforeEach(() => {
  logged = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

test("an intermediary's HTML error page reports the status, not a parse error", async () => {
  respond({
    ok: false,
    status: 502,
    statusText: 'Bad Gateway',
    text: () => Promise.resolve('<!DOCTYPE html><html><body>502 Bad Gateway</body></html>'),
  });

  await savePage();

  const err = logged.mock.calls[0][1];
  expect(err.message).toContain('502');
  expect(err.message).not.toContain('JSON');
  expect(err.message).not.toContain('Unexpected token');
});

test('a 2xx with an empty body is a save that landed, not a failure', async () => {
  respond({ ok: true, status: 200, statusText: 'OK', text: () => Promise.resolve('') });

  const result = await savePage();

  expect(logged).not.toHaveBeenCalled();
  expect(result.msgType).toBe('success');
});

// The host's own error message still wins when it sent one. Tolerating a body that is
// not ours must not mean ignoring the body that is.
test("the host's own message is preferred over the bare status", async () => {
  respond({
    ok: false,
    status: 403,
    statusText: 'Forbidden',
    text: () => Promise.resolve(JSON.stringify({ msg: 'You do not own this page' })),
  });

  await savePage();

  expect(logged.mock.calls[0][1].message).toBe('You do not own this page');
});
