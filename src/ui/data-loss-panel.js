/**
 * data-loss-panel — the data-clobber guard's chip UI (edit-mode only).
 *
 * Mounts a small, persistent, top-right chip when the server reports that saved
 * island data was overwritten. The chip expands to a panel offering: restore my
 * data / revert entire page / dismiss. Visual spec: mirk Pixel Quiet, from
 * plans/hyperclay-local/data-clobber-guard-panel-chip.html.
 *
 * Three surfacing triggers: on page load (GET /_/data-loss), live on this tab's
 * own save (re-check /_/data-loss on a bounded backoff after `hyperclay:save-saved`),
 * and — only in the `everything` preset — the livesync `hyperclay:notification`
 * event (msgType 'data-loss') as an optional accelerator. The root carries
 * `no-save` + `snapshot-remove` so it never persists into the saved file.
 *
 * The server owns all detection + recovery; this module only renders and posts
 * the user's choice. Detection data (recoverable values) never reaches the
 * client raw — only the now/yours preview strings the server computed.
 */
import { isEditMode } from '../core/isAdminOfCurrentResource.js';
import { initUserGesture } from '../utilities/user-gesture.js';
import Mutation from '../utilities/mutation.js';

const ROOT_ID = 'hyperclay-data-loss-guard';
const STYLE_ID = 'hyperclay-data-loss-guard-style';

const ICON_ALERT = '<svg class="dg-x" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2h2v2h-2zM12 2h2v2h-2zM8 4h2v2h-2zM8 6h2v2h-2zM6 8h2v2h-2zM6 10h2v2h-2zM4 12h2v2h-2zM4 14h2v2h-2zM2 16h2v2h-2zM2 18h2v2h-2zM14 4h2v2h-2zM14 6h2v2h-2zM16 8h2v2h-2zM16 10h2v2h-2zM18 12h2v2h-2zM18 14h2v2h-2zM20 16h2v2h-2zM20 18h2v2h-2zM2 20h2v2h-2zM4 20h2v2h-2zM6 20h2v2h-2zM8 20h2v2h-2zM10 20h2v2h-2zM12 20h2v2h-2zM14 20h2v2h-2zM16 20h2v2h-2zM18 20h2v2h-2zM20 20h2v2h-2z"/><path d="M11 8h2v6h-2zM11 16h2v2h-2z"/></svg>';
const ICON_COLLAPSE = '<svg class="dg-ic" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 8h-2v2h2V8Zm-2 2H9v2h2v-2Zm4 0h-2v2h2v-2Zm-6 2H7v2h2v-2Zm8 0h-2v2h2v-2ZM7 14H5v2h2v-2Zm12 0h-2v2h2v-2Z"/></svg>';

