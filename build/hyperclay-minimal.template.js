/**
 * HyperclayJS v__VERSION__ - Minimal Browser-Native Loader
 *
 * Modules self-export to window.hyperclay when imported.
 * Modules auto-init when imported (no separate init call needed).
 *
 * <!-- Load with a preset -->
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=minimal" type="module"></script>
 * <!-- Load specific features -->
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?features=save,admin,toast" type="module"></script>
 *
 * AUTO-GENERATED FILE - Do not edit directly
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

  const MODULE_PATHS = __MODULE_PATHS__;
  const PRESETS = __PRESETS__;

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
