/**
 * @jest-environment jsdom
 *
 * user-gesture: the per-batch "was a human driving this write?" signal for the
 * data-clobber guard. Covers the same-turn flag, the bounded recency window that
 * attributes cross-turn first-party edits (click handlers, confirm-modal
 * deletes), the isTrusted gate, and the read-and-reset bit.
 */
import {
  initUserGesture,
  isUserDrivenNow,
  markUserDriven,
  consumeUserDriven,
  _resetUserGesture,
  _simulateGestureTurn,
} from '../src/utilities/user-gesture.js';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeAll(() => {
  initUserGesture();
});

beforeEach(() => {
  _resetUserGesture();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('userDriven accumulation (read-and-reset)', () => {
  it('defaults to false', () => {
    expect(consumeUserDriven()).toBe(false);
  });

  it('markUserDriven sets the bit; consume reads it once then resets', () => {
    markUserDriven();
    expect(consumeUserDriven()).toBe(true);
    expect(consumeUserDriven()).toBe(false);
  });

  it('OR-accumulates across many marks but consumes once', () => {
    markUserDriven();
    markUserDriven();
    markUserDriven();
    expect(consumeUserDriven()).toBe(true);
    expect(consumeUserDriven()).toBe(false);
  });
});

describe('isUserDrivenNow — same-turn flag', () => {
  it('is false before any gesture', () => {
    expect(isUserDrivenNow()).toBe(false);
  });

  it('is active synchronously in the gesture turn, independent of the clock', () => {
    _simulateGestureTurn();
    // Same turn as the gesture — what a synchronous handler's MutationObserver
    // microtask sees. The flag answers true without consulting the clock.
    expect(isUserDrivenNow()).toBe(true);
  });

  it('ignores synthetic (isTrusted=false) events — a script cannot fake a gesture', () => {
    // A real jsdom-dispatched event is isTrusted=false; the capture listener
    // installed by initUserGesture must leave the turn inactive.
    document.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(isUserDrivenNow()).toBe(false);
  });
});

describe('isUserDrivenNow — bounded recency window (cross-turn attribution)', () => {
  it('stays user-driven after the same-turn flag clears, within the window', async () => {
    let t = 1000;
    jest.spyOn(performance, 'now').mockImplementation(() => t);
    _simulateGestureTurn();        // stamps t=1000, sets the flag
    await flush();                 // the flag clears on the next macrotask
    // A click handler / confirm-modal delete mutates here, a turn after the
    // gesture: the flag is gone but the recency window carries it.
    expect(isUserDrivenNow()).toBe(true);   // 0ms since the gesture
    t = 1499;
    expect(isUserDrivenNow()).toBe(true);   // 499ms < 500
  });

  it('reverts to background once the window elapses', async () => {
    let t = 1000;
    jest.spyOn(performance, 'now').mockImplementation(() => t);
    _simulateGestureTurn();
    await flush();                 // flag cleared
    t = 1500;
    expect(isUserDrivenNow()).toBe(false);  // 500ms is not < 500
    t = 5000;
    expect(isUserDrivenNow()).toBe(false);
  });
});
