const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const ok = (condition, message) => { if (!condition) fail(message); };

const indexHtml = read('index.html');
const css = read('style.css');
const runtime = read('app.runtime.js');
const loader = read('data/quality-loader.js');
const offers = JSON.parse(read('data/affiliate-offers-v2.3.json'));

ok(indexHtml.includes('id="atlasWorkspace"') && indexHtml.includes('id="detailPanel"'), 'master-detail structure must exist in authoritative HTML, not be injected later');
ok(indexHtml.includes('id="detailContent"') && indexHtml.includes('id="detailEmpty"'), 'detail states must be first-class HTML');
ok(!indexHtml.includes('detail-dictionary-fix.js'), 'legacy detail bootstrap must not be in the production entrypoint');
ok(!indexHtml.includes('detail-image-hotfix.js'), 'legacy image hotfix must not be in the production entrypoint');
ok(!indexHtml.includes('ui-mock-v2-parity.js') && !indexHtml.includes('ui-mock-v2-hardening.js'), 'legacy parity/hardening runtimes must not be in the production entrypoint');
ok(!indexHtml.includes('content-polish.css') && !indexHtml.includes('detail-layout-fix.css'), 'legacy CSS patch layers must not be in the production entrypoint');
ok(indexHtml.includes('style.css?v=20260916-authoritative-ui-1'), 'authoritative stylesheet cache key must be current');
ok(indexHtml.includes('app.runtime.js?v=20260916-authoritative-ui-1'), 'authoritative runtime cache key must be current');
ok(indexHtml.includes('/assets/amazon-affiliate.js'), 'shared Amazon affiliate helper must be loaded directly');
ok(indexHtml.includes('semantic-search-core.js'), 'semantic search core must remain available without dynamic injection');

ok(css.includes('grid-template-columns:minmax(360px,43fr) minmax(0,57fr)'), 'desktop master-detail must remain approximately 43/57');
ok(css.includes('height:clamp(660px,calc(100vh - 255px),920px)'), 'desktop workspace must own a real viewport-relative height');
ok(css.includes('.detailPanel{position:relative;display:grid;grid-template-rows:minmax(0,1fr)}'), 'visible detail panel itself must fill the workspace');
ok(css.includes('.detailContent{height:100%;min-height:0;display:flex;flex-direction:column}'), 'detail content must fill the panel');
ok(css.includes('.detailScroll{flex:1;min-height:0;overflow:auto'), 'detail scroll surface must fill remaining pane height');
ok(css.includes('@media(max-width:899px)') && css.includes('position:fixed;z-index:50'), 'mobile detail must become a bottom sheet below 900px');
ok(!css.includes('[data-theme="dark"]'), 'authoritative Mock v2 UI must not reintroduce the legacy dark system');

ok(!runtime.includes('document.head.appendChild(link)'), 'runtime must not inject CSS after initial paint');
ok(!runtime.includes('document.head.appendChild(script)'), 'runtime must not inject JS after initial paint');
ok(!runtime.includes('appendScriptOnce'), 'runtime must not use extension-loader patching');
ok(runtime.includes('Promise.all(['), 'runtime assets must load in parallel');
ok(runtime.includes('data/image-registry-v2.3.json'), 'runtime must use the formal canonical image registry');
ok(runtime.includes('data/affiliate-offers-v2.3.json'), 'runtime must use maintained canonical affiliate mappings');
ok(runtime.includes('offer = state.offers.get(entry.id)'), 'affiliate handoff must be selected by canonical entry ID');
ok(runtime.includes('canonicalUrl(entry.id)'), 'detail must expose canonical deep links');
ok(runtime.includes('history[method]') && runtime.includes('popstate'), 'deep links must preserve browser back behavior');
ok(runtime.includes('state.lang === "both"'), 'JA / EN / Both must remain supported');
ok(!runtime.includes('tabMeta') && !runtime.includes('quality_batch'), 'internal Meta/debug fields must not be rendered by UI runtime');

ok(!loader.includes('no-store'), 'static dictionary data must use normal browser caching');
ok(loader.includes('Promise.all(packPaths.map(fetchJson))'), 'dictionary packs must load in parallel');
ok(loader.includes('Promise.all(enrichmentPaths.map(fetchJson))'), 'content enrichment packs must load in parallel');
ok(!loader.includes('detail-image-hotfix.js') && !loader.includes('canonical-deep-link-v2.3.js'), 'data loader must not inject UI/runtime extensions');
ok(!loader.includes('DOMContentLoaded'), 'data loader must be a pure data module');

ok(offers.schema === 'cta-affiliate-offers-v2.3', 'affiliate offer schema must remain v2.3');
ok(offers.policy?.query_source === 'maintained_canonical_mapping_only', 'affiliate query source must remain canonical mapping only');
ok(offers.policy?.free_text_forwarding === false, 'free-text forwarding must remain disabled');
ok(Array.isArray(offers.offers) && offers.offers.length >= 24, 'maintained affiliate coverage must remain intact');
ok(offers.offers.some((offer) => offer.entry_id === 'q017_access_floor_panel'), 'Access Floor Panel affiliate mapping must remain present');

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
console.log(`Construction Tools Atlas authoritative Mock v2 contract: PASS (${offers.offers.length} affiliate mappings)`);
