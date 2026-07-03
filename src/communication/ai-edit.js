/**
 * AI Edit — comment-to-edit AI editing over the local message bus.
 * Requires: save-system, mutation, edit-mode (static imports pull them in).
 *
 * Direct editing is primary: text units carry editmode:contenteditable, so
 * clicking a heading or paragraph just places the caret, and clicking a
 * figure reaches its own interactivity. The AI comment box is on demand: a
 * floating 💬 chip near the hovered unit, ⌘K for the unit holding the
 * caret/selection (selection rides along as a quote), a click on bare
 * section padding, or the fixed bottom-right bubble for the whole document.
 * Units resolve to the nearest h1-h6/p/figure inside a [data-edit-id]
 * section, falling back to the section itself.
 *
 * An AI request rides the local message bus (`/_/bus`, channel "ai-edit") to
 * whatever agent answers it: hyperclay-local's built-in ai-edit plugin
 * (claude by default; @fable/@codex/@agy or user-defined engines via a
 * leading @token) or a custom standalone handler. The handler acks on pickup
 * (no ack within 10s → cancel + report), the reply streams back as delta
 * messages and morphs the element live via HyperMorph; `ai-edit/done`
 * carries the full final HTML (self-correcting), then Keep = a normal
 * Hyperclay save, Revert = morph back to the held pre-edit snapshot.
 * Document mode (tag body) skips the streaming preview — a half-streamed
 * body would blank the rest of the page — and applies once on done; body
 * morphs veto removal of [save-remove] chrome.
 *
 * Dormant by design when the bus is absent (e.g. on hyperclay.com): the page
 * is then just a page. All injected chrome carries save-remove (stripped from
 * saves) + mutations-ignore (invisible to undo/autosave/live-sync observers).
 *
 * Undo integration: observers pause at stream start. On Keep the element is
 * rewound to the snapshot while still paused, observers resume, then one
 * final morph lands the whole AI edit as a single undoable step. On Revert
 * the rewind happens under pause, so history never sees the edit at all.
 *
 * Wire protocol: hyperclay-pages/plans/comment-to-edit-plan.md
 * Bus + plugin:  plans/hyperclay-local/ai-edit-plugin-plan.md
 */
import { HyperMorph } from "../vendor/hyper-morph.vendor.js";
import Mutation from "../utilities/mutation.js";
import { isEditMode } from "../core/isAdminOfCurrentResource.js";
import { savePage } from "../core/savePage.js";
import { enableContentEditable } from "../core/adminContenteditable.js";

const BUS = '/_/bus';
const CHANNEL = 'ai-edit';
const WATCHDOG_MS = 90_000;      // mid-stream stall
const FIRST_REPLY_MS = 10_000;   // nothing at all yet → probably no handler running
const UNIT_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,figure';
const sender = 'page-' + Math.random().toString(36).slice(2, 8);
let requestCounter = 0;
let session = null; // one edit at a time
let panel, ring, textarea, quoteEl, statusEl, warningsEl, chip, docBubble;
let buttons = {};
let anchorEl = null;    // element the panel is currently anchored to
let chipTarget = null;  // unit the hover chip currently points at
let chipHideTimer = null;

// ---------------------------------------------------------------- bus

async function busPresent() {
  try {
    const res = await fetch(`${BUS}/subscribe?channel=${CHANNEL}`, {
      headers: { accept: 'text/event-stream' }
    });
    const ok = res.ok && (res.headers.get('content-type') || '').includes('text/event-stream');
    res.body?.cancel();
    return ok;
  } catch {
    return false;
  }
}

