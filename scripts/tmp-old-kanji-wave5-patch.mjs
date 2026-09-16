import fs from 'node:fs';

const modernizerPath = 'tools/kanji-modernizer/index.html';
const referencePath = 'tools/old-kanji-reference/index.html';
const sitemapPath = 'sitemap.xml';

let modernizer = fs.readFileSync(modernizerPath, 'utf8');
let reference = fs.readFileSync(referencePath, 'utf8');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

function replaceOnce(text, oldValue, newValue, label) {
  const count = text.split(oldValue).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return text.replace(oldValue, newValue);
}

modernizer = replaceOnce(
  modernizer,
  '<title>旧字体→新字体 変換｜Kanji Modernizer | NicheWorks</title>',
  '<title>旧字体変換・旧漢字変換｜新字体⇄旧字体を無料で一括変換 | NicheWorks</title>',
  'title'
);
modernizer = replaceOnce(
  modernizer,
  '<meta name="description" content="旧字体・新字体を辞書ベースで一括変換する無料ツール。姓名・地名・古文書などの旧字を現代漢字へ変換し、新→旧にも対応。入力本文は送信しません。">',
  '<meta name="description" content="旧字体・旧漢字を新字体へ、新字体を旧字体候補へ一括変換する無料ツール。舊→旧、學→学、體→体など辞書ベースで変換し、置換箇所と候補を確認できます。">',
  'meta description'
);
modernizer = replaceOnce(
  modernizer,
  '<meta property="og:title" content="旧字体→新字体 変換｜Kanji Modernizer | NicheWorks">',
  '<meta property="og:title" content="旧字体変換・旧漢字変換｜新字体⇄旧字体を無料で一括変換 | NicheWorks">',
  'og title'
);
modernizer = replaceOnce(
  modernizer,
  '<meta property="og:description" content="旧字体・新字体を辞書ベースで一括変換する無料ツール。姓名・地名・古文書などの旧字を現代漢字へ変換し、新→旧にも対応。入力本文は送信しません。">',
  '<meta property="og:description" content="旧字体・旧漢字を新字体へ、新字体を旧字体候補へ文章ごとに変換できる無料ツールです。">',
  'og description'
);
modernizer = replaceOnce(
  modernizer,
  '<meta name="twitter:title" content="旧字体→新字体 変換｜Kanji Modernizer | NicheWorks">',
  '<meta name="twitter:title" content="旧字体変換・旧漢字変換｜新字体⇄旧字体を無料で一括変換 | NicheWorks">',
  'twitter title'
);
modernizer = replaceOnce(
  modernizer,
  '<meta name="twitter:description" content="旧字体・新字体を辞書ベースで一括変換する無料ツール。姓名・地名・古文書などの旧字を現代漢字へ変換し、新→旧にも対応。入力本文は送信しません。">',
  '<meta name="twitter:description" content="旧字体・旧漢字を新字体へ、新字体を旧字体候補へ文章ごとに変換できる無料ツールです。">',
  'twitter description'
);
modernizer = replaceOnce(
  modernizer,
  '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"Kanji Modernizer","url":"https://nicheworks.app/tools/kanji-modernizer/","applicationCategory":"UtilityApplication","description":"旧字体・新字体を辞書ベースで一括変換する無料ツール。","operatingSystem":"All"}</script>',
  '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"旧字体変換・旧漢字変換（Kanji Modernizer）","url":"https://nicheworks.app/tools/kanji-modernizer/","applicationCategory":"UtilityApplication","description":"旧字体・旧漢字を新字体へ、新字体を旧字体候補へ文章ごとに変換する辞書ベースの無料ツール。","operatingSystem":"All"}</script>',
  'WebApplication JSON-LD'
);
modernizer = replaceOnce(
  modernizer,
  '<h1 class="nw-title"><span data-i18n="ja">旧字体・新字体 一括変換ツール</span><span data-i18n="en">Kanji Modernizer</span></h1>',
  '<h1 class="nw-title"><span data-i18n="ja">旧字体変換・旧漢字変換</span><span data-i18n="en">Kanji Modernizer</span></h1>',
  'h1'
);
modernizer = replaceOnce(
  modernizer,
  '<p class="nw-subtitle"><span data-i18n="ja">旧字・新字を辞書ベースで変換し、置換箇所と回数を確認できます。</span><span data-i18n="en">Convert old and modern kanji with a dictionary-based checker and replacement summary.</span></p>',
  '<p class="nw-subtitle"><span data-i18n="ja">旧字体・旧漢字を新字体へ、新字体を旧字体候補へ文章ごとに一括変換できます。</span><span data-i18n="en">Convert old and modern kanji with a dictionary-based checker and replacement summary.</span></p>',
  'subtitle'
);
modernizer = replaceOnce(
  modernizer,
  '<p><span data-i18n="ja">旧字体（例：舊・學・體）を新字体へ、または新字体を旧字体候補へ変換します。人名・地名・古い文書の確認用の補助ツールです。</span><span data-i18n="en">Convert old-style kanji into modern forms, or convert modern kanji back to old-form candidates.</span></p>\n      <p class="usage-link"><a href="./usage.html" data-i18n="ja">使い方・注意点はこちら</a><a href="./usage-en.html" data-i18n="en">Usage guide and notes</a></p>',
  '<p><span data-i18n="ja">旧字体・旧漢字を文章ごと新字体へ変換できます。初期設定は「旧 → 新」です。</span><span data-i18n="en">Convert old-style kanji into modern forms, or convert modern kanji back to old-form candidates.</span></p>\n      <p data-i18n="ja"><strong>変換例：</strong>舊→旧 / 學→学 / 體→体 / 畫→画 / 將→将</p>\n      <p data-i18n="ja">「新 → 旧」は辞書にある旧字体候補を返します。候補が複数ある文字は一意に決まらないため、用途に応じて確認してください。</p>\n      <p data-i18n="ja">文字単位の辞書置換であり、文脈判定や戸籍・登記などの正式表記の確認を行うものではありません。</p>\n      <p class="usage-link"><a href="./usage.html" data-i18n="ja">使い方・注意点はこちら</a><a href="./usage-en.html" data-i18n="en">Usage guide and notes</a></p>',
  'intro copy'
);

