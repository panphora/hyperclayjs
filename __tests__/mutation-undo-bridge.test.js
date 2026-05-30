/**
 * @jest-environment jsdom
 *
 * Spec 8 (jest half): Mutation.pause()/resume() is reference-counted and bridges
 * to window.hyperclay.undo.pause()/resume().
 *
 * Important: mutation.js keeps its own `_pauseDepth` purely to gate the
 * observer's takeRecords() drain on the outermost release. The undo bridge is
 * forwarded 1:1 — every pause() calls undo.pause() and every non-underflowing
 * resume() calls undo.resume(). The "only resume on the outermost release"
 * guarantee for undo lives inside hyper-undo's OWN reference-counted
 * pause/resume (see comment in mutation.js: "undo.pause() is itself
 * reference-counted"), not in this layer. These tests assert the real
 * mutation.js contract: correct depth bookkeeping, 1:1 undo forwarding, and a
 * resume() underflow guard that never drops below zero or calls undo.resume().
 */

import Mutation from '../src/utilities/mutation.js';

describe('Mutation pause/resume undo bridge', () => {
  let originalUndo;
  let pauseSpy;
  let resumeSpy;

  beforeEach(() => {
    Mutation._pauseDepth = 0;
    pauseSpy = jest.fn();
    resumeSpy = jest.fn();
    originalUndo = window.hyperclay && window.hyperclay.undo;
    window.hyperclay = window.hyperclay || {};
    window.hyperclay.undo = { pause: pauseSpy, resume: resumeSpy };
  });

  afterEach(() => {
    Mutation._pauseDepth = 0;
    if (originalUndo === undefined) delete window.hyperclay.undo;
    else window.hyperclay.undo = originalUndo;
  });

  test('pause() bridges to window.hyperclay.undo.pause()', () => {
    Mutation.pause();
    expect(pauseSpy).toHaveBeenCalledTimes(1);
    expect(Mutation._pauseDepth).toBe(1);
  });

  test('nested pause/pause keeps depth and forwards each pause to undo.pause()', () => {
    Mutation.pause();
    Mutation.pause();
    expect(Mutation._pauseDepth).toBe(2);
    expect(pauseSpy).toHaveBeenCalledTimes(2);
  });

  test('balanced pause/pause/resume/resume returns to depth 0 and forwards each resume to undo.resume()', () => {
    Mutation.pause();
    Mutation.pause();

    Mutation.resume();
    expect(Mutation._pauseDepth).toBe(1);
    expect(resumeSpy).toHaveBeenCalledTimes(1);

    Mutation.resume();
    expect(Mutation._pauseDepth).toBe(0);
    expect(resumeSpy).toHaveBeenCalledTimes(2);
  });

  test('resume() without a matching pause() does not underflow or call undo.resume()', () => {
    expect(() => Mutation.resume()).not.toThrow();
    expect(Mutation._pauseDepth).toBe(0);
    expect(resumeSpy).not.toHaveBeenCalled();
  });

  test('extra resume() past the balance point is a no-op (no underflow, no extra undo.resume())', () => {
    Mutation.pause();
    Mutation.resume();
    expect(resumeSpy).toHaveBeenCalledTimes(1);

    Mutation.resume();
    expect(Mutation._pauseDepth).toBe(0);
    expect(resumeSpy).toHaveBeenCalledTimes(1);
  });

  test('pause/resume are safe no-ops when window.hyperclay.undo is absent', () => {
    delete window.hyperclay.undo;
    expect(() => {
      Mutation.pause();
      Mutation.pause();
      Mutation.resume();
      Mutation.resume();
    }).not.toThrow();
    expect(Mutation._pauseDepth).toBe(0);
  });
});