async function busSend(type, payload) {
  try {
    const res = await fetch(`${BUS}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Page-URL': location.href },
      body: JSON.stringify({ channel: CHANNEL, type, v: 1, payload, sender })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { error: body.error || `bus error (${res.status})` };
    }
    return await res.json();
  } catch {
    return null; // network-level failure: bus unreachable
  }
}

function listen() {
  const es = new EventSource(`${BUS}/subscribe?channel=${CHANNEL}`);
  es.onmessage = (event) => {
    let envelope;
    try { envelope = JSON.parse(event.data); } catch { return; }
    if (envelope.sender === sender) return;
    const payload = envelope.payload || {};
    if (!session || payload.id !== session.id) return;
    if (envelope.type === 'ai-edit/ack') onAck();
    else if (envelope.type === 'ai-edit/delta') onDelta(payload);
    else if (envelope.type === 'ai-edit/done') onDone(payload);
    else if (envelope.type === 'ai-edit/error') onError(payload.message || 'Handler reported an error');
    // unknown types: ignored silently, per bus semantics
  };
  return es;
}

// ---------------------------------------------------------------- observers (undo/autosave)

function pauseObservers() {
  Mutation.pause();
}

function resumeObservers() {
  Mutation.resume();
}

// ---------------------------------------------------------------- units

// The editable unit for an interaction: nearest heading/paragraph/figure
// inside a [data-edit-id] section, else the section itself.
function unitFrom(target) {
  if (!(target instanceof Element)) return null;
  const section = target.closest('[data-edit-id]');
  if (!section) return null;
  const unit = target.closest(UNIT_SELECTOR);
  return unit && section.contains(unit) ? unit : section;
}

function editLabel(el) {
  if (el === document.body) return 'document';
  const own = el.getAttribute('data-edit-id');
  if (own) return own;
  const section = el.closest('[data-edit-id]');
  return (section ? section.getAttribute('data-edit-id') + ' › ' : '') + el.tagName.toLowerCase();
}

function quoteFromSelection(scope) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return undefined;
  const text = selection.toString().trim();
  if (!text) return undefined;
  let node = selection.getRangeAt(0).commonAncestorContainer;
  if (node.nodeType !== 1) node = node.parentElement;
  if (scope && scope !== document.body && !scope.contains(node)) return undefined;
  return text.length > 400 ? text.slice(0, 400) + '…' : text;
}

function strippedBodyHTML() {
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll('[save-remove]').forEach(node => node.remove());
  return clone.outerHTML;
}

// ---------------------------------------------------------------- morphing

function morphTo(el, content) {
  return HyperMorph.morph(el, content, { morphStyle: 'outerHTML', restoreFocus: true });
}

// Session-aware morph. Document mode morphs the whole body but vetoes
// removal of [save-remove] chrome (the model never saw it, so a plain morph
// would delete the panel mid-flight). Either way, re-run the hyperclayjs
// contenteditable pass afterwards: a reply may drop the runtime attribute.
function sessionMorph(s, content) {
  if (s.docMode) {
    if (typeof content === 'string') {
      // Parse to an element ourselves: hyper-morph parses a body string into a
      // full document and would insert DOMParser's synthesized empty <head>
      // alongside the morphed body. An element gets sibling-free treatment.
      content = new DOMParser().parseFromString(content, 'text/html').body;
    }
    HyperMorph.morph(document.body, content, {
      morphStyle: 'outerHTML',
      restoreFocus: true,
      callbacks: {
        beforeNodeRemoved: node => !(node.nodeType === 1 && node.hasAttribute('save-remove'))
      }
    });
  } else {
    morphTo(s.el, content);
  }
  enableContentEditable();
}

// Extract a morphable single-root candidate from (possibly partial, possibly
// fenced) streamed HTML. Returns an inert element or null. Template parsing
// auto-closes half-open tags and never executes scripts — but silently strips
// <body> tags, so a body candidate parses via DOMParser (equally inert).
function candidateFrom(html, tag) {
  const start = html.search(new RegExp('<' + tag + '(\\s|>)', 'i'));
  if (start === -1) return null;
  const cleaned = html.slice(start).replace(/\s*`{1,3}\s*$/, '');
  if (tag.toLowerCase() === 'body') {
    return new DOMParser().parseFromString(cleaned, 'text/html').body;
  }
  const template = document.createElement('template');
  template.innerHTML = cleaned;
  const candidate = template.content.firstElementChild;
  if (!candidate || candidate.tagName.toLowerCase() !== tag.toLowerCase()) return null;
  return candidate;
}

function scheduleMorph() {
  if (!session || session.rafPending) return;
  session.rafPending = true;
  requestAnimationFrame(() => {
    if (!session) return;
    session.rafPending = false;
    if (session.state !== 'streaming' || session.desynced || session.docMode) return;
    const candidate = candidateFrom(session.buffer, session.tag);
    if (candidate) {
      sessionMorph(session, candidate);
      positionChrome();
    }
  });
}

// ---------------------------------------------------------------- session lifecycle

function newSession(el, comment, quote) {
  const docMode = el === document.body;
  // Context refs are @tokens containing a dot or slash (@notes.md, @src/x.js).
  // Bare @words are not refs: a leading one is an engine token (@fable,
  // @codex — routed handler-side), and mid-text ones are prose.
  const contextRefs = [...comment.matchAll(/@([\w.-]*[/.][\w./-]*)/g)]
    .map(m => m[1])
    .filter(ref => ref !== 'page');
  const elementHTML = docMode ? strippedBodyHTML() : el.outerHTML;
  const payload = {
    id: 'req-' + Date.now().toString(36) + '-' + (++requestCounter),
    editId: editLabel(el),
    tag: el.tagName.toLowerCase(),
    elementHTML,
    comment,
    contextRefs
  };
  if (quote) payload.quote = quote;
  if (!docMode && /@page\b/.test(comment)) {
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('[save-remove]').forEach(node => node.remove());
    payload.pageHTML = clone.outerHTML;
  }
  return {
    id: payload.id,
    el,
    docMode,
    tag: payload.tag,
    reassertId: docMode ? null : el.getAttribute('data-edit-id'),
    snapshot: elementHTML,
    payload,
    buffer: '',
    nextIndex: 0,
    desynced: false,
    rafPending: false,
    state: 'requesting',
    paused: false,
    sawReply: false,
    watchdog: null,
    finalCandidate: null
  };
}

async function sendRequest(el, comment, quote) {
  session = newSession(el, comment, quote);
  // Arm the session BEFORE the request hits the wire: an in-process handler
  // (hyperclay-local's ai-edit plugin) acks while the send POST is still in
  // flight, and an ack landing on a not-yet-streaming session would be
  // dropped — the watchdog would then cancel a perfectly healthy request.
  session.state = 'streaming';
  session.paused = true;
  pauseObservers();
  // delivered counts every subscriber including this page, so it can't
  // detect a missing handler; the handler's ack does. No ack in time → the
  // watchdog cancels and reports; the ack re-arms it for the model phase.
  armWatchdog(FIRST_REPLY_MS, 'no reply from an agent — enable AI Editing in Hyperclay Local, or run a handler');
  setStatus('sending…');
  showButtons('stop');
  const reply = await busSend('ai-edit/request', session.payload);
  if (!session) return; // cancelled while in flight
  if (!reply || reply.error) {
    clearTimeout(session.watchdog);
    resumeObservers();
    session = null;
    setStatus(reply?.error || 'bus unreachable — is hyperclay-local running?', 'warn');
    showButtons('send');
    return;
  }
  if (session.state === 'streaming' && !session.sawReply) setStatus('waiting for handler…');
}

function armWatchdog(ms = WATCHDOG_MS, message = 'timed out waiting for the handler') {
  clearTimeout(session.watchdog);
  session.watchdog = setTimeout(() => {
    busSend('ai-edit/cancel', { id: session.id }); // stop the handler burning tokens
    onError(message);
  }, ms);
}

function onAck() {
  if (session.state !== 'streaming') return;
  session.sawReply = true;
  armWatchdog(); // handler picked it up; give the model the full stall window
  setStatus('thinking…');
}

function onDelta(payload) {
  if (session.state !== 'streaming') return;
  session.sawReply = true;
  armWatchdog();
  if (payload.index !== session.nextIndex) {
    session.desynced = true; // gap in the stream: stop previewing, done will correct
    return;
  }
  session.nextIndex += 1;
  session.buffer += payload.text;
  if (session.docMode) {
    setStatus(`streaming… (${session.buffer.length.toLocaleString()} chars)`);
  } else if (session.nextIndex === 1) {
    setStatus('streaming…');
  }
  scheduleMorph();
}

function onDone(payload) {
  if (session.state !== 'streaming') return;
  clearTimeout(session.watchdog);
  session.state = 'deciding';

  const warnings = [];
  let candidate = candidateFrom(payload.html || '', session.tag);
  if (!candidate) {
    onError(`reply is not a single <${session.tag}> element`);
    return;
  }
  if (!session.docMode) { // template parsing strips <body>, making this check meaningless there
    const template = document.createElement('template');
    template.innerHTML = payload.html || '';
    if (template.content.children.length > 1) {
      warnings.push('reply had extra root elements — kept the first');
    }
  }
  if (session.reassertId) candidate.setAttribute('data-edit-id', session.reassertId);
  if (!session.docMode) { // the real body legitimately contains scripts; skip in doc mode
    if (candidate.querySelector('script')) {
      warnings.push('reply contains <script> — review before keeping');
    }
    for (const el of [candidate, ...candidate.querySelectorAll('*')]) {
      if ([...el.attributes].some(a => a.name.toLowerCase().startsWith('on'))) {
        warnings.push('reply contains inline event handlers — review before keeping');
        break;
      }
    }
  }

  session.finalCandidate = candidate;
  sessionMorph(session, candidate); // authoritative morph from the full final HTML
  positionChrome();
  setStatus(payload.model ? `done (${payload.model})` : 'done');
  showWarnings(warnings);
  showButtons('keep', 'revert');
  textarea.value = '';
}

function onError(message) {
  if (!session) return;
  revertSession();
  setStatus(message, 'warn');
  showButtons('send');
}

// Rewind to the pre-edit snapshot and release observers. The paused rewind
// means undo history never sees the abandoned edit.
function revertSession() {
  const s = session;
  session = null;
  clearTimeout(s.watchdog);
  if (s.state === 'streaming' || s.state === 'deciding') {
    sessionMorph(s, s.snapshot);
  }
  if (s.paused) resumeObservers();
  positionChrome();
}

function keepSession() {
  const s = session;
  session = null;
  clearTimeout(s.watchdog);
  sessionMorph(s, s.snapshot);        // rewind while observers are still paused
  if (s.paused) resumeObservers();    // boundary drain discards the rewind
  sessionMorph(s, s.finalCandidate);  // recorded: the whole edit = one undo step
  positionChrome();
  savePage(({ msg, msgType } = {}) => setStatus(msg || 'saved', msgType === 'error' ? 'warn' : ''));
  setStatus('saving…');
  showButtons('send');
}

function cancelStream() {
  const id = session.id;
  busSend('ai-edit/cancel', { id });
  revertSession();
  setStatus('cancelled');
  showButtons('send');
}

// ---------------------------------------------------------------- chrome

function buildChrome() {
  const style = document.createElement('style');
  style.setAttribute('save-remove', '');
  style.setAttribute('mutations-ignore', '');
  style.textContent = `
    #hyper-edit-panel {
      position: fixed; z-index: 99999; width: min(30rem, calc(100vw - 2rem));
      background: #16161d; color: #e8e8f0; border: 1px solid #34343f;
      border-radius: 10px; box-shadow: 0 12px 40px rgba(0,0,0,.45);
      font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
      padding: 10px;
    }
    #hyper-edit-panel[hidden] { display: none; }
    #hyper-edit-panel .hep-quote {
      color: #9a9ab0; border-left: 2px solid #4a4a5a; padding-left: 8px;
      margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    #hyper-edit-panel textarea {
      width: 100%; box-sizing: border-box; min-height: 3.2em; resize: vertical;
      background: #0e0e13; color: inherit; border: 1px solid #34343f;
      border-radius: 6px; padding: 8px; font: inherit; outline: none;
    }
    #hyper-edit-panel textarea:focus { border-color: #6a6a8a; }
    #hyper-edit-panel .hep-row {
      display: flex; align-items: center; gap: 8px; margin-top: 8px;
    }
    #hyper-edit-panel .hep-status { flex: 1; color: #9a9ab0; min-width: 0; }
    #hyper-edit-panel .hep-status.warn { color: #e8b04a; }
    #hyper-edit-panel button {
      background: #26262f; color: inherit; border: 1px solid #44444f;
      border-radius: 6px; padding: 4px 12px; font: inherit; cursor: pointer;
    }
    #hyper-edit-panel button:hover { background: #32323d; }
    #hyper-edit-panel .hep-keep { background: #1e3a2a; border-color: #2e5a40; }
    #hyper-edit-panel .hep-warnings {
      margin-top: 8px; color: #e8b04a; white-space: pre-line;
    }
    #hyper-edit-ring {
      position: fixed; z-index: 99998; pointer-events: none;
      border: 1px solid #7a7aff; border-radius: 4px; opacity: .8;
    }
    #hyper-edit-ring[hidden] { display: none; }
    #hyper-edit-chip {
      position: fixed; z-index: 99999; width: 26px; height: 26px; padding: 0;
      display: flex; align-items: center; justify-content: center;
      background: #16161d; color: #e8e8f0; border: 1px solid #44444f;
      border-radius: 50%; cursor: pointer; font-size: 13px; line-height: 1;
      box-shadow: 0 4px 14px rgba(0,0,0,.4);
    }
    #hyper-edit-chip[hidden] { display: none; }
    #hyper-edit-chip:hover { background: #32323d; border-color: #6a6a8a; }
    #hyper-edit-doc-bubble {
      position: fixed; right: 16px; bottom: 16px; z-index: 99999;
      width: 44px; height: 44px; padding: 0; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: #16161d; color: #e8e8f0; border: 1px solid #44444f;
      font-size: 18px; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,.45);
    }
    #hyper-edit-doc-bubble:hover { background: #32323d; border-color: #6a6a8a; }
    [editmode\\:contenteditable][contenteditable]:focus {
      outline: 1px solid #4a4a6a; outline-offset: 4px; border-radius: 2px;
    }
  `;
  document.head.appendChild(style);

  ring = document.createElement('div');
  ring.id = 'hyper-edit-ring';
  ring.setAttribute('save-remove', '');
  ring.setAttribute('mutations-ignore', '');
  ring.hidden = true;

  panel = document.createElement('div');
  panel.id = 'hyper-edit-panel';
  panel.setAttribute('save-remove', '');
  panel.setAttribute('mutations-ignore', '');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="hep-quote" hidden></div>
    <textarea rows="2" placeholder="Describe the change… (@file.ext adds context, @fable / @claude picks the agent)"></textarea>
    <div class="hep-row">
      <span class="hep-status"></span>
      <button class="hep-send" type="button">Send</button>
      <button class="hep-stop" type="button" hidden>Stop</button>
      <button class="hep-revert" type="button" hidden>Revert</button>
      <button class="hep-keep" type="button" hidden>Keep</button>
    </div>
    <div class="hep-warnings" hidden></div>
  `;

  chip = document.createElement('button');
  chip.id = 'hyper-edit-chip';
  chip.type = 'button';
  chip.title = 'Comment on this (⌘K)';
  chip.textContent = '💬';
  chip.setAttribute('save-remove', '');
  chip.setAttribute('mutations-ignore', '');
  chip.hidden = true;

  docBubble = document.createElement('button');
  docBubble.id = 'hyper-edit-doc-bubble';
  docBubble.type = 'button';
  docBubble.title = 'Comment on the whole page';
  docBubble.textContent = '💬';
  docBubble.setAttribute('save-remove', '');
  docBubble.setAttribute('mutations-ignore', '');

  document.body.append(ring, panel, chip, docBubble);

  quoteEl = panel.querySelector('.hep-quote');
  textarea = panel.querySelector('textarea');
  statusEl = panel.querySelector('.hep-status');
  warningsEl = panel.querySelector('.hep-warnings');
  for (const name of ['send', 'stop', 'keep', 'revert']) {
    buttons[name] = panel.querySelector('.hep-' + name);
  }

  buttons.send.addEventListener('click', submit);
  buttons.stop.addEventListener('click', cancelStream);
  buttons.keep.addEventListener('click', keepSession);
  buttons.revert.addEventListener('click', () => { revertSession(); setStatus('reverted'); showButtons('send'); });
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!buttons.send.hidden) submit();
    }
  });

  chip.addEventListener('click', () => {
    const target = chipTarget;
    hideChip();
    if (target && !session) openPanel(target, quoteFromSelection(target));
  });
  docBubble.addEventListener('click', () => {
    if (session) return;
    openPanel(document.body, quoteFromSelection(document.body));
  });

  window.addEventListener('scroll', () => { positionChrome(); hideChip(); }, { passive: true });
  window.addEventListener('resize', positionChrome, { passive: true });
}

// ---------------------------------------------------------------- hover chip

function showChipFor(unit) {
  clearTimeout(chipHideTimer);
  chipHideTimer = null;
  chipTarget = unit;
  const rect = unit.getBoundingClientRect();
  chip.hidden = false;
  chip.style.left = Math.min(rect.right + 8, window.innerWidth - 34) + 'px';
  chip.style.top = Math.max(8, rect.top) + 'px';
}

function hideChip() {
  clearTimeout(chipHideTimer);
  chipHideTimer = null;
  chip.hidden = true;
  chipTarget = null;
}

function scheduleChipHide() {
  if (chip.hidden || chipHideTimer) return;
  chipHideTimer = setTimeout(hideChip, 400);
}

function setStatus(text, tone) {
  statusEl.textContent = text || '';
  statusEl.classList.toggle('warn', tone === 'warn');
}

function showButtons(...names) {
  for (const [name, button] of Object.entries(buttons)) {
    button.hidden = !names.includes(name);
  }
}

function showWarnings(warnings) {
  warningsEl.hidden = !warnings.length;
  warningsEl.textContent = warnings.map(w => '⚠ ' + w).join('\n');
}

function positionChrome() {
  if (!anchorEl || panel.hidden) return;
  if (!anchorEl.isConnected) { closePanel(); return; }
  if (anchorEl === document.body) {
    // document mode: no ring, panel pinned above the bottom-right bubble
    ring.hidden = true;
    panel.style.left = Math.max(16, window.innerWidth - (panel.offsetWidth || 480) - 16) + 'px';
    panel.style.top = Math.max(16, window.innerHeight - (panel.offsetHeight || 120) - 76) + 'px';
    return;
  }
  const rect = anchorEl.getBoundingClientRect();
  ring.hidden = false;
  ring.style.left = rect.left - 4 + 'px';
  ring.style.top = rect.top - 4 + 'px';
  ring.style.width = rect.width + 6 + 'px';
  ring.style.height = rect.height + 6 + 'px';
  const panelWidth = panel.offsetWidth || 480;
  const left = Math.max(16, Math.min(rect.left, window.innerWidth - panelWidth - 16));
  let top = rect.bottom + 10;
  const panelHeight = panel.offsetHeight || 120;
  if (top + panelHeight > window.innerHeight - 16) {
    top = Math.max(16, rect.top - panelHeight - 10);
  }
  panel.style.left = left + 'px';
  panel.style.top = top + 'px';
}

function openPanel(el, quote) {
  anchorEl = el;
  hideChip();
  panel.hidden = false;
  quoteEl.hidden = !quote;
  quoteEl.textContent = quote ? `“${quote}”` : '';
  panel.dataset.quote = quote || '';
  setStatus('');
  showWarnings([]);
  showButtons('send');
  positionChrome();
  textarea.focus();
}

function closePanel() {
  if (session) revertSession();
  anchorEl = null;
  panel.hidden = true;
  ring.hidden = true;
  textarea.value = '';
}

function submit() {
  const comment = textarea.value.trim();
  if (!comment || !anchorEl || session) return;
  sendRequest(anchorEl, comment, panel.dataset.quote || undefined);
}

// ---------------------------------------------------------------- interactions

function wireInteractions() {
  // Clicks: text units are contenteditable (caret) and figures keep their
  // own interactivity, so neither is intercepted. Only a click on bare
  // section padding opens the comment box; a click away from an open,
  // empty panel closes it.
  document.addEventListener('click', (event) => {
    if (panel.contains(event.target) || chip.contains(event.target) || docBubble.contains(event.target)) return;
    if (session) return; // one edit at a time
    const section = event.target.closest?.('[data-edit-id]');
    const unit = section ? unitFrom(event.target) : null;
    if (section && unit === section) {
      if (section !== anchorEl || panel.hidden) openPanel(section, quoteFromSelection(section));
    } else if (!panel.hidden && !textarea.value.trim() && !(anchorEl && anchorEl.contains(event.target))) {
      closePanel();
    }
  });

  // Hover chip: follows the unit under the cursor while no panel is open.
  let lastMove = 0;
  document.addEventListener('mousemove', (event) => {
    const now = Date.now();
    if (now - lastMove < 80) return;
    lastMove = now;
    if (session || !panel.hidden) { scheduleChipHide(); return; }
    if (chip.contains(event.target)) { clearTimeout(chipHideTimer); chipHideTimer = null; return; }
    const unit = unitFrom(event.target);
    if (unit) showChipFor(unit);
    else scheduleChipHide();
  });

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'k') {
      if (session) return;
      event.preventDefault();
      const selection = window.getSelection();
      let node = selection && selection.anchorNode;
      if (node && node.nodeType !== 1) node = node.parentElement;
      const target = (node && unitFrom(node)) || chipTarget;
      if (target) openPanel(target, quoteFromSelection(target));
      return;
    }
    if (event.key !== 'Escape' || panel.hidden) return;
    if (session?.state === 'streaming') {
      cancelStream();
    } else if (session?.state === 'deciding') {
      revertSession();
      setStatus('reverted');
      showButtons('send');
    } else {
      closePanel();
    }
  });
}

// ---------------------------------------------------------------- boot

async function init() {
  if (!isEditMode) return;           // an owner/editor feature, nothing else
  if (!(await busPresent())) return; // no bus (e.g. prod): stay dormant
  buildChrome();
  wireInteractions();
  listen();
  console.log('[ai-edit] comment-to-edit ready (bus present)');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { init().catch(() => {}); });
} else {
  init().catch(() => {});
}

export default init;
export const __internals = { candidateFrom, unitFrom, editLabel }; // test seams
