/**
 * HyperclayJS v1.3.0 - Minimal Browser-Native Loader
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

const MODULE_PATHS = {
  "save-core": "./core/savePageCore.js",
  "save-system": "./core/savePage.js",
  "autosave": "./core/autosave.js",
  "admin": "./core/adminSystem.js",
  "persist": "./core/enablePersistentFormInputValues.js",
  "option-visibility": "./core/optionVisibilityRuleGenerator.js",
  "edit-mode": "./core/editmodeSystem.js",
  "event-attrs": "./custom-attributes/events.js",
  "ajax-elements": "./custom-attributes/ajaxElements.js",
  "sortable": "./custom-attributes/sortable.js",
  "dom-helpers": "./custom-attributes/domHelpers.js",
  "input-helpers": "./custom-attributes/inputHelpers.js",
  "dialogs": "./ui/prompts.js",
  "toast": "./ui/toast.js",
  "toast-hyperclay": "./ui/toast-hyperclay.js",
  "modal": "./ui/theModal.js",
  "tailwind-play": "./vendor/tailwind-play.js",
  "mutation": "./utilities/mutation.js",
  "nearest": "./utilities/nearest.js",
  "cookie": "./utilities/cookie.js",
  "throttle": "./utilities/throttle.js",
  "debounce": "./utilities/debounce.js",
  "dom-ready": "./dom-utilities/onDomReady.js",
  "window-load": "./dom-utilities/onLoad.js",
  "all-js": "./dom-utilities/All.js",
  "style-injection": "./dom-utilities/insertStyleTag.js",
  "form-data": "./dom-utilities/getDataFromForm.js",
  "idiomorph": "./vendor/idiomorph.min.js",
  "slugify": "./string-utilities/slugify.js",
  "emmet": "./string-utilities/emmet-html.js",
  "clipboard": "./string-utilities/copy-to-clipboard.js",
  "query-params": "./string-utilities/query.js",
  "behavior-collector": "./communication/behaviorCollector.js",
  "send-message": "./communication/sendMessage.js",
  "file-upload": "./communication/uploadFile.js"
};
const PRESETS = {
  "minimal": {
    "name": "Minimal",
    "description": "Essential features for basic editing",
    "modules": [
      "save-core",
      "save-system",
      "admin",
      "toast"
    ]
  },
  "standard": {
    "name": "Standard",
    "description": "Standard feature set for most use cases",
    "modules": [
      "save-core",
      "save-system",
      "admin",
      "persist",
      "option-visibility",
      "event-attrs",
      "dom-helpers",
      "toast"
    ]
  },
  "everything": {
    "name": "Everything",
    "description": "All available features",
    "modules": [
      "save-core",
      "save-system",
      "autosave",
      "admin",
      "persist",
      "option-visibility",
      "edit-mode",
      "event-attrs",
      "ajax-elements",
      "sortable",
      "dom-helpers",
      "input-helpers",
      "dialogs",
      "toast",
      "toast-hyperclay",
      "modal",
      "tailwind-play",
      "mutation",
      "nearest",
      "cookie",
      "throttle",
      "debounce",
      "dom-ready",
      "window-load",
      "all-js",
      "style-injection",
      "form-data",
      "idiomorph",
      "slugify",
      "emmet",
      "clipboard",
      "query-params",
      "behavior-collector",
      "send-message",
      "file-upload"
    ]
  }
};

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
