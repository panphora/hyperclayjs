/**
 * @jest-environment jsdom
 *
 * Scenario: a host too old to save to does not get to look editable.
 *
 * HTML Clay 1.8.0 and earlier send the pre-rename save token AND set the owner cookie
 * on every document serve. This library reads one token name, so it finds none, and the
 * cookie alone would hand the page full edit mode. Every save from that page posts to
 * the bare route, which that host does not have, so it 404s. An editable page that
 * keeps nothing is worse than a read-only one.
 *
 * Its own file: the module decides at import and jest caches it per file.
 */

test('the old token beats the owner cookie, and edit mode stays off', async () => {
  document.cookie = 'isAdminOfCurrentResource=true';
  document.documentElement.setAttribute('htmlclaytoken', 'tok-old');
  jest.spyOn(console, 'warn').mockImplementation(() => {});

  const mod = await import('../src/core/isAdminOfCurrentResource.js');

  expect(mod.isEditMode).toBe(false);
  // The cookie is still there and still true: this is the rung being overruled, not
  // absent. Without the stale check the same page reports edit mode on.
  expect(mod.isOwner).toBe(true);
});
