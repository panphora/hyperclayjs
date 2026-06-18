/**
 * @jest-environment jsdom
 *
 * Regression test for the onbeforesubmit gating contract.
 *
 * An [ajax-form]/[ajax-button] runs its `onbeforesubmit` expression and awaits
 * the returned promise before fetching. A confirm/ask dialog gates the submit by
 * resolving (proceed) or rejecting (abort). After the modal fix, dismissing a
 * dialog REJECTS, so submitAjax must catch that rejection: abort the fetch AND
 * not surface an unhandled promise rejection.
 */

import getDataFromForm from "../../src/dom-utilities/getDataFromForm.js";

// ajaxElements auto-inits document listeners on import.
import "../../src/custom-attributes/ajaxElements.js";

const tick = () => new Promise((r) => setTimeout(r, 0));

function makeAjaxForm(gateExpr, action = "/default") {
  const form = document.createElement("form");
  form.setAttribute("ajax-form", "");
  form.setAttribute("action", action);
  form.setAttribute("method", "POST");
  form.setAttribute("onbeforesubmit", gateExpr);
  form.innerHTML =
    '<input name="foo" value="bar"><button type="submit">go</button>';
  return form;
}

let fetchMock;
beforeEach(() => {
  document.body.innerHTML = "";
  fetchMock = jest.fn(() =>
    Promise.resolve({ status: 204, ok: true, headers: { get: () => "" } })
  );
  global.fetch = fetchMock;
});

test("a rejected onbeforesubmit aborts the submit with no unhandled rejection", async () => {
  const rejections = [];
  const handler = (reason) => rejections.push(reason);
  process.on("unhandledRejection", handler);

  try {
    // Mimic a dismissed consent(): rejects with no value.
    globalThis.__gate = () => Promise.reject(undefined);
    const form = makeAjaxForm("globalThis.__gate()");
    document.body.appendChild(form);

    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await tick();
    await tick();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(rejections).toEqual([]);
  } finally {
    process.off("unhandledRejection", handler);
    delete globalThis.__gate;
  }
});

test("a resolved onbeforesubmit proceeds to fetch", async () => {
  globalThis.__gate = () => Promise.resolve();
  const form = makeAjaxForm("globalThis.__gate()", "/submit-here");
  document.body.appendChild(form);

  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await tick();
  await tick();

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toBe("/submit-here");
  delete globalThis.__gate;
});

test("getDataFromForm serializes the gated form (sanity)", () => {
  const form = makeAjaxForm("globalThis.__noop && globalThis.__noop()");
  expect(getDataFromForm(form)).toMatchObject({ foo: "bar" });
});
