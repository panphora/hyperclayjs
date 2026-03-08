/**
 * @jest-environment jsdom
 */

jest.mock('../src/core/savePage.js', () => ({
  beforeSave: jest.fn()
}));
jest.mock('../src/core/isAdminOfCurrentResource.js', () => ({
  isEditMode: false,
  isOwner: false
}));
jest.mock('../src/dom-utilities/onDomReady.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

import { SELECTOR as RESOURCES_SELECTOR, SELECTOR_INERT as RESOURCES_SELECTOR_INERT } from '../src/core/adminResources.js';
import { SELECTOR as CONTENTEDITABLE_SELECTOR } from '../src/core/adminContenteditable.js';
import { SELECTOR as ONCLICK_SELECTOR } from '../src/core/adminOnClick.js';
import { SELECTOR_DISABLED, SELECTOR_READONLY } from '../src/core/adminInputs.js';

describe('CSS selectors with colon attributes are valid', () => {
  test('adminResources SELECTOR', () => {
    document.querySelectorAll(RESOURCES_SELECTOR);
  });

  test('adminResources SELECTOR_INERT', () => {
    document.querySelectorAll(RESOURCES_SELECTOR_INERT);
  });

  test('adminContenteditable SELECTOR', () => {
    document.querySelectorAll(CONTENTEDITABLE_SELECTOR);
  });

  test('adminOnClick SELECTOR', () => {
    document.querySelectorAll(ONCLICK_SELECTOR);
  });

  test('adminInputs SELECTOR_DISABLED', () => {
    document.querySelectorAll(SELECTOR_DISABLED);
  });

  test('adminInputs SELECTOR_READONLY', () => {
    document.querySelectorAll(SELECTOR_READONLY);
  });
});
