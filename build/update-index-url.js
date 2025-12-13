#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

/**
 * Update index.html with current package version in the copyable URL
 */
function updateIndexUrl() {
  console.log('📝 Updating index.html CDN URL...');

  // Read package.json for version
  const packagePath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const version = packageJson.version;

  // Read the HTML file
  const htmlPath = path.join(ROOT_DIR, 'website', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Update the base URL in the generateURL function
  const cdnUrl = `https://cdn.jsdelivr.net/npm/hyperclayjs@${version}/src/hyperclay.js`;
  html = html.replace(
    /const baseURL = ['"]https:\/\/[^'"]+['"]/,
    `const baseURL = '${cdnUrl}'`
  );

  // Write it back
  fs.writeFileSync(htmlPath, html, 'utf-8');

  console.log(`✅ Updated index.html with CDN URL: ${cdnUrl}`);
}

// Run the update
try {
  updateIndexUrl();
} catch (error) {
  console.error('❌ Error updating index.html:', error);
  process.exit(1);
}
