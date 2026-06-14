/**
 * @jest-environment jsdom
 *
 * Popover behavior for the upgrade module, with the vendor, gating, and save
 * mocked (owner + edit mode). The module's import-time auto-init runs once
 * against the default mocks; each test drives initUpgrade/showPopover
 * directly with fakes.
 */

const mockCheck = jest.fn().mockResolvedValue(null);
const mockRun = jest.fn();
const mockSaveHtml = jest.fn();

jest.mock('../src/vendor/hyper-html-api-upgrade.vendor.js', () => ({
  __esModule: true,
  upgrade: { checkForUpdate: mockCheck, run: mockRun, extractAll: jest.fn(), shapeMatch: jest.fn() },
}));

jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({
  __esModule: true,
  isEditMode: true,
  isOwner: true,
}));

jest.mock('../src/core/savePageCore.js', () => ({
  __esModule: true,
  saveHtml: mockSaveHtml,
}));

const { initUpgrade, showPopover } = require('../src/upgrade.js');

const INFO = {
  available: true,
  currentVersion: '1.0.0',
  sourceVersion: '1.2.0',
  sourceUrl: 'https://canonical.example/',
};

const POPOVER_ID = 'hyperclay-upgrade-popover';
const popover = () => document.getElementById(POPOVER_ID);
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  mockCheck.mockReset().mockResolvedValue(null);
  mockRun.mockReset();
  mockSaveHtml.mockReset();
});

describe('initUpgrade', () => {
  test('renders the popover when an update is available', async () => {
    mockCheck.mockResolvedValue(INFO);
    const card = await initUpgrade();
    expect(card).toBe(popover());
    expect(card.textContent).toContain('Update available');
    expect(card.textContent).toContain('v1.0.0 → v1.2.0');
    expect(card.textContent).toContain('from: https://canonical.example/');
    expect(card.textContent).toContain('version history');
  });

  test('stays silent when up to date or check is inert', async () => {
    mockCheck.mockResolvedValue({ ...INFO, available: false });
    expect(await initUpgrade()).toBeNull();
    mockCheck.mockResolvedValue(null);
    expect(await initUpgrade()).toBeNull();
    expect(popover()).toBeNull();
  });

  test('does not check when not owner or not edit mode', async () => {
    expect(await initUpgrade({ owner: false })).toBeNull();
    expect(await initUpgrade({ editMode: false })).toBeNull();
    expect(mockCheck).not.toHaveBeenCalled();
  });

  test('Skip this version persists and suppresses future popovers', async () => {
    mockCheck.mockResolvedValue(INFO);
    const card = await initUpgrade();
    card.querySelector('[data-upgrade-action="skip"]').click();
    expect(popover()).toBeNull();
    expect(localStorage.getItem(
      'hha:upgrade-dismissed:https://canonical.example/:1.2.0',
    )).toBe('1');
    expect(await initUpgrade()).toBeNull();
  });

  test('Later removes the popover without persisting', async () => {
    mockCheck.mockResolvedValue(INFO);
    const card = await initUpgrade();
    card.querySelector('[data-upgrade-action="later"]').click();
    expect(popover()).toBeNull();
    expect(localStorage.length).toBe(0);
    expect(await initUpgrade()).not.toBeNull();
  });
});

describe('the Upgrade button', () => {
  test('happy path: run → saveHtml(html) → reload', async () => {
    const reload = jest.fn();
    mockRun.mockResolvedValue({ html: '<!DOCTYPE html>\n<html>new</html>', summary: {} });
    mockSaveHtml.mockResolvedValue({ err: null, data: { msgType: 'success' } });

    const card = showPopover(INFO, { reload });
    card.querySelector('[data-upgrade-action="run"]').click();
    await flush();

    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(mockSaveHtml).toHaveBeenCalledWith('<!DOCTYPE html>\n<html>new</html>');
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('a failing run surfaces the error and never saves or reloads', async () => {
    const reload = jest.fn();
    mockRun.mockRejectedValue(new Error('boom'));

    const card = showPopover(INFO, { reload });
    card.querySelector('[data-upgrade-action="run"]').click();
    await flush();

    expect(card.textContent).toContain('Upgrade failed: boom');
    expect(mockSaveHtml).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
    expect(card.querySelector('[data-upgrade-action="run"]').disabled).toBe(false);
  });

  test('a skipped save counts as failure, no reload', async () => {
    const reload = jest.fn();
    mockRun.mockResolvedValue({ html: '<html></html>', summary: {} });
    mockSaveHtml.mockResolvedValue({ err: null, data: { msgType: 'skipped', msg: 'Save already in progress' } });

    const card = showPopover(INFO, { reload });
    card.querySelector('[data-upgrade-action="run"]').click();
    await flush();

    expect(card.textContent).toContain('Save already in progress');
    expect(reload).not.toHaveBeenCalled();
  });
});
