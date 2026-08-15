/**
 * @jest-environment jsdom
 *
 * The loader's only wire into the readiness contract is `exportModule?.markReady?.()`.
 * Both calls are optional-chained, so a rename on either side, or a dropped call,
 * yields a loader that loads every module correctly, never settles hyperclay.ready,
 * never fires hyperclay:ready, and leaves the rest of the suite green. The symptom
 * then surfaces in a vendored plugin that silently stops binding, which is the bug
 * the readiness contract exists to remove. So pin the linkage rather than the name.
 *
 * src/hyperclay.js is generated from build/hyperclay.template.js and the generator
 * copies this region verbatim, so asserting both files also catches a template edit
 * that was never regenerated.
 */

import fs from 'fs';
import path from 'path';

const SOURCES = [
  ['generated loader', 'src/hyperclay.js'],
  ['loader template', 'build/hyperclay.template.js']
];

const read = relative => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');

const calledNames = source =>
  [...source.matchAll(/exportModule\?\.(\w+)\?\.\(/g)].map(match => match[1]);

const loadExportToWindow = async () => {
  let mod;
  await jest.isolateModulesAsync(async () => {
    mod = await import('../src/core/exportToWindow.js');
  });
  return mod;
};

describe('the loader is wired to the readiness contract', () => {
  afterEach(() => {
    delete window.__hyperclayNoAutoExport;
    delete window.hyperclay;
    delete window.h;
  });

  test.each(SOURCES)('%s settles the contract on both the success and failure path', (_label, relative) => {
    const names = calledNames(read(relative));
    expect(names).toContain('markReady');
    expect(names).toContain('markFailed');
  });

  test.each(SOURCES)('every capability %s calls is really exported by exportToWindow.js', async (_label, relative) => {
    const exportModule = await loadExportToWindow();
    const names = calledNames(read(relative));

    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(typeof exportModule[name]).toBe('function');
    }
  });
});
