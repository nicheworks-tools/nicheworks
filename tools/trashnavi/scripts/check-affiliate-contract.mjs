#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const toolDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(toolDir, '../..');
const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const check = (condition, message) => { if (!condition) throw new Error(message); };

const config = read('tools/trashnavi/affiliate-config.js');
const runtime = read('tools/trashnavi/affiliate-runtime.js');
const generator = read('tools/trashnavi/scripts/generate-municipality-pages.mjs');
const helper = read('assets/amazon-affiliate.js');
const manifest = JSON.parse(read('tools/trashnavi/municipality-page-manifest.json')).filter((entry) => entry.publish);
const ledger = JSON.parse(read('tools/trashnavi/data/municipality-review-ledger.json'));
const publishableStates = new Set(['standard', 'limited', 'joint_service']);
const byCode = new Map(ledger.municipalities.map((row) => [row.lgcode, row]));

check(config.includes('const TRACKING_ID = "nicheworks09-22"'), 'TrashNavi Associates tracking ID missing');
check(config.includes('trackingMode: "tagged_search"'), 'TrashNavi must use tagged Amazon search mode');
check(config.includes('verificationMethod: "shared_link_checker_validated_tagged_search_format"'), 'validated tagged-search inheritance missing');
for (const key of ['sorting_bin', 'compression_bag', 'trash_bag_storage', 'packing_supplies']) {
  check(config.includes(`key: "${key}"`), `affiliate category missing: ${key}`);
}
check((config.match(/https:\/\/www\.amazon\.co\.jp\/s\?k=/g) || []).length === 4, 'TrashNavi must expose exactly four fixed Amazon Japan searches');
check((config.match(/tag=nicheworks09-22/g) || []).length === 4, 'every TrashNavi Amazon search must carry the verified tag');
for (const forbidden of ['window.location', 'location.search', 'URLSearchParams', 'document.querySelector("input', "document.querySelector('input"]) {
  check(!config.includes(forbidden), `affiliate config must not derive Amazon queries from runtime/user state: ${forbidden}`);
}

check(runtime.includes('window.NWAmazonAffiliate'), 'shared Amazon helper must be reused');
check(runtime.includes('helper.configure('), 'shared helper configuration missing');
check(runtime.includes('helper.mount('), 'shared helper link mounting missing');
check(runtime.includes('helper.renderDisclosure('), 'Amazon Associates disclosure rendering missing');
check(runtime.includes('placement: "municipality_supporting_supplies"'), 'coarse affiliate placement missing');
check(helper.includes('rel = "sponsored noopener"'), 'shared helper must retain sponsored link semantics');
check(helper.includes('Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。'), 'shared Associates disclosure missing');

const root = read('tools/trashnavi/index.html');
const rootAffiliatePos = root.indexOf('id="trashnaviAmazonAffiliate"');
check(rootAffiliatePos > root.indexOf('id="results"') && rootAffiliatePos < root.indexOf('class="data-note"'), 'TrashNavi root PR panel must follow official search results and precede bulk directory');
check(root.includes('自治体ごとの指定・収集ルールへの適合'), 'general supplies must not claim municipal compliance');
check(runtime.includes('orderedOffers(intent)') && runtime.includes('const intent = searchIntent();'), 'closed-set search-intent ranking is required');
check(runtime.includes('renderChoiceGuide(section, intent, lang)'), 'buyer guidance must follow the broad search intent');
check(runtime.includes('OFFER_GUIDES[offer.key][lang]'), 'each approved offer must have an original selection checklist');
check(runtime.includes('intentBucket: intent'), 'privacy-bucketed purchase click tracking required');
check(helper.includes('payload.intent_bucket = options.intentBucket'), 'click analytics must emit only the broad intent bucket');
check(!runtime.includes('window.gtag('), 'runtime must not directly send raw search or municipality data to GA4');
check(runtime.includes('helper.trackImpression('), 'visible impressions must use the shared Amazon analytics helper');
check(helper.includes('function trackImpression(') && helper.includes('"affiliate_impression"'), 'shared helper must emit the view event');
check(runtime.includes('new IntersectionObserver('), 'affiliate impression may only fire when visible');
check(runtime.includes('config.offers'), 'only fixed approved affiliate offers can be ranked');

const affiliatePos = generator.indexOf('id="trashnaviAmazonAffiliate"');
const officialPos = generator.indexOf('class="municipality-links-section"');
check(officialPos >= 0 && affiliatePos > officialPos, 'affiliate block must remain downstream of official municipal links');
for (const asset of ['/assets/amazon-affiliate.js', '/tools/trashnavi/affiliate-config.js', '/tools/trashnavi/affiliate-runtime.js']) {
  check(generator.includes(asset), `generated page asset missing: ${asset}`);
}
check(generator.includes('自治体の収集ルールとは別に'), 'municipal-rule separation copy missing');
check(manifest.every((entry) => publishableStates.has(byCode.get(entry.lgcode)?.coverage_state)), 'every published municipality must have an eligible reviewed coverage state');

for (const entry of manifest) {
  const relative = path.join('tools', 'trashnavi', entry.pref_slug, entry.city_slug, 'index.html');
  const page = read(relative);
  check(page.includes('id="trashnaviAmazonAffiliate"'), `${relative}: affiliate block missing`);
  check(page.includes('/assets/amazon-affiliate.js'), `${relative}: shared Amazon helper missing`);
  check(page.includes('/tools/trashnavi/affiliate-config.js'), `${relative}: affiliate config missing`);
  check(page.includes('/tools/trashnavi/affiliate-runtime.js'), `${relative}: affiliate runtime missing`);
}

console.log(JSON.stringify({
  published_municipality_pages: manifest.length,
  amazon_fixed_categories: 4,
  associate_tag: 'nicheworks09-22',
  user_or_municipality_state_in_amazon_query: false,
  contract: 'trashnavi-amazon-tagged-search-v1'
}, null, 2));
