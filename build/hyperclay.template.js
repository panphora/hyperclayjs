/**
 * HyperclayJS v__VERSION__ - Minimal Browser-Native Loader
 *
 * Modules auto-init when imported (no separate init call needed).
 * Include `export-to-window` feature to export to window.hyperclay.
 *
 * Usage (use await import to ensure modules finish loading):
 *
 * <script type="module">
 *   // With window.hyperclay (default presets include export-to-window):
 *   await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=minimal');
 *   const { toast, savePage } = window.hyperclay;
 *
 *   // ES modules only (exclude export-to-window):
 *   const hyperclay = await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=minimal&exclude=export-to-window');
 *   const modules = window.hyperclayModules;
 * </script>
 *
 * AUTO-GENERATED FILE - Do not edit directly
 */

window.hyperclayModules = window.hyperclayModules || {};

const MODULE_PATHS = __MODULE_PATHS__;
const PRESETS = __PRESETS__;

// Parse URL (use import.meta.url for ES modules since document.currentScript is null)
const url = new URL(import.meta.url);
const preset = url.searchParams.get('preset');
const features = url.searchParams.get('features');
const exclude = url.searchParams.get('exclude');
const debug = url.searchParams.get('debug') === 'true';
const baseUrl = url.href.substring(0, url.href.lastIndexOf('/'));

// Get requested features
let requested = [];
if (preset && PRESETS[preset]) {
  requested = [...PRESETS[preset].modules];
} else if (features) {
  requested = features.split(',').map(f => f.trim());
} else {
  requested = [...PRESETS.minimal.modules];
}

// Apply exclusions
if (exclude) {
  const excluded = new Set(exclude.split(',').map(f => f.trim()));
  requested = requested.filter(f => !excluded.has(f));
}

// Modules that extend prototypes must load before modules that execute user code
const LOAD_FIRST = new Set(['dom-helpers', 'all-js']);

// export-to-window must run AFTER all other modules are loaded
const LOAD_LAST = 'export-to-window';

const loadModules = (modules) => Promise.all(modules.map(async feature => {
  const path = MODULE_PATHS[feature];
  if (!path) throw new Error(`Unknown feature: ${feature}`);
  if (debug) console.log(`HyperclayJS: Loading ${feature}...`);
  const module = await import(`${baseUrl}/${path}`);
  window.hyperclayModules[feature] = module;
}));

if (debug) console.log('HyperclayJS: Loading features:', requested);

// Separate export-to-window from other modules - it must run last
const shouldExportToWindow = requested.includes(LOAD_LAST);
const modulesToLoad = requested.filter(f => f !== LOAD_LAST);

// Load in waves: prototype extenders first, then everything else
const first = modulesToLoad.filter(f => LOAD_FIRST.has(f));
const rest = modulesToLoad.filter(f => !LOAD_FIRST.has(f));

try {
  if (first.length) await loadModules(first);
  if (rest.length) await loadModules(rest);

  // Load export-to-window LAST, after all modules are registered
  if (shouldExportToWindow) {
    if (debug) console.log('HyperclayJS: Exporting to window...');
    const exportModule = await import(`${baseUrl}/${MODULE_PATHS[LOAD_LAST]}`);
    window.hyperclayModules[LOAD_LAST] = exportModule;
  }
} catch (err) {
  console.error('HyperclayJS: Failed to load modules:', err);
  throw err;
}

if (debug) console.log('HyperclayJS: Ready');
