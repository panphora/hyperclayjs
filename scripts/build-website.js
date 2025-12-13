import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const WEBSITE_DIST = path.join(ROOT_DIR, 'website', 'dist');

// Folders to copy to website/dist
const FOLDERS_TO_COPY = [
  'core',
  'custom-attributes',
  'ui',
  'utilities',
  'dom-utilities',
  'string-utilities',
  'communication',
  'vendor'
];

// Files to copy to website/dist
const FILES_TO_COPY = [
  'hyperclay.js',
  'module-dependency-graph.json'
];

async function main() {
  console.log('Building website/dist...');

  // Clean website/dist
  if (fs.existsSync(WEBSITE_DIST)) {
    fs.rmSync(WEBSITE_DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(WEBSITE_DIST, { recursive: true });

  // Copy folders
  for (const folder of FOLDERS_TO_COPY) {
    const src = path.join(ROOT_DIR, folder);
    const dest = path.join(WEBSITE_DIST, folder);

    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`  Copied ${folder}/`);
    } else {
      console.warn(`  Warning: ${folder}/ not found`);
    }
  }

  // Copy files
  for (const file of FILES_TO_COPY) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(WEBSITE_DIST, file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  Copied ${file}`);
    } else {
      console.warn(`  Warning: ${file} not found`);
    }
  }

  console.log('Done! website/dist is ready.');
}

main().catch(console.error);
