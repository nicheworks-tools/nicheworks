import fs from 'node:fs';

function replaceExactlyOnce(text, before, after, label) {
  const parts = text.split(before);
  if (parts.length !== 2) {
    throw new Error(`${label}: expected exactly one match, found ${parts.length - 1}`);
  }
  return parts[0] + after + parts[1];
}

const indexPath = 'tools/old-kanji-reference/index.html';
const sitemapPath = 'sitemap.xml';

let index = fs.readFileSync(indexPath, 'utf8');
const oldGuide = `      <p class="section-desc"><span data-i18n="ja">検索需要と辞書監査の両方を確認できた文字から、個別解説を追加しています。<a href="./kanji/ga-kaku/">「画」の旧字体「畫」と「計画→計畫」</a> / <a href="./kanji/sho-shou/">「将」の旧字体「將」</a></span><span data-i18n="en">Individual guides are added only after search-demand and dictionary checks. <a href="./kanji/ga-kaku/" lang="ja">画 / 畫 guide (Japanese)</a> / <a href="./kanji/sho-shou/" lang="ja">将 / 將 guide (Japanese)</a></span></p>`;
const newGuide = `      <p class="section-desc"><span data-i18n="ja">検索需要と辞書監査の両方を確認できた文字から、個別解説を追加しています。<a href="./kanji/ga-kaku/">「画」の旧字体「畫」と「計画→計畫」</a> / <a href="./kanji/sho-shou/">「将」の旧字体「將」</a> / <a href="./kanji/kyu-old/">「旧」の旧字体「舊」</a></span><span data-i18n="en">Individual guides are added only after search-demand and dictionary checks. <a href="./kanji/ga-kaku/" lang="ja">画 / 畫 guide (Japanese)</a> / <a href="./kanji/sho-shou/" lang="ja">将 / 將 guide (Japanese)</a> / <a href="./kanji/kyu-old/" lang="ja">旧 / 舊 guide (Japanese)</a></span></p>`;
if (index.includes('./kanji/kyu-old/')) throw new Error('index: Wave 3 link already exists');
index = replaceExactlyOnce(index, oldGuide, newGuide, 'index');
fs.writeFileSync(indexPath, index);

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const oldSitemap = `  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/kanji/sho-shou/</loc>\n    <lastmod>2026-09-17</lastmod>\n  </url>\n  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/howto/</loc>`;
const newSitemap = `  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/kanji/sho-shou/</loc>\n    <lastmod>2026-09-17</lastmod>\n  </url>\n  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/kanji/kyu-old/</loc>\n    <lastmod>2026-09-17</lastmod>\n  </url>\n  <url>\n    <loc>https://nicheworks.app/tools/old-kanji-reference/howto/</loc>`;
if (sitemap.includes('https://nicheworks.app/tools/old-kanji-reference/kanji/kyu-old/')) throw new Error('sitemap: Wave 3 URL already exists');
sitemap = replaceExactlyOnce(sitemap, oldSitemap, newSitemap, 'sitemap');
fs.writeFileSync(sitemapPath, sitemap);

console.log('Old Kanji Wave 3 guarded patch applied.');
