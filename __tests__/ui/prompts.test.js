/**
 * @jest-environment jsdom
 *
 * Regression tests for ask()/consent()/tell() modal behavior. The two contracts
 * that matter — and that a previous refactor (v1.27.0) broke — are:
 *
 *   1. A yesCallback that throws keeps the modal open, and surfaces the error
 *      as a toast. Callers use this to validate input (e.g. "type the site
 *      name to confirm delete") without writing their own modal state machine.
 *
 *   2. The Promise returned by ask()/consent() resolves asynchronously (next
 *      tick), so a chained .then(() => ask(...)) lands in a clean themodal
 *      instead of colliding with the first modal's still-tearing-down state.
 *
 * These two contracts interact subtly: we need the callback to run *sync*
 * (so throwing keeps the modal up) while the resolve is *deferred* (for chain
 * cleanliness).
 */

// Jest hoists jest.mock() above all imports and disallows referencing
// non-"mock"-prefixed outer scope in factories. So each mock is self-contained,
// and tests reach into the mocked modules via their imports.

jest.mock("../../src/ui/theModal.js", () => ({
  __esModule: true,
  default: {
    _yesHandler: null,
    _noHandler: null,
    set html(_v) {},
    set closeHtml(_v) {},
    set yes(_v) {},
    onYes(cb) {
      this._yesHandler = cb;
    },
    set onNo(cb) {
      this._noHandler = cb;
    },
    open: jest.fn(),
  },
}));

jest.mock("../../src/ui/toast.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../src/string-utilities/copy-to-clipboard.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../src/dom-utilities/onDomReady.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const { ask, consent, tell } = require("../../src/ui/prompts.js");
const themodal = require("../../src/ui/theModal.js").default;
const toast = require("../../src/ui/toast.js").default;

// Fire the registered yes/no callbacks as if the user clicked.
const clickYes = () => themodal._yesHandler();
const clickNo = () => themodal._noHandler();

function seedInput(value) {
  document.body.innerHTML = `<input class="micromodal__input" value="${value}">`;
}

// Flush the deferred `setTimeout(resolve, 0)` so awaited promises settle.
function flushMicrotasks() {
  return new Promise((r) => setTimeout(r, 0));
}

beforeEach(() => {
  themodal._yesHandler = null;
  themodal._noHandler = null;
  toast.mockClear();
  document.body.innerHTML = "";
});

describe("ask() — throw-to-keep-open contract", () => {
  test("yesCallback that throws returns false (modal stays open) and toasts the error", () => {
    seedInput("wrong-name");
    const validator = jest.fn((value) => {
      if (value !== "expected") throw new Error("type the right name");
    });

    const unhandled = ask("Confirm:", validator);
    unhandled.catch(() => {}); // keep pending; we don't want unhandledrejection noise

    const closeDecision = clickYes();

    expect(validator).toHaveBeenCalledWith("wrong-name");
    expect(closeDecision).toBe(false);
    expect(toast).toHaveBeenCalledWith("type the right name", "error");
  });

  test("a throw with no message falls back to a generic error toast", () => {
    seedInput("anything");
    const validator = () => {
      throw new Error(); // empty message
    };

    ask("Confirm:", validator).catch(() => {});
    clickYes();

    expect(toast).toHaveBeenCalledWith("An error occurred", "error");
  });

  test("promise does NOT resolve when yesCallback throws", async () => {
    seedInput("wrong");
    let resolved = false;
    ask("Confirm:", () => {
      throw new Error("no");
    }).then(() => {
      resolved = true;
    });

    clickYes();
    await flushMicrotasks();
    await flushMicrotasks();

    expect(resolved).toBe(false);
  });
});

describe("ask() — happy path", () => {
  test("yesCallback that succeeds returns true (modal closes) and resolves with input value", async () => {
    seedInput("my-site.html");
    const validator = jest.fn();

    const promise = ask("Name:", validator);
    const closeDecision = clickYes();

    expect(validator).toHaveBeenCalledWith("my-site.html");
    expect(closeDecision).toBe(true);

    const resolved = await promise;
    expect(resolved).toBe("my-site.html");
  });

  test("empty input returns false without invoking yesCallback", () => {
    seedInput("");
    const validator = jest.fn();

    ask("Name:", validator).catch(() => {});
    const closeDecision = clickYes();

    expect(validator).not.toHaveBeenCalled();
    expect(closeDecision).toBe(false);
  });

  test("null yesCallback is allowed (raw input capture, no validation)", async () => {
    seedInput("raw-value");
    const promise = ask("Name:", null);
    clickYes();
    expect(await promise).toBe("raw-value");
  });
});

describe("ask() — deferred resolve for clean chaining", () => {
  test("resolve fires on a later tick so caller code runs before .then()", async () => {
    seedInput("hello");
    const order = [];

    const promise = ask("Name:", null).then(() => order.push("then"));
    clickYes();
    order.push("after-yesHandler"); // synchronous, should land first

    await promise;
    expect(order).toEqual(["after-yesHandler", "then"]);
  });

  test("rejection is also deferred (onNo does not throw synchronously into themodal)", async () => {
    const order = [];
    const promise = ask("Name:", null).catch(() => order.push("catch"));
    clickNo();
    order.push("after-noHandler");

    await promise;
    expect(order).toEqual(["after-noHandler", "catch"]);
  });
});

describe("consent() — same contracts, no input", () => {
  test("throw-to-keep-open applies to consent() too", () => {
    const closeDecision = (() => {
      const p = consent("Proceed?", () => {
        throw new Error("not allowed");
      });
      p.catch(() => {});
      return clickYes();
    })();

    expect(closeDecision).toBe(false);
    expect(toast).toHaveBeenCalledWith("not allowed", "error");
  });

  test("consent with no callback resolves on Yes", async () => {
    const promise = consent("Proceed?");
    expect(clickYes()).toBe(true);
    await promise; // should not throw
  });

  test("consent passes undefined to yesCallback (no input to read)", async () => {
    const callback = jest.fn();
    const p = consent("Proceed?", callback);
    clickYes();
    await p;
    expect(callback).toHaveBeenCalledWith(undefined);
  });
});

describe("tell() — informational modal", () => {
  test("resolves on Yes, deferred", async () => {
    const order = [];
    const promise = tell("Heads up", "some body").then(() => order.push("then"));
    clickYes();
    order.push("sync");
    await promise;
    expect(order).toEqual(["sync", "then"]);
  });
});
