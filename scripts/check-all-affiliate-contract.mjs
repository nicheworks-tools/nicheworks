import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const check = (condition, message) => { if (!condition) failures.push(message); };
const TRACKING_ID = 'nicheworks09-22';

const expectedAffiliate = [
  'construction-tools-atlas',
  'cosmetic-ingredient-checker-lite',
  'dry-meter',
  'inci-fastscan',
  'laundry-code-decode',
  'light-check',
  'manual-finder',
  'kanji-modernizer',
  'name-old-kanji-checker',
  'old-document-kanji-highlighter',
  'old-kanji-ocr-scanner',
  'old-kanji-reference',
  'place-old-kanji-checker',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'moving-checklist-generator',
  'moving-lease-final-check',
  'pattern-dictionary',
  'phone-quickcheck',
  'trashnavi'
];

const classification = json('MONETIZATION_CLASSIFICATION.json');
const actualAffiliate = [...(classification.classes?.AFFILIATE || [])].sort();
check(JSON.stringify(actualAffiliate) === JSON.stringify([...expectedAffiliate].sort()),
  `canonical AFFILIATE set mismatch: expected ${expectedAffiliate.length}, got ${actualAffiliate.length}`);

const helper = read('assets/amazon-affiliate.js');
for (const needle of [
  '"affiliate_outbound"',
  'tool_slug:',
  'affiliate_id:',
  'placement,',
  'merchant:',
  'destination_key:',
  'language:'
]) {
  check(helper.includes(needle), `shared Amazon helper missing canonical outbound contract: ${needle}`);
}

function validateTaggedUrl(raw, label) {
  try {
    const url = new URL(raw);
    check(url.protocol === 'https:', `${label}: Amazon URL must be HTTPS`);
    check(url.hostname === 'www.amazon.co.jp' || url.hostname === 'amazon.co.jp', `${label}: Amazon URL must use amazon.co.jp`);
    check(url.pathname === '/s', `${label}: Amazon URL must use search path /s`);
    check(Boolean(url.searchParams.get('k')), `${label}: Amazon search query missing`);
    check(url.searchParams.get('tag') === TRACKING_ID, `${label}: tracking tag mismatch`);
  } catch {
    check(false, `${label}: invalid Amazon URL`);
  }
}

const fiveStatic = ['dry-meter','light-check','laundry-code-decode','moving-checklist-generator','moving-lease-final-check'];
for (const slug of fiveStatic) {
  const html = read(`tools/${slug}/index.html`);
  for (const needle of ['/assets/amazon-affiliate.js','./affiliate-config.js','/assets/amazon-static-offers.js','id="nwAmazonAffiliate"']) {
    check(html.includes(needle), `${slug}: missing static affiliate wiring ${needle}`);
  }
}

for (const slug of ['manual-finder','phone-quickcheck']) {
  const html = read(`tools/${slug}/index.html`);
  const runtime = read(`tools/${slug}/affiliate-runtime.js`);
  const config = read(`tools/${slug}/affiliate-config.js`);
  check(html.includes('/assets/amazon-affiliate.js'), `${slug}: shared Amazon helper missing`);
  check(html.includes('./affiliate-config.js'), `${slug}: affiliate config wiring missing`);
  check(html.includes('./affiliate-runtime.js'), `${slug}: affiliate runtime wiring missing`);
  check(config.includes(TRACKING_ID), `${slug}: tracking ID missing`);
  check(runtime.includes('NWAmazonAffiliate'), `${slug}: runtime must use shared helper`);
  check(runtime.includes('placement:') || runtime.includes('placement,'), `${slug}: runtime placement metadata missing`);
  check(!runtime.includes('gtag("event"') && !runtime.includes("gtag('event'"), `${slug}: runtime must not bypass shared outbound analytics`);
}


const oldKanjiAffiliate = [
  'old-kanji-reference',
  'kanji-modernizer',
  'old-kanji-ocr-scanner',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker'
];
const oldKanjiContext = read('assets/old-kanji-amazon-context.js');
check(oldKanjiContext.includes(TRACKING_ID), 'Old Kanji: tracking ID missing from contextual catalog');
check(oldKanjiContext.includes('https://www.amazon.co.jp/s'), 'Old Kanji: Amazon Japan fixed-search base missing');
check(!oldKanjiContext.includes('location.search'), 'Old Kanji: page query string must not enter affiliate runtime');
check(!oldKanjiContext.includes('localStorage'), 'Old Kanji: local storage must not enter affiliate runtime');
for (const slug of oldKanjiAffiliate) {
  const html = read(`tools/${slug}/index.html`);
  check(html.includes('/assets/amazon-affiliate.js'), `${slug}: shared Amazon helper missing`);
  check(html.includes('/assets/old-kanji-amazon-context.js'), `${slug}: Old Kanji contextual affiliate runtime missing`);
  check(oldKanjiContext.includes(`"${slug}"`), `${slug}: contextual offer catalog entry missing`);
}

