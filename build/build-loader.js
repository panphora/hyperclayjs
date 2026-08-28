/**
 * Build script to generate hyperclay.js from module-dependency-graph.generated.json
 *
 * Simplified for browser-native ES modules approach.
 * Modules self-export to window.hyperclay when imported.
 * The loader only needs to know module paths and presets.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json for version
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageJson.version;

// Read module dependency graph
const depGraphPath = path.join(__dirname, '../module-dependency-graph.generated.json');
const depGraph = JSON.parse(fs.readFileSync(depGraphPath, 'utf8'));

// Read template
const templatePath = path.join(__dirname, 'hyperclay.template.js');
const template = fs.readFileSync(templatePath, 'utf8');

// When two modules export the same name, declaration order decides which one the
// ESM export resolves to. This names the exceptions, where the wrong one wins.
//
// savePage: save-core is the bare network save; save-system is the stateful one
// that coalesces a save requested while another is on the wire, keeps the saved
// baseline, and drives the savestatus attribute. Both auto-export to
// window.hyperclay, and save-system's block runs second (it imports save-core), so
// the GLOBAL already resolves to save-system. Without this the documented ESM
// import resolved to save-core instead, and the same name meant two different
// functions depending on how a page reached it, only one of which coalesced.
const EXPORT_OWNER = {
  savePage: 'save-system',
};

// Generate ES module export lines from module exports definitions
function generateExports() {
  const modules = depGraph.modules || {};
  const declaredBy = new Map();

  for (const [moduleId, module] of Object.entries(modules)) {
    if (!module.exports) continue;
    for (const exportName of Object.keys(module.exports)) {
      if (!declaredBy.has(exportName)) declaredBy.set(exportName, []);
      declaredBy.get(exportName).push(moduleId);
    }
  }

  const exportLines = [];

  for (const [exportName, moduleIds] of declaredBy) {
    const owner = EXPORT_OWNER[exportName];
    const ordered = owner && moduleIds.includes(owner)
      ? [owner, ...moduleIds.filter(id => id !== owner)]
      : moduleIds;

    // Every module that declares the name, owner first. The rest are fallbacks:
    // a preset can load one without the other, and resolving to undefined there
    // would be worse than resolving to the smaller implementation.
    // Use optional chaining since module may not be loaded
    // Try named export first, fall back to default
    const chain = ordered
      .flatMap(id => [
        `window.hyperclayModules['${id}']?.${exportName}`,
        `window.hyperclayModules['${id}']?.default`,
      ])
      .join(' ?? ');

    exportLines.push(`export const ${exportName} = ${chain};`);
  }

  return exportLines.join('\n');
}

// Generate the edit-mode-only modules set
function generateEditModeOnly() {
  const modules = depGraph.modules || {};
  const editModeOnly = [];

  for (const [moduleId, module] of Object.entries(modules)) {
    if (module.isEditModeOnly) {
      editModeOnly.push(moduleId);
    }
  }

  return editModeOnly;
}

// Generate the loader
function generateLoader() {
  const modulePaths = depGraph.modulePaths || {};
  const presets = depGraph.presets;
  const editModeOnly = generateEditModeOnly();

  let output = template;
  output = output.replace('__VERSION__', version);
  output = output.replace('__MODULE_PATHS__', JSON.stringify(modulePaths, null, 2));
  output = output.replace('__PRESETS__', JSON.stringify(presets, null, 2));
  output = output.replace('__EDIT_MODE_ONLY__', JSON.stringify(editModeOnly, null, 2));
  output = output.replace('__EXPORTS__', generateExports());

  return output;
}

// Write the generated file
const outputPath = path.join(__dirname, '../src/hyperclay.js');
const content = generateLoader();
fs.writeFileSync(outputPath, content, 'utf8');

console.log('✅ Generated minimal hyperclay.js');
console.log(`   Size: ${Math.round(content.length / 1024)}KB`);
