/**
 * @jest-environment jsdom
 *
 * The save-toast module renders the server's message text. It must also honor
 * the server's severity: a successful save carrying msgType 'warning' is a
 * warning toast, anything else stays a success toast.
 */

jest.mock('../../src/core/isAdminOfCurrentResource.js', () => ({
  isEditMode: true,
  isOwner: true,
}));

jest.mock('../../src/ui/toast.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import toast from '../../src/ui/toast.js';
import '../../src/core/saveToast.js';

function fireSaved(detail) {
  document.dispatchEvent(new CustomEvent('hyperclay:save-saved', { detail }));
}

describe('saveToast — severity from msgType', () => {
  beforeEach(() => {
    toast.mockClear();
  });

  test("renders a warning toast when the server's msgType is 'warning'", () => {
    fireSaved({ msg: 'Saved, but the file changed on disk', msgType: 'warning' });

    expect(toast).toHaveBeenCalledWith('Saved, but the file changed on disk', 'warning');
  });

  test("renders a success toast when the server's msgType is 'success'", () => {
    fireSaved({ msg: 'Saved', msgType: 'success' });

    expect(toast).toHaveBeenCalledWith('Saved', 'success');
  });

  test('renders a success toast when msgType is absent', () => {
    fireSaved({ msg: 'Saved' });

    expect(toast).toHaveBeenCalledWith('Saved', 'success');
  });

  test('still renders errors and offline as error toasts', () => {
    document.dispatchEvent(new CustomEvent('hyperclay:save-error', { detail: { msg: 'boom' } }));
    expect(toast).toHaveBeenCalledWith('boom', 'error');

    document.dispatchEvent(new CustomEvent('hyperclay:save-offline', { detail: {} }));
    expect(toast).toHaveBeenCalledWith('No internet connection', 'error');
  });
});
