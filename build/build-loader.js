/**
 * Build script to generate hyperclay.js from module-dependency-graph.json
 * This ensures the loader always matches the actual module structure
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

// Build module dependencies object from dependency graph
function buildModuleDependencies() {
  const moduleDeps = {};

  for (const [moduleName, moduleData] of Object.entries(depGraph.modules)) {
    // Get the primary file for this module (first file in the list)
    const primaryFile = moduleData.files[0];

    // Get dependencies from rawDependencies
    const deps = new Set();

    // For each file in this module, get its dependencies
    moduleData.files.forEach(file => {
      const fileDeps = depGraph.rawDependencies[file] || [];
      fileDeps.forEach(depFile => {
        // Find which module this dependency file belongs to
        for (const [depModuleName, depModuleData] of Object.entries(depGraph.modules)) {
          if (depModuleData.files.includes(depFile) && depModuleName !== moduleName) {
            deps.add(depModuleName);
          }
        }
      });
    });

    moduleDeps[moduleName] = {
      path: `./${primaryFile}`,
      dependencies: Array.from(deps),
      exports: moduleData.exports || {}
    };
  }

  return moduleDeps;
}

// Build presets object
function buildPresets() {
  return depGraph.presets;
}

// Build file sizes lookup
function buildFileSizes() {
  const sizes = {};

  for (const [moduleName, moduleData] of Object.entries(depGraph.modules)) {
    sizes[moduleName] = moduleData.size;
  }

  return sizes;
}

// Generate the loader
function generateLoader() {
  const moduleDependencies = buildModuleDependencies();
  const presets = buildPresets();
  const fileSizes = buildFileSizes();

  // Convert to formatted JSON strings
  const moduleDepsStr = JSON.stringify(moduleDependencies, null, 2);
  const presetsStr = JSON.stringify(presets, null, 2);
  const fileSizesStr = JSON.stringify(fileSizes, null, 2);

  // Replace placeholders in template
  let output = template;
  output = output.replace('__VERSION__', version);
  output = output.replace('__MODULE_DEPENDENCIES__', moduleDepsStr);
  output = output.replace('__PRESETS__', presetsStr);
  output = output.replace('__FILE_SIZES__', fileSizesStr);

  return output;
}

// Write the generated file
function writeLoader() {
  const outputPath = path.join(__dirname, '../hyperclay.js');
  const content = generateLoader();

  fs.writeFileSync(outputPath, content, 'utf8');

  console.log('✅ Generated hyperclay.js from module-dependency-graph.json');

  // Show stats
  const moduleCount = Object.keys(depGraph.modules).length;
  const presetCount = Object.keys(depGraph.presets).length;

  console.log(`   - ${moduleCount} modules`);
  console.log(`   - ${presetCount} presets`);
  console.log(`   - ${Math.round(content.length / 1024)} KB output file`);
}

// Run the build
try {
  writeLoader();
} catch (error) {
  console.error('❌ Failed to generate hyperclay.js:', error);
  process.exit(1);
}
