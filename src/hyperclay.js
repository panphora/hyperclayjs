/**
 * HyperclayJS v1.16.0 - Minimal Browser-Native Loader
 *
 * Modules auto-init when imported (no separate init call needed).
 * Include `export-to-window` feature to export to window.hyperclay.
 *
 * Usage (use await import to ensure modules finish loading):
 *
 * <script type="module">
 *   // With window.hyperclay (default presets include export-to-window):
 *   await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=minimal');
 *   const { toast, savePage } = window.hyperclay;
 *
 *   // ES modules only (exclude export-to-window):
 *   const hyperclay = await import('https://cdn.jsdelivr.net/npm/hyperclayjs@1/src/hyperclay.js?preset=minimal&exclude=export-to-window');
 *   const modules = window.hyperclayModules;
 * </script>
 *
 * AUTO-GENERATED FILE - Do not edit directly
 */

window.hyperclayModules = window.hyperclayModules || {};

// Suppress auto-export in modules - export-to-window will flip this to false
window.__hyperclayNoAutoExport = true;

const MODULE_PATHS = {
  "save-core": "./core/savePageCore.js",
  "save-system": "./core/savePage.js",
  "autosave": "./core/autosave.js",
  "unsaved-warning": "./core/unsavedWarning.js",
  "save-toast": "./core/saveToast.js",
  "edit-mode-helpers": "./core/adminSystem.js",
  "persist": "./core/enablePersistentFormInputValues.js",
  "snapshot": "./core/snapshot.js",
  "option-visibility": "./core/optionVisibility.js",
  "edit-mode": "./core/editmodeSystem.js",
  "event-attrs": "./custom-attributes/events.js",
  "ajax-elements": "./custom-attributes/ajaxElements.js",
  "sortable": "./custom-attributes/sortable.js",
  "dom-helpers": "./custom-attributes/domHelpers.js",
  "input-helpers": "./custom-attributes/inputHelpers.js",
  "onaftersave": "./custom-attributes/onaftersave.js",
  "dialogs": "./ui/prompts.js",
  "toast": "./ui/toast.js",
  "toast-hyperclay": "./ui/toast-hyperclay.js",
  "the-modal": "./ui/theModal.js",
  "mutation": "./utilities/mutation.js",
  "nearest": "./utilities/nearest.js",
  "cookie": "./utilities/cookie.js",
  "throttle": "./utilities/throttle.js",
  "debounce": "./utilities/debounce.js",
  "cache-bust": "./utilities/cacheBust.js",
  "dom-ready": "./dom-utilities/onDomReady.js",
  "window-load": "./dom-utilities/onLoad.js",
  "all-js": "./dom-utilities/All.js",
  "style-injection": "./dom-utilities/insertStyleTag.js",
  "form-data": "./dom-utilities/getDataFromForm.js",
  "hyper-morph": "./vendor/hyper-morph.vendor.js",
  "slugify": "./string-utilities/slugify.js",
  "copy-to-clipboard": "./string-utilities/copy-to-clipboard.js",
  "query-params": "./string-utilities/query.js",
  "behavior-collector": "./communication/behaviorCollector.js",
  "send-message": "./communication/sendMessage.js",
  "file-upload": "./communication/uploadFile.js",
  "live-sync": "./communication/live-sync.js",
  "tailwind-inject": "./core/tailwindInject.js",
  "export-to-window": "./core/exportToWindow.js"
};
const PRESETS = {
  "minimal": {
    "name": "Minimal",
    "description": "Essential features for basic editing",
    "modules": [
      "save-core",
      "snapshot",
      "save-system",
      "edit-mode-helpers",
      "toast",
      "save-toast",
      "export-to-window",
      "view-mode-excludes-edit-modules"
    ]
  },
  "standard": {
    "name": "Standard",
    "description": "Standard feature set for most use cases",
    "modules": [
      "save-core",
      "snapshot",
      "save-system",
      "unsaved-warning",
      "edit-mode-helpers",
      "persist",
      "option-visibility",
      "event-attrs",
      "dom-helpers",
      "toast",
      "save-toast",
      "export-to-window",
      "view-mode-excludes-edit-modules"
    ]
  },
  "everything": {
    "name": "Everything",
    "description": "All available features",
    "modules": [
      "save-core",
      "save-system",
      "autosave",
      "unsaved-warning",
      "save-toast",
      "edit-mode-helpers",
      "persist",
      "snapshot",
      "option-visibility",
      "edit-mode",
      "event-attrs",
      "ajax-elements",
      "sortable",
      "dom-helpers",
      "input-helpers",
      "onaftersave",
      "dialogs",
      "toast",
      "toast-hyperclay",
      "the-modal",
      "mutation",
      "nearest",
      "cookie",
      "throttle",
      "debounce",
      "cache-bust",
      "dom-ready",
      "window-load",
      "all-js",
      "style-injection",
      "form-data",
      "hyper-morph",
      "slugify",
      "copy-to-clipboard",
      "query-params",
      "behavior-collector",
      "send-message",
      "file-upload",
      "live-sync",
      "tailwind-inject",
      "export-to-window",
      "view-mode-excludes-edit-modules"
    ]
  }
};
const EDIT_MODE_ONLY = new Set([
  "save-core",
  "save-system",
  "autosave",
  "unsaved-warning",
  "save-toast",
  "edit-mode-helpers",
  "persist",
  "snapshot",
  "sortable",
  "onaftersave",
  "cache-bust",
  "hyper-morph",
  "file-upload",
  "live-sync",
  "tailwind-inject"
]);

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

