/**
 * @jest-environment jsdom
 *
 * Scenario: dropping the pre-rename save token announces itself.
 *
 * The break is deliberate, and this library's only announcement of it is this one
 * console line: clayjs also takes edit mode away and puts a notice on the page, and
 * the decision for hyperclayjs was the warning instead. So a warning that silently
 * stopped firing would ship the break announcing nothing.
 *
 * The failure mode is why it is worth a test. htmlclay at or below 1.8.0 injects only
 * `htmlclaytoken` AND sets the edit-mode cookie on every serve, so the page stays
 * fully editable while every save 404s against a host that registers only
 * `POST /_/save/{token}`. Editable and unsaveable is the worst shape a break can take.
 *
 * Its own file, and the quiet case has its own file too. The warning fires once per
 * module instance and jest caches modules per test file, so two of these in one file
 * means the second one runs against a spent latch and cannot fail.
 */

import { saveToken } from '../src/core/host-attrs.js';

test('finding only the pre-rename spelling says so, once', () => {
  document.documentElement.setAttribute('htmlclaytoken', 'tok-old');
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  expect(saveToken()).toBeNull();
  saveToken();

  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0][0]).toContain('htmlclaytoken');
  expect(warn.mock.calls[0][0]).toContain('1.9.0');
  warn.mockRestore();
});
