import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (slug) => fs.readFileSync(path.join(root, 'tools', slug, 'index.html'), 'utf8');

const contracts = [
  {
    slug: 'old-kanji-reference', marker: 'class="nw-links"', expectedCount: 4,
    required: ['/tools/kanji-modernizer/', '/tools/old-kanji-ocr-scanner/', '/tools/unicode-kanji-checker/', '/tools/variant-kanji-compare/']
  },
  {
    slug: 'kanji-modernizer', marker: 'class="nw-links"', expectedCount: 3,
    required: ['/tools/old-kanji-reference/', '/tools/old-document-kanji-highlighter/', '/tools/unicode-kanji-checker/']
  },
  {
    slug: 'old-kanji-ocr-scanner', marker: 'class="related-links"', expectedCount: 3,
    required: ['../old-kanji-reference/', '../old-document-kanji-highlighter/', '../kanji-modernizer/']
  },
  {
    slug: 'old-document-kanji-highlighter', marker: 'class="reference-links"', expectedCount: 3,
    required: ['../old-kanji-reference/', '../kanji-modernizer/', '../old-kanji-ocr-scanner/']
  },
  {
    slug: 'unicode-kanji-checker', marker: 'class="reference-links"', expectedCount: 3,
    required: ['../variant-kanji-compare/', '../old-kanji-reference/', '../kanji-modernizer/']
  },
  {
    slug: 'variant-kanji-compare', marker: 'class="reference-links"', expectedCount: 3,
    required: ['../unicode-kanji-checker/', '../old-kanji-reference/', '../name-old-kanji-checker/']
  },
  {
    slug: 'place-old-kanji-checker', marker: 'class="nw-links"', expectedCount: 3,
    required: ['../old-kanji-reference/', '../kanji-modernizer/', '../name-old-kanji-checker/']
  },
  {
    slug: 'name-old-kanji-checker', marker: 'class="reference-links related-links"', expectedCount: 3,
    required: ['../old-kanji-reference/', '../variant-kanji-compare/', '../unicode-kanji-checker/']
  },
];

function blockAfterMarker(html, marker) {
  const start = html.indexOf(marker);
  if (start < 0) return '';
  const open = html.lastIndexOf('<', start);
  const tagMatch = html.slice(open).match(/^<(div|section|footer)\b/);
  if (!tagMatch) return '';
  const tag = tagMatch[1];
  const end = html.indexOf(`</${tag}>`, start);
  return end < 0 ? '' : html.slice(open, end + tag.length + 3);
}

for (const contract of contracts) {
  const html = read(contract.slug);
  const block = blockAfterMarker(html, contract.marker);
  check(Boolean(block), `${contract.slug}: related-link block not found`);
  if (!block) continue;
  for (const target of contract.required) {
    check(block.includes(target), `${contract.slug}: missing required handoff ${target}`);
  }
  const count = (block.match(/<a\b/g) || []).length;
  check(count >= 2 && count <= 4, `${contract.slug}: handoff block must contain 2–4 links, found ${count}`);
  check(count === contract.expectedCount, `${contract.slug}: expected ${contract.expectedCount} handoff links, found ${count}`);
}

const ocr = read('old-kanji-ocr-scanner');
check(!blockAfterMarker(ocr, 'class="related-links"').includes('../unicode-kanji-checker/'), 'OCR primary handoffs must not include Unicode directly');
check(!blockAfterMarker(ocr, 'class="related-links"').includes('../variant-kanji-compare/'), 'OCR primary handoffs must not include Variant Compare directly');
const highlighter = read('old-document-kanji-highlighter');
check(!blockAfterMarker(highlighter, 'class="reference-links"').includes('../place-old-kanji-checker/'), 'Highlighter primary handoffs must not include Place Checker');
const place = read('place-old-kanji-checker');
check(!blockAfterMarker(place, 'class="nw-links"').includes('../old-document-kanji-highlighter/'), 'Place primary handoffs must not include Document Highlighter');

if (failures.length) {
  console.error(`Old Kanji internal handoff contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji internal handoff contract passed.');
