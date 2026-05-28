/**
 * @jest-environment jsdom
 */

import Mutation from '../src/utilities/mutation.js';

// jsdom's MutationObserver fires asynchronously. setTimeout(0) lets the
// microtask queue drain plus a macrotask tick, which is enough in practice.
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('Mutation — text-content mutation bubbling', () => {
  let unsubs = [];

  afterEach(async () => {
    unsubs.forEach(unsub => unsub && unsub());
    unsubs = [];
    document.body.innerHTML = '';
    await flush();
  });

  test('fires onAnyChange when .textContent is set on element with only text child', async () => {
    const div = document.createElement('div');
    div.textContent = 'old';
    document.body.appendChild(div);
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAnyChange({ debounce: 0 }, fn));

    div.textContent = 'new';
    await flush();

    expect(fn).toHaveBeenCalledTimes(1);
    const changes = fn.mock.calls[0][0];
    const charDataChange = changes.find(c => c.type === 'characterData');
    expect(charDataChange).toBeDefined();
    expect(charDataChange.element).toBe(div);
    expect(charDataChange.newValue).toBe('new');
  });

  test('fires onAnyChange with both remove and characterData when .textContent replaces an element child', async () => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = 'bar';
    div.appendChild(span);
    document.body.appendChild(div);
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAnyChange({ debounce: 0 }, fn));

    div.textContent = 'new';
    await flush();

    expect(fn).toHaveBeenCalledTimes(1);
    const changes = fn.mock.calls[0][0];
    expect(changes.some(c => c.type === 'remove' && c.element === span)).toBe(true);
    expect(changes.some(c => c.type === 'characterData' && c.element === div)).toBe(true);
  });

  test('fires onAnyChange when a text node is appended directly', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAnyChange({ debounce: 0 }, fn));

    div.appendChild(document.createTextNode('hi'));
    await flush();

    expect(fn).toHaveBeenCalledTimes(1);
    const charDataChange = fn.mock.calls[0][0].find(c => c.type === 'characterData');
    expect(charDataChange).toBeDefined();
    expect(charDataChange.element).toBe(div);
    expect(charDataChange.newValue).toBe('hi');
  });

  test('onAddElement does NOT receive text nodes (typed callbacks stay element-only)', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAddElement({ debounce: 0 }, fn));

    div.textContent = 'new';
    await flush();

    expect(fn).not.toHaveBeenCalled();
  });

  test('onRemoveElement does NOT receive text nodes', async () => {
    const div = document.createElement('div');
    div.textContent = 'old';
    document.body.appendChild(div);
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onRemoveElement({ debounce: 0 }, fn));

    div.textContent = 'new';
    await flush();

    expect(fn).not.toHaveBeenCalled();
  });

  test('existing characterData branch (direct textNode.data =) reports real oldValue', async () => {
    const div = document.createElement('div');
    div.textContent = 'old';
    document.body.appendChild(div);
    await flush();

    const textNode = div.firstChild;

    const fn = jest.fn();
    unsubs.push(Mutation.onAnyChange({ debounce: 0 }, fn));

    textNode.data = 'new';
    await flush();

    expect(fn).toHaveBeenCalledTimes(1);
    const charDataChange = fn.mock.calls[0][0].find(c => c.type === 'characterData');
    expect(charDataChange).toBeDefined();
    expect(charDataChange.element).toBe(div);
    expect(charDataChange.oldValue).toBe('old');
    expect(charDataChange.newValue).toBe('new');
  });

  test('text mutation inside [save-remove] subtree does NOT fire', async () => {
    const outer = document.createElement('div');
    outer.setAttribute('save-remove', '');
    const inner = document.createElement('div');
    inner.textContent = 'old';
    outer.appendChild(inner);
    document.body.appendChild(outer);
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAnyChange({ debounce: 0 }, fn));

    inner.textContent = 'new';
    await flush();

    expect(fn).not.toHaveBeenCalled();
  });

  test('single .textContent assignment fires onAnyChange exactly once', async () => {
    const div = document.createElement('div');
    div.textContent = 'old';
    document.body.appendChild(div);
    await flush();

    const fn = jest.fn();
    unsubs.push(Mutation.onAnyChange({ debounce: 0 }, fn));

    div.textContent = 'new';
    await flush();

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
