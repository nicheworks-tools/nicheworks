const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const ok = (condition, message) => { if (!condition) fail(message); };

const css = read('ui-mock-v2-parity.css');
const hardening = read('ui-mock-v2-hardening.css');
const runtime = read('ui-mock-v2-parity.js');
const bootstrap = read('detail-dictionary-fix.js');
const appRuntime = read('app.runtime.js');
const presentation = read('dictionary-presentation-v2.3.js');
const deepLink = read('deep-link-v2.3.js');
const imageRuntime = read('detail-image-hotfix.js');
const indexHtml = read('index.html');
const offers = JSON.parse(read('data/affiliate-offers-v2.3.json'));

ok(css.includes('grid-template-columns:minmax(380px,43%) minmax(0,57%)'), 'desktop master-detail base must remain ~43/57');
ok(hardening.includes('grid-template-columns:minmax(0,43fr) minmax(0,57fr)'), 'desktop hardening must preserve a larger right detail pane');
ok(hardening.includes('align-items:stretch!important'), 'desktop master-detail panes must stretch to the same grid-row height');
ok(hardening.includes('.atlasDetailHost{display:flex!important;flex-direction:column!important'), 'detail host must fill the stretched desktop row');
ok(hardening.includes('#detailSheet.detailPanel--desktop{position:relative!important'), 'desktop detail must fill the host instead of retaining sticky viewport height');
ok(hardening.includes('#detailSheet.detailPanel--desktop{width:100%!important;min-width:0!important;max-width:none!important'), 'desktop detail must not retain a legacy max-width cap');
ok(css.includes('@media(max-width:899px)'), 'mobile breakpoint must be below 900px');
ok(css.includes('.ctaResultThumb'), 'result-image styling must exist');
ok(css.includes('#detailTabs{display:none!important}'), 'legacy tabs must not be the primary detail IA');
ok(hardening.includes('#detailSheet #tabMeta') && hardening.includes('#detailSheet #tabMeta[hidden]'), 'legacy Meta/internal-record panel must stay hidden with higher specificity than legacy tabpanel rules');
ok(hardening.includes('#detailSheet .supportInline,#supportInlineBtn{display:none!important}'), 'donation CTA must not appear inside dictionary detail');
ok(hardening.includes('.ctaMockHome{display:none!important}') && runtime.includes('$(".ctaMockHome", wrap)?.remove()'), 'header must not render the NicheWorks badge/link');
ok(css.includes('.ctaAffiliateBox'), 'affiliate surface must be styled');
ok(hardening.includes('.ctaAffiliateMount a'), 'affiliate CTA must have visible hardening styles');

ok(runtime.includes('REGISTRY_URL'), 'parity runtime must use canonical image registry');
ok(runtime.includes('OFFER_URL'), 'parity runtime must use maintained affiliate mappings');
ok(runtime.includes('/assets/amazon-affiliate.js'), 'shared Amazon helper must be reused');
ok(runtime.includes('offerById.get(id)'), 'affiliate lookup must be selected canonical-ID based');
ok(runtime.includes('resolveCanonicalId'), 'affiliate/detail IDs must normalize through canonical redirects');
ok(runtime.includes('dataset.taxonomyKey'), 'taxonomy UI must preserve raw keys internally while rendering display labels');
ok(runtime.includes('humanize(') && runtime.includes('return "";'), 'taxonomy UI must suppress unknown raw enum values instead of displaying them');
ok(runtime.includes('removeLegacyDetailSupport'), 'parity runtime must remove legacy detail support CTA');
ok(!runtime.includes('match(/id:'), 'selected entry resolution must not depend on visible raw Meta text');
ok(!appRuntime.includes('`id: ${e.id}`') && !presentation.includes('`id: ${entry.id}`'), 'runtime and presentation must not render internal record metadata as bullet lists');
ok(!presentation.includes('.match(/id:') && !deepLink.includes('.match(/id:') && !imageRuntime.includes('meta.match(/id:'), 'canonical selection must not use Meta text as application state');
ok(bootstrap.includes('ui-mock-v2-parity.css'), 'detail bootstrap must load parity CSS');
ok(bootstrap.includes('ui-mock-v2-parity.js'), 'detail bootstrap must load parity runtime');
ok(bootstrap.includes('20260916-structural-3'), 'UI parity cache bust must be current');

ok(offers.schema === 'cta-affiliate-offers-v2.3', 'affiliate offer schema must be v2.3');
ok(offers.policy?.query_source === 'maintained_canonical_mapping_only', 'affiliate query source must be maintained canonical mapping only');
ok(offers.policy?.free_text_forwarding === false, 'free-text forwarding must stay disabled');
ok(Array.isArray(offers.offers) && offers.offers.length >= 24, 'maintained affiliate coverage must include common purchase-intent entries');
ok(offers.offers.some((offer) => offer.entry_id === 'impact_driver'), 'Impact Driver must have an active maintained Amazon mapping');
ok(offers.offers.some((offer) => offer.entry_id === 'q017_access_floor_panel'), 'Access Floor Panel must have an active maintained Amazon mapping');
ok(indexHtml.includes('app.runtime.js?v=20260916-structural-3') && indexHtml.includes('detail-image-hotfix.js?v=20260916-structural-3'), 'changed runtimes must be cache-busted in production HTML');

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
