import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INTRO_FILE = path.join(__dirname, '../llms-txt/intro.md');
const DOCS_API = path.join(__dirname, '../docs/api');
const DOCS_ROOT = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../website/llms.txt');

async function buildLlmsTxt() {
  console.log('📄 Building llms.txt...\n');

  const intro = await fs.readFile(INTRO_FILE, 'utf-8');

  const apiFiles = (await fs.readdir(DOCS_API))
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));

  const rootFiles = (await fs.readdir(DOCS_ROOT))
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));

  const sections = [intro.trim()];

  for (const file of apiFiles) {
    const content = await fs.readFile(path.join(DOCS_API, file), 'utf-8');
    sections.push(content.trim());
  }

  for (const file of rootFiles) {
    const content = await fs.readFile(path.join(DOCS_ROOT, file), 'utf-8');
    sections.push(content.trim());
  }

  const output = sections.join('\n\n---\n\n') + '\n';

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, output);

  const sizeKB = (Buffer.byteLength(output) / 1024).toFixed(1);
  console.log(`✓ Wrote ${OUTPUT_FILE}`);
  console.log(`  ${apiFiles.length} API docs + ${rootFiles.length} guide docs`);
  console.log(`  ${sizeKB} KB total\n`);
}

buildLlmsTxt().catch(err => {
  console.error('❌ build-llms-txt failed:', err);
  process.exit(1);
});
