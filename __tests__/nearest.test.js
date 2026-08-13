/**
 * @jest-environment jsdom
 */

import nearest from '../src/utilities/nearest.js';

describe('nearest', () => {
  test('an empty-string transform result is a hit, not a miss', () => {
    document.body.innerHTML = `
      <section>
        <div id="start"></div>
        <input class="field" value="">
      </section>
      <input class="field" id="far" value="later">
    `;
    const start = document.getElementById('start');
    expect(nearest(start, '.field', (el) => el.value)).toBe('');
  });

  test('a false transform result is a hit, not a miss', () => {
    document.body.innerHTML = `
      <section>
        <div id="start"></div>
        <input type="checkbox" class="flag">
      </section>
      <input type="checkbox" class="flag" id="far" checked>
    `;
    const start = document.getElementById('start');
    expect(nearest(start, '.flag', (el) => el.checked)).toBe(false);
  });
});
