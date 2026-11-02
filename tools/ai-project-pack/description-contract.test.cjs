'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const [locale, file] of [['en', 'index.html'], ['ja', 'ja/index.html']]) {
  test(`AI Project Pack ${locale} metadata describes the repository guide`, () => {
    const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const descriptions = [
      /<meta name="description" content="([^"]+)">/,
      /<meta property="og:description" content="([^"]+)">/,
      /<meta name="twitter:description" content="([^"]+)">/,
    ].map((pattern) => {
      const match = html.match(pattern);
      assert.ok(match, `missing metadata ${pattern}`);
      return match[1];
    });
    assert.equal(new Set(descriptions).size, 1, 'SEO/social descriptions must agree');
    assert.match(descriptions[0], /AI Project Pack/);
    assert.match(descriptions[0], /report-only/);
    assert.doesNotMatch(descriptions[0], /ブラウザだけで使えるNicheWorks/);
    assert.match(html, /https:\/\/github.com\/nicheworks-tools\/ai-project-pack\/tree\/main/);
    assert.match(html, /<meta name="robots" content="index,follow">/);
  });
}