// view-mode-excludes-edit-modules: skip edit-only modules when not in edit mode
const viewModeExcludesEdit = requested.includes('view-mode-excludes-edit-modules');
if (viewModeExcludesEdit) {
  requested = requested.filter(f => f !== 'view-mode-excludes-edit-modules');
  const { isEditMode } = await import('./core/isAdminOfCurrentResource.js');
  if (!isEditMode) {
    requested = requested.filter(f => !EDIT_MODE_ONLY.has(f));
    if (debug) console.log('HyperclayJS: View mode - excluding edit-only modules');
  }
}

// Modules that extend prototypes must load before modules that execute user code
const LOAD_FIRST = new Set(['dom-helpers', 'all-js']);

// export-to-window flips the flag, so it must load before other modules
const LOAD_BEFORE_ALL = 'export-to-window';

const loadModules = (modules) => Promise.all(modules.map(async feature => {
  const path = MODULE_PATHS[feature];
  if (!path) throw new Error(`Unknown feature: ${feature}`);
  if (debug) console.log(`HyperclayJS: Loading ${feature}...`);
  const module = await import(`${baseUrl}/${path}`);
  window.hyperclayModules[feature] = module;
}));

if (debug) console.log('HyperclayJS: Loading features:', requested);

// Separate export-to-window - it must load FIRST to flip the flag
const shouldExportToWindow = requested.includes(LOAD_BEFORE_ALL);
const modulesToLoad = requested.filter(f => f !== LOAD_BEFORE_ALL);

// Load in waves: export-to-window first, then prototype extenders, then everything else
const first = modulesToLoad.filter(f => LOAD_FIRST.has(f));
const rest = modulesToLoad.filter(f => !LOAD_FIRST.has(f));

try {
  // Load export-to-window FIRST to flip the flag before other modules load
  if (shouldExportToWindow) {
    if (debug) console.log('HyperclayJS: Enabling window exports...');
    const exportModule = await import(`${baseUrl}/${MODULE_PATHS[LOAD_BEFORE_ALL]}`);
    window.hyperclayModules[LOAD_BEFORE_ALL] = exportModule;
  }

  if (first.length) await loadModules(first);
  if (rest.length) await loadModules(rest);
} catch (err) {
  console.error('HyperclayJS: Failed to load modules:', err);
  throw err;
}

if (debug) console.log('HyperclayJS: Ready');

