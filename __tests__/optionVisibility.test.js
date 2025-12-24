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
      test('generates CSS for single value', () => {
        const patterns = [{
          name: 'editmode',
          rawValue: 'true',
          values: ['true'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('@layer option-visibility');
        expect(css).toContain('[option\\:editmode="true"]');
        expect(css).toContain('display:none!important');
        expect(css).toContain('[editmode="true"] [option\\:editmode="true"]');
        expect(css).toContain('display:revert-layer!important');
      });

      test('generates comma-separated selectors for multi-value', () => {
        const patterns = [{
          name: 'status',
          rawValue: 'saved|error',
          values: ['saved', 'error'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        // Hide rule uses raw value (pipe is escaped by CSS.escape)
        expect(css).toContain('[option\\:status="saved\\|error"]');
        // Show rule has comma-separated ancestor selectors
        expect(css).toContain('[status="saved"] [option\\:status="saved\\|error"]');
        expect(css).toContain('[status="error"] [option\\:status="saved\\|error"]');
      });

      test('generates CSS for three values', () => {
        const patterns = [{
          name: 'x',
          rawValue: 'a|b|c',
          values: ['a', 'b', 'c'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        // Pipes are escaped in the attribute selector
        expect(css).toContain('[x="a"] [option\\:x="a\\|b\\|c"]');
        expect(css).toContain('[x="b"] [option\\:x="a\\|b\\|c"]');
        expect(css).toContain('[x="c"] [option\\:x="a\\|b\\|c"]');
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
        expect(css).toContain('[status=""] [option\\:status=""]');
      });

      test('generates CSS for empty OR value', () => {
        const patterns = [{
          name: 'status',
          rawValue: '|saved',
          values: ['', 'saved'],
          negated: false
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('[status=""] [option\\:status="\\|saved"]');
        expect(css).toContain('[status="saved"] [option\\:status="\\|saved"]');
      });
    });

    describe('option-not: (negation)', () => {
      test('generates CSS for single negation', () => {
        const patterns = [{
          name: 'status',
          rawValue: 'saving',
          values: ['saving'],
          negated: true
        }];

        const css = optionVisibility.generateCSS(patterns);

        expect(css).toContain('[option-not\\:status="saving"]');
        expect(css).toContain('display:none!important');
        // Uses :not() syntax with ancestor requirement
        expect(css).toContain('[status]:not([status="saving"])');
        expect(css).toContain('display:revert-layer!important');
      });

      test('generates CSS for multi-value negation with :not() selector list', () => {
        const patterns = [{
          name: 'status',
          rawValue: 'saving|error',
          values: ['saving', 'error'],
          negated: true
        }];

        const css = optionVisibility.generateCSS(patterns);

        // Uses :not(sel1, sel2) selector list syntax
        expect(css).toContain('[status]:not([status="saving"],[status="error"])');
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

        // CSS.escape should handle the hyphen
        expect(css).toContain('my-attr');
      });
    });
  });
});
