/**
 * @jest-environment jsdom
 *
 * mutation.js installs window.hyperclay.Mutation as an import-time side effect
 * (gated on !window.__hyperclayNoAutoExport, which is unset under jsdom so the
 * install runs). Right after the install it dispatches a
 * 'hyperclay:mutation-ready' CustomEvent on document so consumers — notably
 * hypercms's ?cms=true auto-open — can react instead of polling.
 *
 * The dispatch fires during module evaluation, so the listener must be attached
 * BEFORE the import. jest.isolateModulesAsync gives a fresh module registry per
 * test, re-running mutation.js's top-level install/dispatch each time.
 */

describe('mutation.js — hyperclay:mutation-ready dispatch', () => {
  afterEach(() => {
    delete window.__hyperclayNoAutoExport;
    if (window.hyperclay) delete window.hyperclay.Mutation;
    delete window.Mutation;
  });

  test('dispatches hyperclay:mutation-ready on document after installing window.hyperclay.Mutation', async () => {
    const events = [];
    const handler = (e) => events.push(e);
    document.addEventListener('hyperclay:mutation-ready', handler);
    try {
      let imported;
      await jest.isolateModulesAsync(async () => {
        imported = (await import('../src/utilities/mutation.js')).default;
      });

      expect(events.length).toBe(1);
      // window.hyperclay.Mutation is installed at dispatch time.
      expect(window.hyperclay.Mutation).toBe(imported);
      // detail carries the Mutation singleton.
      expect(events[0].detail.Mutation).toBe(imported);
    } finally {
      document.removeEventListener('hyperclay:mutation-ready', handler);
    }
  });

  test('does not dispatch when auto-export is suppressed by the loader', async () => {
    window.__hyperclayNoAutoExport = true;
    const events = [];
    const handler = (e) => events.push(e);
    document.addEventListener('hyperclay:mutation-ready', handler);
    try {
      await jest.isolateModulesAsync(async () => {
        await import('../src/utilities/mutation.js');
      });

      expect(events.length).toBe(0);
      expect(window.hyperclay && window.hyperclay.Mutation).toBeFalsy();
    } finally {
      document.removeEventListener('hyperclay:mutation-ready', handler);
    }
  });
});