// ES module exports - allows destructuring from import()
export const savePage = window.hyperclayModules['save-core']?.savePage ?? window.hyperclayModules['save-core']?.default;
export const beforeSave = window.hyperclayModules['save-system']?.beforeSave ?? window.hyperclayModules['save-system']?.default;
export const savePageThrottled = window.hyperclayModules['save-system']?.savePageThrottled ?? window.hyperclayModules['save-system']?.default;
export const replacePageWith = window.hyperclayModules['save-system']?.replacePageWith ?? window.hyperclayModules['save-system']?.default;
export const captureSnapshot = window.hyperclayModules['snapshot']?.captureSnapshot ?? window.hyperclayModules['snapshot']?.default;
export const captureForSave = window.hyperclayModules['snapshot']?.captureForSave ?? window.hyperclayModules['snapshot']?.default;
export const captureBodyForSync = window.hyperclayModules['snapshot']?.captureBodyForSync ?? window.hyperclayModules['snapshot']?.default;
export const onSnapshot = window.hyperclayModules['snapshot']?.onSnapshot ?? window.hyperclayModules['snapshot']?.default;
export const onPrepareForSave = window.hyperclayModules['snapshot']?.onPrepareForSave ?? window.hyperclayModules['snapshot']?.default;
export const getPageContents = window.hyperclayModules['snapshot']?.getPageContents ?? window.hyperclayModules['snapshot']?.default;
export const toggleEditMode = window.hyperclayModules['edit-mode']?.toggleEditMode ?? window.hyperclayModules['edit-mode']?.default;
export const isEditMode = window.hyperclayModules['edit-mode']?.isEditMode ?? window.hyperclayModules['edit-mode']?.default;
export const isOwner = window.hyperclayModules['edit-mode']?.isOwner ?? window.hyperclayModules['edit-mode']?.default;
export const ask = window.hyperclayModules['dialogs']?.ask ?? window.hyperclayModules['dialogs']?.default;
export const consent = window.hyperclayModules['dialogs']?.consent ?? window.hyperclayModules['dialogs']?.default;
export const tell = window.hyperclayModules['dialogs']?.tell ?? window.hyperclayModules['dialogs']?.default;
export const snippet = window.hyperclayModules['dialogs']?.snippet ?? window.hyperclayModules['dialogs']?.default;
export const toast = window.hyperclayModules['toast']?.toast ?? window.hyperclayModules['toast']?.default;
export const toastHyperclay = window.hyperclayModules['toast-hyperclay']?.toastHyperclay ?? window.hyperclayModules['toast-hyperclay']?.default;
export const themodal = window.hyperclayModules['the-modal']?.themodal ?? window.hyperclayModules['the-modal']?.default;
export const Mutation = window.hyperclayModules['mutation']?.Mutation ?? window.hyperclayModules['mutation']?.default;
export const nearest = window.hyperclayModules['nearest']?.nearest ?? window.hyperclayModules['nearest']?.default;
export const cookie = window.hyperclayModules['cookie']?.cookie ?? window.hyperclayModules['cookie']?.default;
export const throttle = window.hyperclayModules['throttle']?.throttle ?? window.hyperclayModules['throttle']?.default;
export const debounce = window.hyperclayModules['debounce']?.debounce ?? window.hyperclayModules['debounce']?.default;
export const cacheBust = window.hyperclayModules['cache-bust']?.cacheBust ?? window.hyperclayModules['cache-bust']?.default;
export const onDomReady = window.hyperclayModules['dom-ready']?.onDomReady ?? window.hyperclayModules['dom-ready']?.default;
export const onLoad = window.hyperclayModules['window-load']?.onLoad ?? window.hyperclayModules['window-load']?.default;
export const All = window.hyperclayModules['all-js']?.All ?? window.hyperclayModules['all-js']?.default;
export const insertStyles = window.hyperclayModules['style-injection']?.insertStyles ?? window.hyperclayModules['style-injection']?.default;
export const insertStyleTag = window.hyperclayModules['style-injection']?.insertStyleTag ?? window.hyperclayModules['style-injection']?.default;
export const getDataFromForm = window.hyperclayModules['form-data']?.getDataFromForm ?? window.hyperclayModules['form-data']?.default;
export const HyperMorph = window.hyperclayModules['hyper-morph']?.HyperMorph ?? window.hyperclayModules['hyper-morph']?.default;
export const morph = window.hyperclayModules['hyper-morph']?.morph ?? window.hyperclayModules['hyper-morph']?.default;
export const slugify = window.hyperclayModules['slugify']?.slugify ?? window.hyperclayModules['slugify']?.default;
export const copyToClipboard = window.hyperclayModules['copy-to-clipboard']?.copyToClipboard ?? window.hyperclayModules['copy-to-clipboard']?.default;
export const query = window.hyperclayModules['query-params']?.query ?? window.hyperclayModules['query-params']?.default;
export const behaviorCollector = window.hyperclayModules['behavior-collector']?.behaviorCollector ?? window.hyperclayModules['behavior-collector']?.default;
export const sendMessage = window.hyperclayModules['send-message']?.sendMessage ?? window.hyperclayModules['send-message']?.default;
export const uploadFile = window.hyperclayModules['file-upload']?.uploadFile ?? window.hyperclayModules['file-upload']?.default;
export const createFile = window.hyperclayModules['file-upload']?.createFile ?? window.hyperclayModules['file-upload']?.default;
export const uploadFileBasic = window.hyperclayModules['file-upload']?.uploadFileBasic ?? window.hyperclayModules['file-upload']?.default;
export const liveSync = window.hyperclayModules['live-sync']?.liveSync ?? window.hyperclayModules['live-sync']?.default;
