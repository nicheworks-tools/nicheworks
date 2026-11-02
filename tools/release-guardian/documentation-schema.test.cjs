const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const relative of ['index.html', 'ja/index.html']) {
  test(`Release Guardian ${relative} describes a guide, not an in-browser scanner`, () => {
    const html = fs.readFileSync(path.join(__dirname, relative), 'utf8');
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]));
    const article = scripts.find((entry) => entry['@type'] === 'TechArticle');
    assert.ok(article, 'documentation needs TechArticle structured data');
    assert.equal(article.url, 'https://nicheworks.app/tools/release-guardian/');
    assert.ok(article.description.includes('release-preflight'));
    assert.ok(!scripts.some((entry) => entry['@type'] === 'WebApplication'),
      'the web page does not execute repository checks');
    assert.match(html, /report-only/);
    assert.match(html, /safe-fix/);
    assert.match(html, /github\.com\/nicheworks-tools\/release-guardian/);
  });
}