const STYLE = `
.hcdl {
  position: fixed; top: 16px; right: 16px; z-index: 2147483000;
  display: flex; flex-direction: column; align-items: flex-end;
  font-family: ui-monospace, "Menlo", monospace;
  --mirk-fg: light-dark(#2B241B, #ECEAF2);
  --mirk-bg: light-dark(#F7F2EA, #11131E);
  --mirk-canvas: light-dark(#F7F2EA, #0B0C13);
  --mirk-destructive: light-dark(#C24A3A, #ff5566);
  --mirk-focus-color: light-dark(#C7AE93, #4A506B);
  --mirk-bevel-bg: light-dark(#FCF8F1, #1A1D2C);
  --mirk-bevel-fg: light-dark(#2B241B, #ECEAF2);
  --mirk-bevel-tl: light-dark(#F0E7D8, #2A2E42);
  --mirk-bevel-br: light-dark(#E2D4BF, #14182A);
  --mirk-bevel-hover-bg: light-dark(#F4ECDF, #202436);
  --mirk-pill-inner-top: light-dark(#FBF6EE, #202436);
  --mirk-input-border: light-dark(#D8C8AF, #353B52);
  --mirk-placeholder-color: light-dark(#A8987F, #6A7090);
  --mirk-sortable-label: light-dark(#8C7B62, #8A90AB);
  --mirk-radius: 5px; --mirk-focus-offset: 2px;
  color: var(--mirk-fg);
}
.hcdl .dg-unit { display: flex; flex-direction: column; align-items: flex-end; }
.hcdl .dg-panel { display: none; }
.hcdl.is-open .dg-chip { display: none; }
.hcdl.is-open .dg-panel { display: flex; }

.hcdl .mirk-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  font: inherit; line-height: 1.5; cursor: pointer; user-select: none; text-align: center;
  color: var(--mirk-bevel-fg); background: var(--mirk-bevel-bg);
  border: 2px solid; border-color: var(--mirk-bevel-tl) var(--mirk-bevel-br) var(--mirk-bevel-br) var(--mirk-bevel-tl);
  padding: 3px 12px; font-size: 14px; outline: none;
}
.hcdl .mirk-button__label { white-space: nowrap; user-select: none; display: inline-block; }
.hcdl .mirk-button:hover { background-color: var(--mirk-bevel-hover-bg); }
.hcdl .mirk-button:active { border-color: var(--mirk-bevel-br) var(--mirk-bevel-tl) var(--mirk-bevel-tl) var(--mirk-bevel-br); }
.hcdl .mirk-button:not(.mirk-button--round):active .mirk-button__label { translate: 1.5px 1.5px; }
.hcdl .mirk-button:focus-visible { outline: 1px solid var(--mirk-focus-color); outline-offset: var(--mirk-focus-offset); }
.hcdl .mirk-button:disabled { opacity: 0.5; cursor: not-allowed; }
.hcdl .mirk-button--round {
  border: none; padding: 2px; border-radius: 12px; background-color: var(--mirk-canvas);
  background-image: linear-gradient(to top in oklab, var(--mirk-bevel-br), var(--mirk-bevel-tl));
  opacity: 0.9; transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.hcdl .mirk-button--round:hover { opacity: 1; }
.hcdl .mirk-button--round .mirk-button__label {
  display: flex; align-items: center; gap: 0.5rem; padding: 2px 14px; border-radius: 10px;
  color: var(--mirk-bevel-fg); background-color: var(--mirk-bevel-bg);
  background-image: linear-gradient(to top in oklab, var(--mirk-bevel-bg), var(--mirk-pill-inner-top));
}

.hcdl .dg-chip .mirk-button__label { gap: 6px; font-size: 14px; padding: 5px 14px; }
/* Alert glyph color via CSS, not an SVG fill="var(...)" attr — var() is not reliably honored there. */
.hcdl .dg-x { fill: var(--mirk-destructive); }
.hcdl .dg-chip .dg-x { vertical-align: -2px; }
.hcdl .dg-panel {
  width: 300px; max-width: calc(100vw - 44px);
  background: var(--mirk-bg); color: var(--mirk-fg);
  border: 1px solid var(--mirk-input-border); border-radius: var(--mirk-radius);
  box-shadow: 0 20px 50px -30px rgba(43,36,27,.6);
  padding: 14px 15px 13px; flex-direction: column; gap: 12px;
}
.hcdl .dg-head { display: flex; gap: 10px; align-items: flex-start; }
.hcdl .dg-ico { flex-shrink: 0; line-height: 0; margin-top: 1px; }
.hcdl .dg-headtext { min-width: 0; }
.hcdl .dg-eyebrow { font-size: 9.5px; text-transform: uppercase; letter-spacing: .2em; color: var(--mirk-placeholder-color); margin-bottom: 3px; }
.hcdl .dg-title { margin: 0; font-size: 13px; font-weight: 400; line-height: 1.3; color: var(--mirk-fg); }
.hcdl .dg-collapse {
  margin-left: auto; flex-shrink: 0; width: 24px; height: 24px;
  display: inline-flex; align-items: center; justify-content: center;
  background: none; border: 0; cursor: pointer; padding: 0; color: var(--mirk-placeholder-color);
}
.hcdl .dg-collapse:hover { color: var(--mirk-fg); }
.hcdl .dg-collapse .dg-ic { display: block; }
.hcdl .dg-meta { font-size: 11px; letter-spacing: .04em; color: var(--mirk-placeholder-color); }
.hcdl .dg-viewchanges {
  background: none; border: 0; cursor: pointer; font: inherit; font-size: 11px; padding: 0;
  color: var(--mirk-placeholder-color); text-decoration: underline; text-underline-offset: 2px;
}
.hcdl .dg-viewchanges:hover { color: var(--mirk-fg); }
.hcdl .dg-preview { display: none; border: 1px solid var(--mirk-input-border); background: var(--mirk-bevel-bg); padding: 10px 11px; flex-direction: column; gap: 11px; }
.hcdl .dg-panel.show-changes .dg-preview { display: flex; }
.hcdl .dg-prow { display: flex; flex-direction: column; gap: 2px; }
.hcdl .dg-pk { font-size: 9.5px; text-transform: uppercase; letter-spacing: .1em; color: var(--mirk-sortable-label); }
.hcdl .dg-now, .hcdl .dg-yours { max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hcdl .dg-now { font-size: 11px; color: var(--mirk-destructive); text-decoration: line-through; opacity: .85; }
.hcdl .dg-yours { font-size: 12px; color: var(--mirk-fg); }
.hcdl .dg-drop { font-size: 10.5px; color: var(--mirk-placeholder-color); }
.hcdl .dg-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 1px; }
.hcdl .dg-actions .mirk-button { width: 100%; }
.hcdl .dg-primary.mirk-button { background-image: none; background-color: var(--mirk-fg); color: var(--mirk-bg); border-color: var(--mirk-fg); }
.hcdl .dg-primary.mirk-button:hover { background-color: var(--mirk-fg); opacity: .88; }
.hcdl .dg-quiet {
  width: 100%; display: inline-flex; align-items: center; justify-content: center;
  border: 2px solid transparent; padding: 5px 12px; background: none; cursor: pointer;
  font-family: inherit; font-size: 11.5px; line-height: 1.5; color: var(--mirk-placeholder-color);
}
.hcdl .dg-quiet:hover { color: var(--mirk-fg); }
.hcdl.dg-busy { opacity: .6; pointer-events: none; }
@media (prefers-color-scheme: dark) { .hcdl { --mirk-focus-offset: 3px; } .hcdl .dg-panel { box-shadow: 0 20px 52px -26px rgba(0,0,0,.78); } }
`;

