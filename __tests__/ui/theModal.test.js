/**
 * @jest-environment jsdom
 *
 * Regression test for the modal singleton's exclusivity + settlement contract.
 *
 * The bug this guards against:
 *   1. themodal kept shared onYes/onNo arrays and added a document `submit`
 *      listener per open(). Stacking N dialogs and clicking one "yes" iterated
 *      the shared array and resolved ALL N promises at once — one confirm click
 *      triggered many destructive actions.
 *   2. prompts.js assigns `themodal.onNo = fn`, which clobbered the registrar
 *      method, so dismissals never rejected (the promise just hung forever).
 *
 * Unlike prompts.test.js (which mocks theModal), these tests drive the REAL
 * theModal singleton through consent().
 */

jest.mock("../../src/ui/toast.js", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../src/string-utilities/copy-to-clipboard.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../../src/dom-utilities/onDomReady.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const { consent } = require("../../src/ui/prompts.js");

// Flush the deferred setTimeout(resolve/reject, 0) so promises settle.
const tick = () => new Promise((r) => setTimeout(r, 0));

// The yes button is type=submit inside the modal form; a submit event bubbles
// to the document listener that runs the yes callbacks.
function clickYes() {
  const form = document.querySelector("#micromodal .micromodal__container");
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

function clickNo() {
  document
    .querySelector(".micromodal__no")
    .dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

// Record a promise's eventual state without throwing on rejection.
function track(promise) {
  const state = { status: "pending" };
  promise.then(
    () => (state.status = "resolved"),
    () => (state.status = "rejected")
  );
  return state;
}

beforeEach(() => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";
  if (window.themodal) {
    window.themodal.isShowing = false;
    window.themodal._dismiss = null;
    window.themodal._cleanupListeners = null;
  }
});

describe("themodal singleton — exclusivity & settlement", () => {
  test("stacked confirms collapse to one modal; one yes resolves exactly one", async () => {
    const a = track(consent("a"));
    const b = track(consent("b"));
    const c = track(consent("c"));

    // Only the latest modal is on screen.
    expect(document.querySelectorAll(".micromodal-parent").length).toBe(1);

    clickYes();
    await tick();
    await tick();

    // Exactly one resolved (the live one); the superseded two rejected — NOT
    // all three resolved, which was the data-loss regression.
    const statuses = [a.status, b.status, c.status];
    expect(statuses.filter((s) => s === "resolved").length).toBe(1);
    expect(statuses.filter((s) => s === "rejected").length).toBe(2);
    expect(c.status).toBe("resolved");
  });

  test("a single confirm resolves on yes", async () => {
    const a = track(consent("solo"));
    clickYes();
    await tick();
    expect(a.status).toBe("resolved");
  });

  test("dismissing a confirm rejects it (onNo clobber fixed)", async () => {
    const a = track(consent("dismiss me"));
    clickNo();
    await tick();
    expect(a.status).toBe("rejected");
  });

  test("sequential confirms each settle independently", async () => {
    const first = track(consent("one"));
    clickYes();
    await tick();
    expect(first.status).toBe("resolved");

    const second = track(consent("two"));
    clickNo();
    await tick();
    expect(second.status).toBe("rejected");

    const third = track(consent("three"));
    clickYes();
    await tick();
    expect(third.status).toBe("resolved");
  });
});

describe("themodal singleton — stale-DOM close (live-sync morph)", () => {
  // Regression: the vendored MicroModal.closeModalById re-resolved this.modal via
  // getElementById, so if the modal DOM was yanked externally (a live-sync morph
  // removes .micromodal-parent), close() found no #micromodal, skipped closeModal(),
  // and stranded the reject + listeners + isShowing. The fix falls back to the
  // stored detached-node reference so closeModal()/onClose still run.
  test("close() after external DOM removal settles + cleans up state", async () => {
    const a = track(consent("morph me"));
    expect(window.themodal.isShowing).toBe(true);

    // Live-sync morph yanks the modal DOM out from under us.
    document.querySelector(".micromodal-parent").remove();

    window.themodal.close();
    await tick();

    expect(a.status).toBe("rejected");
    expect(window.themodal.isShowing).toBe(false);
    expect(window.themodal._dismiss).toBe(null);
    expect(window.themodal._cleanupListeners).toBe(null);
    expect(document.querySelectorAll(".micromodal-parent").length).toBe(0);
    expect(document.body.style.overflow).toBe("");
  });

  test("a fresh confirm opens and settles normally after a stale close", async () => {
    const stale = track(consent("stale"));
    document.querySelector(".micromodal-parent").remove();
    window.themodal.close();
    await tick();
    expect(stale.status).toBe("rejected");

    const fresh = track(consent("fresh"));
    expect(document.querySelectorAll(".micromodal-parent").length).toBe(1);
    clickYes();
    await tick();
    expect(fresh.status).toBe("resolved");
  });

  test("close() with no modal open is a no-op (does not wipe preset fields)", async () => {
    // Fully close a modal first so MicroModal's activeModal is nulled.
    track(consent("setup"));
    clickYes();
    await tick();

    // The guard-based fix would have wiped these; the root-cause fix leaves them.
    window.themodal.html = "PRESET_HTML";
    window.themodal.yes = "PRESET_YES";
    window.themodal.close();

    expect(window.themodal.html).toBe("PRESET_HTML");
    expect(window.themodal.yes).toBe("PRESET_YES");
  });
});
