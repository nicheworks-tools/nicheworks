import assert from 'node:assert/strict';
import fs from 'node:fs';
import { patterns } from '../js/data/patterns-all.js';
import { setupPatternDeepLinks } from '../js/deep-link.js';

const expected = patterns.map(p => p.slug).sort();
assert.equal(expected.length, 30, 'catalog must have 30 entries');
assert.equal(new Set(expected).size, 30, 'all slug URLs must be unique');
for (const file of ['../index.html', '../ja/index.html']) {
  const html = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const urls = [...html.matchAll(/href="\?pattern=([^"]+)"/g)].map(m => m[1]).sort();
  assert.deepEqual(urls, expected, file + ' must expose the whole catalog in crawled HTML');
  assert.match(html, /modern reconstructions|現代的な再構成/,
    'static guide should not claim historical authenticity');
  assert.ok(html.indexOf('id="pattern-index-title"') < html.indexOf('id="list-title"'));
}

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const detail = fs.readFileSync(new URL('../js/detail-ui.js', import.meta.url), 'utf8');
assert.match(app, /setupPatternDeepLinks\(\{ root, patterns \}\);/);
assert.match(detail, /pa-pattern-permalink/);
assert.match(detail, /encodeURIComponent\(pattern.slug\)/);

const previousWindow = globalThis.window;
let clickHandler;
let clickCount = 0;
const historyValues = [];
const current = patterns.find(p => p.slug === 'seigaiha');
const card = {
  dataset: { paPatternId: current.id },
  querySelector(selector) {
    assert.equal(selector, '.pa-card-actions button');
    return { click() { clickCount += 1; } };
  }
};
const root = {
  addEventListener(name, handler) { assert.equal(name, 'click'); clickHandler = handler; },
  querySelectorAll(selector) { assert.equal(selector, '[data-pa-card]'); return [card]; }
};
const location = { origin: 'https://nicheworks.app', pathname: '/tools/pattern-atlas/ja/', search: '?pattern=seigaiha' };
try {
  globalThis.window = {
    location,
    history: { replaceState(_state, _title, url) { historyValues.push(url); } }
  };
  setupPatternDeepLinks({ root, patterns });
  assert.equal(clickCount, 1, 'valid direct link restores the canonical card');
  const button = {
    closest(selector) { return selector === '[data-pa-card]' ? card : null; }
  };
  clickHandler({
    target: { closest(selector) { return selector === '.pa-card-actions button' ? button : null; } }
  });
  assert.deepEqual(historyValues, ['/tools/pattern-atlas/ja/?pattern=seigaiha'],
    'same-language URL only contains a canonical slug');
  clickCount = 0;
  location.search = '?pattern=made-up';
  setupPatternDeepLinks({ root, patterns });
  assert.equal(clickCount, 0, 'unknown or untrusted slugs must be ignored');
} finally {
  globalThis.window = previousWindow;
}

console.log('PASS: Pattern Atlas 30-entry bilingual index and safe deep linking');
