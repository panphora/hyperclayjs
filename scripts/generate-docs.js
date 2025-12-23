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
  'All', 'insertStyles', 'getDataFromForm', 'onDomReady', 'onLoad',
  // String
  'slugify', 'copyToClipboard', 'query',
  // Utilities
  'throttle', 'debounce', 'cacheBust', 'cookie', 'Mutation', 'nearest',
  // Communication
  'sendMessage', 'uploadFile', 'createFile', 'uploadFileBasic', 'live-sync',
  // Event Attributes
  'onclickaway', 'onclickchildren', 'onclone', 'onmutation', 'onpagemutation', 'onrender'
];

// Category definitions with display order
const CATEGORIES = {
  ui: {
    name: 'UI Components',
    functions: ['toast', 'ask', 'consent', 'tell', 'snippet', 'themodal']
  },
  dom: {
    name: 'DOM Utilities',
    functions: ['All', 'insertStyles', 'getDataFromForm', 'onDomReady', 'onLoad']
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
  const match = content.match(/##\s+Signature\s*\n+```(?:js)?\n([\s\S]+?)```/);
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
  const match = content.match(/##\s+Example\s*\n+```(?:js)?\n([\s\S]+?)```/);
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
      --primary-blue: #6A73B6;
      --shadow-blue: rgba(106, 115, 182, 0.2);
      --border-blue: #6A73B6;
      --bg-dark: #0d0e14;
      --bg-card: #11131e;
      --text-primary: #e5e7eb;
      --text-secondary: #9ca3af;
      --code-bg: rgba(106, 115, 182, 0.15);
      --sidebar-width: 240px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Berkeley Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-primary);
      background-color: var(--bg-dark);
      margin: 0;
      padding: 0;
      min-width: 320px;
    }

    .container {
      display: flex;
      min-height: 100vh;
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

    .sidebar {
      width: var(--sidebar-width);
      background-color: var(--bg-card);
      border-right: 1px solid var(--border-blue);
      padding: 20px;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 300;
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
      margin-left: var(--sidebar-width);
      padding: 40px;
      max-width: 900px;
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
      border-bottom: 1px solid rgba(106, 115, 182, 0.2);
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
      .menu-btn {
        display: flex;
      }

      .sidebar {
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
        margin-left: 0;
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
  <button class="menu-btn" onclick="toggleSidebar()" aria-label="Open menu">
    <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
  </button>
  <div class="sidebar-overlay" onclick="closeSidebar()"></div>
  <div class="container">
    <div class="sidebar">
      <button class="sidebar-close" onclick="closeSidebar()" aria-label="Close menu">&times;</button>
      ${generateTOC(categories)}
    </div>
    <main class="content">
      <h1>HyperclayJS API Reference</h1>
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
    // Close sidebar when clicking a link (mobile)
    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });
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
