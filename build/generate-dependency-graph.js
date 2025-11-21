#!/usr/bin/env node

import madge from 'madge';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

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
 * - Core features (savePage, admin): ['hyperclay']
 * - Special cases (themodal): ['window'] with custom name
 * - Internal/side-effect only modules: no exports field
 */
const MODULE_DEFINITIONS = {
  'core/savePageCore.js': {
    name: 'Save Core',
    moduleId: 'save-core',
    description: 'Basic save function only - hyperclay.savePage()',
    exports: {
      savePage: ['hyperclay']
    }
  },
  'core/savePage.js': {
    name: 'Save System',
    moduleId: 'save',
    description: 'Full save: save button, keyboard shortcut, auto-save, change tracking',
    exports: {
      beforeSave: ['hyperclay'],
      savePage: ['hyperclay'],
      replacePageWith: ['hyperclay'],
      initHyperclaySaveButton: ['hyperclay'],
      initSaveKeyboardShortcut: ['hyperclay'],
      initSavePageOnChange: ['hyperclay']
    }
  },
  'core/adminSystem.js': {
    name: 'Admin Features',
    moduleId: 'admin',
    description: 'Hides admin inputs, scripts, contenteditable, onclick for regular viewers',
    relatedFiles: ['core/adminContenteditable.js', 'core/adminInputs.js', 'core/adminOnClick.js', 'core/adminResources.js']
    // No exports - side effects only (init function)
  },
  'core/enablePersistentFormInputValues.js': {
    name: 'Form Persistence',
    moduleId: 'persist',
    description: 'Persist form values to the DOM with [persist] attribute',
    exports: {
      enablePersistentFormInputValues: ['hyperclay']
    }
  },
  'core/optionVisibilityRuleGenerator.js': {
    name: 'Option Visibility',
    moduleId: 'options',
    description: 'Dynamic show/hide based on ancestor state with option:attribute="value"',
    exports: {
      optionVisibilityRuleGenerator: ['window', 'hyperclay']
    }
  },
  'core/editmodeSystem.js': {
    name: 'Edit Mode',
    moduleId: 'editmode',
    description: 'Toggle edit mode on/off',
    relatedFiles: ['core/editmode.js', 'core/setPageTypeOnDocumentElement.js'],
    exports: {
      toggleEditMode: ['hyperclay'],
      isEditMode: ['hyperclay'],
      isOwner: ['hyperclay']
    }
  },
  'custom-attributes/events.js': {
    name: 'Event Attributes',
    moduleId: 'events',
    description: '[onclickaway], [onclone], [onpagemutation], [onrender]',
    relatedFiles: ['custom-attributes/onclickaway.js', 'custom-attributes/onclone.js', 'custom-attributes/onpagemutation.js', 'custom-attributes/onrender.js']
    // No exports - side effects only (init function)
  },
  'custom-attributes/ajaxElements.js': {
    name: 'AJAX Elements',
    moduleId: 'ajax',
    description: '[ajax-form], [ajax-button] for async form submissions'
    // No exports - side effects only (init function)
  },
  'custom-attributes/sortable.js': {
    name: 'Sortable',
    moduleId: 'sortable',
    description: 'Drag-drop sorting with [sortable] - includes Sortable.js vendor library',
    relatedFiles: ['vendor/Sortable.js'],
    exports: {
      Sortable: ['window', 'hyperclay']
    }
  },
  'custom-attributes/domHelpers.js': {
    name: 'DOM Helpers',
    moduleId: 'helpers',
    description: 'el.nearest, el.val, el.text, el.exec, el.cycle',
    exports: {
      initCustomAttributes: ['window', 'hyperclay']
    }
  },
  'custom-attributes/inputHelpers.js': {
    name: 'Input Helpers',
    moduleId: 'inputs',
    description: '[prevent-enter], [autosize] for textareas',
    relatedFiles: ['custom-attributes/preventEnter.js', 'custom-attributes/autosize.js']
    // No exports - side effects only (init function)
  },
  'ui/prompts.js': {
    name: 'Dialog Functions',
    moduleId: 'prompts',
    description: 'ask(), consent(), tell(), snippet() functions',
    exports: {
      ask: ['window', 'hyperclay'],
      consent: ['window', 'hyperclay'],
      tell: ['window', 'hyperclay'],
      snippet: ['hyperclay'],
      showApiKey: ['hyperclay']
    }
  },
  'ui/toast.js': {
    name: 'Toast Notifications',
    moduleId: 'toast',
    description: 'Success/error message notifications - toast(msg, msgType)',
    exports: {
      toast: ['window', 'hyperclay']
    }
  },
  'ui/toast-hyperclay.js': {
    name: 'Toast Hyperclay (Legacy)',
    moduleId: 'toast-hyperclay',
    description: 'Toast with legacy Hyperclay platform styling (hidden feature)',
    relatedFiles: ['ui/toast.js'],
    hidden: true,
    exports: {
      toast: ['window', 'hyperclay']
    }
  },
  'ui/theModal.js': {
    name: 'Modal System',
    moduleId: 'modals',
    description: 'Full modal window creation system - window.theModal',
    exports: {
      themodal: ['window', 'hyperclay']
    }
  },
  'ui/info.js': {
    name: 'Info Dialog',
    moduleId: 'info',
    description: 'Info dialog component',
    exports: {
      info: ['window', 'hyperclay']
    }
  },
  'vendor/tailwind-play.js': {
    name: 'Tailwind Play',
    moduleId: 'tailwind-play',
    description: 'Live Tailwind CSS editing - no need for a build system',
    category: 'ui' // Override - this is a UI feature even though file is in vendor/
    // No exports - side effects only
  },
  'utilities/mutation.js': {
    name: 'Mutation Observer',
    moduleId: 'mutation',
    description: 'DOM mutation observation (often auto-included)',
    exports: {
      Mutation: ['window', 'hyperclay']
    }
  },
  'utilities/nearest.js': {
    name: 'Nearest Element',
    moduleId: 'nearest',
    description: 'Find nearest elements (often auto-included)',
    exports: {
      nearest: ['window', 'hyperclay']
    }
  },
  'utilities/cookie.js': {
    name: 'Cookie Helper',
    moduleId: 'cookie',
    description: 'Cookie management (often auto-included)',
    exports: {
      cookie: ['window', 'hyperclay']
    }
  },
  'utilities/throttle.js': {
    name: 'Throttle',
    moduleId: 'throttle',
    description: 'Function throttling',
    exports: {
      throttle: ['hyperclay']
    }
  },
  'utilities/debounce.js': {
    name: 'Debounce',
    moduleId: 'debounce',
    description: 'Function debouncing',
    exports: {
      debounce: ['hyperclay']
    }
  },
  'dom-utilities/onDomReady.js': {
    name: 'DOM Ready',
    moduleId: 'dom-ready',
    description: 'DOM ready callback',
    exports: {
      onDomReady: ['hyperclay']
    }
  },
  'dom-utilities/onLoad.js': {
    name: 'Window Load',
    moduleId: 'window-load',
    description: 'Window load callback',
    hidden: true,
    exports: {
      onLoad: ['hyperclay']
    }
  },
  'dom-utilities/All.js': {
    name: 'All.js (jQuery-like)',
    moduleId: 'alljs',
    description: 'Full DOM manipulation library',
    exports: {
      All: ['window', 'hyperclay']
    }
  },
  'dom-utilities/insertStyleTag.js': {
    name: 'Style Injection',
    moduleId: 'style-injection',
    description: 'Dynamic stylesheet injection',
    exports: {
      insertStyleTag: ['window', 'hyperclay']
    }
  },
  'dom-utilities/getDataFromForm.js': {
    name: 'Get Data From Form',
    moduleId: 'get-data-from-form',
    description: 'Extract form data as an object',
    exports: {
      getDataFromForm: ['window', 'hyperclay']
    }
  },
  'vendor/idiomorph.min.js': {
    name: 'Idiomorph',
    moduleId: 'idiomorph',
    description: 'Efficient DOM morphing library',
    exports: {
      Idiomorph: ['hyperclay']
    }
  },
  'string-utilities/slugify.js': {
    name: 'Slugify',
    moduleId: 'slugify',
    description: 'URL-friendly slug generator',
    exports: {
      slugify: ['window', 'hyperclay']
    }
  },
  'string-utilities/emmet-html.js': {
    name: 'Emmet HTML',
    moduleId: 'emmet-html',
    description: 'Emmet-like HTML generation',
    exports: {
      emmet: ['hyperclay']  // Available as h (since window.h = emmet + namespace)
    }
  },
  'string-utilities/copy-to-clipboard.js': {
    name: 'Copy to Clipboard',
    moduleId: 'copy-to-clipboard',
    description: 'Clipboard utility',
    exports: {
      copyToClipboard: ['hyperclay']
    }
  },
  'string-utilities/query.js': {
    name: 'URL Query Parser',
    moduleId: 'query-parser',
    description: 'Parse URL search params',
    exports: {
      query: ['window', 'hyperclay']
    }
  },
  'communication/behaviorCollector.js': {
    name: 'Behavior Collector',
    moduleId: 'behavior-collector',
    description: 'Tracks user interactions (mouse, scroll, keyboard)',
    hidden: true,
    exports: {
      behaviorCollector: ['hyperclay']
    }
  },
  'communication/sendMessage.js': {
    name: 'Send Message to App Owner',
    moduleId: 'send-message',
    description: 'Message sending utility',
    exports: {
      sendMessage: ['hyperclay']
    }
  },
  'communication/uploadFile.js': {
    name: 'File Upload to App Owner',
    moduleId: 'file-upload',
    description: 'File upload with progress',
    exports: {
      uploadFile: ['hyperclay'],
      createFile: ['hyperclay'],
      uploadFileBasic: ['hyperclay']
    }
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
    modules: ['save-core', 'save', 'admin', 'toast']
  },
  'standard': {
    name: 'Standard',
    description: 'Standard feature set for most use cases',
    modules: ['save-core', 'save', 'admin', 'persist', 'ajax', 'events', 'helpers', 'toast']
  },
  'everything': {
    name: 'Everything',
    description: 'All available features',
    modules: [] // Will be populated with all module IDs
  }
};

/**
 * Get file size in KB
 */
function getFileSize(filePath) {
  try {
    const fullPath = path.join(ROOT_DIR, filePath);
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
 * Generate dependency graph
 */
async function generateDependencyGraph() {
  console.log('🔍 Analyzing dependencies...');

  // Get dependency tree using madge
  const result = await madge(ROOT_DIR, {
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

  // Build final object
  const graph = {
    rawDependencies,
    modules,
    categories: CATEGORIES,
    presets: PRESETS
  };

  // Write to file
  const outputPath = path.join(ROOT_DIR, 'module-dependency-graph.json');
  fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));

  console.log('✅ Generated module-dependency-graph.json');
  console.log(`📊 Total modules: ${Object.keys(modules).length}`);
  console.log(`📂 Categories: ${Object.keys(CATEGORIES).length}`);
  console.log(`🎯 Presets: ${Object.keys(PRESETS).length}`);
}

// Run the generator
generateDependencyGraph().catch(error => {
  console.error('❌ Error generating dependency graph:', error);
  process.exit(1);
});
