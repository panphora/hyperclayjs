#!/usr/bin/env node

import madge from 'madge';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Category mapping based on folder structure
const CATEGORY_MAP = {
  'core': 'core',
  'custom-attributes': 'custom-attributes',
  'ui': 'ui',
  'utilities': 'utilities',
  'dom-utilities': 'dom-utilities',
  'string-utilities': 'string-utilities',
  'communication': 'communication',
  'vendor': 'vendor'
};

/**
 * Module Definitions with Export Configuration
 *
 * exports: {
 *   functionName: ['window', 'hyperclay']  // Exported to both window.functionName and window.hyperclay.functionName
 *   functionName: ['hyperclay']            // Only namespaced: window.hyperclay.functionName
 *   functionName: ['window']               // Only top-level: window.functionName
 * }
 *
 * Common patterns:
 * - Frequently used utilities (ask, toast, etc.): ['window', 'hyperclay']
 * - Core features (savePage, edit-mode-helpers): ['hyperclay']
 * - Special cases (the-modal): ['window'] with custom name
 * - Internal/side-effect only modules: no exports field
 */
const MODULE_DEFINITIONS = {
  'core/savePageCore.js': {
    name: 'save-core',
    moduleId: 'save-core',
    description: 'Basic save function only - hyperclay.savePage()',
    exports: {
      savePage: ['hyperclay']
    }
  },
  'core/savePage.js': {
    name: 'save-system',
    moduleId: 'save-system',
    description: 'Manual save: keyboard shortcut (CMD+S), save button, change tracking',
    exports: {
      beforeSave: ['hyperclay'],
      savePage: ['hyperclay'],
      savePageThrottled: ['hyperclay'],
      replacePageWith: ['hyperclay']
    }
  },
  'core/autosave.js': {
    name: 'autosave',
    moduleId: 'autosave',
    description: 'Auto-save on DOM changes, unsaved changes warning'
    // No exports - auto-inits on load, savePageThrottled is in save-system
  },
  'core/saveToast.js': {
    name: 'save-toast',
    moduleId: 'save-toast',
    description: 'Toast notifications for save events'
    // No exports - auto-inits on load, listens for save events
  },
  'core/adminSystem.js': {
    name: 'edit-mode-helpers',
    moduleId: 'edit-mode-helpers',
    description: 'Admin-only functionality: [edit-mode-input], [edit-mode-resource], [edit-mode-onclick]',
    relatedFiles: ['core/adminContenteditable.js', 'core/adminInputs.js', 'core/adminOnClick.js', 'core/adminResources.js']
    // No exports - side effects only (init function)
  },
  'core/enablePersistentFormInputValues.js': {
    name: 'persist',
    moduleId: 'persist',
    description: 'Persist input/select/textarea values to the DOM with [persist] attribute'
    // No exports - auto-inits on load
  },
  'core/optionVisibility.js': {
    name: 'option-visibility',
    moduleId: 'option-visibility',
    description: 'Dynamic show/hide based on ancestor state with option:attribute="value"'
    // No exports - auto-inits on load
  },
  'core/editmodeSystem.js': {
    name: 'edit-mode',
    moduleId: 'edit-mode',
    description: 'Toggle edit mode on hyperclay on/off',
    relatedFiles: ['core/editmode.js', 'core/setPageTypeOnDocumentElement.js'],
    exports: {
      toggleEditMode: ['hyperclay'],
      isEditMode: ['hyperclay'],
      isOwner: ['hyperclay']
    }
  },
  'custom-attributes/events.js': {
    name: 'event-attrs',
    moduleId: 'event-attrs',
    description: '[onclickaway], [onclone], [onpagemutation], [onrender]',
    relatedFiles: ['custom-attributes/onclickaway.js', 'custom-attributes/onclone.js', 'custom-attributes/onpagemutation.js', 'custom-attributes/onrender.js']
    // No exports - side effects only (init function)
  },
  'custom-attributes/ajaxElements.js': {
    name: 'ajax-elements',
    moduleId: 'ajax-elements',
    description: '[ajax-form], [ajax-button] for async form submissions'
    // No exports - side effects only (init function)
  },
  'custom-attributes/sortable.js': {
    name: 'sortable',
    moduleId: 'sortable',
    description: 'Drag-drop sorting with [sortable], lazy-loads ~118KB Sortable.js in edit mode'
    // No exports - Sortable.js is loaded via script tag in edit mode only
  },
  'custom-attributes/domHelpers.js': {
    name: 'dom-helpers',
    moduleId: 'dom-helpers',
    description: 'el.nearest, el.val, el.text, el.exec, el.cycle'
    // No exports - side effects only (extends Element.prototype)
  },
  'custom-attributes/inputHelpers.js': {
    name: 'input-helpers',
    moduleId: 'input-helpers',
    description: '[prevent-enter], [autosize] for textareas',
    relatedFiles: ['custom-attributes/preventEnter.js', 'custom-attributes/autosize.js']
    // No exports - side effects only (init function)
  },
  'custom-attributes/onaftersave.js': {
    name: 'onaftersave',
    moduleId: 'onaftersave',
    description: '[onaftersave] attribute - run JS when save status changes'
    // No exports - auto-inits on load
  },
  'ui/prompts.js': {
    name: 'dialogs',
    moduleId: 'dialogs',
    description: 'ask(), consent(), tell(), snippet() dialog functions',
    exports: {
      ask: ['window', 'hyperclay'],
      consent: ['window', 'hyperclay'],
      tell: ['window', 'hyperclay'],
      snippet: ['hyperclay']
    }
  },
  'ui/toast.js': {
    name: 'toast',
    moduleId: 'toast',
    description: 'Success/error message notifications, toast(msg, msgType)',
    exports: {
      toast: ['window', 'hyperclay']
    }
  },
  'ui/toast-hyperclay.js': {
    name: 'toast-hyperclay',
    moduleId: 'toast-hyperclay',
    description: 'toastHyperclay() with legacy Hyperclay platform styling (hidden feature)',
    hidden: true,
    exports: {
      toastHyperclay: ['window', 'hyperclay']
    }
  },
  'ui/theModal.js': {
    name: 'the-modal',
    moduleId: 'the-modal',
    description: 'Full modal window creation system - window.theModal',
    exports: {
      themodal: ['window', 'hyperclay']
    }
  },
  'utilities/mutation.js': {
    name: 'mutation',
    moduleId: 'mutation',
    description: 'DOM mutation observation (often auto-included)',
    exports: {
      Mutation: ['window', 'hyperclay']
    }
  },
  'utilities/nearest.js': {
    name: 'nearest',
    moduleId: 'nearest',
    description: 'Find nearest elements (often auto-included)',
    exports: {
      nearest: ['window', 'hyperclay']
    }
  },
  'utilities/cookie.js': {
    name: 'cookie',
    moduleId: 'cookie',
    description: 'Cookie management (often auto-included)',
    exports: {
      cookie: ['window', 'hyperclay']
    }
  },
  'utilities/throttle.js': {
    name: 'throttle',
    moduleId: 'throttle',
    description: 'Function throttling',
    exports: {
      throttle: ['hyperclay']
    }
  },
  'utilities/debounce.js': {
    name: 'debounce',
    moduleId: 'debounce',
    description: 'Function debouncing',
    exports: {
      debounce: ['hyperclay']
    }
  },
  'dom-utilities/onDomReady.js': {
    name: 'dom-ready',
    moduleId: 'dom-ready',
    description: 'DOM ready callback',
    exports: {
      onDomReady: ['hyperclay']
    }
  },
  'dom-utilities/onLoad.js': {
    name: 'window-load',
    moduleId: 'window-load',
    description: 'Window load callback',
    hidden: true,
    exports: {
      onLoad: ['hyperclay']
    }
  },
  'dom-utilities/All.js': {
    name: 'all-js',
    moduleId: 'all-js',
    description: 'Full DOM manipulation library',
    exports: {
      All: ['window', 'hyperclay']
    }
  },
  'dom-utilities/insertStyleTag.js': {
    name: 'style-injection',
    moduleId: 'style-injection',
    description: 'Dynamic stylesheet injection',
    exports: {
      insertStyleTag: ['window', 'hyperclay']
    }
  },
  'dom-utilities/getDataFromForm.js': {
    name: 'form-data',
    moduleId: 'form-data',
    description: 'Extract form data as an object',
    exports: {
      getDataFromForm: ['window', 'hyperclay']
    }
  },
  'vendor/idiomorph.min.js': {
    name: 'idiomorph',
    moduleId: 'idiomorph',
    description: 'Efficient DOM morphing library',
    exports: {
      Idiomorph: ['hyperclay']
    }
  },
  'string-utilities/slugify.js': {
    name: 'slugify',
    moduleId: 'slugify',
    description: 'URL-friendly slug generator',
    exports: {
      slugify: ['window', 'hyperclay']
    }
  },
  'string-utilities/copy-to-clipboard.js': {
    name: 'copy-to-clipboard',
    moduleId: 'copy-to-clipboard',
    description: 'Clipboard utility',
    exports: {
      copyToClipboard: ['hyperclay']
    }
  },
  'string-utilities/query.js': {
    name: 'query-params',
    moduleId: 'query-params',
    description: 'Parse URL search params',
    exports: {
      query: ['window', 'hyperclay']
    }
  },
  'communication/behaviorCollector.js': {
    name: 'behavior-collector',
    moduleId: 'behavior-collector',
    description: 'Tracks user interactions (mouse, scroll, keyboard)',
    hidden: true,
    exports: {
      behaviorCollector: ['hyperclay']
    }
  },
  'communication/sendMessage.js': {
    name: 'send-message',
    moduleId: 'send-message',
    description: 'Message sending utility',
    exports: {
      sendMessage: ['hyperclay']
    }
  },
  'communication/uploadFile.js': {
    name: 'file-upload',
    moduleId: 'file-upload',
    description: 'File upload with progress',
    exports: {
      uploadFile: ['hyperclay'],
      createFile: ['hyperclay'],
      uploadFileBasic: ['hyperclay']
    }
  },
  'core/exportToWindow.js': {
    name: 'export-to-window',
    moduleId: 'export-to-window',
    description: 'Export all modules to window.hyperclay and window globals',
    hidden: true,
    // No exports - this module flips the auto-export flag
  }
};

