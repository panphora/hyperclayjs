/**
 * @jest-environment jsdom
 *
 * exportToWindow.js owns the readiness contract. A vendored plugin cannot tell
 * "the platform is absent" from "the platform has not published that capability
 * yet", because the loader's rest wave evaluates concurrently. window.hyperclay.ready
 * exists from the moment export-to-window evaluates and settles only after every
 * requested module has loaded; the loader calls markReady()/markFailed() around
 * its waves. clayjs already exposes the same pair as clay.ready / clay:ready.
 *
 * The promise is created during module evaluation, so each test needs a fresh
 * module registry: jest.isolateModulesAsync re-runs the top-level install.
 */

const loadExportToWindow = async () => {
  let mod;
  await jest.isolateModulesAsync(async () => {
    mod = await import('../src/core/exportToWindow.js');
  });
  return mod;
};

describe('exportToWindow.js — the readiness contract', () => {
  afterEach(() => {
    delete window.__hyperclayNoAutoExport;
    delete window.hyperclay;
    delete window.h;
  });

  test('window.hyperclay.ready exists before markReady() and is still pending', async () => {
    await loadExportToWindow();

    expect(typeof window.hyperclay.ready.then).toBe('function');

    const settled = await Promise.race([
      window.hyperclay.ready.then(() => 'resolved', () => 'rejected'),
      Promise.resolve('pending')
    ]);
    expect(settled).toBe('pending');
  });

  test('markReady() resolves ready with window.hyperclay', async () => {
    const { markReady } = await loadExportToWindow();
    const namespace = window.hyperclay;

    markReady();

    await expect(window.hyperclay.ready).resolves.toBe(namespace);
  });

  test('markReady() dispatches hyperclay:ready on document once, carrying the namespace', async () => {
    const events = [];
    const handler = (event) => events.push(event);
    document.addEventListener('hyperclay:ready', handler);
    try {
      const { markReady } = await loadExportToWindow();
      expect(events.length).toBe(0);

      markReady();

      expect(events.length).toBe(1);
      expect(events[0].detail.hyperclay).toBe(window.hyperclay);
    } finally {
      document.removeEventListener('hyperclay:ready', handler);
    }
  });

  test('markFailed() rejects ready with the load error', async () => {
    const { markFailed } = await loadExportToWindow();
    const error = new Error('Unknown feature: nope');

    markFailed(error);

    await expect(window.hyperclay.ready).rejects.toBe(error);
  });

  test('a failed load leaves no unhandled rejection for a page that never awaits ready', async () => {
    const { markFailed } = await loadExportToWindow();
    const unhandled = [];
    const onUnhandled = (event) => {
      event.preventDefault?.();
      unhandled.push(event);
    };
    window.addEventListener('unhandledrejection', onUnhandled);
    try {
      markFailed(new Error('boom'));
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(unhandled).toEqual([]);
    } finally {
      window.removeEventListener('unhandledrejection', onUnhandled);
    }
  });

  test('markFailed() after markReady() cannot unsettle an already-resolved ready', async () => {
    const { markReady, markFailed } = await loadExportToWindow();
    const namespace = window.hyperclay;

    markReady();
    markFailed(new Error('too late'));

    await expect(window.hyperclay.ready).resolves.toBe(namespace);
  });

  test('a ready promise a page installed first is left in place', async () => {
    const preinstalled = new Promise(() => {});
    window.hyperclay = { ready: preinstalled };

    const { markReady } = await loadExportToWindow();
    expect(window.hyperclay.ready).toBe(preinstalled);

    // No promise of its own to settle, but the event still announces the moment.
    const events = [];
    const handler = (event) => events.push(event);
    document.addEventListener('hyperclay:ready', handler);
    try {
      markReady();
      expect(events.length).toBe(1);
    } finally {
      document.removeEventListener('hyperclay:ready', handler);
    }
  });

  test('the namespace and its alias are installed and auto-export is enabled', async () => {
    await loadExportToWindow();

    expect(window.__hyperclayNoAutoExport).toBe(false);
    expect(window.h).toBe(window.hyperclay);
  });
});
