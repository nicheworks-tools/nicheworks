import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const check = (condition, message) => { if (!condition) failures.push(message); };

const classification = JSON.parse(read('MONETIZATION_CLASSIFICATION.json'));
for (const slug of ['motion-atlas', 'vibe-lexicon']) {
  check(classification.classes?.ADS_DONATION?.includes(slug) === true, `${slug} must remain ADS_DONATION`);
  check(classification.classes?.PRO_BUNDLE?.includes(slug) !== true, `${slug} must not be PRO_BUNDLE`);
  check(classification.classes?.AFFILIATE?.includes(slug) !== true, `${slug} must not be AFFILIATE`);
}

const motionFiles = [
  'tools/motion-atlas/index.html',
  'tools/motion-atlas/ja/index.html',
  'tools/motion-atlas/pro/index.html',
  'tools/motion-atlas/ja/pro/index.html',
  'tools/motion-atlas/pro-bridge.js',
  'tools/motion-atlas/SPEC.md',
  'docs/tools/motion-atlas.md'
];
for (const rel of motionFiles) {
  const text = read(rel);
  check(!text.includes('buy.stripe.com'), `${rel}: Stripe purchase URL is forbidden for ADS_DONATION`);
  check(!text.includes('$2.99'), `${rel}: fixed paid price is forbidden for ADS_DONATION`);
}
check(!read('tools/motion-atlas/index.html').includes('/assets/nw-pro.js'), 'Motion Atlas EN must not load paid entitlement client');
check(!read('tools/motion-atlas/ja/index.html').includes('/assets/nw-pro.js'), 'Motion Atlas JA must not load paid entitlement client');
check(!read('tools/motion-atlas/pro-bridge.js').includes('nicheworks_pro'), 'Motion Atlas compatibility bridge must not use legacy paid entitlement');
check(read('tools/motion-atlas/pro-bridge.js').includes('source: "ads_donation"'), 'Motion Atlas free mode must identify ADS_DONATION source');
check(read('tools/motion-atlas/pro/index.html').includes('Advanced outputs are now free'), 'Motion Atlas historical EN Pro page must be a free-mode notice');
check(read('tools/motion-atlas/ja/pro/index.html').includes('高度出力は無料で利用できます'), 'Motion Atlas historical JA Pro page must be a free-mode notice');

const vibeFiles = [
  'tools/vibe-lexicon/index.html',
  'tools/vibe-lexicon/ja/index.html',
  'tools/vibe-lexicon/pro/index.html',
  'tools/vibe-lexicon/ja/pro/index.html',
  'tools/vibe-lexicon/app.js',
  'tools/vibe-lexicon/pro-bridge.js',
  'tools/vibe-lexicon/SPEC.md',
  'docs/tools/vibe-lexicon.md'
];
for (const rel of vibeFiles) {
  const text = read(rel);
  check(!text.includes('buy.stripe.com'), `${rel}: Stripe purchase URL is forbidden for ADS_DONATION`);
  check(!text.includes('$2.99'), `${rel}: fixed paid price is forbidden for ADS_DONATION`);
}
check(!read('tools/vibe-lexicon/index.html').includes('/assets/nw-pro.js'), 'Vibe Lexicon EN must not load paid entitlement client');
check(!read('tools/vibe-lexicon/ja/index.html').includes('/assets/nw-pro.js'), 'Vibe Lexicon JA must not load paid entitlement client');
check(!read('tools/vibe-lexicon/app.js').includes('nicheworks_pro'), 'Vibe Lexicon runtime must not use legacy paid entitlement');
check(read('tools/vibe-lexicon/app.js').includes("monetization: 'ADS_DONATION'"), 'Vibe Lexicon JSON export must identify ADS_DONATION');
check(read('tools/vibe-lexicon/app.js').includes('paidEntitlementRequired: false'), 'Vibe Lexicon JSON export must declare no paid entitlement requirement');
check(read('tools/vibe-lexicon/pro/index.html').includes('Work-pack outputs are now free'), 'Vibe Lexicon historical EN Pro page must be a free-mode notice');
check(read('tools/vibe-lexicon/ja/pro/index.html').includes('実務用出力は無料で利用できます'), 'Vibe Lexicon historical JA Pro page must be a free-mode notice');

if (failures.length) {
  console.error(`ADS_DONATION commercial SSOT check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('ADS_DONATION commercial SSOT check passed for Motion Atlas and Vibe Lexicon.');
