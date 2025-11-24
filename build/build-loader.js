/**
 * Build script to generate hyperclay.js from module-dependency-graph.json
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
const depGraphPath = path.join(__dirname, '../module-dependency-graph.json');
const depGraph = JSON.parse(fs.readFileSync(depGraphPath, 'utf8'));

// Read template
const templatePath = path.join(__dirname, 'hyperclay.template.js');
const template = fs.readFileSync(templatePath, 'utf8');

// Generate ES module export lines from module exports definitions
function generateExports() {
  const modules = depGraph.modules || {};
  const exportLines = [];
  const seenExports = new Set();

  for (const [moduleId, module] of Object.entries(modules)) {
    if (!module.exports) continue;

    for (const exportName of Object.keys(module.exports)) {
      // Skip duplicates - first module wins
      if (seenExports.has(exportName)) continue;
      seenExports.add(exportName);

      // Use optional chaining since module may not be loaded
      // Try named export first, fall back to default
      exportLines.push(`export const ${exportName} = window.hyperclayModules['${moduleId}']?.${exportName} ?? window.hyperclayModules['${moduleId}']?.default;`);
    }
  }

  return exportLines.join('\n');
}

// Generate the loader
function generateLoader() {
  const modulePaths = depGraph.modulePaths || {};
  const presets = depGraph.presets;

  let output = template;
  output = output.replace('__VERSION__', version);
  output = output.replace('__MODULE_PATHS__', JSON.stringify(modulePaths, null, 2));
  output = output.replace('__PRESETS__', JSON.stringify(presets, null, 2));
  output = output.replace('__EXPORTS__', generateExports());

  return output;
}

// Write the generated file
const outputPath = path.join(__dirname, '../hyperclay.js');
const content = generateLoader();
fs.writeFileSync(outputPath, content, 'utf8');

console.log('✅ Generated minimal hyperclay.js');
console.log(`   Size: ${Math.round(content.length / 1024)}KB`);
