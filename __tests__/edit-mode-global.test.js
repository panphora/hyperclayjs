/**
 * @jest-environment jsdom
 *
 * isAdminOfCurrentResource: the opt-in window.__hyperclayEditMode global lets
 * standalone / demo / htmlclay pages turn on edit mode without the platform's
 * isAdminOfCurrentResource cookie. Precedence: ?editmode URL param > global >
 * cookie. Each case re-imports the module via isolateModules because isEditMode
 * is evaluated once at module load.
 *
 * The jest.mock factory may only reference variables prefixed with `mock`.
 */

const mockGet = jest.fn(() => null);

jest.mock('../src/utilities/cookie.js', () => ({
  __esModule: true,
  default: { get: (...args) => mockGet(...args) },
}));

// query.editmode is undefined here (no ?editmode in the jsdom URL), so the
// global/cookie branch is exercised.
jest.mock('../src/string-utilities/query.js', () => ({
  __esModule: true,
  default: {},
}));

function loadIsEditMode() {
  let mod;
  jest.isolateModules(() => {
    mod = require('../src/core/isAdminOfCurrentResource.js');
  });
  return mod.isEditMode;
}

describe('isAdminOfCurrentResource — window.__hyperclayEditMode', () => {
  afterEach(() => {
    delete window.__hyperclayEditMode;
    mockGet.mockReset();
    mockGet.mockReturnValue(null);
  });

  test('global true forces edit mode with no cookie', () => {
    window.__hyperclayEditMode = true;
    expect(loadIsEditMode()).toBe(true);
  });

  test('global false forces view mode even when the cookie is set', () => {
    window.__hyperclayEditMode = false;
    mockGet.mockReturnValue('true');
    expect(loadIsEditMode()).toBe(false);
  });

  test('global unset falls back to the cookie (backward compatible)', () => {
    mockGet.mockReturnValue('true');
    expect(loadIsEditMode()).toBe(true);
    mockGet.mockReturnValue(null);
    expect(loadIsEditMode()).toBe(false);
  });
});
