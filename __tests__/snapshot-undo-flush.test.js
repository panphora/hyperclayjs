/**
 * @jest-environment jsdom
 *
 * Spec 7: captureSnapshot() must force-close the undo idle batch by calling
 * window.hyperclay.undo.flush() BEFORE it clones the DOM, so that a post-save
 * Cmd+Z reverts the last edit and not back across the save boundary. Also
 * verifies the flush is a safe no-op when the undo bridge is absent.
 */

import { captureSnapshot } from '../src/core/snapshot.js';

describe('captureSnapshot — undo flush ordering', () => {
  let originalUndo;

  beforeEach(() => {
    originalUndo = window.hyperclay && window.hyperclay.undo;
    document.body.innerHTML = '<div id="probe">before</div>';
  });

  afterEach(() => {
    if (window.hyperclay) {
      if (originalUndo === undefined) delete window.hyperclay.undo;
      else window.hyperclay.undo = originalUndo;
    }
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('calls undo.flush() before cloning the documentElement', () => {
    const order = [];
    const flush = jest.fn(() => order.push('flush'));

    window.hyperclay = window.hyperclay || {};
    window.hyperclay.undo = { flush };

    const cloneSpy = jest
      .spyOn(document.documentElement, 'cloneNode')
      .mockImplementation(function () {
        order.push('clone');
        const el = document.createElement('html');
        el.innerHTML = this.innerHTML;
        return el;
      });

    captureSnapshot();

    expect(flush).toHaveBeenCalledTimes(1);
    expect(cloneSpy).toHaveBeenCalledTimes(1);
    expect(order).toEqual(['flush', 'clone']);
    expect(flush.mock.invocationCallOrder[0]).toBeLessThan(
      cloneSpy.mock.invocationCallOrder[0]
    );
  });

  test('does not throw when window.hyperclay.undo is absent', () => {
    if (window.hyperclay) delete window.hyperclay.undo;

    let clone;
    expect(() => {
      clone = captureSnapshot();
    }).not.toThrow();
    expect(clone.querySelector('#probe').textContent).toBe('before');
  });

  test('does not throw when window.hyperclay itself is absent', () => {
    const saved = window.hyperclay;
    delete window.hyperclay;
    try {
      expect(() => captureSnapshot()).not.toThrow();
    } finally {
      window.hyperclay = saved;
    }
  });
});
