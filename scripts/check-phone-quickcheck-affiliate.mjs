import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const check = (condition, message) => { if (!condition) failures.push(message); };

const configRel = 'tools/phone-quickcheck/affiliate-config.js';
const runtimeRel = 'tools/phone-quickcheck/affiliate-runtime.js';
const dataRel = 'tools/phone-quickcheck/data/accessories.json';
const htmlRel = 'tools/phone-quickcheck/index.html';

const sandbox = { window: {}, URL };
vm.runInNewContext(read(configRel), sandbox, { filename: configRel });
const config = sandbox.window.NWPhoneQuickCheckAffiliate;
const accessories = JSON.parse(read(dataRel)).accessories || [];

check(config?.enabled === true, 'affiliate config must be enabled');
check(config?.tool === 'phone-quickcheck', 'tool id mismatch');
check(config?.trackingId === 'nicheworks09-22', 'tracking ID mismatch');
check(config?.template?.status === 'verified', 'tagged-search template must be verified');
check(config?.template?.verificationMethod === 'shared_link_checker_validated_tagged_search_format', 'verification method mismatch');
check(String(config?.template?.proofUrl || '').includes('tag=nicheworks09-22'), 'proof URL must contain the maintained tracking ID');

const expectedTargets = ['cable', 'wired_charger', 'wireless_charger', 'power_bank'];
for (const target of expectedTargets) {
  check(typeof config?.targets?.[target] === 'string' && config.targets[target].startsWith('https://'), `missing active coarse target: ${target}`);
}

const accessoryKeys = accessories.map((item) => item.key);
check(accessoryKeys.length > 0, 'accessory catalog must not be empty');
check(new Set(accessoryKeys).size === accessoryKeys.length, 'accessory keys must be unique');
for (const key of ['charger-pd-check-wattage', 'charger-pd-90w']) {
  check(accessoryKeys.includes(key), `required source-backed charger category missing: ${key}`);
}
check(accessories.length >= 22, 'expanded affiliate catalog must contain at least 22 classes');

for (const key of accessoryKeys) {
  const offer = config?.getOffer?.(key);
  check(Boolean(offer), `missing affiliate offer for ${key}`);
  if (!offer) continue;
  check(expectedTargets.includes(offer.target), `invalid coarse target for ${key}: ${offer.target}`);
  check(String(offer.labelJa || '').includes('Amazon'), `Japanese CTA must identify Amazon for ${key}`);
  check(String(offer.labelEn || '').includes('Amazon'), `English CTA must identify Amazon for ${key}`);
  try {
    const url = new URL(offer.url);
    check(url.protocol === 'https:' && url.hostname === 'www.amazon.co.jp', `invalid Amazon host for ${key}`);
    check(url.searchParams.get('tag') === 'nicheworks09-22', `tracking tag mismatch for ${key}`);
    check(Boolean(url.searchParams.get('k')), `empty canonical search query for ${key}`);
  } catch (_) {
    check(false, `invalid affiliate URL for ${key}`);
  }
}

const runtime = read(runtimeRel);
check(!runtime.includes('gtag('), 'tool runtime must not own affiliate analytics payload');
check(runtime.includes('helper.mountUrl'), 'runtime must use shared mountUrl helper');
check(runtime.includes('helper.renderDisclosure'), 'runtime must render Associates disclosure');
check(runtime.includes('desktop_detail') && runtime.includes('mobile_sheet'), 'runtime must use coarse desktop/mobile placements');
check(!runtime.includes('searchInput'), 'user search text must not enter affiliate runtime');
check(runtime.includes('affiliateId: "phone_" + makerBucket + "_" + offer.key'), 'manufacturer/category affiliate bucket missing');
check(runtime.includes('root.dataset.affiliateManufacturer'), 'affiliate bucket must come from canonical detail');
check(!runtime.includes('selectedId'), 'click analytics must not include model history');
check(read('tools/phone-quickcheck/app.js').includes('root.dataset.affiliateManufacturer = phone?.manufacturer'), 'canonical manufacturer attribute missing from detail render');

// All ManualFinder direct links must be exact Phone QuickCheck canonical models.
const matchModule = read('tools/manual-finder/phone-quickcheck-match.js');
const linkVm = { window: {} };
vm.runInNewContext(matchModule, linkVm);
const quick = linkVm.window.MANUALFINDER_QC;
const phoneModels = [...JSON.parse(read('tools/phone-quickcheck/data/phones.json')).phones, ...JSON.parse(read('tools/phone-quickcheck/data/phones-growth-20261103.json')).phones];
for (const [maker,models] of Object.entries(quick.models)) {
  const canonical = new Set(phoneModels.filter(p => p.manufacturer === maker).map(p => p.model));
  for (const model of models) check(canonical.has(model), `stale ManualFinder ${maker} model link ${model}`);
}
check(quick.linkFor('Apple','iPhone 11') === '/tools/phone-quickcheck/?model=iPhone%2011','Apple exact deep link broken');
check(quick.linkFor('Google Pixel','Google Pixel 10') === '/tools/phone-quickcheck/?model=Pixel%2010','Google prefix normalization broken');
check(quick.linkFor('Apple','MacBook Pro') === null,'PC false-positive must not link');
check(quick.linkFor('Samsung Mobile','Galaxy S23 Ultra') === null,'unverified Samsung carrier equivalence must not link');
const jaManual = read('tools/manual-finder/index.html');
const enManual = read('tools/manual-finder/en/index.html');
check(jaManual.includes('./phone-quickcheck-match.js') && enManual.includes('../phone-quickcheck-match.js'),'ManualFinder matching module not installed on both locales');
check(read('tools/manual-finder/app.paged.js').includes('window.MANUALFINDER_QC?.linkFor'),'ManualFinder results must use exact model links');
const html = read(htmlRel);
const helperPos = html.indexOf('/assets/amazon-affiliate.js');
const configPos = html.indexOf('./affiliate-config.js');
const appPos = html.indexOf('./app.js');
const runtimePos = html.indexOf('./affiliate-runtime.js');
check(helperPos >= 0 && helperPos < configPos && configPos < appPos && appPos < runtimePos,
  'affiliate helper/config must load before app and affiliate runtime after app');
check(html.includes('./affiliate.css'), 'affiliate stylesheet must be loaded');

if (failures.length) {
  console.error(`Phone QuickCheck affiliate contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Phone QuickCheck affiliate contract passed: ${accessoryKeys.length} accessory classes, fixed tracking ID, shared helper/disclosure, no user-query handoff.`);

// The owned GA4→Sheets adapter is an additive, direct-Google integration.
execFileSync(process.execPath, ['scripts/analytics/test-phone-quickcheck-ga4.mjs'], { stdio: 'inherit' });
// Validate crawlable static index, official source provenance, and commercial SEO guide.
execFileSync(process.execPath, ['scripts/check-phone-quickcheck-growth-seo.mjs'], { stdio: 'inherit' });

// Test the nine static guide's tagged clicks and privacy bucket attributes.
execFileSync(process.execPath, ['scripts/check-phone-quickcheck-guide-events.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/check-phone-quickcheck-model-index.mjs'], { stdio: 'inherit' });
execFileSync(process.execPath, ['scripts/check-phone-quickcheck-model-profiles.mjs'], { stdio: 'inherit' });

// Verify exact-SKU Samsung ManualFinder→Phone QuickCheck model-profile conversion.
execFileSync(process.execPath, ['scripts/check-manualfinder-phone-galaxy-funnel.mjs'], { stdio: 'inherit' });
