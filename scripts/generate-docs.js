import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const DOCS_API_DIR = path.join(ROOT_DIR, 'docs/api');
const MODULE_GRAPH = path.join(ROOT_DIR, 'module-dependency-graph.generated.json');
const OUTPUT_FILE = path.join(ROOT_DIR, 'website', 'docs.html');

// Function order (matches index.html demos)
const FUNCTION_ORDER = [
  // UI
  'toast', 'ask', 'consent', 'tell', 'snippet', 'themodal',
  // DOM
  'All', 'insertStyles', 'getDataFromForm', 'onDomReady', 'onLoad', 'dom-helpers',
  // String
  'slugify', 'copyToClipboard', 'query',
  // Utilities
  'throttle', 'debounce', 'cacheBust', 'cookie', 'Mutation', 'nearest',
  // Communication
  'sendMessage', 'uploadFile', 'createFile', 'uploadFileBasic', 'live-sync',
  // Event Attributes
  'onclickaway', 'onclickchildren', 'onclone', 'onmutation', 'onpagemutation', 'onrender',
  // Custom Attributes
  'persist', 'onaftersave', 'prevent-enter', 'autosize', 'sortable', 'option-visibility',
  // Save/Edit Features
  'edit-mode', 'edit-mode-helpers', 'save-system', 'save-toast', 'unsaved-warning', 'autosave', 'tailwind-inject'
];

// Category definitions with display order
const CATEGORIES = {
  ui: {
    name: 'UI Components',
    functions: ['toast', 'ask', 'consent', 'tell', 'snippet', 'themodal']
  },
  dom: {
    name: 'DOM Utilities',
    functions: ['All', 'insertStyles', 'getDataFromForm', 'onDomReady', 'onLoad', 'dom-helpers']
  },
  string: {
    name: 'String Utilities',
    functions: ['slugify', 'copyToClipboard', 'query']
  },
  utilities: {
    name: 'Utilities',
    functions: ['throttle', 'debounce', 'cacheBust', 'cookie', 'Mutation', 'nearest']
  },
  communication: {
    name: 'Communication',
    functions: ['sendMessage', 'uploadFile', 'createFile', 'uploadFileBasic', 'live-sync']
  },
  events: {
    name: 'Event Attributes',
    functions: ['onclickaway', 'onclickchildren', 'onclone', 'onmutation', 'onpagemutation', 'onrender']
  },
  customAttrs: {
    name: 'Custom Attributes',
    functions: ['persist', 'onaftersave', 'prevent-enter', 'autosize', 'sortable', 'option-visibility']
  },
  saveEdit: {
    name: 'Save/Edit Features',
    functions: ['edit-mode', 'edit-mode-helpers', 'save-system', 'save-toast', 'unsaved-warning', 'autosave', 'tailwind-inject']
  }
};

