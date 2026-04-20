/**
 * @jest-environment jsdom
 */

// Prevent slugify.js from attaching to window during import
window.__hyperclayNoAutoExport = true;

import slugify from '../src/string-utilities/slugify.js';

describe('slugify', () => {
  describe('basic transformation', () => {
    test('lowercases input', () => {
      expect(slugify('Hello')).toBe('hello');
    });

    test('replaces spaces with hyphens', () => {
      expect(slugify('Hello there')).toBe('hello-there');
    });

    test('collapses multiple spaces into one hyphen', () => {
      expect(slugify('foo   bar')).toBe('foo-bar');
    });

    test('strips accents', () => {
      expect(slugify('café')).toBe('cafe');
      expect(slugify('naïve')).toBe('naive');
    });

    test('strips non-word characters', () => {
      expect(slugify('hello!@#$world')).toBe('helloworld');
    });

    test('trims leading and trailing hyphens', () => {
      expect(slugify('---foo---')).toBe('foo');
    });
  });

  describe('.html / .htmlclay extension preservation', () => {
    test('preserves .html extension when user types it', () => {
      expect(slugify('coffee.html')).toBe('coffee.html');
    });

    test('preserves .htmlclay extension when user types it', () => {
      expect(slugify('coffee.htmlclay')).toBe('coffee.htmlclay');
    });

    test('lowercases uppercase .HTML extension', () => {
      expect(slugify('Coffee.HTML')).toBe('coffee.html');
    });

    test('strips dots from the middle but preserves trailing .html', () => {
      expect(slugify('my.coffee.html')).toBe('mycoffee.html');
    });

    test('does not preserve non-html extensions', () => {
      expect(slugify('coffee.txt')).toBe('coffeetxt');
    });

    test('handles spaces before extension', () => {
      expect(slugify('My Coffee.html')).toBe('my-coffee.html');
    });

    test('handles accents in the base with extension', () => {
      expect(slugify('café.html')).toBe('cafe.html');
    });
  });

  describe('edge cases', () => {
    test('returns empty string for null', () => {
      expect(slugify(null)).toBe('');
    });

    test('returns empty string for undefined', () => {
      expect(slugify(undefined)).toBe('');
    });

    test('returns empty string for empty string', () => {
      expect(slugify('')).toBe('');
    });

    test('handles numeric input', () => {
      expect(slugify(123)).toBe('123');
    });
  });
});
