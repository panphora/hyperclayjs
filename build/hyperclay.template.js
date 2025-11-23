/**
 * HyperclayJS v__VERSION__ - Minimal Browser-Native Loader
 *
 * Modules self-export to window.hyperclay when imported.
 * Modules auto-init when imported (no separate init call needed).
 * Uses top-level await so subsequent module scripts automatically wait.
 *
 * <!-- Load with a preset -->
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=minimal" type="module"></script>
 * <!-- Load specific features -->
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?features=save,admin,toast" type="module"></script>
 * <!-- Load preset with exclusions -->
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=everything&exclude=tailwind-play,behavior-collector" type="module"></script>
 *
 * AUTO-GENERATED FILE - Do not edit directly
 */

window.hyperclay = window.hyperclay || {};
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

const loadModules = (modules) => Promise.all(modules.map(async feature => {
  const path = MODULE_PATHS[feature];
  if (!path) throw new Error(`Unknown feature: ${feature}`);
  if (debug) console.log(`HyperclayJS: Loading ${feature}...`);
  const module = await import(`${baseUrl}/${path}`);
  window.hyperclayModules[feature] = module;
}));

if (debug) console.log('HyperclayJS: Loading features:', requested);

// Load in waves: prototype extenders first, then everything else
const first = requested.filter(f => LOAD_FIRST.has(f));
const rest = requested.filter(f => !LOAD_FIRST.has(f));

if (first.length) await loadModules(first);
if (rest.length) await loadModules(rest);

// Create h alias
window.h = window.hyperclay;

if (debug) console.log('HyperclayJS: Ready');
