import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

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

const expectedOffers = {
  'old-kanji-reference': ['itaiji_world', 'kuzushiji_examples', 'japanese_notation'],
  'kanji-modernizer': ['japanese_notation', 'itaiji_world', 'kanjigen'],
  'old-kanji-ocr-scanner': ['czur_et24', 'book_scanner', 'magnifier'],
  'old-document-kanji-highlighter': ['kuzushiji_examples', 'komonjo_dictionary', 'book_stand'],
  'unicode-kanji-checker': ['charcode_guide', 'japanese_design', 'unicode_reference'],
  'variant-kanji-compare': ['itaiji_world', 'name_kanji_2026', 'glyph_reference'],
  'place-old-kanji-checker': ['kadokawa_place', 'historical_place', 'old_maps'],
  'name-old-kanji-checker': ['name_kanji_2026', 'name_etymology', 'itaiji_world']
};

const helper = read('assets/amazon-affiliate.js');
const contextSource = read('assets/old-kanji-amazon-context.js');
const contract = read('tools/OLD_KANJI_AMAZON.md');
const analytics = read('assets/old-kanji-analytics.js');
const classification = JSON.parse(read('MONETIZATION_CLASSIFICATION.json'));

check(helper.includes('affiliate_outbound'), 'shared Amazon helper must emit canonical affiliate_outbound');
check(helper.includes('sponsored noopener'), 'shared Amazon helper must set sponsored noopener');
check(helper.includes('Amazonのアソシエイトとして'), 'shared Amazon helper must render Associates disclosure');
check(contextSource.includes('nicheworks09-22'), 'Old Kanji contextual runtime must use the validated Associates tracking ID');
check(contextSource.includes('https://www.amazon.co.jp/s'), 'Old Kanji contextual runtime must use Amazon.co.jp search destinations');
check(contextSource.includes('NWOldKanjiAmazonContextCatalog'), 'contextual catalog must be exposed for deterministic audit');
check(contextSource.includes('fixed') || contract.includes('fixed curated'), 'fixed curated destination contract missing');

for (const slug of slugs) {
  check(classification.classes?.AFFILIATE?.includes(slug) === true, `${slug} must be in canonical AFFILIATE class`);
  const html = read(`tools/${slug}/index.html`);
  check(html.includes('/assets/amazon-affiliate.js'), `${slug}: shared Amazon helper missing`);
  check(html.includes('/assets/old-kanji-amazon-context.js'), `${slug}: contextual Amazon runtime missing`);
  check(html.includes('/assets/old-kanji-amazon-context.css'), `${slug}: contextual Amazon stylesheet missing`);
  check(!html.includes('./affiliate-config.js'), `${slug}: obsolete tool-local affiliate config must not be loaded`);
  check(!html.includes('./affiliate.js'), `${slug}: obsolete tool-local affiliate runtime must not be loaded`);
}

const fakeDocument = {
  readyState: 'loading',
  addEventListener() {},
  documentElement: { lang: 'ja' }
};
const fakeWindow = {};
const sandbox = {
  window: fakeWindow,
  document: fakeDocument,
  location: { pathname: '/tools/old-kanji-reference/' },
  URL,
  Object,
  console
};
vm.runInNewContext(contextSource, sandbox, { filename: 'assets/old-kanji-amazon-context.js' });
const catalog = fakeWindow.NWOldKanjiAmazonContextCatalog;
check(catalog && typeof catalog === 'object', 'contextual affiliate catalog did not initialize');
check(fakeWindow.NWOldKanjiAmazonTrackingId === 'nicheworks09-22', 'tracking ID export mismatch');

for (const slug of slugs) {
  const cfg = catalog?.[slug];
  check(Boolean(cfg), `catalog missing ${slug}`);
  check(Array.isArray(cfg?.offers) && cfg.offers.length === 3, `${slug}: expected exactly three reviewed offers`);
  const keys = (cfg?.offers || []).map((offer) => offer[0]);
  check(JSON.stringify(keys) === JSON.stringify(expectedOffers[slug]), `${slug}: offer keys drifted: ${JSON.stringify(keys)}`);
  check(typeof cfg?.placement === 'string' && cfg.placement.length > 0, `${slug}: placement missing`);
  check(typeof cfg?.anchor === 'string' && cfg.anchor.startsWith('#'), `${slug}: anchor missing`);
  for (const offer of cfg?.offers || []) {
    const [key, query, ja, en] = offer;
    check(typeof key === 'string' && key.length > 0, `${slug}: invalid offer key`);
    check(typeof query === 'string' && query.trim().length >= 4, `${slug}/${key}: weak or empty fixed query`);
    check(typeof ja === 'string' && ja.includes('Amazon') || typeof ja === 'string' && ja.length > 8, `${slug}/${key}: Japanese CTA missing`);
    check(typeof en === 'string' && en.length > 8, `${slug}/${key}: English CTA missing`);
  }
}

const buildSearchBody = contextSource.match(/function buildSearchUrl\(query\) \{([\s\S]*?)\n  \}/)?.[1] || '';
check(buildSearchBody.includes('url.searchParams.set("k", query)'), 'Amazon query builder must use only the reviewed catalog query');
check(buildSearchBody.includes('url.searchParams.set("tag", TRACKING_ID)'), 'Amazon query builder must append Associates tracking ID');
check(!buildSearchBody.includes('document.'), 'Amazon URL builder must not inspect page DOM/user input');
check(!buildSearchBody.includes('location.'), 'Amazon URL builder must not inspect current page URL/query');
check(!contextSource.includes('location.search'), 'contextual affiliate runtime must not read page query strings for Amazon');
check(!contextSource.includes('localStorage'), 'contextual affiliate runtime must not read localStorage for Amazon');
check(!contextSource.includes('sessionStorage'), 'contextual affiliate runtime must not read sessionStorage for Amazon');

check(!analytics.includes('affiliate_click'), 'cluster analytics must not implement legacy affiliate_click');
check(!analytics.includes('affiliate_outbound'), 'cluster analytics must not duplicate shared affiliate_outbound');

check(contract.includes('active across all eight Old Kanji tools'), 'affiliate contract must declare all-eight active scope');
for (const slug of slugs) check(contract.includes(slug.replaceAll('-', ' ')) || contract.includes(slug) || contract.includes({
  'old-kanji-reference':'Old Kanji Reference',
  'kanji-modernizer':'Kanji Modernizer',
  'old-kanji-ocr-scanner':'Old Kanji OCR Scanner',
  'old-document-kanji-highlighter':'Old Document Kanji Highlighter',
  'unicode-kanji-checker':'Unicode Kanji Checker',
  'variant-kanji-compare':'Variant Kanji Compare',
  'place-old-kanji-checker':'Place Old Kanji Checker',
  'name-old-kanji-checker':'Name Old Kanji Checker'
}[slug]), `affiliate contract missing ${slug}`);
check(contract.includes('No user-derived value may be inserted into an Amazon URL or affiliate event'), 'affiliate privacy boundary missing');
check(contract.includes('no arbitrary "two-tool only" cap exists'), 'contract must explicitly remove historical two-tool cap');

if (failures.length) {
  console.error(`Old Kanji Amazon active contract failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Old Kanji Amazon active contract passed: 8/8 tools, three reviewed contextual offers each, fixed destinations, privacy-safe shared measurement.');
