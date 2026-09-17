import fs from 'node:fs';

const rootPath = 'tools/old-kanji-reference/index.html';
const sitemapPath = 'sitemap.xml';

let root = fs.readFileSync(rootPath, 'utf8');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

const faqScriptMarker = '<script type="application/ld+json">\n  {"@context":"https://schema.org","@type":"FAQPage"';
const faqScriptStart = root.indexOf(faqScriptMarker);
if (faqScriptStart < 0) throw new Error('FAQPage structured-data marker not found');
const jsonStart = root.indexOf('{', faqScriptStart);
const scriptEnd = root.indexOf('\n  </script>', jsonStart);
if (jsonStart < 0 || scriptEnd < 0) throw new Error('FAQPage structured-data bounds not found');

const faq = JSON.parse(root.slice(jsonStart, scriptEnd));
if (!Array.isArray(faq.mainEntity)) throw new Error('FAQPage mainEntity missing');

const additions = [
  {
    '@type': 'Question',
    name: '「臨」の旧字体は？',
    acceptedAnswer: {
      '@type': 'Answer',
      text: '文化庁の常用漢字表では「臨」に丸括弧付きの康熙字典体は示されていません。このサイトでは、確認できた根拠のない別字を「臨の旧字体」として提示しません。'
    }
  },
  {
    '@type': 'Question',
    name: '「御」の旧字体は「禦」ですか？',
    acceptedAnswer: {
      '@type': 'Answer',
      text: '文化庁の常用漢字表では「御」に丸括弧付きの康熙字典体は示されていません。一方、文化庁の「同音の漢字による書きかえ」には「制馭（禦）→制御」があります。これは語の書換え例なので、このサイトでは「御の旧字体＝禦」と一律には扱いません。'
    }
  },
  {
    '@type': 'Question',
    name: '「魂」の旧字体は？',
    acceptedAnswer: {
      '@type': 'Answer',
      text: '文化庁の常用漢字表では「魂」に丸括弧付きの康熙字典体は示されていません。このサイトでは、確認できた根拠のない別字を「魂の旧字体」として提示しません。'
    }
  },
  {
    '@type': 'Question',
    name: '「霧」の旧字体は？',
    acceptedAnswer: {
      '@type': 'Answer',
      text: '文化庁の常用漢字表では「霧」に丸括弧付きの康熙字典体は示されていません。このサイトでは、確認できた根拠のない別字を「霧の旧字体」として提示しません。'
    }
  }
];

const existingNames = new Set(faq.mainEntity.map((item) => item?.name));
for (const item of additions) {
  if (existingNames.has(item.name)) throw new Error(`FAQ already contains: ${item.name}`);
  faq.mainEntity.push(item);
}
root = root.slice(0, jsonStart) + JSON.stringify(faq) + root.slice(scriptEnd);

const faqSectionStart = root.indexOf('<section class="faq-section">');
if (faqSectionStart < 0) throw new Error('visible FAQ section not found');
const faqSectionEnd = root.indexOf('</section>', faqSectionStart);
if (faqSectionEnd < 0) throw new Error('visible FAQ section end not found');