const patternConfig = json('tools/pattern-dictionary/data/affiliate-config.json');
check(patternConfig.tracking_id === TRACKING_ID, 'pattern-dictionary: tracking ID mismatch');
check(patternConfig.policy?.free_text_forwarding === false, 'pattern-dictionary: free-text forwarding must remain disabled');
for (const offer of patternConfig.offers || []) {
  if (offer.status !== 'active') continue;
  validateTaggedUrl(offer.amazon_url, `pattern-dictionary:${offer.offer_id || offer.pattern_id || 'offer'}`);
}
const patternRuntime = read('tools/pattern-dictionary/app.js');
check(patternRuntime.includes('/assets/amazon-affiliate.js'), 'pattern-dictionary: shared helper loader missing');
check(patternRuntime.includes("helper.configure({enabled:true,tool:'pattern-dictionary',targets})"), 'pattern-dictionary: shared helper configuration missing');
check(!patternRuntime.includes('gtag("event"') && !patternRuntime.includes("gtag('event'"), 'pattern-dictionary: runtime must not bypass shared outbound analytics');

const trashConfig = read('tools/trashnavi/affiliate-config.js');
const trashRuntime = read('tools/trashnavi/affiliate-runtime.js');
const trashGenerator = read('tools/trashnavi/scripts/generate-municipality-pages.mjs');
check(trashConfig.includes(TRACKING_ID), 'trashnavi: tracking ID missing');
check((trashConfig.match(/tag=nicheworks09-22/g) || []).length === 4, 'trashnavi: expected four fixed tagged searches');
check(trashRuntime.includes('NWAmazonAffiliate'), 'trashnavi: runtime must use shared helper');
for (const needle of ['/assets/amazon-affiliate.js','affiliate-config.js','affiliate-runtime.js','trashnaviAmazonAffiliate']) {
  check(trashGenerator.includes(needle), `trashnavi: municipality generator missing affiliate wiring ${needle}`);
}
check(!trashRuntime.includes('gtag("event"') && !trashRuntime.includes("gtag('event'"), 'trashnavi: runtime must not bypass shared outbound analytics');

const construction = json('tools/construction-tools-atlas/data/affiliate-offers-v2.3.json');
check(construction.tracking_id === TRACKING_ID, 'construction-tools-atlas: tracking ID mismatch');
check(construction.policy?.free_text_forwarding === false, 'construction-tools-atlas: free-text forwarding must remain disabled');
for (const offer of construction.offers || []) {
  if (offer.status !== 'active') continue;
  validateTaggedUrl(offer.amazon_url, `construction-tools-atlas:${offer.entry_id || offer.offer_id || 'offer'}`);
}
const constructionHtml = read('tools/construction-tools-atlas/index.html');
const constructionRuntime = read('tools/construction-tools-atlas/app.runtime.js');
check(constructionHtml.includes('/assets/amazon-affiliate.js'), 'construction-tools-atlas: shared helper missing');
check(constructionRuntime.includes('NWAmazonAffiliate'), 'construction-tools-atlas: runtime must use shared helper');
check(constructionRuntime.includes('affiliate-offers-v2.3.json'), 'construction-tools-atlas: maintained affiliate data load missing');
check(!constructionRuntime.includes('gtag("event"') && !constructionRuntime.includes("gtag('event'"), 'construction-tools-atlas: runtime must not bypass shared outbound analytics');

const cosmeticsConfig = read('tools/_shared/cosmetics-affiliate-config.js');
const cosmeticsSlot = read('tools/_shared/cosmetics-affiliate-slot.js');
check(cosmeticsConfig.includes(`const ASSOCIATE_TAG = "${TRACKING_ID}"`), 'cosmetics: tracking ID missing');
check((cosmeticsConfig.match(/tag=nicheworks09-22/g) || []).length === 7, 'cosmetics: every fixed category must carry maintained tag');
check(cosmeticsSlot.includes('"affiliate_outbound"'), 'cosmetics: canonical affiliate_outbound event missing');
check(!cosmeticsSlot.includes('"affiliate_click"'), 'cosmetics: legacy affiliate_click must not return');
for (const needle of ['tool_slug:','affiliate_id:','placement:','merchant:','destination_key:','language:']) {
  check(cosmeticsSlot.includes(needle), `cosmetics: outbound metadata missing ${needle}`);
}
for (const slug of ['cosmetic-ingredient-checker-lite','inci-fastscan']) {
  const html = read(`tools/${slug}/index.html`);
  check(html.includes('id="amazonAffiliateSlot"'), `${slug}: affiliate slot missing`);
  check(html.includes('data-affiliate-placement="after-results"'), `${slug}: affiliate placement must remain after-results`);
  check(html.includes('data-affiliate-state="inactive"'), `${slug}: affiliate HTML must fail closed`);
}

for (const slug of expectedAffiliate) {
  const spec = read(`tools/${slug}/SPEC.md`);
  check(/affiliate/i.test(spec), `${slug}: SPEC must retain affiliate contract`);
}

if (failures.length) {
  console.error(`All-affiliate contract audit failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS: ${expectedAffiliate.length} canonical AFFILIATE tools retain Amazon tag, safe destination isolation, disclosure/runtime wiring, and canonical affiliate_outbound click measurement.`);