let currentEvent = null;
let installed = false;
let fetchGen = 0;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.setAttribute('snapshot-remove', '');
  style.textContent = STYLE;
  document.head.appendChild(style);
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function previewRowsHtml(event) {
  const rows = Array.isArray(event.preview) ? event.preview : [];
  let html = rows.map((r) => `
    <div class="dg-prow">
      <span class="dg-pk">${escapeHtml(r.key)}</span>
      <span class="dg-now" title="${escapeHtml(r.now)}">${escapeHtml(r.now)}</span>
      <span class="dg-yours" title="${escapeHtml(r.yours)}">${escapeHtml(r.yours)}</span>
    </div>`).join('');
  if (event.droppedAdditions > 0) {
    const n = event.droppedAdditions;
    html += `<div class="dg-drop">${n} new item${n === 1 ? '' : 's'} added since would be dropped by restore.</div>`;
  }
  return html;
}

function buildRoot(event) {
  const restorable = !!event.restorable;
  const canRevert = !!event.canRevert;
  const n = event.fieldCount || (event.preview ? event.preview.length : 0);
  const fieldLabel = `${n} field${n === 1 ? '' : 's'}`;

  // Restore is primary only when its dry-run round-trips; otherwise Revert leads.
  const restoreBtn = `<button type="button" class="mirk-button mirk-button--small ${restorable ? 'dg-primary' : ''}" data-dg="restore" ${restorable ? '' : 'disabled'}><span class="mirk-button__label">Keep change, restore my data</span></button>`;
  const revertBtn = `<button type="button" class="mirk-button mirk-button--small ${restorable ? '' : 'dg-primary'}" data-dg="revert" ${canRevert ? '' : 'disabled'}><span class="mirk-button__label">Revert entire page</span></button>`;

  const root = document.createElement('div');
  root.id = ROOT_ID;
  root.className = 'hcdl';
  root.setAttribute('data-theme', 'pixel-quiet');
  root.setAttribute('no-save', '');
  root.setAttribute('snapshot-remove', '');
  root.innerHTML = `
    <div class="dg-unit">
      <button type="button" class="dg-chip mirk-button mirk-button--small mirk-button--round" data-dg="open" title="Click to expand">
        <span class="mirk-button__label">${ICON_ALERT} Saved data overwritten</span>
      </button>
      <section class="dg-panel" role="dialog" aria-label="Data recovery">
        <div class="dg-head">
          <span class="dg-ico">${ICON_ALERT}</span>
          <div class="dg-headtext">
            <div class="dg-eyebrow">Data guard</div>
            <h2 class="dg-title">Saved data overwritten</h2>
          </div>
          <button type="button" class="dg-collapse" data-dg="collapse" aria-label="Collapse to chip">${ICON_COLLAPSE}</button>
        </div>
        <div class="dg-meta">${escapeHtml(fieldLabel)} <button type="button" class="dg-viewchanges" data-dg="toggle">(view changes)</button></div>
        <div class="dg-preview">${previewRowsHtml(event)}</div>
        <div class="dg-actions">
          ${restoreBtn}
          ${revertBtn}
          <button type="button" class="dg-quiet" data-dg="dismiss">Dismiss</button>
        </div>
      </section>
    </div>`;
  return root;
}

