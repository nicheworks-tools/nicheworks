import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const dataDir = path.join(root, 'data');
const manifest = JSON.parse(fs.readFileSync(path.join(dataDir, 'quality-manifest.json'), 'utf8'));
const files = [
  ...(manifest.base || []),
  ...(manifest.packs || []).map((item) => typeof item === 'string' ? item : item.path),
].map((value) => value.replace(/^\.\/data\//, ''));

const repairs = [
  [/("summary_en":"(?:\\.|[^"\\])*")\},"detail_ja"/g, '$1,"detail_ja"'],
  [/("detail_en":"(?:\\.|[^"\\])*")\},"bullets_ja"/g, '$1,"bullets_ja"'],
];

const changed = [];
for (const name of files) {
  const file = path.join(dataDir, name);
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [pattern, replacement] of repairs) {
    after = after.replace(pattern, replacement);
  }
  JSON.parse(after);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed.push(name);
  }
}

console.log(`Repaired ${changed.length} quality JSON file(s): ${changed.join(', ') || 'none'}`);
