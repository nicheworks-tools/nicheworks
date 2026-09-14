import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const cluster = [
  'old-kanji-reference',
  'kanji-modernizer',
  'old-kanji-ocr-scanner',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker'
];

const unfinishedSalesPattern = /okj-pro-panel|billing-unavailable|課金未接続|課金導線[^<\n]{0,80}接続されていません|Billing unavailable|Billing is not connected yet|\$4\.99/i;

for (const slug of cluster) {
  const html = read(`tools/${slug}/index.html`);
  check(
    !unfinishedSalesPattern.test(html),
    `${slug}: public landing must not expose unfinished Pro sales UI before verified billing activation`
  );
}

const reference = read('tools/old-kanji-reference/index.html');
check(
  reference.includes('CSV / JSON / Markdown / 印刷は無料'),
  'old-kanji-reference: current Free exports must remain explicitly free'
);

const clusterContract = read('tools/OLD_KANJI_CLUSTER.md');
check(
  clusterContract.includes('must not render a fixed Pro price, disabled purchase CTA, or billing-unavailable sales panel'),
  'Old Kanji cluster contract must document the no-unfinished-sales-UI boundary'
);

if (failures.length) {
  console.error(`Old Kanji Pro boundary contract failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Old Kanji public Pro boundary passed: no unfinished sales UI is exposed across the eight-tool cluster.');
