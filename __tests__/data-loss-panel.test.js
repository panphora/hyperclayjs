/**
 * @jest-environment jsdom
 *
 * data-loss-panel: renders the guard chip from a server event payload, reflects
 * the restore dry-run in which action leads, and posts the user's choice. We
 * drive mount/unmount directly (the auto-init is gated on edit mode, off here).
 */
import { mount, unmount } from '../src/ui/data-loss-panel.js';

const ROOT_ID = 'hyperclay-data-loss-guard';
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function baseEvent(overrides = {}) {
  return {
    id: 'evt-1',
    fieldCount: 2,
    preview: [
      { key: 'title', now: '— empty —', yours: 'My Title' },
      { key: 'body', now: 'short', yours: 'a much longer body' },
    ],
    restorable: true,
    canRevert: true,
    droppedAdditions: 0,
    lossSummary: { provenance: 'external' },
    ...overrides,
  };
}

beforeEach(() => {
  unmount();
  document.body.innerHTML = '';
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) }));
  window.toast = jest.fn();
});

afterEach(() => {
  unmount();
});

describe('rendering', () => {
  it('mounts a root that never persists into the saved file', () => {
    mount(baseEvent());
    const root = document.getElementById(ROOT_ID);
    expect(root).toBeTruthy();
    expect(root.hasAttribute('no-save')).toBe(true);
    expect(root.hasAttribute('snapshot-remove')).toBe(true);
  });

  it('renders one preview row per changed field and the now/yours values', () => {
    mount(baseEvent());
    const rows = document.querySelectorAll(`#${ROOT_ID} .dg-prow`);
    expect(rows.length).toBe(2);
    expect(document.querySelector(`#${ROOT_ID} .dg-yours`).textContent).toBe('My Title');
  });

  it('shows the dropped-additions warning only when restore would drop new items', () => {
    mount(baseEvent({ droppedAdditions: 3 }));
    expect(document.querySelector(`#${ROOT_ID} .dg-drop`).textContent).toMatch(/3 new items/);
    unmount();
    mount(baseEvent({ droppedAdditions: 0 }));
    expect(document.querySelector(`#${ROOT_ID} .dg-drop`)).toBeNull();
  });

  it('escapes HTML in preview values', () => {
    mount(baseEvent({ preview: [{ key: 'x', now: '', yours: '<img src=x onerror=alert(1)>' }] }));
    const yours = document.querySelector(`#${ROOT_ID} .dg-yours`);
    expect(yours.querySelector('img')).toBeNull();
    expect(yours.textContent).toContain('<img');
  });
});

describe('restore dry-run drives which action leads', () => {
  it('restorable=true: Restore is primary and enabled', () => {
    mount(baseEvent({ restorable: true }));
    const restore = document.querySelector(`#${ROOT_ID} [data-dg="restore"]`);
    const revert = document.querySelector(`#${ROOT_ID} [data-dg="revert"]`);
    expect(restore.disabled).toBe(false);
    expect(restore.classList.contains('dg-primary')).toBe(true);
    expect(revert.classList.contains('dg-primary')).toBe(false);
  });

  it('restorable=false: Restore is disabled and Revert leads', () => {
    mount(baseEvent({ restorable: false }));
    const restore = document.querySelector(`#${ROOT_ID} [data-dg="restore"]`);
    const revert = document.querySelector(`#${ROOT_ID} [data-dg="revert"]`);
    expect(restore.disabled).toBe(true);
    expect(revert.classList.contains('dg-primary')).toBe(true);
  });

  it('canRevert=false disables Revert', () => {
    mount(baseEvent({ canRevert: false }));
    expect(document.querySelector(`#${ROOT_ID} [data-dg="revert"]`).disabled).toBe(true);
  });
});

describe('chip / panel toggling', () => {
  it('opens the panel from the chip and collapses back', () => {
    mount(baseEvent());
    const root = document.getElementById(ROOT_ID);
    expect(root.classList.contains('is-open')).toBe(false);
    root.querySelector('[data-dg="open"]').click();
    expect(root.classList.contains('is-open')).toBe(true);
    root.querySelector('[data-dg="collapse"]').click();
    expect(root.classList.contains('is-open')).toBe(false);
  });

  it('toggles the change preview', () => {
    mount(baseEvent());
    const panel = document.querySelector(`#${ROOT_ID} .dg-panel`);
    document.querySelector(`#${ROOT_ID} [data-dg="toggle"]`).click();
    expect(panel.classList.contains('show-changes')).toBe(true);
  });
});

describe('actions', () => {
  it('dismiss posts the choice to /_/data-loss/:id then unmounts', async () => {
    mount(baseEvent());
    document.querySelector(`#${ROOT_ID} [data-dg="dismiss"]`).click();
    await flush();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('/_/data-loss/evt-1');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body).choice).toBe('dismiss');
    expect(document.getElementById(ROOT_ID)).toBeNull();
  });

  it('does not post for a disabled action (restore when not restorable)', async () => {
    mount(baseEvent({ restorable: false }));
    document.querySelector(`#${ROOT_ID} [data-dg="restore"]`).click();
    await flush();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(document.getElementById(ROOT_ID)).toBeTruthy();
  });
});
