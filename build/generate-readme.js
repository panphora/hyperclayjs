#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

/**
 * Generate README.md from template and module-dependency-graph.generated.json
 */
async function generateReadme() {
  console.log('📝 Generating README.md...');

  // Read template
  const templatePath = path.join(__dirname, 'README.template.md');
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Read module dependency graph
  const graphPath = path.join(ROOT_DIR, 'module-dependency-graph.generated.json');
  const graph = JSON.parse(fs.readFileSync(graphPath, 'utf-8'));

  // Generate module tables by category
  const moduleTables = generateModuleTables(graph);

  // Generate preset descriptions
  const presetDescriptions = generatePresetDescriptions(graph);

  // Replace placeholders
  let readme = template;
  readme = readme.replace('{{MODULE_TABLES}}', moduleTables);
  readme = readme.replace('{{PRESET_DESCRIPTIONS}}', presetDescriptions);

  // Write README.md
  const readmePath = path.join(ROOT_DIR, 'README.md');
  fs.writeFileSync(readmePath, readme);

  console.log('✅ Generated README.md');
}

/**
 * Generate module tables grouped by category
 */
function generateModuleTables(graph) {
  const { modules, categories } = graph;
  let output = '';

  // Sort categories by a preferred order
  const categoryOrder = [
    'core',
    'custom-attributes',
    'ui',
    'utilities',
    'dom-utilities',
    'string-utilities',
    'communication',
    'vendor'
  ];

  for (const categoryId of categoryOrder) {
    const category = categories[categoryId];
    if (!category || category.modules.length === 0) continue;

    // Category header
    output += `### ${category.name} (${category.description})\n\n`;
    output += '| Module | Size | Description |\n';
    output += '|--------|------|-------------|\n';

    // Sort modules by name for consistency
    const sortedModules = category.modules
      .map(moduleId => ({ id: moduleId, ...modules[moduleId] }))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const module of sortedModules) {
      const size = formatSize(module.size);
      output += `| ${module.name} | ${size} | ${module.description} |\n`;
    }

    output += '\n';
  }

  return output.trim();
}

/**
 * Generate preset descriptions
 */
function generatePresetDescriptions(graph) {
  const { presets, modules } = graph;
  let output = '';

  // Define preset order
  const presetOrder = ['minimal', 'standard', 'everything'];

  for (const presetId of presetOrder) {
    const preset = presets[presetId];
    if (!preset) continue;

    // Calculate total size
    const totalSize = preset.modules.reduce((sum, moduleId) => {
      return sum + (modules[moduleId]?.size || 0);
    }, 0);

    // Preset header
    output += `### ${preset.name} (~${formatSize(totalSize)})\n`;
    output += `${preset.description}\n\n`;

    // Module list
    if (presetId === 'everything') {
      output += 'Includes all available modules across all categories.\n';
    } else {
      const moduleNames = preset.modules.map(id => `\`${id}\``).join(', ');
      output += `**Modules:** ${moduleNames}\n`;
    }

    output += '\n';
  }

  return output.trim();
}

/**
 * Format size in KB
 */
function formatSize(sizeInKB) {
  if (sizeInKB >= 1000) {
    return `${Math.round(sizeInKB / 10) / 100}MB`;
  }
  // Round to 1 decimal place to avoid floating point precision issues
  return `${Math.round(sizeInKB * 10) / 10}KB`;
}

// Run the generator
generateReadme().catch(error => {
  console.error('❌ Error generating README:', error);
  process.exit(1);
});
