import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function loadConfig(rel, globalName) {
  const sandbox = { window: {} };
  vm.runInNewContext(read(rel), sandbox, { filename: rel });
  return sandbox.window[globalName];
}

const refConfigSource = read('tools/old-kanji-reference/affiliate-config.js');
const refConfig = loadConfig('tools/old-kanji-reference/affiliate-config.js', 'NWOldKanjiReferenceAffiliate');
const refAffiliate = read('tools/old-kanji-reference/affiliate.js');
const refCss = read('tools/old-kanji-reference/amazon-layout.css');
const ocrConfigSource = read('tools/old-kanji-ocr-scanner/affiliate-config.js');
const ocrConfig = loadConfig('tools/old-kanji-ocr-scanner/affiliate-config.js', 'NWOldKanjiOcrAffiliate');
const ocrAffiliate = read('tools/old-kanji-ocr-scanner/affiliate.js');
const ocrCss = read('tools/old-kanji-ocr-scanner/amazon.css');
const contract = read('tools/OLD_KANJI_AMAZON.md');
const clusterAnalytics = read('assets/old-kanji-analytics.js');
const classification = JSON.parse(read('MONETIZATION_CLASSIFICATION.json'));

check(classification.classes?.ADS_DONATION?.includes('old-kanji-reference') === true,
  'Old Kanji Reference must remain ADS_DONATION in canonical monetization SSOT');
check(classification.classes?.HOLD?.includes('old-kanji-ocr-scanner') === true,
  'Old Kanji OCR Scanner must remain HOLD in canonical monetization SSOT');
check(classification.classes?.AFFILIATE?.includes('old-kanji-reference') !== true,
  'Old Kanji Reference must not be in canonical AFFILIATE class');
check(classification.classes?.AFFILIATE?.includes('old-kanji-ocr-scanner') !== true,
  'Old Kanji OCR Scanner must not be in canonical AFFILIATE class');

for (const [label, source, config] of [
  ['Old Kanji Reference', refConfigSource, refConfig],
  ['Old Kanji OCR Scanner', ocrConfigSource, ocrConfig]
]) {
  check(config?.enabled === false, `${label} affiliate config must remain disabled`);
  check(config?.provider === 'disabled', `${label} affiliate provider must remain disabled`);
  check(config?.trackingId === '', `${label} trackingId must remain empty`);
  check(config?.targets && Object.keys(config.targets).length === 0, `${label} affiliate targets must remain empty`);
  check(config?.searches && Object.keys(config.searches).length === 0, `${label} affiliate searches must remain empty`);
  check(!source.includes('amazon.co.jp'), `${label} config must not contain amazon.co.jp destination`);
  check(!source.includes('amzn.to'), `${label} config must not contain amzn.to destination`);
  check(!source.includes('nicheworks09-22'), `${label} config must not contain historical Amazon tracking ID`);
  check(!source.includes('enabled: true'), `${label} config must not contain enabled affiliate state`);
}

// Dormant compatibility wiring may remain, but it must not create its own authority.
check(refAffiliate.includes('placement: "reference_resources"'), 'Reference compatibility placement must remain reference_resources');
check(ocrAffiliate.includes('placement: "ocr_resources"'), 'OCR compatibility placement must remain ocr_resources');
check(ocrAffiliate.includes('placePanelAfterResultActions'), 'OCR compatibility panel placement function missing');
check(ocrAffiliate.includes('document.getElementById("copy-actions")'), 'OCR compatibility panel anchor missing');
check(ocrAffiliate.includes('resultActions.after(panel)'), 'OCR compatibility panel placement missing');
check(refCss.includes('@media (max-width: 720px)') && refCss.includes('grid-template-columns: 1fr'),
  'Reference compatibility mobile one-column rule missing');
check(ocrCss.includes('@media (max-width: 560px)') && ocrCss.includes('grid-template-columns: 1fr'),
  'OCR compatibility mobile one-column rule missing');

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
  check(!html.includes('/assets/amazon-affiliate.js'), `${slug} must not activate Amazon without canonical AFFILIATE classification`);
}

check(!clusterAnalytics.includes('affiliate_click'), 'cluster analytics must not implement legacy affiliate_click');
check(!clusterAnalytics.includes('affiliate_outbound'), 'cluster analytics must not duplicate shared affiliate_outbound');
check(contract.includes('dormant compatibility contract'), 'Old Kanji Amazon contract must declare dormant compatibility status');
check(contract.includes('`old-kanji-reference` as `ADS_DONATION`'), 'Old Kanji Amazon contract must document Reference classification');
check(contract.includes('`old-kanji-ocr-scanner` as `HOLD`'), 'Old Kanji Amazon contract must document OCR classification');
check(contract.includes('`enabled: false`'), 'Old Kanji Amazon contract must document disabled runtime state');
check(contract.includes('No Amazon activation is authorized'), 'Old Kanji Amazon contract must document non-expansion rule');
check(contract.includes('affiliate_outbound'), 'Old Kanji Amazon contract must document shared canonical outbound event boundary');

if (failures.length) {
  console.error(`Old Kanji Amazon dormant contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji Amazon dormant contract passed.');