const visibleBlock = `
<details><summary><span data-i18n="ja">「臨」の旧字体は？</span><span data-i18n="en">Does 臨 have an old-form counterpart?</span></summary><p data-i18n="ja">文化庁の常用漢字表では「臨」に丸括弧付きの康熙字典体は示されていません。このサイトでは、確認できた根拠のない別字を「臨の旧字体」として提示しません。</p><p data-i18n="en">The Agency for Cultural Affairs Joyo Kanji Table does not show a parenthesized Kangxi-dictionary form for 臨. This site therefore does not invent a separate old-form character for it.</p></details>
<details><summary><span data-i18n="ja">「御」の旧字体は「禦」ですか？</span><span data-i18n="en">Is 禦 simply the old form of 御?</span></summary><p data-i18n="ja">文化庁の常用漢字表では「御」に丸括弧付きの康熙字典体は示されていません。一方、文化庁の「同音の漢字による書きかえ」には「制馭（禦）→制御」があります。これは語の書換え例なので、このサイトでは「御の旧字体＝禦」と一律には扱いません。</p><p data-i18n="en">The Joyo Kanji Table does not show a parenthesized Kangxi-dictionary form for 御. A separate Agency for Cultural Affairs source records 制馭（禦）→制御 as a word-level rewrite, so this site does not present 禦 as a universal old form of 御.</p></details>
<details><summary><span data-i18n="ja">「魂」の旧字体は？</span><span data-i18n="en">Does 魂 have an old-form counterpart?</span></summary><p data-i18n="ja">文化庁の常用漢字表では「魂」に丸括弧付きの康熙字典体は示されていません。このサイトでは、確認できた根拠のない別字を「魂の旧字体」として提示しません。</p><p data-i18n="en">The Agency for Cultural Affairs Joyo Kanji Table does not show a parenthesized Kangxi-dictionary form for 魂. This site therefore does not invent a separate old-form character for it.</p></details>
<details><summary><span data-i18n="ja">「霧」の旧字体は？</span><span data-i18n="en">Does 霧 have an old-form counterpart?</span></summary><p data-i18n="ja">文化庁の常用漢字表では「霧」に丸括弧付きの康熙字典体は示されていません。このサイトでは、確認できた根拠のない別字を「霧の旧字体」として提示しません。</p><p data-i18n="en">The Agency for Cultural Affairs Joyo Kanji Table does not show a parenthesized Kangxi-dictionary form for 霧. This site therefore does not invent a separate old-form character for it.</p></details>
<p class="section-desc"><span data-i18n="ja">根拠：<a href="https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/joyokanjisakuin/" target="_blank" rel="noopener">文化庁「常用漢字表の音訓索引」</a>。御・禦の関係は<a href="https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kakuki/03/pdf/doon.pdf" target="_blank" rel="noopener">文化庁「同音の漢字による書きかえ」</a>の語例も確認しています。</span><span data-i18n="en">Sources: <a href="https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/joyokanjisakuin/" target="_blank" rel="noopener">Agency for Cultural Affairs Joyo Kanji index</a> and its <a href="https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kakuki/03/pdf/doon.pdf" target="_blank" rel="noopener">homophone rewrite reference</a>.</span></p>`;

root = root.slice(0, faqSectionEnd) + visibleBlock + root.slice(faqSectionEnd);

const sitemapOld = '    <loc>https://nicheworks.app/tools/old-kanji-reference/</loc>\n    <lastmod>2026-06-16</lastmod>';
const sitemapNew = '    <loc>https://nicheworks.app/tools/old-kanji-reference/</loc>\n    <lastmod>2026-09-17</lastmod>';
const sitemapCount = sitemap.split(sitemapOld).length - 1;
if (sitemapCount !== 1) throw new Error(`root sitemap anchor count mismatch: ${sitemapCount}`);
sitemap = sitemap.replace(sitemapOld, sitemapNew);

for (const question of additions.map((item) => item.name)) {
  const count = root.split(question).length - 1;
  if (count !== 2) throw new Error(`expected structured + visible question exactly twice: ${question}, got ${count}`);
}
if (root.includes('御の旧字体＝禦</')) throw new Error('unsafe universal 御/禦 equation detected');
if ((root.match(/<link rel="canonical" href="https:\/\/nicheworks\.app\/tools\/old-kanji-reference\/">/g) || []).length !== 1) throw new Error('root canonical changed or duplicated');
if ((sitemap.match(/https:\/\/nicheworks\.app\/tools\/old-kanji-reference\/<\/loc>/g) || []).length !== 1) throw new Error('root sitemap URL count mismatch');
if (!sitemap.includes(sitemapNew)) throw new Error('root sitemap lastmod not updated');

fs.writeFileSync(rootPath, root);
fs.writeFileSync(sitemapPath, sitemap);
