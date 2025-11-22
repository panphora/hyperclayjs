/**
 * HyperclayJS v1.2.0 - Minimal Browser-Native Loader
 *
 * Modules self-export to window.hyperclay when imported.
 * Modules auto-init when imported (no separate init call needed).
 */
(async function() {
  'use strict';

  window.hyperclay = window.hyperclay || {};
  window.hyperclayModules = window.hyperclayModules || {};

  let hyperclayReadyResolve, hyperclayReadyReject;
  window.hyperclayReady = new Promise((resolve, reject) => {
    hyperclayReadyResolve = resolve;
    hyperclayReadyReject = reject;
  });

  const MODULE_PATHS = {
  "save-core": "./core/savePageCore.js",
  "save": "./core/savePage.js",
  "admin": "./core/adminSystem.js",
  "persist": "./core/enablePersistentFormInputValues.js",
  "options": "./core/optionVisibilityRuleGenerator.js",
  "editmode": "./core/editmodeSystem.js",
  "events": "./custom-attributes/events.js",
  "ajax": "./custom-attributes/ajaxElements.js",
  "sortable": "./custom-attributes/sortable.js",
  "helpers": "./custom-attributes/domHelpers.js",
  "inputs": "./custom-attributes/inputHelpers.js",
  "prompts": "./ui/prompts.js",
  "toast": "./ui/toast.js",
  "toast-hyperclay": "./ui/toast-hyperclay.js",
  "modals": "./ui/theModal.js",
  "info": "./ui/info.js",
  "tailwind-play": "./vendor/tailwind-play.js",
  "mutation": "./utilities/mutation.js",
  "nearest": "./utilities/nearest.js",
  "cookie": "./utilities/cookie.js",
  "throttle": "./utilities/throttle.js",
  "debounce": "./utilities/debounce.js",
  "dom-ready": "./dom-utilities/onDomReady.js",
  "window-load": "./dom-utilities/onLoad.js",
  "alljs": "./dom-utilities/All.js",
  "style-injection": "./dom-utilities/insertStyleTag.js",
  "get-data-from-form": "./dom-utilities/getDataFromForm.js",
  "idiomorph": "./vendor/idiomorph.min.js",
  "slugify": "./string-utilities/slugify.js",
  "emmet-html": "./string-utilities/emmet-html.js",
  "copy-to-clipboard": "./string-utilities/copy-to-clipboard.js",
  "query-parser": "./string-utilities/query.js",
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
      "save",
      "admin",
      "toast"
    ]
  },
  "standard": {
    "name": "Standard",
    "description": "Standard feature set for most use cases",
    "modules": [
      "save-core",
      "save",
      "admin",
      "persist",
      "ajax",
      "events",
      "helpers",
      "toast"
    ]
  },
  "everything": {
    "name": "Everything",
    "description": "All available features",
    "modules": [
      "save-core",
      "save",
      "admin",
      "persist",
      "options",
      "editmode",
      "events",
      "ajax",
      "sortable",
      "helpers",
      "inputs",
      "prompts",
      "toast",
      "toast-hyperclay",
      "modals",
      "info",
      "tailwind-play",
      "mutation",
      "nearest",
      "cookie",
      "throttle",
      "debounce",
      "dom-ready",
      "window-load",
      "alljs",
      "style-injection",
      "get-data-from-form",
      "idiomorph",
      "slugify",
      "emmet-html",
      "copy-to-clipboard",
      "query-parser",
      "behavior-collector",
      "send-message",
      "file-upload"
    ]
  }
};

  // Parse URL
  const script = document.currentScript;
  const url = new URL(script.src);
  const preset = url.searchParams.get('preset');
  const features = url.searchParams.get('features');
  const debug = url.searchParams.get('debug') === 'true';
  const baseUrl = url.href.substring(0, url.href.lastIndexOf('/'));

  // Get requested features
  let requested = [];
  if (preset && PRESETS[preset]) {
    requested = PRESETS[preset].modules;
  } else if (features) {
    requested = features.split(',').map(f => f.trim());
  } else {
    requested = PRESETS.minimal.modules;
  }

  if (debug) console.log('HyperclayJS: Loading features:', requested);

  // Load requested modules (browser loads dependencies automatically)
  // Modules auto-init and self-export when imported
  try {
    await Promise.all(requested.map(async feature => {
      const path = MODULE_PATHS[feature];
      if (!path) throw new Error(`Unknown feature: ${feature}`);
      if (debug) console.log(`HyperclayJS: Loading ${feature}...`);
      const module = await import(`${baseUrl}/${path}`);
      window.hyperclayModules[feature] = module;
    }));

    // Create h alias
    window.h = window.hyperclay;

    // Fire ready event
    window.dispatchEvent(new CustomEvent('hyperclayReady', {
      detail: { features: requested }
    }));

    hyperclayReadyResolve(window.hyperclay);

    if (debug) console.log('HyperclayJS: Ready');
  } catch (error) {
    console.error('HyperclayJS: Failed to load modules:', error);
    hyperclayReadyReject(error);
  }
})();
