/**
 * HyperclayJS - Self-detecting module loader
 * Automatically loads requested features with dependency resolution
 *
 * USAGE:
 *
 * <!-- Load with a preset -->
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=minimal" type="module"></script>
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=standard" type="module"></script>
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=everything" type="module"></script>
 *
 * <!-- Load specific features -->
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?features=save,admin,toast" type="module"></script>
 *
 * <!-- Combine presets and features -->
 * <script src="https://cdn.jsdelivr.net/npm/hyperclayjs@1/hyperclay.js?preset=minimal&features=modals,ajax" type="module"></script>
 *
 * Available presets: minimal, standard, everything
 * See https://github.com/hyperclay/hyperclayjs for full list of features
 *
 * AUTO-GENERATED FILE - Do not edit directly
 * Generated from module-dependency-graph.json
 */

(async function() {
  'use strict';

  // Create a promise that resolves when hyperclay is ready
  let hyperclayReadyResolve;
  window.hyperclayReady = new Promise(resolve => {
    hyperclayReadyResolve = resolve;
  });

  // Initialize namespaces
  window.hyperclay = window.hyperclay || {};

  // Module dependency map - AUTO-GENERATED
  const moduleDependencies = __MODULE_DEPENDENCIES__;

  // Preset configurations - AUTO-GENERATED
  const presets = __PRESETS__;

  // Find our script tag
  const currentScript = document.currentScript ||
    Array.from(document.scripts).find(s =>
      s.src && (s.src.includes('hyperclay.js') || s.src.includes('hyperclay-starter-kit.js'))
    );

  if (!currentScript) {
    console.error('HyperclayJS: Could not find script tag');
    return;
  }

  // Parse URL parameters
  const scriptUrl = new URL(currentScript.src);
  const featuresParam = scriptUrl.searchParams.get('features');
  const presetParam = scriptUrl.searchParams.get('preset');

  // Determine requested features
  let requestedFeatures = [];

  if (presetParam && presets[presetParam]) {
    requestedFeatures = presets[presetParam].modules;
    console.log(`HyperclayJS: Loading preset "${presetParam}"`);
  } else if (featuresParam) {
    requestedFeatures = featuresParam.split(',').map(f => f.trim());
    console.log(`HyperclayJS: Loading features:`, requestedFeatures);
  } else {
    // Default to minimal preset
    requestedFeatures = presets.minimal.modules;
    console.log('HyperclayJS: No features specified, loading minimal preset');
  }

  // Resolve all dependencies
  function resolveDependencies(features) {
    const resolved = new Set();
    const queue = [...features];

    while (queue.length > 0) {
      const feature = queue.shift();

      if (resolved.has(feature)) continue;

      const module = moduleDependencies[feature];
      if (!module) {
        console.warn(`HyperclayJS: Unknown feature "${feature}"`);
        continue;
      }

      // Add dependencies to queue
      if (module.dependencies && module.dependencies.length > 0) {
        module.dependencies.forEach(dep => {
          if (!resolved.has(dep)) {
            queue.push(dep);
          }
        });
      }

      // Mark this feature as resolved
      resolved.add(feature);
    }

    return Array.from(resolved);
  }

  // Topological sort for correct load order
  function topologicalSort(features) {
    const visited = new Set();
    const result = [];

    function visit(feature) {
      if (visited.has(feature)) return;
      visited.add(feature);

      const module = moduleDependencies[feature];
      if (module && module.dependencies) {
        module.dependencies.forEach(dep => {
          if (features.includes(dep)) {
            visit(dep);
          }
        });
      }

      result.push(feature);
    }

    features.forEach(feature => visit(feature));
    return result;
  }

  // Get base URL for module imports
  function getBaseUrl() {
    const scriptDir = scriptUrl.href.substring(0, scriptUrl.href.lastIndexOf('/'));
    return scriptDir;
  }

  // Load a module
  async function loadModule(feature, baseUrl) {
    const module = moduleDependencies[feature];
    if (!module) return null;

    const modulePath = `${baseUrl}/${module.path}`;

    try {
      console.log(`HyperclayJS: Loading ${feature}...`);
      const loaded = await import(modulePath);

      // Auto-initialize if the module exports an init function
      if (loaded.init && typeof loaded.init === 'function') {
        loaded.init();
      }

      return loaded;
    } catch (error) {
      console.error(`HyperclayJS: Failed to load ${feature}:`, error);
      return null;
    }
  }

  // Main execution
  try {
    // Resolve all dependencies
    const allFeatures = resolveDependencies(requestedFeatures);

    // Sort in correct load order
    const loadOrder = topologicalSort(allFeatures);

    console.log('HyperclayJS: Load order:', loadOrder);

    // Get base URL
    const baseUrl = getBaseUrl();

    // Track loaded modules
    const loadedModules = {};

    // Load modules in order
    for (const feature of loadOrder) {
      const module = await loadModule(feature, baseUrl);
      if (module) {
        loadedModules[feature] = module;
      }
    }

    // Store loaded modules globally for access
    window.hyperclayModules = loadedModules;

    // Attach exports to window based on module configuration
    for (const feature of loadOrder) {
      const module = loadedModules[feature];
      const moduleConfig = moduleDependencies[feature];

      if (!module || !moduleConfig.exports) continue;

      // For each export in the module's configuration
      for (const [exportName, locations] of Object.entries(moduleConfig.exports)) {
        // Try to get the export - check both named export and default export
        let exportValue = module[exportName];

        // If not found as named export, try default export
        if (!exportValue && module.default) {
          exportValue = module.default;
        }

        if (!exportValue) continue;

        // Attach to each configured location
        locations.forEach(location => {
          if (location === 'window') {
            window[exportName] = exportValue;
          } else if (location === 'hyperclay') {
            window.hyperclay[exportName] = exportValue;
          }
        });
      }
    }

    // Create window.h alias
    window.h = window.hyperclay;

    // Fire custom event when loading is complete
    window.dispatchEvent(new CustomEvent('hyperclayReady', {
      detail: {
        features: loadOrder,
        modules: loadedModules
      }
    }));

    // Resolve the ready promise
    if (hyperclayReadyResolve) {
      hyperclayReadyResolve(window.hyperclay);
    }

    console.log('HyperclayJS: All modules loaded successfully');

    // Show feature summary - AUTO-GENERATED
    const sizes = __FILE_SIZES__;
    const totalSize = loadOrder.reduce((sum, feature) => {
      return sum + (sizes[feature] || 0);
    }, 0);

    console.log(`HyperclayJS: Loaded ${loadOrder.length} modules (~${totalSize.toFixed(1)}KB)`);

  } catch (error) {
    console.error('HyperclayJS: Fatal error during initialization:', error);
  }
})();

// Export for use in build tools
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { version: '1.0.0' };
}
