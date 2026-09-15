const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const ok = (condition, message) => { if (!condition) fail(message); };

const css = read('ui-mock-v2-parity.css');
const runtime = read('ui-mock-v2-parity.js');
const bootstrap = read('detail-dictionary-fix.js');
const offers = JSON.parse(read('data/affiliate-offers-v2.3.json'));

ok(css.includes('grid-template-columns:minmax(380px,43%) minmax(0,57%)'), 'desktop master-detail must remain ~43/57');
ok(css.includes('@media(max-width:899px)'), 'mobile breakpoint must be below 900px');
ok(css.includes('.ctaResultThumb'), 'result-image styling must exist');
ok(css.includes('#detailTabs{display:none!important}'), 'legacy tabs must not be the primary detail IA');
ok(css.includes('.ctaAffiliateBox'), 'affiliate surface must be styled');
ok(runtime.includes('REGISTRY_URL'), 'parity runtime must use canonical image registry');
ok(runtime.includes('OFFER_URL'), 'parity runtime must use maintained affiliate mappings');
ok(runtime.includes('/assets/amazon-affiliate.js'), 'shared Amazon helper must be reused');
ok(runtime.includes('offerById.get(selectedEntryId())'), 'affiliate lookup must be canonical-ID based');
ok(bootstrap.includes('ui-mock-v2-parity.css'), 'detail bootstrap must load parity CSS');
ok(bootstrap.includes('ui-mock-v2-parity.js'), 'detail bootstrap must load parity runtime');

ok(offers.schema === 'cta-affiliate-offers-v2.3', 'affiliate offer schema must be v2.3');
ok(offers.policy?.query_source === 'maintained_canonical_mapping_only', 'affiliate query source must be maintained canonical mapping only');
ok(offers.policy?.free_text_forwarding === false, 'free-text forwarding must stay disabled');
ok(Array.isArray(offers.offers) && offers.offers.length > 0, 'at least one maintained canonical offer is required');

const ids = new Set();
for (const offer of offers.offers) {
  ok(typeof offer.entry_id === 'string' && offer.entry_id.length > 0, 'offer entry_id is required');
  ok(!ids.has(offer.entry_id), `duplicate affiliate mapping: ${offer.entry_id}`);
  ids.add(offer.entry_id);
  ok(offer.status === 'active', `${offer.entry_id} must be explicitly active`);
  let url;
  try { url = new URL(offer.amazon_url); } catch { fail(`${offer.entry_id} has invalid URL`); continue; }
  ok(url.protocol === 'https:', `${offer.entry_id} must use HTTPS`);
  ok(url.hostname === 'www.amazon.co.jp' || url.hostname === 'amazon.co.jp', `${offer.entry_id} must point to Amazon Japan`);
  ok(url.searchParams.get('tag') === offers.tracking_id, `${offer.entry_id} must use configured tracking ID`);
  ok(url.searchParams.get('k') === offer.query, `${offer.entry_id} URL query must match maintained query`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`Construction Tools Atlas UI Mock v2 parity contract: PASS (${offers.offers.length} affiliate mappings)`);
