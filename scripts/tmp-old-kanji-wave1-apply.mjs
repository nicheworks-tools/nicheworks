import fs from 'node:fs';

const rootPath = 'tools/old-kanji-reference/index.html';
const sitemapPath = 'sitemap.xml';
const pagePath = 'tools/old-kanji-reference/kanji/ga-kaku/index.html';

if (!fs.existsSync(pagePath)) throw new Error('Wave 1 page is missing');
const page = fs.readFileSync(pagePath, 'utf8');
for (const required of ['「画」の旧字体は「畫」', '計画', '計畫', 'www.bunka.go.jp']) {
  if (!page.includes(required)) throw new Error(`Wave 1 page missing required content: ${required}`);
}

const root = fs.readFileSync(rootPath, 'utf8');
const rootNeedle = `    <section class="popular-panel">`;
if (!root.includes(rootNeedle)) throw new Error('Old Kanji root insertion point not found');
if (root.includes('./kanji/ga-kaku/')) throw new Error('Old Kanji root already links to Wave 1 page');
const rootInsert = `    <section class="popular-panel" aria-label="Individual kanji guides">\n      <h2 class="section-title"><span data-i18n="ja">個別の旧字体解説</span><span data-i18n="en">Individual kanji guides</span></h2>\n      <p class="section-desc"><span data-i18n="ja">検索需要と辞書監査の両方を確認できた文字から、個別解説を追加しています。<a href="./kanji/ga-kaku/">「画」の旧字体「畫」と「計画→計畫」</a></span><span data-i18n="en">Individual guides are added only after search-demand and dictionary checks. <a href="./kanji/ga-kaku/" lang="ja">画 / 畫 guide (Japanese)</a></span></p>\n    </section>\n\n`;
fs.writeFileSync(rootPath, root.replace(rootNeedle, rootInsert + rootNeedle));

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapNeedle = `  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/</loc>\n    <lastmod>2026-06-16</lastmod>\n  </url>`;
if (!sitemap.includes(sitemapNeedle)) throw new Error('Old Kanji sitemap insertion point not found');
if (sitemap.includes('/tools/old-kanji-reference/kanji/ga-kaku/')) throw new Error('Wave 1 URL already exists in sitemap');
const sitemapInsert = `${sitemapNeedle}\n  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/kanji/ga-kaku/</loc>\n    <lastmod>2026-09-16</lastmod>\n  </url>`;
fs.writeFileSync(sitemapPath, sitemap.replace(sitemapNeedle, sitemapInsert));

const updatedRoot = fs.readFileSync(rootPath, 'utf8');
const updatedSitemap = fs.readFileSync(sitemapPath, 'utf8');
if ((updatedRoot.match(/\.\/kanji\/ga-kaku\//g) || []).length !== 2) throw new Error('Expected exactly two bilingual root link occurrences');
if ((updatedSitemap.match(/old-kanji-reference\/kanji\/ga-kaku\//g) || []).length !== 1) throw new Error('Expected exactly one sitemap URL');

fs.unlinkSync('scripts/tmp-old-kanji-wave1-apply.mjs');
fs.unlinkSync('.github/workflows/tmp-old-kanji-wave1-apply.yml');
