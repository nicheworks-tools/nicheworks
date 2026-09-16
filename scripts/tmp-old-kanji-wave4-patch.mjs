import fs from 'node:fs';

const rootPath = 'tools/old-kanji-reference/index.html';
const sitemapPath = 'sitemap.xml';

let root = fs.readFileSync(rootPath, 'utf8');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

const oldRoot = `      <p class="section-desc"><span data-i18n="ja">検索需要と辞書監査の両方を確認できた文字から、個別解説を追加しています。<a href="./kanji/ga-kaku/">「画」の旧字体「畫」と「計画→計畫」</a> / <a href="./kanji/sho-shou/">「将」の旧字体「將」</a> / <a href="./kanji/kyu-old/">「旧」の旧字体「舊」</a></span><span data-i18n="en">Individual guides are added only after search-demand and dictionary checks. <a href="./kanji/ga-kaku/" lang="ja">画 / 畫 guide (Japanese)</a> / <a href="./kanji/sho-shou/" lang="ja">将 / 將 guide (Japanese)</a> / <a href="./kanji/kyu-old/" lang="ja">旧 / 舊 guide (Japanese)</a></span></p>`;
const newRoot = `${oldRoot}\n      <p class="section-desc"><span data-i18n="ja">旧字体の探し方が分からない場合は、<a href="./howto/">旧字体の調べ方</a>で検索・画像・文章変換の使い分けを確認できます。</span><span data-i18n="en">Need help choosing a method? See the <a href="./howto/" lang="ja">Japanese guide to looking up old kanji</a>.</span></p>`;

if ((root.match(new RegExp(oldRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length !== 1) {
  throw new Error('Old Kanji root insertion anchor was not found exactly once');
}
if (root.includes('href="./howto/">旧字体の調べ方</a>')) {
  throw new Error('Wave 4 root how-to link already exists');
}
root = root.replace(oldRoot, newRoot);

const oldSitemap = `    <loc>https://nicheworks.app/tools/old-kanji-reference/howto/</loc>\n    <lastmod>2026-06-16</lastmod>`;
const newSitemap = `    <loc>https://nicheworks.app/tools/old-kanji-reference/howto/</loc>\n    <lastmod>2026-09-17</lastmod>`;
if ((sitemap.match(new RegExp(oldSitemap.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length !== 1) {
  throw new Error('Old Kanji how-to sitemap anchor was not found exactly once');
}
sitemap = sitemap.replace(oldSitemap, newSitemap);

if ((root.match(/href="\.\/howto\/">旧字体の調べ方<\/a>/g) || []).length !== 1) {
  throw new Error('Expected exactly one new Old Kanji how-to root link');
}
if ((sitemap.match(/<loc>https:\/\/nicheworks\.app\/tools\/old-kanji-reference\/howto\/<\/loc>/g) || []).length !== 1) {
  throw new Error('Old Kanji Japanese how-to URL must appear exactly once in sitemap');
}

fs.writeFileSync(rootPath, root);
fs.writeFileSync(sitemapPath, sitemap);