const referenceAnchor = '      <p class="section-desc"><span data-i18n="ja">旧字体の探し方が分からない場合は、<a href="./howto/">旧字体の調べ方</a>で検索・画像・文章変換の使い分けを確認できます。</span><span data-i18n="en">Need help choosing a method? See the <a href="./howto/" lang="ja">Japanese guide to looking up old kanji</a>.</span></p>';
const referenceReplacement = `${referenceAnchor}\n      <p class="section-desc"><span data-i18n="ja">文章全体を旧字体・新字体へ変換したい場合は、<a href="../kanji-modernizer/">旧字体変換・旧漢字変換ツール</a>を使えます。</span><span data-i18n="en">For whole-text conversion, use <a href="../kanji-modernizer/">Kanji Modernizer</a>.</span></p>`;
if (reference.includes('href="../kanji-modernizer/">旧字体変換・旧漢字変換ツール</a>')) {
  throw new Error('reference conversion link already exists');
}
reference = replaceOnce(reference, referenceAnchor, referenceReplacement, 'Old Kanji Reference conversion link');

const sitemapRe = /(<loc>https:\/\/nicheworks\.app\/tools\/kanji-modernizer\/<\/loc>\s*\n\s*<lastmod>)(\d{4}-\d{2}-\d{2})(<\/lastmod>)/;
const sitemapMatches = sitemap.match(new RegExp(sitemapRe.source, 'g')) || [];
if (sitemapMatches.length !== 1) throw new Error(`sitemap modernizer entry: expected 1, found ${sitemapMatches.length}`);
sitemap = sitemap.replace(sitemapRe, (_match, before, _date, after) => `${before}2026-09-17${after}`);

if ((modernizer.match(/旧字体変換・旧漢字変換/g) || []).length < 4) throw new Error('conversion intent terms not propagated');
if ((reference.match(/href="\.\.\/kanji-modernizer\/"/g) || []).length !== 1) throw new Error('expected exactly one new reference-to-modernizer link');
if (!sitemap.includes('<loc>https://nicheworks.app/tools/kanji-modernizer/</loc>\n    <lastmod>2026-09-17</lastmod>')) throw new Error('modernizer sitemap lastmod not updated');

fs.writeFileSync(modernizerPath, modernizer);
fs.writeFileSync(referencePath, reference);
fs.writeFileSync(sitemapPath, sitemap);
