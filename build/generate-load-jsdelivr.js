#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

/**
 * Update HTML files with current package version
 */
function generateLoadJsdelivr() {
  console.log('📝 Updating website HTML files with version...');

  // Read package.json for version
  const packagePath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const version = packageJson.version;

  // Files to update
  const filesToUpdate = ['load-jsdelivr.html', 'config.html'];

  for (const filename of filesToUpdate) {
    const htmlPath = path.join(ROOT_DIR, 'website', filename);
    if (!fs.existsSync(htmlPath)) {
      console.log(`⚠️  Skipping ${filename} (not found)`);
      continue;
    }

    let html = fs.readFileSync(htmlPath, 'utf-8');

    // Replace version in jsdelivr URLs (handles both versioned URLs and __VERSION__ placeholder)
    html = html.replace(
      /https:\/\/cdn\.jsdelivr\.net\/npm\/hyperclayjs@[\d.]+\/src/g,
      `https://cdn.jsdelivr.net/npm/hyperclayjs@${version}/src`
    );
    html = html.replace(/__VERSION__/g, version);

    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`✅ Updated ${filename} with version ${version}`);
  }
}

// Run the generator
try {
  generateLoadJsdelivr();
} catch (error) {
  console.error('❌ Error generating load-jsdelivr.html:', error);
  process.exit(1);
}
