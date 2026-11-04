const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const [relative, lang] of [['index.html', 'en'], ['ja/index.html', 'ja']]) {
  test('Product Founder OS ' + relative + ' accurately labels external repository documentation', () => {
    const html = fs.readFileSync(path.join(__dirname, relative), 'utf8');
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map(match => JSON.parse(match[1]));
    const url = 'https://nicheworks.app/tools/product-founder-os/' + (lang === 'ja' ? 'ja/' : '');
    const article = blocks.find(entry => entry['@type'] === 'TechArticle');
    assert.ok(article, 'documentation-first page must have TechArticle');
    assert.equal(article.url, url);
    assert.equal(article.inLanguage, lang);
    assert.ok(article.description.includes('repository') || article.description.includes('リポジトリ'));
    assert.ok(!blocks.some(entry => entry['@type'] === 'WebApplication'),
      'NicheWorks guide does not run a project manager or repository editor');
    assert.ok(blocks.some(entry => entry['@type'] === 'FAQPage'), 'keep existing FAQ schema');
    assert.ok(blocks.some(entry => entry['@type'] === 'WebPage'), 'keep existing page schema');
    assert.match(html, /https:\/\/github\.com\/nicheworks-tools\/product-founder-os\/tree\/main/);
    assert.match(html, /<link rel="canonical" href="https:\/\/nicheworks\.app\/tools\/product-founder-os\//);
  });
}

test('English and Japanese documentation preserve the same outbound repository asset', () => {
  const pages = ['index.html', 'ja/index.html'].map(relative =>
    fs.readFileSync(path.join(__dirname, relative), 'utf8'));
  const url = 'https://github.com/nicheworks-tools/product-founder-os/tree/main';
  for (const html of pages) {
    assert.ok(html.includes(url));
    assert.ok(html.includes('G-57QT78M3JB'), 'existing analytics must remain intact');
  }
});
