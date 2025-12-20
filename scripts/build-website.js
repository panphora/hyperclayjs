import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
const WEBSITE_DIR = path.join(ROOT_DIR, 'website');
const WEBSITE_DIST = path.join(WEBSITE_DIR, 'dist');

// Folders to copy to website/dist (from src/)
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
const SRC_FILES_TO_COPY = [
  'hyperclay.js',
  'module-dependency-graph.json'
];

const ROOT_FILES_TO_COPY = [];

// Build files to copy to website/ (not dist/)
const BUILD_FILES_TO_COPY = [];

async function main() {
  console.log('Building website/dist...');

  // Clean website/dist
  if (fs.existsSync(WEBSITE_DIST)) {
    fs.rmSync(WEBSITE_DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(WEBSITE_DIST, { recursive: true });

  // Copy folders from src/
  for (const folder of FOLDERS_TO_COPY) {
    const src = path.join(SRC_DIR, folder);
    const dest = path.join(WEBSITE_DIST, folder);

    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`  Copied src/${folder}/`);
    } else {
      console.warn(`  Warning: src/${folder}/ not found`);
    }
  }

  // Copy files from src/
  for (const file of SRC_FILES_TO_COPY) {
    const src = path.join(SRC_DIR, file);
    const dest = path.join(WEBSITE_DIST, file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  Copied src/${file}`);
    } else {
      console.warn(`  Warning: src/${file} not found`);
    }
  }

  // Copy files from root
  for (const file of ROOT_FILES_TO_COPY) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(WEBSITE_DIST, file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  Copied ${file}`);
    } else {
      console.warn(`  Warning: ${file} not found`);
    }
  }

  // Copy build files to website/
  for (const file of BUILD_FILES_TO_COPY) {
    const src = path.join(BUILD_DIR, file);
    const dest = path.join(WEBSITE_DIR, file);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  Copied build/${file} to website/`);
    } else {
      console.warn(`  Warning: build/${file} not found`);
    }
  }

  console.log('Done! website/dist is ready.');
}

main().catch(console.error);
