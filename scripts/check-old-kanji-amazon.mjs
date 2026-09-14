import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const refConfig = read('tools/old-kanji-reference/affiliate-config.js');
const refAffiliate = read('tools/old-kanji-reference/affiliate.js');
const refCss = read('tools/old-kanji-reference/amazon-layout.css');
const ocrConfig = read('tools/old-kanji-ocr-scanner/affiliate-config.js');
const ocrAffiliate = read('tools/old-kanji-ocr-scanner/affiliate.js');
const ocrCss = read('tools/old-kanji-ocr-scanner/amazon.css');
const contract = read('tools/OLD_KANJI_AMAZON.md');
const clusterAnalytics = read('assets/old-kanji-analytics.js');

for (const file of [refConfig, ocrConfig]) {
  check(file.includes('nicheworks09-22'), 'Old Kanji Amazon config must use nicheworks09-22');
  check(file.includes('https://www.amazon.co.jp/s'), 'Old Kanji Amazon config must use Amazon.co.jp search base');
  check(file.includes('enabled: true'), 'Old Kanji Amazon config must remain active');
}

for (const term of ['旧字体 異体字 辞典', '古文書 ルーペ', '書見台 ブックスタンド']) {
  check(refConfig.includes(term), `Reference Amazon fixed search missing: ${term}`);
}
for (const term of ['ブックスキャナー 非破壊', '古文書 ルーペ']) {
  check(ocrConfig.includes(term), `OCR Amazon fixed search missing: ${term}`);
}

check(refAffiliate.includes('placement: "reference_resources"'), 'Reference Amazon placement must remain reference_resources');
check(ocrAffiliate.includes('placement: "ocr_resources"'), 'OCR Amazon placement must remain ocr_resources');
check(ocrAffiliate.includes('placePanelAfterResultActions'), 'OCR Amazon panel placement function missing');
check(ocrAffiliate.includes('document.getElementById("copy-actions")'), 'OCR Amazon panel must anchor after result/copy actions');
check(ocrAffiliate.includes('resultActions.after(panel)'), 'OCR Amazon panel must move immediately after result actions');
check(refAffiliate.includes('必要な場合だけ') && ocrAffiliate.includes('必要な場合だけ'), 'Amazon resource copy must state optional/need-based use');

check(refCss.includes('@media (max-width: 720px)') && refCss.includes('grid-template-columns: 1fr'), 'Reference Amazon mobile one-column rule missing');
check(ocrCss.includes('@media (max-width: 560px)') && ocrCss.includes('grid-template-columns: 1fr'), 'OCR Amazon mobile one-column rule missing');

const inactive = [
  'kanji-modernizer',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker'
];
for (const slug of inactive) {
  const html = read(`tools/${slug}/index.html`);
  check(!html.includes('/assets/amazon-affiliate.js'), `${slug} must not activate Amazon without a separate relevance case`);
}

check(!clusterAnalytics.includes('affiliate_click'), 'cluster analytics must not duplicate affiliate_click');
check(contract.includes('affiliate_click'), 'Old Kanji Amazon contract must document affiliate_click');
check(contract.includes('tool`, `affiliate`, `target`, and `placement'), 'Old Kanji Amazon contract must document coarse event parameters');
check(contract.includes('No Amazon activation is added'), 'Old Kanji Amazon non-expansion rule missing');

if (failures.length) {
  console.error(`Old Kanji Amazon contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji Amazon contract passed.');
