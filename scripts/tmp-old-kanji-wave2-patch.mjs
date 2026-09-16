import fs from 'node:fs';

const replaceExactlyOnce = (text, before, after, label) => {
  const first = text.indexOf(before);
  if (first === -1) throw new Error(`${label}: anchor not found`);
  if (text.indexOf(before, first + before.length) !== -1) throw new Error(`${label}: anchor not unique`);
  return text.slice(0, first) + after + text.slice(first + before.length);
};

const indexPath = 'tools/old-kanji-reference/index.html';
let index = fs.readFileSync(indexPath, 'utf8');
const indexBefore = '<p class="section-desc"><span data-i18n="ja">検索需要と辞書監査の両方を確認できた文字から、個別解説を追加しています。<a href="./kanji/ga-kaku/">「画」の旧字体「畫」と「計画→計畫」</a></span><span data-i18n="en">Individual guides are added only after search-demand and dictionary checks. <a href="./kanji/ga-kaku/" lang="ja">画 / 畫 guide (Japanese)</a></span></p>';
const indexAfter = '<p class="section-desc"><span data-i18n="ja">検索需要と辞書監査の両方を確認できた文字から、個別解説を追加しています。<a href="./kanji/ga-kaku/">「画」の旧字体「畫」と「計画→計畫」</a> / <a href="./kanji/sho-shou/">「将」の旧字体「將」</a></span><span data-i18n="en">Individual guides are added only after search-demand and dictionary checks. <a href="./kanji/ga-kaku/" lang="ja">画 / 畫 guide (Japanese)</a> / <a href="./kanji/sho-shou/" lang="ja">将 / 將 guide (Japanese)</a></span></p>';
index = replaceExactlyOnce(index, indexBefore, indexAfter, 'old-kanji root guide links');
fs.writeFileSync(indexPath, index);

const sitemapPath = 'sitemap.xml';
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapBefore = `  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/kanji/ga-kaku/</loc>\n    <lastmod>2026-09-16</lastmod>\n  </url>`;
const sitemapAfter = `${sitemapBefore}\n  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/kanji/sho-shou/</loc>\n    <lastmod>2026-09-17</lastmod>\n  </url>`;
sitemap = replaceExactlyOnce(sitemap, sitemapBefore, sitemapAfter, 'sitemap ga-kaku entry');
fs.writeFileSync(sitemapPath, sitemap);

for (const [path, needle] of [
  [indexPath, './kanji/sho-shou/'],
  [sitemapPath, 'https://nicheworks.app/tools/old-kanji-reference/kanji/sho-shou/']
]) {
  const text = fs.readFileSync(path, 'utf8');
  const count = text.split(needle).length - 1;
  if (path === sitemapPath && count !== 1) throw new Error(`${path}: expected one sitemap URL, got ${count}`);
  if (path === indexPath && count !== 2) throw new Error(`${path}: expected JP+EN internal links, got ${count}`);
}

console.log('Old Kanji Wave 2 guarded patch applied.');
