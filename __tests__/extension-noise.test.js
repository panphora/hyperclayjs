/**
 * @jest-environment jsdom
 */

import { captureForSave } from '../src/core/snapshot.js';
import Mutation from '../src/utilities/mutation.js';

// jsdom's MutationObserver fires asynchronously; a macrotask tick drains it.
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe('extension noise: stripped from saves, ignored by the observer', () => {
  afterEach(async () => {
    document.body.innerHTML = '';
    await flush();
  });

  test('save removes injected extension elements but keeps real inputs (and drops their marker attrs)', () => {
    document.body.innerHTML =
      '<input id="email" data-bitwarden-watching="1" data-com-onepassword-filled="light-design" data-lpignore="true">' +
      '<div id="1p-menu-live-region" aria-live="polite"></div>' +
      '<grammarly-extension></grammarly-extension>';

    const html = captureForSave({ emitForSync: false });

    expect(html).not.toContain('1p-menu-live-region');     // injected element gone
    expect(html).not.toContain('grammarly-extension');     // injected element gone
    expect(html).not.toContain('data-bitwarden-watching'); // marker attr stripped
    expect(html).not.toContain('data-com-onepassword');    // 1Password fill marker stripped
    expect(html).toContain('data-lpignore="true"');        // author-set LastPass opt-out preserved
    expect(html).toContain('id="email"');                  // ...and the real input survives
  });

  test('a same-prefix real attribute is preserved on save (boundary, not blunt prefix)', () => {
    document.body.innerHTML = '<div id="keep" data-ltr="yes"></div>';
    const html = captureForSave({ emitForSync: false });
    expect(html).toContain('data-ltr="yes"');
  });

  test('the observer ignores a marker attribute set on a real input', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    await flush();

    const fn = jest.fn();
    const unsub = Mutation.onAnyChange({ debounce: 0 }, fn);
    input.setAttribute('data-bitwarden-watching', '1');
    await flush();

    expect(fn).not.toHaveBeenCalled();
    unsub && unsub();
  });

  test('the observer ignores an injected extension element', async () => {
    const fn = jest.fn();
    const unsub = Mutation.onAnyChange({ debounce: 0 }, fn);

    const ext = document.createElement('div');
    ext.id = '1p-menu-live-region';
    document.body.appendChild(ext);
    await flush();

    expect(fn).not.toHaveBeenCalled();
    unsub && unsub();
  });

  test('control: a real edit still fires the observer (no over-broadening)', async () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    await flush();

    const fn = jest.fn();
    const unsub = Mutation.onAnyChange({ debounce: 0 }, fn);
    div.setAttribute('data-real', 'x');
    await flush();

    expect(fn).toHaveBeenCalled();
    unsub && unsub();
  });
});
