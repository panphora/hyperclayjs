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
  const moduleDependencies = {
  "save-core": {
    "path": "./core/savePageCore.js",
    "dependencies": [
      "cookie"
    ],
    "exports": {
      "savePage": [
        "hyperclay"
      ]
    }
  },
  "save": {
    "path": "./core/savePage.js",
    "dependencies": [
      "save-core",
      "toast",
      "mutation",
      "throttle"
    ],
    "exports": {
      "beforeSave": [
        "hyperclay"
      ],
      "savePage": [
        "hyperclay"
      ],
      "replacePageWith": [
        "hyperclay"
      ],
      "initHyperclaySaveButton": [
        "hyperclay"
      ],
      "initSaveKeyboardShortcut": [
        "hyperclay"
      ],
      "initSavePageOnChange": [
        "hyperclay"
      ]
    }
  },
  "admin": {
    "path": "./core/adminSystem.js",
    "dependencies": [
      "save",
      "dom-ready"
    ],
    "exports": {}
  },
  "persist": {
    "path": "./core/enablePersistentFormInputValues.js",
    "dependencies": [
      "save"
    ],
    "exports": {
      "enablePersistentFormInputValues": [
        "hyperclay"
      ]
    }
  },
  "options": {
    "path": "./core/optionVisibilityRuleGenerator.js",
    "dependencies": [
      "mutation"
    ],
    "exports": {
      "optionVisibilityRuleGenerator": [
        "window",
        "hyperclay"
      ]
    }
  },
  "editmode": {
    "path": "./core/editmodeSystem.js",
    "dependencies": [
      "save",
      "dom-ready"
    ],
    "exports": {
      "toggleEditMode": [
        "hyperclay"
      ],
      "isEditMode": [
        "hyperclay"
      ],
      "isOwner": [
        "hyperclay"
      ]
    }
  },
  "events": {
    "path": "./custom-attributes/events.js",
    "dependencies": [
      "mutation",
      "window-load"
    ],
    "exports": {}
  },
  "ajax": {
    "path": "./custom-attributes/ajaxElements.js",
    "dependencies": [
      "get-data-from-form"
    ],
    "exports": {}
  },
  "sortable": {
    "path": "./custom-attributes/sortable.js",
    "dependencies": [
      "mutation"
    ],
    "exports": {
      "Sortable": [
        "window",
        "hyperclay"
      ]
    }
  },
  "helpers": {
    "path": "./custom-attributes/domHelpers.js",
    "dependencies": [
      "nearest"
    ],
    "exports": {
      "initCustomAttributes": [
        "window",
        "hyperclay"
      ]
    }
  },
  "inputs": {
    "path": "./custom-attributes/inputHelpers.js",
    "dependencies": [],
    "exports": {}
  },
  "prompts": {
    "path": "./ui/prompts.js",
    "dependencies": [
      "dom-ready",
      "copy-to-clipboard",
      "modals",
      "toast"
    ],
    "exports": {
      "ask": [
        "window",
        "hyperclay"
      ],
      "consent": [
        "window",
        "hyperclay"
      ],
      "tell": [
        "window",
        "hyperclay"
      ],
      "snippet": [
        "hyperclay"
      ],
      "showApiKey": [
        "hyperclay"
      ]
    }
  },
  "toast": {
    "path": "./ui/toast.js",
    "dependencies": [],
    "exports": {
      "toast": [
        "window",
        "hyperclay"
      ]
    }
  },
  "modals": {
    "path": "./ui/theModal.js",
    "dependencies": [],
    "exports": {
      "themodal": [
        "window",
        "hyperclay"
      ]
    }
  },
  "info": {
    "path": "./ui/info.js",
    "dependencies": [
      "dom-ready",
      "modals"
    ],
    "exports": {
      "info": [
        "window",
        "hyperclay"
      ]
    }
  },
  "tailwind-play": {
    "path": "./vendor/tailwind-play.js",
    "dependencies": [
      "style-injection"
    ],
    "exports": {}
  },
  "mutation": {
    "path": "./utilities/mutation.js",
    "dependencies": [],
    "exports": {
      "Mutation": [
        "window",
        "hyperclay"
      ]
    }
  },
  "nearest": {
    "path": "./utilities/nearest.js",
    "dependencies": [],
    "exports": {
      "nearest": [
        "window",
        "hyperclay"
      ]
    }
  },
  "cookie": {
    "path": "./utilities/cookie.js",
    "dependencies": [],
    "exports": {
      "cookie": [
        "window",
        "hyperclay"
      ]
    }
  },
  "throttle": {
    "path": "./utilities/throttle.js",
    "dependencies": [],
    "exports": {
      "throttle": [
        "hyperclay"
      ]
    }
  },
  "debounce": {
    "path": "./utilities/debounce.js",
    "dependencies": [],
    "exports": {
      "debounce": [
        "hyperclay"
      ]
    }
  },
  "dom-ready": {
    "path": "./dom-utilities/onDomReady.js",
    "dependencies": [],
    "exports": {
      "onDomReady": [
        "hyperclay"
      ]
    }
  },
  "window-load": {
    "path": "./dom-utilities/onLoad.js",
    "dependencies": [],
    "exports": {
      "onLoad": [
        "hyperclay"
      ]
    }
  },
  "alljs": {
    "path": "./dom-utilities/All.js",
    "dependencies": [],
    "exports": {
      "All": [
        "window",
        "hyperclay"
      ]
    }
  },
  "style-injection": {
    "path": "./dom-utilities/insertStyleTag.js",
    "dependencies": [],
    "exports": {
      "insertStyleTag": [
        "window",
        "hyperclay"
      ]
    }
  },
  "get-data-from-form": {
    "path": "./dom-utilities/getDataFromForm.js",
    "dependencies": [],
    "exports": {
      "getDataFromForm": [
        "window",
        "hyperclay"
      ]
    }
  },
  "dom-morphing": {
    "path": "./vendor/idiomorph.min.js",
    "dependencies": [],
    "exports": {
      "Idiomorph": [
        "hyperclay"
      ]
    }
  },
  "slugify": {
    "path": "./string-utilities/slugify.js",
    "dependencies": [],
    "exports": {
      "slugify": [
        "window",
        "hyperclay"
      ]
    }
  },
  "emmet-html": {
    "path": "./string-utilities/emmet-html.js",
    "dependencies": [],
    "exports": {
      "emmet": [
        "hyperclay"
      ]
    }
  },
  "copy-to-clipboard": {
    "path": "./string-utilities/copy-to-clipboard.js",
    "dependencies": [],
    "exports": {
      "copyToClipboard": [
        "hyperclay"
      ]
    }
  },
  "query-parser": {
    "path": "./string-utilities/query.js",
    "dependencies": [],
    "exports": {
      "query": [
        "window",
        "hyperclay"
      ]
    }
  },
  "behavior-collector": {
    "path": "./communication/behaviorCollector.js",
    "dependencies": [],
    "exports": {
      "behaviorCollector": [
        "hyperclay"
      ]
    }
  },
  "send-message": {
    "path": "./communication/sendMessage.js",
    "dependencies": [
      "behavior-collector",
      "get-data-from-form",
      "toast"
    ],
    "exports": {
      "sendMessage": [
        "hyperclay"
      ]
    }
  },
  "file-upload": {
    "path": "./communication/uploadFile.js",
    "dependencies": [
      "copy-to-clipboard",
      "toast",
      "debounce"
    ],
    "exports": {
      "uploadFile": [
        "hyperclay"
      ],
      "createFile": [
        "hyperclay"
      ],
      "uploadFileBasic": [
        "hyperclay"
      ]
    }
  }
};

  // Preset configurations - AUTO-GENERATED
  const presets = {
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
      "dom-morphing",
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
    const sizes = {
  "save-core": 5.9,
  "save": 4.9,
  "admin": 5.300000000000001,
  "persist": 2.2,
  "options": 4.4,
  "editmode": 1.4,
  "events": 3.5,
  "ajax": 2.7,
  "sortable": 117.89999999999999,
  "helpers": 5.4,
  "inputs": 1.2,
  "prompts": 7.7,
  "toast": 7.3,
  "modals": 18.4,
  "info": 3.2,
  "tailwind-play": 362.3,
  "mutation": 12.8,
  "nearest": 3.2,
  "cookie": 1.3,
  "throttle": 0.6,
  "debounce": 0.2,
  "dom-ready": 0.2,
  "window-load": 0.2,
  "alljs": 13.8,
  "style-injection": 0.8,
  "get-data-from-form": 1.7,
  "dom-morphing": 7.9,
  "slugify": 0.7,
  "emmet-html": 1.4,
  "copy-to-clipboard": 0.9,
  "query-parser": 0.1,
  "behavior-collector": 5.2,
  "send-message": 1.2,
  "file-upload": 10.4
};
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
