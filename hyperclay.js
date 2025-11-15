/**
 * Hyperclay Starter Kit - Self-detecting module loader
 * Automatically loads requested features with dependency resolution
 */

(async function() {
  'use strict';

  // Module dependency map
  const moduleDependencies = {
    // Core Features
    'save-core': {
      path: './core/savePageCore.js',
      dependencies: ['cookie']
    },
    'save': {
      path: './core/savePage.js',
      dependencies: ['save-core', 'toast', 'mutation', 'throttle']
    },
    'admin': {
      path: './core/adminContenteditable.js',
      dependencies: ['admin-inputs', 'admin-resources', 'admin-onclick']
    },
    'admin-inputs': {
      path: './core/adminInputs.js',
      dependencies: ['cookie', 'dom-ready']
    },
    'admin-resources': {
      path: './core/adminResources.js',
      dependencies: ['cookie', 'dom-ready']
    },
    'admin-onclick': {
      path: './core/adminOnClick.js',
      dependencies: ['cookie', 'dom-ready']
    },
    'admin-contenteditable': {
      path: './core/adminContenteditable.js',
      dependencies: ['cookie', 'dom-ready']
    },
    'persist': {
      path: './core/enablePersistentFormInputValues.js',
      dependencies: []
    },
    'options': {
      path: './core/optionVisibilityRuleGenerator.js',
      dependencies: ['mutation']
    },
    'editmode': {
      path: './core/editmode.js',
      dependencies: ['cookie']
    },
    // Custom Attributes
    'ajax': {
      path: './custom-attributes/ajaxElements.js',
      dependencies: []
    },
    'events': {
      path: './custom-attributes/onclickaway.js',
      dependencies: ['onclone', 'onpagemutation', 'onrender']
    },
    'onclickaway': {
      path: './custom-attributes/onclickaway.js',
      dependencies: []
    },
    'onclone': {
      path: './custom-attributes/onclone.js',
      dependencies: []
    },
    'onpagemutation': {
      path: './custom-attributes/onpagemutation.js',
      dependencies: ['mutation']
    },
    'onrender': {
      path: './custom-attributes/onrender.js',
      dependencies: ['mutation', 'window-load']
    },
    'sortable': {
      path: './custom-attributes/sortable.js',
      dependencies: ['mutation', 'sortable-vendor']
    },
    'sortable-vendor': {
      path: './vendor/Sortable.js',
      dependencies: []
    },
    'helpers': {
      path: './custom-attributes/domHelpers.js',
      dependencies: ['nearest', 'pipe']
    },
    'inputs': {
      path: './custom-attributes/prevent.js',
      dependencies: ['autosize']
    },
    'autosize': {
      path: './custom-attributes/autosize.js',
      dependencies: []
    },
    // UI Components
    'prompts': {
      path: './ui/prompts.js',
      dependencies: ['modals', 'toast', 'dom-ready', 'copy-to-clipboard']
    },
    'toast': {
      path: './ui/toast.js',
      dependencies: []
    },
    'modals': {
      path: './ui/theModal.js',
      dependencies: []
    },
    'info': {
      path: './ui/info.js',
      dependencies: ['modals', 'dom-ready']
    },
    'tailwind-play': {
      path: './vendor/tailwind-play.js',
      dependencies: ['style-injection']
    },
    // Utilities (often auto-included)
    'mutation': {
      path: './utilities/mutation.js',
      dependencies: []
    },
    'nearest': {
      path: './utilities/nearest.js',
      dependencies: []
    },
    'cookie': {
      path: './utilities/cookie.js',
      dependencies: []
    },
    'throttle': {
      path: './utilities/throttle.js',
      dependencies: []
    },
    'debounce': {
      path: './utilities/debounce.js',
      dependencies: []
    },
    'pipe': {
      path: './utilities/pipe.js',
      dependencies: []
    },
    // DOM Utilities
    'dom-ready': {
      path: './dom-utilities/onDomReady.js',
      dependencies: []
    },
    'window-load': {
      path: './dom-utilities/onLoad.js',
      dependencies: []
    },
    'jquery-like': {
      path: './dom-utilities/All.js',
      dependencies: []
    },
    'style-injection': {
      path: './dom-utilities/insertStyleTag.js',
      dependencies: []
    },
    'dom-morphing': {
      path: './vendor/idiomorph.min.js',
      dependencies: []
    },
    // String Utilities
    'slugify': {
      path: './string-utilities/slugify.js',
      dependencies: []
    },
    'emmet-html': {
      path: './string-utilities/emmet-html.js',
      dependencies: []
    },
    'copy-to-clipboard': {
      path: './string-utilities/copy-to-clipboard.js',
      dependencies: []
    },
    'query-parser': {
      path: './string-utilities/query.js',
      dependencies: []
    },
    // Communication
    'send-message': {
      path: './communication/sendMessage.js',
      dependencies: ['toast']
    },
    'file-upload': {
      path: './communication/uploadFile.js',
      dependencies: ['toast', 'debounce', 'copy-to-clipboard']
    }
  };

  // Preset configurations
  const presets = {
    'minimal': ['save-core', 'save', 'admin', 'toast'],
    'standard': ['save-core', 'save', 'admin', 'persist', 'ajax', 'events', 'helpers', 'toast'],
    'everything': Object.keys(moduleDependencies).filter(m =>
      !['mutation', 'nearest', 'cookie', 'sortable-vendor', 'throttle', 'debounce',
        'dom-ready', 'window-load', 'pipe', 'admin-inputs', 'admin-resources',
        'admin-onclick', 'admin-contenteditable', 'onclickaway', 'onclone',
        'onpagemutation', 'onrender', 'autosize', 'copy-to-clipboard'].includes(m)
    )
  };

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
        'save-core': 4.9, 'save': 4.4, 'admin': 1, 'admin-inputs': 1.5,
        'admin-resources': 1, 'admin-onclick': 0.9, 'admin-contenteditable': 1,
        'persist': 1.4, 'options': 4.3, 'editmode': 0.3, 'ajax': 1.8,
        'events': 2.7, 'onclickaway': 0.7, 'onclone': 0.6, 'onpagemutation': 0.6,
        'onrender': 0.8, 'sortable': 1.7, 'sortable-vendor': 118, 'helpers': 5.2,
        'inputs': 0.4, 'autosize': 0.5, 'prompts': 7.3, 'toast': 7.3,
        'modals': 18.8, 'info': 3.3, 'tailwind-play': 362, 'mutation': 12.8,
        'nearest': 3.2, 'cookie': 1.2, 'throttle': 0.6, 'debounce': 0.2,
        'pipe': 0.1, 'dom-ready': 0.2, 'window-load': 0.2, 'jquery-like': 12.1,
        'style-injection': 0.8, 'dom-morphing': 7.9, 'slugify': 0.5,
        'emmet-html': 1.4, 'copy-to-clipboard': 0.7, 'query-parser': 0.1,
        'send-message': 1.1, 'file-upload': 10.3
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