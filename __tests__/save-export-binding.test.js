/**
 * @jest-environment node
 *
 * Two modules export a function called savePage: save-core is the bare network
 * save, save-system is the stateful one that coalesces a save requested while
 * another is on the wire, keeps the saved baseline, and drives savestatus. Both
 * auto-export to window.hyperclay and save-system's block runs second, so the
 * GLOBAL resolves to save-system.
 *
 * The ESM export in the generated loader is built from declaration order, which
 * picked save-core. The same name then meant two different functions depending on
 * how a page reached it, and only one of them followed the save protocol. The
 * generator now names save-system the owner, so pin the binding rather than trust
 * the order to stay put.
 */

import fs from 'fs';
import path from 'path';

const read = relative => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');

test('the generated savePage export resolves to save-system before save-core', () => {
  const line = read('src/hyperclay.js')
    .split('\n')
    .find(l => l.startsWith('export const savePage ='));

  expect(line).toBeDefined();
  expect(line.indexOf("'save-system'")).toBeGreaterThan(-1);
  expect(line.indexOf("'save-system'")).toBeLessThan(line.indexOf("'save-core'"));
});

test('save-core stays a fallback, so a page that loads it alone still gets a savePage', () => {
  const line = read('src/hyperclay.js')
    .split('\n')
    .find(l => l.startsWith('export const savePage ='));

  expect(line).toContain("window.hyperclayModules['save-core']?.savePage");
});
