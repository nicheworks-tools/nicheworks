import fs from 'node:fs';

const gaPath = 'tools/old-kanji-reference/kanji/ga-kaku/index.html';
const rootPath = 'tools/old-kanji-reference/index.html';
const modernizerPath = 'tools/kanji-modernizer/index.html';
const sitemapPath = 'sitemap.xml';

let ga = fs.readFileSync(gaPath, 'utf8');
let root = fs.readFileSync(rootPath, 'utf8');
let modernizer = fs.readFileSync(modernizerPath, 'utf8');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

function replaceOnce(text, oldValue, newValue, label) {
  const count = text.split(oldValue).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return text.replace(oldValue, newValue);
}

ga = replaceOnce(
  ga,
  '<title>「画」の旧字体は「畫」｜「計画」は「計畫」 | NicheWorks</title>',
  '<title>「計画」の旧字体は「計畫」｜「画」は「畫」 | NicheWorks</title>',
  'ga title'
);
ga = replaceOnce(
  ga,
  '<meta name="description" content="「画」の旧字体は「畫」です。「計画」を旧字体で表すと「計畫」になります。文化庁の常用漢字表を根拠に、画と畫の対応を簡潔に確認できます。">',
  '<meta name="description" content="「計画」の旧字体は「計畫」です。「画」の旧字体「畫」との対応を、文化庁の常用漢字表を根拠に簡潔に確認できます。">',
  'ga meta description'
);
ga = replaceOnce(
  ga,
  '<meta property="og:title" content="「画」の旧字体は「畫」｜「計画」は「計畫」">',
  '<meta property="og:title" content="「計画」の旧字体は「計畫」｜「画」は「畫」">',
  'ga og title'
);
ga = replaceOnce(
  ga,
  '<meta name="twitter:title" content="「画」の旧字体は「畫」｜「計画」は「計畫」">',
  '<meta name="twitter:title" content="「計画」の旧字体は「計畫」｜「画」は「畫」">',
  'ga twitter title'
);
ga = replaceOnce(
  ga,
  '"headline":"「画」の旧字体は「畫」｜「計画」は「計畫」"',
  '"headline":"「計画」の旧字体は「計畫」｜「画」は「畫」"',
  'ga article headline'
);
ga = replaceOnce(
  ga,
  '<h1>「画」の旧字体は「畫」</h1>\n      <p class="lead">「計画」の「画」を旧字体に置き換えると、<strong>「計畫」</strong>になります。</p>',
  '<h1>「計画」の旧字体は「計畫」</h1>\n      <p class="lead">「計画」の「画」は、旧字体では<strong>「畫」</strong>です。したがって旧字体で表すと<strong>「計畫」</strong>になります。</p>',
  'ga h1 lead'
);

root = replaceOnce(
  root,
  '<a href="./kanji/ga-kaku/">「画」の旧字体「畫」と「計画→計畫」</a>',
  '<a href="./kanji/ga-kaku/">「計画」の旧字体は「計畫」（画→畫）</a>',
  'root ga anchor'
);

modernizer = replaceOnce(
  modernizer,
  '<p data-i18n="ja"><strong>変換例：</strong>舊→旧 / 學→学 / 體→体 / 畫→画 / 將→将</p>',
  '<p data-i18n="ja"><strong>変換例：</strong>舊→旧 / 學→学 / 體→体 / 畫→画 / 將→将</p>\n      <p data-i18n="ja">「計画」の旧字体を確認する場合は、<a href="../old-kanji-reference/kanji/ga-kaku/">「計画→計畫」の解説</a>があります。</p>',
  'modernizer ga link'
);

const sitemapAnchor = '    <loc>https://nicheworks.app/tools/old-kanji-reference/kanji/ga-kaku/</loc>\n    <lastmod>2026-09-16</lastmod>';
const sitemapReplacement = '    <loc>https://nicheworks.app/tools/old-kanji-reference/kanji/ga-kaku/</loc>\n    <lastmod>2026-09-17</lastmod>';
sitemap = replaceOnce(sitemap, sitemapAnchor, sitemapReplacement, 'ga sitemap lastmod');

if ((ga.match(/「計画」の旧字体は「計畫」/g) || []).length < 4) throw new Error('ga intent wording not propagated');
if ((root.match(/href="\.\/kanji\/ga-kaku\/"/g) || []).length !== 1) throw new Error('root ga link count mismatch');
if ((modernizer.match(/href="\.\.\/old-kanji-reference\/kanji\/ga-kaku\/"/g) || []).length !== 1) throw new Error('modernizer ga link count mismatch');
if ((sitemap.match(/https:\/\/nicheworks\.app\/tools\/old-kanji-reference\/kanji\/ga-kaku\//g) || []).length !== 1) throw new Error('ga sitemap URL count mismatch');
if (!sitemap.includes(sitemapReplacement)) throw new Error('ga sitemap lastmod missing');

fs.writeFileSync(gaPath, ga);
fs.writeFileSync(rootPath, root);
fs.writeFileSync(modernizerPath, modernizer);
fs.writeFileSync(sitemapPath, sitemap);
