import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const config = read('tools/_shared/cosmetics-affiliate-config.js');
const adapter = read('tools/_shared/cosmetics-affiliate-slot.js');
const parser = read('tools/_shared/cosmetic-ingredient-parser.js');
const lite = read('tools/cosmetic-ingredient-checker-lite/index.html');
const fast = read('tools/inci-fastscan/index.html');

check(config.includes('enabled: true'), 'affiliate config must stay active');
check(config.includes('trackingMode: "tagged_search"'), 'cosmetics affiliate must use explicit tagged_search mode');
check(config.includes('displayMode: "post_result_category_choice"'), 'affiliate display mode must remain post-result category choice');
check(config.includes('associateTag: ASSOCIATE_TAG'), 'affiliate config must use the verified Associates tag constant');
check(config.includes('const ASSOCIATE_TAG = "nicheworks09-22"'), 'verified Associates tag missing');
check(config.includes('Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。'), 'required Japanese Amazon Associates disclosure missing');
check(config.includes('As an Amazon Associate, NicheWorks earns from qualifying purchases.'), 'English Amazon Associates disclosure missing');
check(config.includes('"cosmetic-ingredient-checker-lite"'), 'Lite slot config missing');
check(config.includes('"inci-fastscan"'), 'FastScan slot config missing');
check((config.match(/links: fixedSearchLinks/g) || []).length === 2, 'same fixed search set must be mapped to both cosmetics slots');
check((config.match(/placement: "after-results"/g) || []).length === 2, 'both cosmetics affiliate slots must stay after the useful result output');

const categoryKeys = ['toner', 'serum', 'moisturizer', 'cleanser', 'cleansing', 'sunscreen', 'bodycare'];
for (const key of categoryKeys) {
  check(config.includes(`key: "${key}"`), `affiliate category missing: ${key}`);
}
check((config.match(/tag=nicheworks09-22/g) || []).length === categoryKeys.length, 'every fixed Amazon category must carry the verified Associates tag');
check((config.match(/https:\/\/www\.amazon\.co\.jp\/s\?k=/g) || []).length === categoryKeys.length, 'every offer must be a fixed Amazon Japan search URL');
check(!config.includes('skincare_general'), 'generic skincare category should not return');
check(!config.includes('skincare_ceramide'), 'ingredient-themed ceramide category should not return');
check(!config.includes('amzn.to/4xNbcDO'), 'single generic Special Link should remain retired');

for (const [name, html] of [
  ['Lite', lite],
  ['FastScan', fast]
]) {
  check(html.includes('id="amazonAffiliateSlot"'), `${name}: stable amazonAffiliateSlot missing`);
  check(html.includes('data-affiliate-placement="after-results"'), `${name}: affiliate slot must be placed after results`);
  check(html.includes('data-affiliate-state="inactive"'), `${name}: HTML slot must remain fail-closed before runtime activation`);
}

const liteTableAt = lite.indexOf('id="itemsTable"');
const liteAffiliateAt = lite.indexOf('id="amazonAffiliateSlot"');
check(liteTableAt >= 0 && liteAffiliateAt > liteTableAt, 'Lite affiliate markup must come after the ingredient result table');

for (const asset of [
  '/tools/_shared/cosmetics-affiliate-slot.css',
  '/tools/_shared/cosmetics-affiliate-config.js',
  '/tools/_shared/cosmetics-affiliate-slot.js'
]) {
  check(parser.includes(asset), `shared cosmetics runtime must bootstrap ${asset}`);
}
check(parser.includes('getElementById("amazonAffiliateSlot")'), 'affiliate runtime must only bootstrap when a slot exists');

check(adapter.includes('config.trackingMode === "tagged_search"'), 'adapter must explicitly enforce tagged_search mode');
check(adapter.includes('url.searchParams.get("tag") !== expectedTag'), 'adapter must reject links with the wrong Associates tag');
check(adapter.includes('url.pathname !== "/s"'), 'adapter must restrict tagged mode to Amazon search paths');
check(adapter.includes('!url.searchParams.get("k")'), 'adapter must require a fixed search keyword');
check(adapter.includes('host !== "amazon.co.jp"'), 'adapter must explicitly handle the amazon.co.jp host');
check(adapter.includes('!host.endsWith(".amazon.co.jp")'), 'adapter must explicitly handle Amazon Japan subdomains');
check(adapter.includes('url.protocol !== "https:"'), 'adapter must reject non-HTTPS affiliate URLs');
check(adapter.includes('rel = "sponsored noopener noreferrer"'), 'affiliate link sponsored/noopener/noreferrer semantics missing');
check(adapter.includes('function resultsReady(tool)'), 'affiliate adapter must gate display on completed result rendering');
check(adapter.includes('#itemsTableBody tr'), 'Lite affiliate gate must require at least one rendered result row');
check(adapter.includes('#fast-results .result-card, #jb-results .result-card'), 'FastScan affiliate gate must require at least one rendered result card');
check(adapter.includes('MutationObserver'), 'affiliate gate must react when result output appears or is reset');
check(adapter.includes('カテゴリは照合結果ではなく、あなた自身の選択で決まります。'), 'Japanese user-choice disclosure missing');
check(adapter.includes('The category is selected by you, not by the check result.'), 'English user-choice disclosure missing');

for (const eventName of ['affiliate_impression', 'affiliate_click']) {
  check(adapter.includes(eventName), `adapter missing event ${eventName}`);
}
for (const safeKey of ['tool', 'provider', 'placement', 'link_key']) {
  check(adapter.includes(safeKey), `adapter missing generic metadata ${safeKey}`);
}
for (const forbidden of ['inciInput', 'fast-input', 'jb-input', 'ocr-file', 'ingredients', 'analysis', 'filename']) {
  check(!adapter.includes(forbidden), `adapter must not reference raw user-data surface: ${forbidden}`);
}

if (failures.length) {
  console.error(`Cosmetics affiliate contract check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  display_mode: 'post_result_category_choice',
  lite_placement: 'after-results',
  fastscan_placement: 'after-results',
  fixed_categories: categoryKeys.length,
  result_driven_destination: false,
  raw_user_data_in_affiliate_adapter: false
}, null, 2));