function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.md');

  return {
    name: extractTitle(content) || fileName,
    description: extractDescription(content),
    signature: extractSignature(content),
    params: extractParams(content),
    methods: extractMethods(content),
    returns: extractReturns(content),
    example: extractExample(content)
  };
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractDescription(content) {
  // Get text between title and first ## heading
  const match = content.match(/^#\s+.+\n\n([\s\S]+?)(?=\n##\s)/);
  return match ? match[1].trim() : '';
}

function extractSignature(content) {
  const match = content.match(/##\s+Signature\s*\n+```(?:\w+)?\n([\s\S]+?)```/);
  return match ? match[1].trim() : '';
}

function extractParams(content) {
  const paramsSection = content.match(/##\s+Parameters\s*\n([\s\S]+?)(?=\n##\s|$)/);
  if (!paramsSection) return [];

  const tableMatch = paramsSection[1].match(/\|[\s\S]+?\|/g);
  if (!tableMatch) return [];

  const params = [];
  const rows = paramsSection[1].split('\n').filter(line => line.startsWith('|'));

  // Skip header and separator rows
  for (let i = 2; i < rows.length; i++) {
    const cells = rows[i]
      .replace(/\\\|/g, '\x00')  // Protect escaped pipes
      .split('|')
      .map(c => c.trim().replace(/\x00/g, '|'))  // Restore pipes
      .filter(c => c);
    if (cells.length >= 4) {
      params.push({
        name: cells[0],
        type: cells[1],
        default: cells[2] === '—' ? null : cells[2],
        description: cells[3]
      });
    }
  }

  return params;
}

function extractMethods(content) {
  const methodsSection = content.match(/##\s+Methods\s*\n([\s\S]+?)(?=\n##\s|$)/);
  if (!methodsSection) return [];

  const methods = [];
  const rows = methodsSection[1].split('\n').filter(line => line.startsWith('|'));

  // Skip header and separator rows
  for (let i = 2; i < rows.length; i++) {
    const cells = rows[i]
      .replace(/\\\|/g, '\x00')  // Protect escaped pipes
      .split('|')
      .map(c => c.trim().replace(/\x00/g, '|'))  // Restore pipes
      .filter(c => c);
    if (cells.length >= 2) {
      methods.push({
        name: cells[0].replace(/`/g, ''),
        description: cells[1]
      });
    }
  }

  return methods;
}

function extractReturns(content) {
  const match = content.match(/##\s+Returns\s*\n+`([^`]+)`(?:\s*-\s*(.+))?/);
  if (match) {
    return {
      type: match[1],
      description: match[2] || ''
    };
  }
  return null;
}

function extractExample(content) {
  const match = content.match(/##\s+Example\s*\n+```(?:\w+)?\n([\s\S]+?)```/);
  return match ? match[1].trim() : '';
}

function buildExportMap(moduleGraph) {
  const exportMap = new Map();

  for (const [moduleId, module] of Object.entries(moduleGraph.modules)) {
    if (!module.exports) continue;

    for (const [fnName, targets] of Object.entries(module.exports)) {
      const locations = targets.map(t => `${t}.${fnName}`);
      exportMap.set(fnName, locations);
    }
  }

  return exportMap;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateStyles() {
  return `<style>
    @font-face {
      font-family: 'Berkeley Mono';
      src: url('./assets/BerkeleyMonoVariable-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
    }

    :root {
      --primary-blue: #d79921;
      --shadow-blue: rgba(215, 153, 33, 0.06);
      --border-blue: #d79921;
      --bg-dark: #080808;
      --bg-card: #0e0e0e;
      --text-primary: #ffffff;
      --text-secondary: #c8bca4;
      --code-bg: rgba(215, 153, 33, 0.1);
      --sidebar-width: 240px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Berkeley Mono', monospace;
      line-height: 1.6;
      color: var(--text-primary);
      background-color: var(--bg-dark);
      margin: 0;
      padding: 0;
      min-width: 320px;
    }

    .top-nav {
      border-bottom: 1px solid var(--border-blue);
      padding: 1.5rem;
    }

    .top-nav-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }

    .top-nav h1 {
      font-size: 2.5rem;
      font-weight: 900;
      margin: 0;
      color: var(--text-primary);
    }

    .nav-links {
      display: flex;
      gap: 1rem;
    }

    .nav-link {
      font-weight: bold;
      color: var(--text-primary);
      text-decoration: none;
      border: 2px solid var(--primary-blue);
      padding: 0.5rem 1rem;
      background: var(--bg-card);
      box-shadow: 4px 4px 0 var(--shadow-blue);
      white-space: nowrap;
    }

    .nav-link:hover {
      background: var(--shadow-blue);
    }

    .nav-link.active {
      background: var(--primary-blue);
      color: var(--bg-dark);
    }

    .nav-link-icon {
      padding: 0.5rem;
      display: flex;
      align-items: center;
    }

    .nav-link-icon svg {
      display: block;
    }

    .container {
      display: flex;
      max-width: 1400px;
      margin: 0 auto;
    }

    .sidebar-col {
      width: var(--sidebar-width);
      flex-shrink: 0;
    }

    .sidebar {
      width: var(--sidebar-width);
      background-color: var(--bg-card);
      border-right: 1px solid var(--border-blue);
      padding: 20px;
      overflow-y: auto;
    }

    .sidebar.is-stuck {
      position: fixed;
      top: 0;
    }

    /* Mobile menu button */
    .menu-btn {
      display: none;
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 200;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--primary-blue);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      align-items: center;
      justify-content: center;
    }

    .menu-btn svg {
      width: 24px;
      height: 24px;
      fill: white;
    }

    .menu-btn:hover {
      background-color: #7A83C6;
    }

    /* Sidebar overlay for mobile */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 299;
    }

    .sidebar-close {
      display: none;
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 24px;
      cursor: pointer;
      border-radius: 4px;
    }

    .sidebar-close:hover {
      background-color: var(--shadow-blue);
      color: var(--text-primary);
    }

    .sidebar h2 {
      font-size: 14px;
      color: var(--primary-blue);
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-blue);
    }

    .sidebar-section {
      margin-bottom: 20px;
    }

    .sidebar-section h3 {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sidebar-section a {
      display: block;
      color: var(--text-primary);
      text-decoration: none;
      padding: 4px 8px;
      margin: 2px 0;
      border-radius: 4px;
      font-size: 13px;
    }

    .sidebar-section a:hover {
      background-color: var(--shadow-blue);
    }

    .content {
      flex: 1;
      padding: 40px;
      max-width: 1100px;
      min-width: 0;
    }

    .content h1 {
      font-size: 28px;
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }

    .content > p:first-of-type {
      color: var(--text-secondary);
      margin-bottom: 40px;
    }

    .category-section {
      margin-bottom: 60px;
    }

    .category-section h2 {
      font-size: 20px;
      color: var(--primary-blue);
      margin: 0 0 24px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-blue);
    }

    .function-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-blue);
      box-shadow: 4px 4px 0 var(--shadow-blue);
      padding: 24px;
      margin-bottom: 24px;
      overflow: hidden;
    }

    .function-card h3 {
      font-size: 18px;
      margin: 0 0 4px 0;
      color: var(--text-primary);
      word-break: break-word;
    }

    .function-description {
      color: var(--text-secondary);
      margin: 0 0 16px 0;
    }

    .exports {
      display: inline-block;
      background-color: var(--code-bg);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      color: var(--primary-blue);
      margin-bottom: 16px;
      word-break: break-all;
    }

    .signature {
      background-color: var(--code-bg);
      border-left: 3px solid var(--primary-blue);
      padding: 12px 16px;
      margin: 16px 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .signature code {
      color: var(--text-primary);
      white-space: pre;
      display: block;
    }

    .function-card h4 {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 20px 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .params-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .params-table tbody,
    .params-table tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    .params-table th {
      text-align: left;
      color: var(--text-secondary);
      font-weight: normal;
      padding: 8px;
      border-bottom: 1px solid var(--border-blue);
    }

    .params-table td {
      padding: 8px;
      border-bottom: 1px solid rgba(215, 153, 33, 0.06);
      vertical-align: top;
      word-break: break-word;
    }

    .params-table code {
      background-color: var(--code-bg);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      word-break: break-all;
    }

    .returns-type {
      background-color: var(--code-bg);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 13px;
    }

    .example {
      background-color: var(--code-bg);
      border-left: 3px solid var(--primary-blue);
      padding: 16px;
      margin: 16px 0 0 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .example pre {
      margin: 0;
      color: var(--text-primary);
      font-size: 13px;
      line-height: 1.5;
      white-space: pre;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .top-nav {
        padding: 1rem;
      }

      .top-nav-inner {
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .top-nav h1 {
        font-size: 1.5rem;
      }

      .nav-links {
        gap: 0.5rem;
      }

      .nav-link {
        padding: 0.35rem 0.65rem;
        font-size: 12px;
      }

      .menu-btn {
        display: flex;
      }

      .sidebar-col {
        width: 0;
        overflow: visible;
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        max-height: 100vh !important;
        z-index: 300;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .sidebar-close {
        display: block;
      }

      .sidebar-overlay.open {
        display: block;
      }

      .content {
        padding: 20px;
        padding-bottom: 80px;
      }

      .content h1 {
        font-size: 24px;
      }

      .function-card {
        padding: 16px;
        box-shadow: 2px 2px 0 var(--shadow-blue);
      }

      .function-card h3 {
        font-size: 16px;
      }

      .params-table {
        font-size: 12px;
      }

      .params-table th,
      .params-table td {
        padding: 6px;
      }
    }

    @media (max-width: 480px) {
      .content {
        padding: 16px;
        padding-bottom: 80px;
      }

      .content h1 {
        font-size: 20px;
      }

      .category-section h2 {
        font-size: 18px;
      }

      .function-card {
        padding: 12px;
      }

      .signature {
        padding: 10px 12px;
        font-size: 12px;
      }

      .example {
        padding: 12px;
        font-size: 12px;
      }

      .example pre {
        font-size: 11px;
      }
    }
  </style>`;
}

function generateTOC(categories) {
  let toc = '<h2>API Reference</h2>';

  for (const [catId, category] of Object.entries(categories)) {
    toc += `<div class="sidebar-section">
      <h3>${category.name}</h3>`;

    for (const fnName of category.functions) {
      toc += `<a href="#fn-${fnName}">${fnName}</a>`;
    }

    toc += '</div>';
  }

  return toc;
}

function generateFunctionCard(fn, exportMap) {
  const exports = exportMap.get(fn.name) || [];
  const exportsHtml = exports.length > 0
    ? `<div class="exports">Available as: ${exports.map(e => `<code>${e}</code>`).join(', ')}</div>`
    : '';

  let paramsHtml = '';
  if (fn.params.length > 0) {
    paramsHtml = `<h4>Parameters</h4>
    <table class="params-table">
      <tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
      ${fn.params.map(p => `
        <tr>
          <td><code>${escapeHtml(p.name)}</code></td>
          <td><code>${escapeHtml(p.type)}</code></td>
          <td>${p.default ? `<code>${escapeHtml(p.default)}</code>` : '—'}</td>
          <td>${escapeHtml(p.description)}</td>
        </tr>
      `).join('')}
    </table>`;
  }

  let methodsHtml = '';
  if (fn.methods && fn.methods.length > 0) {
    methodsHtml = `<h4>Methods</h4>
    <table class="params-table">
      <tr><th>Method</th><th>Description</th></tr>
      ${fn.methods.map(m => `
        <tr>
          <td><code>${escapeHtml(m.name)}</code></td>
          <td>${escapeHtml(m.description)}</td>
        </tr>
      `).join('')}
    </table>`;
  }

  const returnsHtml = fn.returns
    ? `<h4>Returns</h4><p><code class="returns-type">${escapeHtml(fn.returns.type)}</code>${fn.returns.description ? ' — ' + escapeHtml(fn.returns.description) : ''}</p>`
    : '';

  const exampleHtml = fn.example
    ? `<h4>Example</h4><div class="example"><pre>${escapeHtml(fn.example)}</pre></div>`
    : '';

  return `<div class="function-card" id="fn-${fn.name}">
    <h3>${fn.name}</h3>
    <p class="function-description">${escapeHtml(fn.description)}</p>
    ${exportsHtml}
    ${fn.signature ? `<div class="signature"><code>${escapeHtml(fn.signature)}</code></div>` : ''}
    ${paramsHtml}
    ${methodsHtml}
    ${returnsHtml}
    ${exampleHtml}
  </div>`;
}

function generateSections(categories, docs, exportMap) {
  let html = '';

  for (const [catId, category] of Object.entries(categories)) {
    html += `<div class="category-section" id="cat-${catId}">
      <h2>${category.name}</h2>`;

    for (const fnName of category.functions) {
      const fn = docs.find(d => d.name === fnName);
      if (fn) {
        html += generateFunctionCard(fn, exportMap);
      }
    }

    html += '</div>';
  }

  return html;
}

function generateHTML(categories, docs, exportMap) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HyperclayJS API Reference</title>
  ${generateStyles()}
</head>
<body>
  <div class="top-nav">
    <div class="top-nav-inner">
    <h1>HyperclayJS</h1>
    <div class="nav-links">
      <a href="index.html" class="nav-link">Home</a>
      <a href="docs.html" class="nav-link active">Docs</a>
      <a href="config.html" class="nav-link">Use HyperclayJS</a>
      <a href="https://github.com/panphora/hyperclayjs" class="nav-link nav-link-icon" target="_blank" rel="noopener" title="GitHub">
        <svg width="20" height="20" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/></svg>
      </a>
    </div>
    </div>
  </div>
  <button class="menu-btn" onclick="toggleSidebar()" aria-label="Open menu">
    <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
  </button>
  <div class="sidebar-overlay" onclick="closeSidebar()"></div>
  <div class="container">
    <div class="sidebar-col">
      <div class="sidebar">
        <button class="sidebar-close" onclick="closeSidebar()" aria-label="Close menu">&times;</button>
        ${generateTOC(categories)}
      </div>
    </div>
    <main class="content">
      <h1>API Reference</h1>
      <p>Documentation for all exported functions and utilities.</p>
      ${generateSections(categories, docs, exportMap)}
    </main>
  </div>
  <script>
    function toggleSidebar() {
      document.querySelector('.sidebar').classList.toggle('open');
      document.querySelector('.sidebar-overlay').classList.toggle('open');
    }
    function closeSidebar() {
      document.querySelector('.sidebar').classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('open');
    }
    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });

    // Emulate sticky sidebar
    (function() {
      var sidebar = document.querySelector('.sidebar');
      var sidebarCol = document.querySelector('.sidebar-col');
      if (!sidebar || !sidebarCol) return;

      function update() {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('is-stuck');
          sidebar.style.maxHeight = '';
          return;
        }
        var colTop = sidebarCol.getBoundingClientRect().top;
        if (colTop <= 0) {
          sidebar.classList.add('is-stuck');
          sidebar.style.maxHeight = '100vh';
        } else {
          sidebar.classList.remove('is-stuck');
          sidebar.style.maxHeight = (window.innerHeight - colTop) + 'px';
        }
      }

      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    })();
  </script>
</body>
</html>`;
}

async function main() {
  console.log('Generating documentation...');

  // 1. Load module graph
  const moduleGraph = JSON.parse(fs.readFileSync(MODULE_GRAPH, 'utf-8'));
  const exportMap = buildExportMap(moduleGraph);

  // 2. Parse all markdown files
  const mdFiles = fs.readdirSync(DOCS_API_DIR).filter(f => f.endsWith('.md'));
  const docs = mdFiles.map(f => parseMarkdownFile(path.join(DOCS_API_DIR, f)));

  // 3. Check for missing documentation
  for (const fnName of FUNCTION_ORDER) {
    const hasDoc = docs.some(d => d.name === fnName);
    if (!hasDoc) {
      console.warn(`Warning: No documentation found for "${fnName}"`);
    }
  }

  // Check for documented functions not in our order
  for (const doc of docs) {
    if (!FUNCTION_ORDER.includes(doc.name)) {
      console.warn(`Warning: "${doc.name}" is documented but not in FUNCTION_ORDER`);
    }
  }

  // 4. Generate HTML
  const html = generateHTML(CATEGORIES, docs, exportMap);

  // 5. Write output
  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`Generated ${OUTPUT_FILE} with ${docs.length} functions`);
}

main().catch(console.error);
