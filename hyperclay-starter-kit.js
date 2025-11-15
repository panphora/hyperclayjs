/**
 * Hyperclay Starter Kit - Self-detecting module loader
 * Automatically loads requested features with dependency resolution
 */

(async function() {
  'use strict';

  // Module dependency map
  const moduleDependencies = {
    'save-core': {
      path: './core/save-core.js',
      dependencies: []
    },
    'save': {
      path: './features/save.js',
      dependencies: ['save-core', 'toast', 'mutation']
    },
    'admin': {
      path: './features/admin.js',
      dependencies: ['cookie']
    },
    'persist': {
      path: './features/persist.js',
      dependencies: []
    },
    'options': {
      path: './features/options.js',
      dependencies: ['mutation']
    },
    'ajax': {
      path: './features/ajax.js',
      dependencies: []
    },
    'events': {
      path: './features/events.js',
      dependencies: []
    },
    'sortable': {
      path: './features/sortable.js',
      dependencies: ['mutation', 'sortable-vendor']
    },
    'sortable-vendor': {
      path: './vendor/Sortable.js',
      dependencies: []
    },
    'helpers': {
      path: './features/helpers.js',
      dependencies: ['nearest']
    },
    'inputs': {
      path: './features/inputs.js',
      dependencies: []
    },
    'prompts': {
      path: './ui/prompts.js',
      dependencies: ['modals', 'toast']
    },
    'toast': {
      path: './ui/toast.js',
      dependencies: []
    },
    'modals': {
      path: './ui/modals.js',
      dependencies: []
    },
    'tailwind-play': {
      path: './vendor/tailwind-play.js',
      dependencies: []
    },
    // Core dependencies
    'mutation': {
      path: './core/mutation.js',
      dependencies: []
    },
    'nearest': {
      path: './core/nearest.js',
      dependencies: []
    },
    'cookie': {
      path: './core/cookie.js',
      dependencies: []
    }
  };

  // Preset configurations
  const presets = {
    'minimal': ['save-core', 'save', 'admin', 'toast'],
    'standard': ['save-core', 'save', 'admin', 'persist', 'ajax', 'events', 'helpers', 'toast'],
    'everything': Object.keys(moduleDependencies).filter(m =>
      !['mutation', 'nearest', 'cookie', 'sortable-vendor'].includes(m)
    )
  };

  // Find our script tag
  const currentScript = document.currentScript ||
    Array.from(document.scripts).find(s =>
      s.src && s.src.includes('hyperclay-starter-kit.js')
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
    requestedFeatures = presets[presetParam];
    console.log(`HyperclayJS: Loading preset "${presetParam}"`);
  } else if (featuresParam) {
    requestedFeatures = featuresParam.split(',').map(f => f.trim());
    console.log(`HyperclayJS: Loading features:`, requestedFeatures);
  } else {
    // Default to minimal preset
    requestedFeatures = presets.minimal;
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

      // Add dependencies first (depth-first)
      if (module.dependencies && module.dependencies.length > 0) {
        queue.unshift(...module.dependencies.filter(d => !resolved.has(d)));
      } else {
        resolved.add(feature);
      }
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

      // Make module available globally if it exports to window
      if (loaded.exportToWindow && typeof loaded.exportToWindow === 'function') {
        loaded.exportToWindow();
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

    // Fire custom event when loading is complete
    window.dispatchEvent(new CustomEvent('hyperclayReady', {
      detail: {
        features: loadOrder,
        modules: loadedModules
      }
    }));

    console.log('HyperclayJS: All modules loaded successfully');

    // Show feature summary
    const totalSize = loadOrder.reduce((sum, feature) => {
      const sizes = {
        'save-core': 3, 'save': 3, 'admin': 10, 'persist': 1.4,
        'options': 4.4, 'ajax': 1.8, 'events': 2.7, 'sortable': 118,
        'helpers': 5.3, 'inputs': 1, 'prompts': 7.5, 'toast': 7.3,
        'modals': 18.8, 'tailwind-play': 29, 'mutation': 2,
        'nearest': 1, 'cookie': 1, 'sortable-vendor': 115
      };
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