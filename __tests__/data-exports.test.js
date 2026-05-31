/**
 * @jest-environment jsdom
 *
 * Spec 10 (thin): data.js re-exports extractData / applyData / engine from the
 * vendored hyper-html-api module, the three exports are callable, and a trivial
 * extract -> apply -> extract round-trip works through the real vendored path.
 *
 * The data sugar maps a rules object (key -> CSS selector) to the trimmed text
 * of the matched element, so { title: 'h1' } extracts the <h1>'s text.
 */

import { extractData, applyData, engine } from '../src/data.js';

const rules = { title: 'h1', body: 'p' };

describe('data.js — vendored data sugar exports', () => {
  test('exports extractData, applyData, and engine and they are callable', () => {
    expect(typeof extractData).toBe('function');
    expect(typeof applyData).toBe('function');
    expect(engine).toBeDefined();
    expect(typeof engine.extract).toBe('function');
    expect(typeof engine.apply).toBe('function');
  });

  test('extractData round-trips a fixture through the vendored engine', () => {
    const source = document.createElement('div');
    source.innerHTML = '<h1>Hello</h1><p>World</p>';

    expect(extractData(source, rules)).toEqual({ title: 'Hello', body: 'World' });
  });

  test('engine.extract resolves the same shape as extractData', () => {
    const source = document.createElement('div');
    source.innerHTML = '<h1>Hello</h1><p>World</p>';

    expect(engine.extract(source, rules)).toEqual({ title: 'Hello', body: 'World' });
  });

  test('applyData writes values back so a subsequent extract reflects them', () => {
    const target = document.createElement('div');
    target.innerHTML = '<h1></h1><p></p>';

    applyData(target, { title: 'Hi', body: 'There' }, rules);

    expect(extractData(target, rules)).toEqual({ title: 'Hi', body: 'There' });
  });
});
