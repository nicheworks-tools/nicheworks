import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const analytics = read('assets/old-kanji-analytics.js');
const entitlement = read('assets/nw-pro-entitlement.js');
const modernizer = read('tools/kanji-modernizer/index.html');
const measurement = read('tools/OLD_KANJI_MEASUREMENT.md');

const slugs = [
  'old-kanji-reference',
  'kanji-modernizer',
  'old-kanji-ocr-scanner',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker'
];

for (const slug of slugs) check(analytics.includes(`'${slug}'`), `analytics missing cluster slug ${slug}`);
for (const eventName of ['old_kanji_handoff', 'support_click', 'old_kanji_pro_click']) {
  check(analytics.includes(`'${eventName}'`), `analytics missing event ${eventName}`);
  check(measurement.includes(`\`${eventName}\``), `measurement doc missing event ${eventName}`);
}

check(!analytics.includes('affiliate_click'), 'Old Kanji analytics must not duplicate Amazon affiliate_click');
check(analytics.includes("provider: 'ofuse'") || analytics.includes("return 'ofuse'"), 'OFUSE provider allowlist missing');
check(analytics.includes("return 'ko-fi'"), 'Ko-fi provider allowlist missing');
check(analytics.includes("proCta.matches(':disabled')"), 'disabled Pro guard missing');
check(analytics.includes("getAttribute('aria-disabled') === 'true'"), 'aria-disabled Pro guard missing');
check(analytics.includes("data-okj-pro-state") && analytics.includes("billing-unavailable"), 'billing-unavailable Pro guard missing');

const forbiddenPayloadSources = ['.value', '.textContent', '.innerText', 'localStorage', 'sessionStorage', 'location.search', 'searchParams'];
for (const token of forbiddenPayloadSources) check(!analytics.includes(token), `analytics must not inspect user-derived payload source: ${token}`);

check(entitlement.includes('/assets/old-kanji-analytics.js?v=20260914-1'), 'toolkit pages do not load Old Kanji analytics');
check(modernizer.includes('/assets/old-kanji-analytics.js?v=20260914-1'), 'Kanji Modernizer does not load Old Kanji analytics');

const entitlementPages = [
  'old-kanji-reference',
  'old-kanji-ocr-scanner',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker'
];
for (const slug of entitlementPages) {
  const html = read(`tools/${slug}/index.html`);
  check(html.includes('/assets/nw-pro-entitlement.js'), `${slug} must load entitlement loader for shared analytics`);
}

for (const param of ['source_tool', 'target_tool', 'placement', 'tool', 'provider']) {
  check(analytics.includes(param), `expected coarse analytics parameter missing: ${param}`);
}
for (const forbiddenDoc of ['searched kanji', 'OCR text', 'raw URLs/query strings']) {
  check(measurement.includes(forbiddenDoc), `privacy boundary documentation missing: ${forbiddenDoc}`);
}
check(measurement.includes('affiliate_click'), 'Amazon affiliate_click KPI must remain documented');

if (failures.length) {
  console.error(`Old Kanji measurement contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji measurement contract passed.');
