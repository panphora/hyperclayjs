/**
 * ai-edit module: boot gating (edit mode + bus presence), chrome hygiene,
 * unit resolution, and the candidateFrom parsing seams (including the
 * DOMParser-for-body regression — template parsing silently strips <body>
 * tags, which once made every document-mode reply fail validation).
 */

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

function busPresentFetch() {
  return jest.fn().mockResolvedValue({
    ok: true,
    headers: { get: () => 'text/event-stream' },
    body: { cancel: () => {} }
  });
}

function loadModule({ editMode, busPresent }) {
  jest.resetModules();
  document.body.innerHTML = '';
  window.__hyperclayEditMode = editMode;
  global.fetch = busPresent ? busPresentFetch() : jest.fn().mockRejectedValue(new Error('no bus'));
  let mod;
  jest.isolateModules(() => {
    mod = require('../src/communication/ai-edit.js');
  });
  return mod;
}

afterEach(() => {
  delete window.__hyperclayEditMode;
  delete global.fetch;
});

describe('boot gating', () => {
  test('view mode: fully dormant, no chrome, no bus probe', async () => {
    loadModule({ editMode: false, busPresent: true });
    await flush();
    expect(document.getElementById('hyper-edit-panel')).toBeNull();
    expect(document.getElementById('hyper-edit-doc-bubble')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('edit mode without a bus: dormant, no chrome', async () => {
    loadModule({ editMode: true, busPresent: false });
    await flush();
    expect(document.getElementById('hyper-edit-panel')).toBeNull();
    expect(document.getElementById('hyper-edit-doc-bubble')).toBeNull();
  });

  test('edit mode with a bus: chrome injected, all of it save-stripped and observer-invisible', async () => {
    loadModule({ editMode: true, busPresent: true });
    await flush();
    for (const id of ['hyper-edit-panel', 'hyper-edit-ring', 'hyper-edit-chip', 'hyper-edit-doc-bubble']) {
      const el = document.getElementById(id);
      expect(el).not.toBeNull();
      expect(el.hasAttribute('save-remove')).toBe(true);
      expect(el.hasAttribute('mutations-ignore')).toBe(true);
    }
    expect(document.getElementById('hyper-edit-panel').hidden).toBe(true);
    expect(document.getElementById('hyper-edit-doc-bubble').hidden).toBe(false);
  });
});

describe('candidateFrom', () => {
  let candidateFrom;
  beforeEach(async () => {
    ({ __internals: { candidateFrom } } = loadModule({ editMode: false, busPresent: false }));
    await flush();
  });

  test('extracts a single-root element candidate, stripping trailing fences', () => {
    const candidate = candidateFrom('```html\n<section data-edit-id="a"><p>hi</p></section>\n```', 'section');
    expect(candidate.tagName).toBe('SECTION');
    expect(candidate.getAttribute('data-edit-id')).toBe('a');
  });

  test('auto-closes a half-streamed element', () => {
    const candidate = candidateFrom('<section data-edit-id="a"><p>partial tex', 'section');
    expect(candidate.tagName).toBe('SECTION');
    expect(candidate.textContent).toContain('partial tex');
  });

  test('wrong tag or absent tag yields null', () => {
    expect(candidateFrom('<div>nope</div>', 'section')).toBeNull();
    expect(candidateFrom('no html at all', 'section')).toBeNull();
  });

  test('a <body> candidate parses via DOMParser (template parsing strips body tags)', () => {
    const candidate = candidateFrom('<body class="x"><section data-edit-id="a"><p>hi</p></section></body>', 'body');
    expect(candidate).not.toBeNull();
    expect(candidate.tagName).toBe('BODY');
    expect(candidate.className).toBe('x');
    expect(candidate.querySelector('[data-edit-id="a"]')).not.toBeNull();
  });

  test('prose before the body tag is skipped, same as element replies', () => {
    const candidate = candidateFrom('Sure! Here is the page:\n<body><p>hi</p></body>', 'body');
    expect(candidate.tagName).toBe('BODY');
  });
});

describe('unit resolution', () => {
  let unitFrom, editLabel;
  beforeEach(async () => {
    ({ __internals: { unitFrom, editLabel } } = loadModule({ editMode: false, busPresent: false }));
    await flush();
    document.body.innerHTML = `
      <section data-edit-id="hero">
        <h2>Title</h2>
        <p>Text</p>
        <figure><svg></svg></figure>
        <div class="padding"></div>
      </section>
      <div><p>outside any section</p></div>
    `;
  });

  test('resolves the nearest unit inside a section', () => {
    const section = document.querySelector('[data-edit-id]');
    expect(unitFrom(document.querySelector('h2')).tagName).toBe('H2');
    expect(unitFrom(document.querySelector('figure svg')).tagName).toBe('FIGURE');
    expect(unitFrom(document.querySelector('.padding'))).toBe(section);
  });

  test('elements outside a [data-edit-id] section resolve to null', () => {
    expect(unitFrom(document.querySelector('div > p'))).toBeNull();
  });

  test('editLabel: document for body, own id for sections, section › tag for units', () => {
    expect(editLabel(document.body)).toBe('document');
    expect(editLabel(document.querySelector('[data-edit-id]'))).toBe('hero');
    expect(editLabel(document.querySelector('h2'))).toBe('hero › h2');
  });
});