function wire(root) {
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-dg]');
    if (!btn) return;
    const action = btn.getAttribute('data-dg');
    if (action === 'open') { root.classList.add('is-open'); return; }
    if (action === 'collapse') { root.classList.remove('is-open'); return; }
    if (action === 'toggle') { root.querySelector('.dg-panel').classList.toggle('show-changes'); return; }
    if (action === 'restore' || action === 'revert' || action === 'dismiss') {
      if (btn.disabled) return;
      await resolve(action, root);
    }
  });
}

function getFile() {
  // The page's own identity — same value the save path sends (Page-URL header,
  // resolved server-side). The platform ignores it (node from subdomain); the
  // local server resolves the file by name.
  return window.location.href;
}

async function resolve(choice, root) {
  if (!currentEvent) return;
  root.classList.add('dg-busy');
  try {
    const res = await fetch(`/_/data-loss/${encodeURIComponent(currentEvent.id)}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Page-URL': window.location.href },
      body: JSON.stringify({ choice, file: getFile() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      root.classList.remove('dg-busy');
      if (window.toast) window.toast(data.error || 'Could not resolve', 'error');
      // Re-sync: an upgrade or a server-side clear skipped while busy is now
      // reconciled (the backoff re-fetches and upgrades or clears the chip).
      scheduleRechecks();
      return;
    }
    unmount();
    if (window.toast) {
      const msg = choice === 'dismiss' ? 'Dismissed' : choice === 'revert' ? 'Page reverted' : 'Data restored';
      window.toast(msg, 'success');
    }
    if (choice === 'revert' || choice === 'restore') {
      // The good content is on disk now; reload to show it.
      setTimeout(() => window.location.reload(), 350);
    }
  } catch (err) {
    root.classList.remove('dg-busy');
    if (window.toast) window.toast('Could not resolve', 'error');
    scheduleRechecks();
  }
}

function unmount() {
  currentEvent = null;
  // Bump the fetch generation and drop any pending backoff timers so a
  // just-resolved chip can't be re-mounted by a stale in-flight GET or a
  // timer that hasn't fired yet.
  fetchGen++;
  clearRechecks();
  const existing = document.getElementById(ROOT_ID);
  if (existing) existing.remove();
}

// Same incident id can arrive more than once (save-saved re-fetch, page-load
// GET, livesync push) with an evolving payload. Only apply a payload that is at
// least as fresh: never let an older write, or a pre-backup canRevert:false,
// replace what's shown. The server bumps lastWriteAt on each firing write but
// NOT when it later patches the whole-file backup, so the canRevert:false→true
// upgrade shares a lastWriteAt with the pre-backup event — hence the explicit
// canRevert tiebreak. Missing lastWriteAt (undefined) compares false, so a
// payload without one is never wrongly blocked.
function isStalePayload(event) {
  if (!currentEvent || currentEvent.id !== event.id) return false;
  if (event.lastWriteAt < currentEvent.lastWriteAt) return true;
  if (event.lastWriteAt === currentEvent.lastWriteAt && currentEvent.canRevert && !event.canRevert) return true;
  return false;
}

// A re-arriving payload that renders identically (same incident, same write, same
// recovery affordances) needs no rebuild — skip it so an open panel doesn't lose
// focus/selection/scroll on every autosave tick. A real upgrade differs in
// canRevert / restorable / lastWriteAt, so it still rebuilds.
function rendersSame(event) {
  return !!currentEvent
    && currentEvent.id === event.id
    && currentEvent.lastWriteAt === event.lastWriteAt
    && !!currentEvent.canRevert === !!event.canRevert
    && !!currentEvent.restorable === !!event.restorable
    && !!document.getElementById(ROOT_ID);
}

function mount(event) {
  if (!event || !event.id) return;
  if (isStalePayload(event)) return;
  if (rendersSame(event)) return;
  ensureStyle();
  const existing = document.getElementById(ROOT_ID);
  // A resolve POST is mid-flight on this chip — leave it be. It's about to
  // unmount, and rebuilding would drop the `dg-busy` shield and re-open a
  // double-submit window.
  if (existing && existing.classList.contains('dg-busy')) return;
  // Preserve the user's expand + view-changes state across the rebuild by
  // reading it off the live node — no module globals to leak between incidents.
  const wasOpen = !!existing && existing.classList.contains('is-open');
  const wasShowChanges = !!existing && !!existing.querySelector('.dg-panel.show-changes');
  if (existing) existing.remove();
  currentEvent = event;
  const root = buildRoot(event);
  if (wasOpen) root.classList.add('is-open');
  if (wasShowChanges) root.querySelector('.dg-panel').classList.add('show-changes');
  wire(root);
  document.body.appendChild(root);
  // Fully recoverable now (the whole-file backup has landed) — nothing left to
  // poll for, so cancel any remaining backoff attempts. Covers the livesync
  // settled-mount path too, not just fetchAndMount.
  if (event.canRevert) clearRechecks();
}

async function fetchAndMount() {
  const gen = fetchGen;
  try {
    const res = await fetch(`/_/data-loss?file=${encodeURIComponent(getFile())}`, {
      credentials: 'include',
      headers: { 'Page-URL': window.location.href },
    });
    if (!res.ok) return;
    const data = await res.json();
    // A resolve/dismiss between the request and its response bumps fetchGen —
    // drop the late result so it can't resurrect a chip the user already cleared.
    if (gen !== fetchGen) return;
    if (data && data.event) {
      mount(data.event);
    } else if (currentEvent) {
      // Successful GET, no pending event, but we're showing a chip — the loss was
      // resolved or self-healed elsewhere (e.g. the data was restored by hand and
      // saved). Clear the stale chip, unless a resolve POST is mid-flight on it.
      const root = document.getElementById(ROOT_ID);
      if (!root || !root.classList.contains('dg-busy')) unmount();
    }
  } catch {}
}

function onNotification(e) {
  const d = e.detail || {};
  if (d.msgType !== 'data-loss') return;
  if (d.action === 'resolved') {
    // Resolved elsewhere (this tab or the counterpart environment). Only clear a
    // chip we actually have, and only when the id matches (or the notice carries
    // none) — otherwise a stale `resolved` could cancel a fresh incident's
    // in-flight backoff via unmount()'s fetchGen bump + clearRechecks().
    if (currentEvent && (!d.data || d.data.id === undefined || d.data.id === currentEvent.id)) {
      unmount();
    }
    return;
  }
  if (d.action === 'raised' && d.data) {
    mount(d.data);
  }
}

let recheckTimers = [];
function clearRechecks() { recheckTimers.forEach(clearTimeout); recheckTimers = []; }

// Poll /_/data-loss on a short bounded backoff [300, 1200, 3000]ms. The server
// guard runs in setImmediate AFTER the save response (a row-locked txn, then the
// whole-file backup persisted in a follow-up txn), so its commit can lag by up to
// a couple seconds on a large page. Polling races the event's appearance,
// upgrades a chip first shown before the backup landed (canRevert false→true),
// and clears one the server has resolved; mount() (on canRevert) and the null
// branch of fetchAndMount stop it once settled. The page-load GET is the backstop
// beyond the last attempt.
function scheduleRechecks() {
  clearRechecks();
  for (const ms of [300, 1200, 3000]) {
    recheckTimers.push(setTimeout(fetchAndMount, ms));
  }
}

// A save made by THIS tab can itself be the clobber (a background script, a
// deliberate big delete, or deleting the `api` island outright). Surface it live
// with no livesync by re-checking the panel's own endpoint (unconditional: the
// endpoint is owner-only and returns { event: null } cheaply, so we trust the
// server rather than infer from the possibly-clobbered DOM). External/cross-device
// clobbers have no save-saved here and stay on the page-load path.
function onSaveSaved() {
  scheduleRechecks();
}

function init() {
  if (typeof document === 'undefined') return;
  if (!isEditMode) return;
  if (installed) return;
  installed = true;
  // Install the trusted-gesture tracker here too (not only from autosave): this
  // panel ships in presets that don't bundle autosave (e.g. cms), and without the
  // capture-phase listeners userDriven would always be false, so the server would
  // read every UI save as ui-background and fire on any destruction — a chip on
  // every deliberate delete.
  initUserGesture();
  // Start the singleton DOM observer ourselves so attribution runs wherever the
  // chip ships, not only when another module (e.g. option-visibility) subscribes.
  Mutation.ensureObserving();
  document.addEventListener('hyperclay:notification', onNotification);
  document.addEventListener('hyperclay:save-saved', onSaveSaved);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchAndMount, { once: true });
  } else {
    fetchAndMount();
  }
}

init();

export default init;
export { mount, unmount };