// Category definitions
const CATEGORIES = {
  'core': {
    name: 'Core Features',
    description: 'Essential functionality',
    modules: []
  },
  'custom-attributes': {
    name: 'Custom Attributes',
    description: 'HTML enhancements',
    modules: []
  },
  'ui': {
    name: 'UI Components',
    description: 'User interface elements',
    modules: []
  },
  'utilities': {
    name: 'Utilities',
    description: 'Core utilities (often auto-included)',
    modules: []
  },
  'dom-utilities': {
    name: 'DOM Utilities',
    description: 'DOM manipulation helpers',
    modules: []
  },
  'string-utilities': {
    name: 'String Utilities',
    description: 'String manipulation helpers',
    modules: []
  },
  'communication': {
    name: 'Communication & Files',
    description: 'File handling and messaging',
    modules: []
  },
  'vendor': {
    name: 'Vendor Libraries',
    description: 'Third-party libraries',
    modules: []
  }
};

// Preset definitions
const PRESETS = {
  'minimal': {
    name: 'Minimal',
    description: 'Essential features for basic editing',
    modules: ['save-core', 'save-system', 'edit-mode-helpers', 'toast', 'save-toast', 'export-to-window']
  },
  'standard': {
    name: 'Standard',
    description: 'Standard feature set for most use cases',
    modules: ['save-core', 'save-system', 'edit-mode-helpers', 'persist', 'option-visibility', 'event-attrs', 'dom-helpers', 'toast', 'save-toast', 'export-to-window']
  },
  'everything': {
    name: 'Everything',
    description: 'All available features',
    modules: [] // Will be populated with all module IDs (including export-to-window)
  }
};

