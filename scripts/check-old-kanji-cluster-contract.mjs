import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'tools/OLD_KANJI_CLUSTER.md');
const contract = fs.readFileSync(contractPath, 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const tools = [
  'old-kanji-reference',
  'kanji-modernizer',
  'old-kanji-ocr-scanner',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker',
];

for (const slug of tools) {
  const dir = path.join(root, 'tools', slug);
  check(fs.existsSync(dir), `missing Old Kanji cluster tool: ${slug}`);
  check(fs.existsSync(path.join(dir, 'SPEC.md')), `missing SPEC.md for Old Kanji cluster tool: ${slug}`);
  check(contract.includes(`| ${slug === 'old-kanji-reference' ? 'Old Kanji Reference' : ''}`) || contract.includes(`\`${slug}\``) || contract.includes(slug), `cluster contract does not represent ${slug}`);
}

check(contract.includes('Only **Old Kanji Reference** targets'), 'generic lookup anti-cannibalization rule missing');
check(contract.includes('Only **Kanji Modernizer** targets full-text'), 'conversion anti-cannibalization rule missing');
check(contract.includes('2–4 per tool'), 'bounded related-link contract missing');
check(contract.includes('Do **not** mass-generate thin pages'), 'thin-page prohibition missing');
check(contract.includes('existing Old Kanji Reference CSV/JSON/Markdown/print actions remain Free'), 'existing Free export boundary missing');
check(contract.includes('Amazon is **contextual and optional**'), 'Amazon relevance boundary missing');
check(contract.includes('internal Old Kanji tool handoff clicks'), 'internal-link measurement requirement missing');
check(contract.includes('OFUSE / Ko-fi clicks'), 'support-click measurement requirement missing');
check(contract.includes('must not send user-entered names, addresses, OCR text'), 'analytics payload privacy rule missing');

if (failures.length) {
  console.error(`Old Kanji cluster contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji cluster contract passed.');
