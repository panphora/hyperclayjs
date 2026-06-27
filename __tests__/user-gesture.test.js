/**
 * @jest-environment jsdom
 *
 * user-gesture: the per-batch "was a human driving this write?" signal for the
 * data-clobber guard. Covers the synchronous-in-handler vs deferred timing, the
 * isTrusted gate, the userActivation corroborator, and the read-and-reset bit.
 */
import {
  initUserGesture,
  isGestureActive,
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

describe('isGestureActive timing (synchronous-in-handler vs deferred)', () => {
  it('is false before any gesture', () => {
    expect(isGestureActive()).toBe(false);
  });

  it('is active synchronously in the gesture turn, cleared on the next macrotask', async () => {
    _simulateGestureTurn();
    // Same turn as the gesture — what the MutationObserver microtask sees.
    expect(isGestureActive()).toBe(true);
    await flush();
    // A setTimeout / fetch().then() mutation lands here: flag already cleared.
    expect(isGestureActive()).toBe(false);
  });

  it('ignores synthetic (isTrusted=false) events — a script cannot fake a gesture', () => {
    // A real jsdom-dispatched event is isTrusted=false; the capture listener
    // installed by initUserGesture must leave the turn inactive.
    document.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(isGestureActive()).toBe(false);
  });
});

describe('userActivation corroborator', () => {
  afterEach(() => {
    delete navigator.userActivation;
  });

  it('suppresses the signal when userActivation is present but inactive', () => {
    Object.defineProperty(navigator, 'userActivation', {
      value: { isActive: false },
      configurable: true,
    });
    _simulateGestureTurn();
    expect(isGestureActive()).toBe(false);
  });

  it('passes through when userActivation agrees', () => {
    Object.defineProperty(navigator, 'userActivation', {
      value: { isActive: true },
      configurable: true,
    });
    _simulateGestureTurn();
    expect(isGestureActive()).toBe(true);
  });
});
