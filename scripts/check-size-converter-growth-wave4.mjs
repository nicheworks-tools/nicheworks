import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const check = (condition, message) => { if (!condition) failures.push(message); };
const has = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (exists(rel)) check(read(rel).includes(needle), `${rel}: missing ${label}`);
};
const lacks = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (exists(rel)) check(!read(rel).includes(needle), `${rel}: forbidden ${label}`);
};

const index = 'tools/size-converter/index.html';
const app = 'tools/size-converter/app.js';
const spec = 'tools/size-converter/SPEC.md';
const basis = 'tools/size-converter/data-basis.md';
const ukEval = 'tools/size-converter/uk-evaluation.md';
const behavior = 'tools/size-converter/tests/behavior.test.mjs';
const affiliate = 'tools/size-converter/affiliate-config.js';
const canonical = 'docs/tools/size-converter.md';

// PR16: search-visible representative answers stay crawlable and grounded in current DATA.
has(index, 'よく確認される代表換算', 'static representative conversion section');
has(index, 'US 4 → JP 22.0 / EU 36', 'men shoes US 4 static answer');
has(index, 'US 4 → JP 21.0 / EU 34', 'women shoes US 4 static answer');
has(index, 'US 8.5 → JP 26.5 / EU 42', 'men shoes US 8.5 static answer');
has(index, 'US 8.5 → JP 25.5 / EU 40', 'women shoes US 8.5 static answer');
has(index, 'JP M / US M / EU 48', 'men clothing M static answer');
has(index, 'US 4 → JP S / EU 34–36', 'women clothing US 4 static answer');
has(index, 'not a universal cross-brand JP/US/EU standard', 'non-universal sizing warning');

// PR17: provenance/source audit remains explicit and does not promote one brand to a generic standard.
has(basis, 'representative crosswalk for orientation', 'representative data classification');
has(basis, 'https://www.adidas.com/us/help/size_charts/shoes', 'adidas official footwear source');
has(basis, 'https://www.asics.com/nz/en-nz/japan-s-unisex-1203a615-109', 'ASICS official footwear source');
has(basis, 'https://www.newbalance.com/size-guide.html', 'New Balance official footwear source');
has(basis, 'Never describe the bundled table as an ISO/JIS/US/EU universal conversion standard', 'anti-universal maintenance rule');
has(spec, 'Data basis and provenance contract');
has(canonical, 'representative', 'canonical representative-data classification');

// PR18: UK is a verified deferral, not a hidden fixed offset or generic runtime column.
has(ukEval, 'Decision: **defer generic UK runtime conversion**', 'UK verified-deferred decision');
has(ukEval, 'US 4: adidas/New Balance UK 3.5 vs ASICS UK 3', 'UK US4 disagreement');
has(ukEval, 'US 8.5: adidas/New Balance UK 8 vs ASICS UK 7.5', 'UK US8.5 disagreement');
has(ukEval, 'Do **not** add a generic UK column', 'no generic UK runtime decision');
has(spec, 'UK generic conversion is **verified-deferred**', 'spec UK verified-deferred boundary');
has(index, '現在は汎用UK換算を表示していません', 'user-facing UK support boundary');
lacks(index, 'value="uk"', 'UK source-system selector');
if (exists(app)) check(!/\buk\s*:/i.test(read(app)), `${app}: generic UK DATA field introduced while verified-deferred`);

// Production behavior test must lock the representative examples to production DATA.
has(behavior, 'men shoes US 4 reference row should match the static representative answer');
has(behavior, 'women shoes US 8.5 reference row should match the static representative answer');
has(behavior, 'generic UK runtime field must remain absent while verified-deferred');

// Amazon remains ready-but-inert until separate verified activation.
has(affiliate, 'enabled: false', 'disabled Amazon config');
has(affiliate, 'shoes: ""', 'empty shoes target');
has(affiliate, 'clothing: ""', 'empty clothing target');
lacks(affiliate, 'https://', 'live affiliate URL before activation');

if (failures.length) {
  console.error(`Size Converter growth-wave 4 contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  tool: 'size-converter',
  wave4: ['static-search-answers', 'data-basis-audit', 'uk-verified-deferral', 'production-data-behavior-lock'],
  amazon_enabled: false
}, null, 2));