/**
 * Get file size in KB
 */
function getFileSize(filePath) {
  try {
    const fullPath = path.join(SRC_DIR, filePath);
    const stats = fs.statSync(fullPath);
    return Math.round((stats.size / 1024) * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.warn(`Could not get size for ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Get category from file path
 */
function getCategory(filePath) {
  const folder = filePath.split('/')[0];
  return CATEGORY_MAP[folder] || 'other';
}

/**
 * Generate module paths for the simplified loader
 */
function generateModulePaths(modules) {
  const paths = {};
  for (const [moduleId, module] of Object.entries(modules)) {
    // Use the first file in the files array as the main module path
    paths[moduleId] = `./${module.files[0]}`;
  }
  return paths;
}

/**
 * Generate dependency graph
 */
async function generateDependencyGraph() {
  console.log('🔍 Analyzing dependencies...');

  // Get dependency tree using madge
  const result = await madge(SRC_DIR, {
    fileExtensions: ['js'],
    excludeRegExp: [/node_modules/, /dist/, /scripts/]
  });

  const dependencies = result.obj();

  console.log(`📦 Found ${Object.keys(dependencies).length} files`);

  // Build raw dependencies object
  const rawDependencies = {};
  for (const [file, deps] of Object.entries(dependencies)) {
    rawDependencies[file] = deps;
  }

  // Build modules object
  const modules = {};
  const processedFiles = new Set();

  for (const [filePath, definition] of Object.entries(MODULE_DEFINITIONS)) {
    const moduleId = definition.moduleId;
    const category = definition.category || getCategory(filePath); // Allow override

    // Get all files for this module
    const files = [filePath, ...(definition.relatedFiles || [])];

    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + getFileSize(file), 0);

    modules[moduleId] = {
      name: definition.name,
      category: category,
      size: totalSize,
      files: files,
      description: definition.description,
      exports: definition.exports || {}
    };

    // Mark files as processed
    files.forEach(f => processedFiles.add(f));

    // Add to category modules list (unless hidden)
    if (CATEGORIES[category] && !definition.hidden) {
      CATEGORIES[category].modules.push(moduleId);
    }
  }

  // Populate "everything" preset with all module IDs
  PRESETS.everything.modules = Object.keys(modules);

  // Generate module paths for the simplified loader
  const modulePaths = generateModulePaths(modules);

  // Build final object
  const graph = {
    rawDependencies,
    modules,
    modulePaths, // NEW: Add module paths for simplified loader
    categories: CATEGORIES,
    presets: PRESETS
  };

  // Write to file
  const outputPath = path.join(SRC_DIR, 'module-dependency-graph.json');
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));

  console.log('✅ Generated module-dependency-graph.json');
  console.log(`📊 Total modules: ${Object.keys(modules).length}`);
  console.log(`📂 Categories: ${Object.keys(CATEGORIES).length}`);
  console.log(`🎯 Presets: ${Object.keys(PRESETS).length}`);
  console.log(`🗺️ Module paths: ${Object.keys(modulePaths).length}`);
}

// Run the generator
generateDependencyGraph().catch(error => {
  console.error('❌ Error generating dependency graph:', error);
  process.exit(1);
});
