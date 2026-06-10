/**
 * @jest-environment jsdom
 *
 * Integration: the REAL vendored hyper-undo, paired with the REAL region
 * resolver exposed on window.hyperclay.region, must skip recording inside a
 * no-undo / no-watch region. This is the Phase-2 "ignore-list convergence" —
 * the new attributes now reach undo via delegation to the shared resolver,
 * where before undo's hand-mirrored filter never knew about them.
 */
import '../src/utilities/region-policy.js'; // sets window.hyperclay.region as a side effect
import { undo } from '../src/vendor/hyper-undo.vendor.js';

const tick = (ms = 40) => new Promise(r => setTimeout(r, ms));

const start = () => undo.start({ scope: document.body, bindKeys: false, idleWindowMs: 20 });

describe('vendored undo delegates region decisions to window.hyperclay.region', () => {
  afterEach(() => {
    try { undo.stop(); } catch {}
    document.body.innerHTML = '';
  });

  test('region-policy exposes the canonical resolver on window.hyperclay.region', () => {
    expect(typeof window.hyperclay.region.resolveRegionPolicy).toBe('function');
    expect(window.hyperclay.region.resolveRegionPolicy(document.createElement('div')).undoable).toBe(true);
  });

  test('a [no-undo] region is NOT recorded; a normal region IS (delegation works)', async () => {
    document.body.innerHTML = '<div no-undo><span id="s">x</span></div><h1 id="h">Hi</h1>';
    start();
    undo.clear();

    document.getElementById('s').textContent = 'changed';
    await tick();
    expect(undo.history.length).toBe(0); // no-undo now reaches undo

    document.getElementById('h').textContent = 'changed';
    await tick();
    expect(undo.history.length).toBe(1); // normal region still recorded
  });

  test('a [no-watch] region is NOT recorded', async () => {
    document.body.innerHTML = '<div no-watch><span id="s">x</span></div>';
    start();
    undo.clear();

    document.getElementById('s').textContent = 'changed';
    await tick();
    expect(undo.history.length).toBe(0);
  });

  test('a [no-save] region IS recorded (stays undoable in the model)', async () => {
    document.body.innerHTML = '<div no-save><span id="s">x</span></div>';
    start();
    undo.clear();

    document.getElementById('s').textContent = 'changed';
    await tick();
    expect(undo.history.length).toBe(1);
  });

  test('a legacy [save-ignore] region is still NOT recorded (back-compat)', async () => {
    document.body.innerHTML = '<div save-ignore><span id="s">x</span></div>';
    start();
    undo.clear();

    document.getElementById('s').textContent = 'changed';
    await tick();
    expect(undo.history.length).toBe(0);
  });
});
