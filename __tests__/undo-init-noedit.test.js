/**
 * @jest-environment jsdom
 *
 * Spec 9 (non-edit-mode half): when NOT in edit mode, undo.js's import-time
 * init() must not start the recorder / bind keys. Kept in its own file so it
 * imports undo.js exactly once with isEditMode mocked to false (see the
 * companion undo-init.test.js for why single-import files avoid a deferred
 * babel transform warning landing after teardown).
 *
 * The jest.mock factory may only reference variables prefixed with `mock`.
 */

const mockStart = jest.fn();

jest.mock('../src/vendor/hyper-undo.vendor.js', () => ({
  undo: { start: mockStart },
}));

jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({
  __esModule: true,
  isEditMode: false,
  isOwner: false,
}));

require('../src/undo.js');

describe('undo.js init — non-edit mode', () => {
  test('does not bind keys / start the recorder', () => {
    expect(mockStart).not.toHaveBeenCalled();
  });
});
