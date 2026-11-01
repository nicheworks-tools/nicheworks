import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const app = fs.readFileSync(new URL('app.js', root), 'utf8');
const en = fs.readFileSync(new URL('index.html', root), 'utf8');
const ja = fs.readFileSync(new URL('ja/index.html', root), 'utf8');
const payload = JSON.parse(fs.readFileSync(new URL('data/patterns.free.v1.json', root), 'utf8'));
const records = payload.patterns;
assert.ok(records.length >= 1);
const knownSlug = records[0].slug;
assert.ok(typeof knownSlug === 'string' && knownSlug.length > 0);

for (const [language, html] of [['EN', en], ['JA', ja]]) {
  assert.equal(html.split('data-copy-pattern-link').length - 1, 1, language + ' must have one copy control');
  assert.equal(html.split('data-detail-permalink').length - 1, 1, language + ' must have one native link');
  assert.match(html, /data-copy-pattern-link disabled/);
  assert.match(html, /data-detail-permalink hidden/);
}
assert.match(app, /async function copyPatternLink\(\)/);
assert.match(app, /get\('pattern'\)/, 'deep link restored after dataset loads');
assert.match(app, /if \(selectedCard\) openDetail\(selectedCard\);/);
assert.match(app, /copyLinkBtn\.disabled = !link/, 'reject links outside canonical list');
assert.match(app, /url\.searchParams\.delete\('pattern'\)/, 'closing detail clears selection');

const start = app.indexOf('  function detailUrl(slug) {');
const end = app.indexOf('\n  function closeDetailSheet()', start);
assert.ok(start >= 0 && end > start);
const fn = app.slice(start, end);
const context = {
  bySlug: new Map([[knownSlug, { id: records[0].id }]]),
  URL,
  window: { location: { pathname: '/tools/ui-atlas/ja/', origin: 'https://nicheworks.app' } }
};
vm.runInNewContext(fn + '\nglobalThis.makeLink = detailUrl;', context);
assert.equal(context.makeLink(knownSlug),
  '/tools/ui-atlas/ja/?pattern=' + encodeURIComponent(knownSlug));
assert.equal(context.makeLink('not-in-the-catalog'), '',
  'unknown query data must not appear in share URL');
assert.equal(context.makeLink('invalid&src=bad'), '');

console.log('PASS: UI Atlas canonical share links, JA/EN controls, and safe detail restoration');
