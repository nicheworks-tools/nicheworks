import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const analytics = fs.readFileSync(new URL('analytics.js', root), 'utf8');
const ja = fs.readFileSync(new URL('index.html', root), 'utf8');
const en = fs.readFileSync(new URL('en/index.html', root), 'utf8');
const amazon = fs.readFileSync(new URL('../../../assets/amazon-affiliate.js', import.meta.url), 'utf8');

assert.match(ja, /<script src="\.\/analytics\.js\?v=mf-analytics-20260915a" defer><\/script>/, 'JA page must load ManualFinder analytics');
assert.match(en, /<script src="\.\.\/analytics\.js\?v=mf-analytics-20260915a" defer><\/script>/, 'EN page must load ManualFinder analytics');

for (const eventName of ['manualfinder_search', 'manualfinder_result_click', 'manualfinder_pagination']) {
  assert.match(analytics, new RegExp(`track\\("${eventName}"`), `${eventName} must remain in the analytics contract`);
}

assert.match(analytics, /query_length_bucket/, 'text searches must use a coarse length bucket');
assert.match(analytics, /result_bucket/, 'searches must record coarse result-volume buckets');
assert.match(analytics, /outcome: count === 0 \? "no_results"/, 'zero-result searches must be distinguishable');
assert.match(analytics, /\.card-links a/, 'official result clicks must be measured from result links only');

assert.doesNotMatch(analytics, /search_term\s*:/, 'raw search terms must never be sent to GA4');
assert.doesNotMatch(analytics, /search_value\s*:/, 'raw search values must never be sent to GA4');
assert.doesNotMatch(analytics, /query\s*:\s*input\.value/, 'raw input values must never be event parameters');
assert.doesNotMatch(analytics, /link_url\s*:/, 'official destination URLs are intentionally excluded from custom telemetry');
assert.doesNotMatch(analytics, /destination_url\s*:/, 'official destination URLs are intentionally excluded from custom telemetry');

assert.match(amazon, /"affiliate_outbound"/, 'Amazon helper must own canonical affiliate outbound telemetry');
assert.match(amazon, /destination_key/, 'Amazon helper must use internal destination keys rather than outbound URLs');
assert.doesNotMatch(amazon, /"affiliate_click"/, 'Amazon helper must not emit the legacy affiliate_click event');
assert.doesNotMatch(analytics, /affiliate_outbound/, 'ManualFinder analytics must not duplicate affiliate outbound events');
assert.doesNotMatch(analytics, /affiliate_click/, 'ManualFinder analytics must not retain legacy affiliate click events');

console.log('ManualFinder analytics contract tests passed.');
