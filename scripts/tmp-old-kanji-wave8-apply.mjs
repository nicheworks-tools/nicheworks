import fs from 'node:fs';

const rootPath = 'tools/old-kanji-reference/index.html';
const sitemapPath = 'sitemap.xml';
const workflowPath = '.github/workflows/tmp-old-kanji-wave8-apply.yml';
const scriptPath = 'scripts/tmp-old-kanji-wave8-apply.mjs';

let root = fs.readFileSync(rootPath, 'utf8');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

const anchor = '      <p class="section-desc"><span data-i18n="ja">文章全体を旧字体・新字体へ変換したい場合は、<a href="../kanji-modernizer/">旧字体変換・旧漢字変換ツール</a>を使えます。</span><span data-i18n="en">For whole-text conversion, use <a href="../kanji-modernizer/">Kanji Modernizer</a>.</span></p>';
const addition = `${anchor}\n      <p class="section-desc"><span data-i18n="ja">名前や戸籍で使われる旧字体・異体字候補を確認したい場合は、<a href="../name-old-kanji-checker/">名前の旧字体・異体字を調べる</a>を使えます。正式な登録字体は戸籍・公的書類で確認してください。</span><span data-i18n="en">For old or variant kanji candidates in names, use the <a href="../name-old-kanji-checker/">Name Old Kanji Checker</a>. Verify official registered glyphs against official records.</span></p>`;

if ((root.match(new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length !== 1) {
  throw new Error('Expected exactly one converter paragraph anchor');
}
if (root.includes('../name-old-kanji-checker/')) {
  throw new Error('Name checker root link already exists; refusing duplicate insertion');
}
root = root.replace(anchor, addition);

const oldBlock = `    <loc>https://nicheworks.app/tools/name-old-kanji-checker/</loc>\n    <lastmod>2026-06-16</lastmod>`;
const newBlock = `    <loc>https://nicheworks.app/tools/name-old-kanji-checker/</loc>\n    <lastmod>2026-09-17</lastmod>`;
if ((sitemap.match(/<loc>https:\/\/nicheworks\.app\/tools\/name-old-kanji-checker\/<\/loc>/g) || []).length !== 1) {
  throw new Error('Expected exactly one Name Old Kanji Checker sitemap URL');
}
if (!sitemap.includes(oldBlock)) {
  throw new Error('Expected Name Old Kanji Checker sitemap block not found');
}
sitemap = sitemap.replace(oldBlock, newBlock);

fs.writeFileSync(rootPath, root);
fs.writeFileSync(sitemapPath, sitemap);
fs.unlinkSync(workflowPath);
fs.unlinkSync(scriptPath);
