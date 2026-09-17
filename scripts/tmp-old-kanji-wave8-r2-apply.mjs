import fs from 'node:fs';

const rootPath = 'tools/old-kanji-reference/index.html';
const sitemapPath = 'sitemap.xml';
const workflowPath = '.github/workflows/tmp-old-kanji-wave8-r2-apply.yml';
const selfPath = 'scripts/tmp-old-kanji-wave8-r2-apply.mjs';

let root = fs.readFileSync(rootPath, 'utf8');
const nameLink = '名前や戸籍の旧字体・異体字候補を調べたい場合は、<a href="../name-old-kanji-checker/">人名旧字体チェッカー</a>で名前を1文字ずつ確認できます。戸籍・公的書類の正式表記は実際の登録字体を確認してください。';
if (!root.includes(nameLink)) {
  const anchor = '      <p class="section-desc"><span data-i18n="ja">文章全体を旧字体・新字体へ変換したい場合は、<a href="../kanji-modernizer/">旧字体変換・旧漢字変換ツール</a>を使えます。</span><span data-i18n="en">For whole-text conversion, use <a href="../kanji-modernizer/">Kanji Modernizer</a>.</span></p>';
  if (!root.includes(anchor)) throw new Error('Old Kanji Reference insertion anchor not found');
  const insertion = '      <p class="section-desc"><span data-i18n="ja">' + nameLink + '</span><span data-i18n="en">For name-specific old/variant kanji candidates, use the <a href="../name-old-kanji-checker/">Name Old Kanji Checker</a>. Verify official spellings against the actual registered glyph.</span></p>\n';
  root = root.replace(anchor, insertion + anchor);
  fs.writeFileSync(rootPath, root);
}

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const re = /(<loc>https:\/\/nicheworks\.app\/tools\/name-old-kanji-checker\/<\/loc>\s*<lastmod>)([^<]+)(<\/lastmod>)/;
if (!re.test(sitemap)) throw new Error('Name Old Kanji Checker sitemap entry not found');
sitemap = sitemap.replace(re, '$12026-09-17$3');
fs.writeFileSync(sitemapPath, sitemap);

fs.rmSync(workflowPath, { force: true });
fs.rmSync(selfPath, { force: true });
