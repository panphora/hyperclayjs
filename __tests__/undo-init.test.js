/**
 * @jest-environment jsdom
 *
 * Spec 9 (edit-mode + safe-degrade): undo.js auto-starts the recorder in edit
 * mode and re-exports the vendored singleton. The non-edit-mode case lives in
 * undo-init-noedit.test.js so each file imports undo.js exactly once (no
 * jest.resetModules / re-require), which keeps babel's transform — and its
 * benign async Browserslist warning — settled during setup rather than landing
 * after a test boundary.
 *
 * undo.js runs init() as an import-time side effect, gated on the `isEditMode`
 * const from src/core/isAdminOfCurrentResource.js. Per repo convention (see
 * selectors.test.js) we mock that module to force edit mode on.
 *
 * The jest.mock factory may only reference variables prefixed with `mock`.
 */

const mockStart = jest.fn();

jest.mock('../src/vendor/hyper-undo.vendor.js', () => ({
  undo: { start: mockStart },
}));

jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({
  __esModule: true,
  isEditMode: true,
  isOwner: true,
}));

// Require every module under test at file-load time so all first-time babel
// transforms (and the deferred Browserslist warning they emit) happen during
// setup, never inside a test body where the late warn would land after a
// boundary.
const undoModule = require('../src/undo.js');
const { captureSnapshot } = require('../src/core/snapshot.js');
const Mutation = require('../src/utilities/mutation.js').default;

describe('undo.js init — edit mode', () => {
  test('edit mode invokes undo.start({ bindKeys: true })', () => {
    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(mockStart).toHaveBeenCalledWith({ bindKeys: true });
  });

  test('re-exports the vendored undo singleton', () => {
    expect(undoModule.undo).toBeDefined();
    expect(typeof undoModule.undo.start).toBe('function');
    expect(undoModule.default).toBe(undoModule.undo);
  });
});

describe('undo glue degrades safely when window.hyperclay.undo is absent', () => {
  let savedUndo;

  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  beforeEach(() => {
    savedUndo = window.hyperclay && window.hyperclay.undo;
    if (window.hyperclay) delete window.hyperclay.undo;
  });

  afterEach(async () => {
    if (window.hyperclay && savedUndo !== undefined) {
      window.hyperclay.undo = savedUndo;
    }
    await flush();
  });

  test('captureSnapshot flush is a safe no-op (does not throw)', () => {
    let clone;
    expect(() => {
      clone = captureSnapshot();
    }).not.toThrow();
    expect(clone.querySelector('body')).not.toBeNull();
  });

  test('Mutation.pause()/resume() are safe no-ops (do not throw / underflow)', () => {
    Mutation._pauseDepth = 0;
    expect(() => {
      Mutation.pause();
      Mutation.pause();
      Mutation.resume();
      Mutation.resume();
    }).not.toThrow();
    expect(Mutation._pauseDepth).toBe(0);
  });
});
