import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

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
