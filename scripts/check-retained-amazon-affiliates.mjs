import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const check = (condition, message) => { if (!condition) failures.push(message); };
const retained = ['dry-meter','light-check','laundry-code-decode','moving-checklist-generator','moving-lease-final-check'];
const classification = JSON.parse(read('MONETIZATION_CLASSIFICATION.json'));
const affiliateSet = new Set(classification.classes.AFFILIATE || []);
const TRACKING_ID = 'nicheworks09-22';

function loadConfig(slug) {
  const sandbox = { window: {} };
  vm.runInNewContext(read(`tools/${slug}/affiliate-config.js`), sandbox, { filename: slug });
  return sandbox.window.NWAmazonStaticOffers;
}

for (const slug of retained) {
  check(affiliateSet.has(slug), `${slug}: must remain canonical AFFILIATE`);
  const cfg = loadConfig(slug);
  check(cfg?.enabled === true, `${slug}: affiliate config must be enabled`);
  check(cfg?.tool === slug, `${slug}: config tool slug mismatch`);
  check(cfg?.trackingId === TRACKING_ID, `${slug}: tracking ID mismatch`);
  check(cfg?.template?.status === 'verified', `${slug}: template must be verified`);
  check(String(cfg?.template?.proofUrl || '').includes('amazon.co.jp/s?'), `${slug}: proof URL must be Amazon Japan search`);
  check(String(cfg?.template?.proofUrl || '').includes(`tag=${TRACKING_ID}`), `${slug}: proof URL must carry maintained tracking ID`);
  check(Array.isArray(cfg?.offers) && cfg.offers.length >= 3, `${slug}: expected at least three fixed offers`);
  const keys = new Set();
  for (const offer of cfg?.offers || []) {
    check(Boolean(offer.key && offer.target && offer.query && offer.labelJa), `${slug}: offer fields incomplete`);
    check(!keys.has(offer.key), `${slug}: duplicate offer key ${offer.key}`);
    keys.add(offer.key);
    check(!/[{}$]/.test(offer.query), `${slug}: offer query must be fixed metadata`);
    const url = new URL('https://www.amazon.co.jp/s');
    url.searchParams.set('k', offer.query);
    url.searchParams.set('tag', cfg.trackingId);
    check(url.hostname === 'www.amazon.co.jp' && url.searchParams.get('tag') === TRACKING_ID, `${slug}: generated tagged search invalid`);
  }
  const html = read(`tools/${slug}/index.html`);
  for (const needle of ['/assets/amazon-static-offers.css','id="nwAmazonAffiliate"','/assets/amazon-affiliate.js','./affiliate-config.js','/assets/amazon-static-offers.js']) {
    check(html.includes(needle), `${slug}: missing affiliate wiring ${needle}`);
  }
  const spec = read(`tools/${slug}/SPEC.md`);
  check(spec.includes('nicheworks09-22'), `${slug}: specification must record active shared tracking template`);
}

const runtime = read('assets/amazon-static-offers.js');
for (const needle of ['url.searchParams.set("k", query)','url.searchParams.set("tag", config.trackingId)','helper.mountUrl({','affiliateId: offer.key','destinationKey: offer.target','helper.renderDisclosure']) {
  check(runtime.includes(needle), `shared static runtime missing ${needle}`);
}
for (const forbidden of ['location.search','localStorage','sessionStorage','offer.query =','gtag("event"']) {
  check(!runtime.includes(forbidden), `shared static runtime must not derive commerce from user/page state: ${forbidden}`);
}

if (failures.length) {
  console.error(`Retained Amazon affiliate rollout failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PASS: five retained affiliate tools use fixed NicheWorks Amazon Japan tagged-search offers with shared analytics/disclosure.');
