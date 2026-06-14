/**
 * @jest-environment jsdom
 *
 * Gating half: when the visitor is not the owner (no
 * isAdminOfCurrentResource cookie), the module's import-time auto-init must
 * never call checkForUpdate — no fetch, no popover, fully inert. Kept in its
 * own file so it imports upgrade.js exactly once with the gate mocked false
 * (same pattern as undo-init-noedit.test.js).
 */

const mockCheck = jest.fn();

jest.mock('../src/vendor/hyper-html-api-upgrade.vendor.js', () => ({
  __esModule: true,
  upgrade: { checkForUpdate: mockCheck, run: jest.fn(), extractAll: jest.fn(), shapeMatch: jest.fn() },
}));

jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({
  __esModule: true,
  isEditMode: true,
  isOwner: false,
}));

jest.mock('../src/core/savePageCore.js', () => ({
  __esModule: true,
  saveHtml: jest.fn(),
}));

require('../src/upgrade.js');

describe('upgrade.js init — non-owner', () => {
  test('never calls checkForUpdate', async () => {
    await new Promise((r) => setTimeout(r, 0));
    expect(mockCheck).not.toHaveBeenCalled();
    expect(document.getElementById('hyperclay-upgrade-popover')).toBeNull();
  });
});
