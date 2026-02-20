/**
 * @jest-environment jsdom
 */

import { parseOptionAttribute } from '../src/core/optionVisibility.js';
import optionVisibility from '../src/core/optionVisibility.js';

// Mock CSS.escape for Node environment
if (typeof CSS === 'undefined') {
  global.CSS = {
    escape: (str) => str.replace(/([^\w-])/g, '\\$1'),
    supports: () => true
  };
}

describe('optionVisibility', () => {
  // ========================================
  // parseOptionAttribute
  // ========================================

  describe('parseOptionAttribute', () => {
    describe('option: prefix (positive matching)', () => {
      test('parses single value', () => {
        const result = parseOptionAttribute('option:editmode', 'true');

        expect(result).toEqual({
          name: 'editmode',
          rawValue: 'true',
          values: ['true'],
          negated: false
        });
      });

      test('parses multi-value with pipe delimiter', () => {
        const result = parseOptionAttribute('option:status', 'saved|error|offline');

        expect(result).toEqual({
          name: 'status',
          rawValue: 'saved|error|offline',
          values: ['saved', 'error', 'offline'],
          negated: false
        });
      });

      test('parses two values', () => {
        const result = parseOptionAttribute('option:savestatus', 'saved|error');

        expect(result).toEqual({
          name: 'savestatus',
          rawValue: 'saved|error',
          values: ['saved', 'error'],
          negated: false
        });
      });

      test('keeps empty values in pipes for empty string matching', () => {
        const result = parseOptionAttribute('option:foo', 'a||b');

        expect(result).toEqual({
          name: 'foo',
          rawValue: 'a||b',
          values: ['a', '', 'b'],
          negated: false
        });
      });

      test('keeps leading/trailing empty values', () => {
        const result = parseOptionAttribute('option:foo', '|a|b|');

        expect(result).toEqual({
          name: 'foo',
          rawValue: '|a|b|',
          values: ['', 'a', 'b', ''],
          negated: false
        });
      });

      test('parses empty value for matching empty attribute', () => {
        const result = parseOptionAttribute('option:status', '');

        expect(result).toEqual({
          name: 'status',
          rawValue: '',
          values: [''],
          negated: false
        });
      });

      test('parses empty OR value with leading pipe', () => {
        const result = parseOptionAttribute('option:status', '|saved');

        expect(result).toEqual({
          name: 'status',
          rawValue: '|saved',
          values: ['', 'saved'],
          negated: false
        });
      });
    });

    describe('option-not: prefix (negation)', () => {
      test('parses single negated value', () => {
        const result = parseOptionAttribute('option-not:savestatus', 'saving');

        expect(result).toEqual({
          name: 'savestatus',
          rawValue: 'saving',
          values: ['saving'],
          negated: true
        });
      });

      test('parses multi-value negation', () => {
        const result = parseOptionAttribute('option-not:status', 'saving|error');

        expect(result).toEqual({
          name: 'status',
          rawValue: 'saving|error',
          values: ['saving', 'error'],
          negated: true
        });
      });
    });

    describe('invalid inputs', () => {
      test('returns null for non-option attribute', () => {
        expect(parseOptionAttribute('data-foo', 'bar')).toBeNull();
        expect(parseOptionAttribute('class', 'foo')).toBeNull();
        expect(parseOptionAttribute('id', 'test')).toBeNull();
      });

      test('returns null for option prefix without colon', () => {
        expect(parseOptionAttribute('optionfoo', 'bar')).toBeNull();
      });
    });

    describe('edge cases', () => {
      test('handles attribute names with special characters', () => {
        const result = parseOptionAttribute('option:my-attr', 'value');

        expect(result).toEqual({
          name: 'my-attr',
          rawValue: 'value',
          values: ['value'],
          negated: false
        });
      });

      test('handles values with special characters', () => {
        const result = parseOptionAttribute('option:foo', 'value-1');

        expect(result).toEqual({
          name: 'foo',
          rawValue: 'value-1',
          values: ['value-1'],
          negated: false
        });
      });

      test('preserves whitespace in values', () => {
        const result = parseOptionAttribute('option:foo', 'hello world');

        expect(result).toEqual({
          name: 'foo',
          rawValue: 'hello world',
          values: ['hello world'],
          negated: false
        });
      });
    });
  });

  // ========================================
  // generateCSS
  // ========================================

  describe('generateCSS', () => {
    test('returns empty string for empty patterns array', () => {
      const result = optionVisibility.generateCSS([]);
      expect(result).toBe('');
    });

    describe('option: (positive matching)', () => {
      test('generates conditional-hide rule for single value', () => {
        const patterns = [{
          name: 'editmode',
          rawValue: 'true',
          values: ['true'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        // Single rule: hide when NOT inside matching ancestor
        expect(css).not.toContain('@layer');
        expect(css).not.toContain('revert-layer');
        expect(css).toContain('[option\\:editmode="true"]:not(:is(');
        expect(css).toContain('[editmode="true"]');
        expect(css).toContain('[editmode="true"] *');
        expect(css).toContain('display:none!important');
      });

      test('generates scope selectors for multi-value', () => {
        const patterns = [{
          name: 'status',
          rawValue: 'saved|error',
          values: ['saved', 'error'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        // Attribute selector uses escaped pipe
        expect(css).toContain('[option\\:status="saved\\|error"]');
        // :not(:is(...)) contains both self and descendant matchers
        expect(css).toContain('[status="saved"]');
        expect(css).toContain('[status="error"]');
        expect(css).toContain('[status="saved"] *');
        expect(css).toContain('[status="error"] *');
      });

      test('generates scope selectors for three values', () => {
        const patterns = [{
          name: 'x',
          rawValue: 'a|b|c',
          values: ['a', 'b', 'c'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('[x="a"]');
        expect(css).toContain('[x="b"]');
        expect(css).toContain('[x="c"]');
        expect(css).toContain('[x="a"] *');
        expect(css).toContain('[x="b"] *');
        expect(css).toContain('[x="c"] *');
      });

      test('generates CSS for empty value', () => {
        const patterns = [{
          name: 'status',
          rawValue: '',
          values: [''],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('[option\\:status=""]');
        expect(css).toContain('[status=""]');
        expect(css).toContain('[status=""] *');
      });

      test('generates CSS for empty OR value', () => {
        const patterns = [{
          name: 'status',
          rawValue: '|saved',
          values: ['', 'saved'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('[status=""]');
        expect(css).toContain('[status="saved"]');
        expect(css).toContain('[status=""] *');
        expect(css).toContain('[status="saved"] *');
      });
    });

    describe('option-not: (negation)', () => {
      test('generates conditional-hide rule for single negation', () => {
        const patterns = [{
          name: 'status',
          rawValue: 'saving',
          values: ['saving'],
          negated: true
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).not.toContain('revert-layer');
        expect(css).toContain('[option-not\\:status="saving"]');
        expect(css).toContain('display:none!important');
        // Scope: ancestor has attr but not the excluded value
        expect(css).toContain('[status]:not([status="saving"])');
        expect(css).toContain('[status]:not([status="saving"]) *');
      });

      test('generates CSS for multi-value negation with :not() selector list', () => {
        const patterns = [{
          name: 'status',
          rawValue: 'saving|error',
          values: ['saving', 'error'],
          negated: true
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('[status]:not([status="saving"],[status="error"])');
        expect(css).toContain('[status]:not([status="saving"],[status="error"]) *');
      });
    });

    describe('multiple patterns', () => {
      test('generates CSS for multiple patterns', () => {
        const patterns = [
          { name: 'a', rawValue: '1', values: ['1'], negated: false },
          { name: 'b', rawValue: '2', values: ['2'], negated: true }
        ];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('[option\\:a="1"]');
        expect(css).toContain('[option-not\\:b="2"]');
      });
    });

    describe('special character escaping', () => {
      test('escapes special characters in attribute names', () => {
        const patterns = [{
          name: 'my-attr',
          rawValue: 'value',
          values: ['value'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('my-attr');
      });
    });
  });
});
