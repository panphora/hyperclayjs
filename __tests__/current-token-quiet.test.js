/**
 * @jest-environment jsdom
 *
 * The other half of the pre-rename warning: a host serving the current spelling says
 * nothing.
 *
 * Both names are set, because that is the shape a current host actually serves:
 * htmlclay 1.9.0 injects `savetoken` and goes on injecting `htmlclaytoken` forever,
 * for the documents frozen against the old spelling. So the old name being present is
 * not what makes a host stale, and warning on it alone would fire on every current
 * host, which is as useless as never firing and worse for the reader, who is told to
 * upgrade something already current.
 *
 * Its own file because the warning fires once per module instance and jest caches
 * modules per test file. Sitting below the legacy test it would import a module whose
 * latch was already spent, on a root that still carried `htmlclaytoken`, and it would
 * pass whatever the code did.
 */

import { saveToken } from '../src/core/host-attrs.js';

test('a host serving the current name says nothing, old name alongside or not', () => {
  document.documentElement.setAttribute('savetoken', 'tok-spec');
  document.documentElement.setAttribute('htmlclaytoken', 'tok-spec');
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  expect(saveToken()).toBe('tok-spec');

  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});
