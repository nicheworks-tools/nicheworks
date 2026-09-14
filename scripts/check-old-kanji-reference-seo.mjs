import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'tools/old-kanji-reference/index.html'), 'utf8');
const spec = fs.readFileSync(path.join(root, 'tools/old-kanji-reference/SPEC.md'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const title = '旧字体検索・旧字体一覧｜旧字と新字体を無料で調べる | NicheWorks';
const canonical = 'https://nicheworks.app/tools/old-kanji-reference/';
const handoffs = [
  '/tools/kanji-modernizer/',
  '/tools/old-kanji-ocr-scanner/',
  '/tools/unicode-kanji-checker/',
  '/tools/variant-kanji-compare/',
];

check(html.includes(`<title>${title}</title>`), 'CTR-oriented title missing');
check(html.includes('<meta name="description" content="旧字体・旧字を1文字から検索し、新字体との対応を一覧で確認できる無料ツールです。'), 'search/list/free meta description missing');
check(html.includes(`<link rel="canonical" href="${canonical}">`), 'self-canonical missing');
check(html.includes('<span data-i18n="ja">旧字体検索・旧字体一覧</span>'), 'Japanese H1 intent missing');
check(html.includes('文章全体を変換したい場合は旧字体変換ツール、画像から調べたい場合は旧字体OCRを使ってください。'), 'visible task-boundary explanation missing');
check(html.includes('"@type":"WebApplication"'), 'WebApplication JSON-LD missing');
check(html.includes('"@type":"FAQPage"'), 'FAQPage JSON-LD missing');
check(html.includes('<section class="faq-section">'), 'visible FAQ section missing');
check(html.includes('この一覧は変換ツールとして使えますか？'), 'visible conversion-boundary FAQ missing');

const linksMatch = html.match(/<div class="nw-links">([\s\S]*?)<\/div>/);
check(Boolean(linksMatch), 'footer-near Old Kanji handoff block missing');
if (linksMatch) {
  const block = linksMatch[1];
  for (const href of handoffs) check(block.includes(`href="${href}"`), `missing required handoff: ${href}`);
  const hrefCount = (block.match(/href=/g) || []).length;
  check(hrefCount === 4, `Reference handoff block must contain exactly 4 links, found ${hrefCount}`);
  check(!block.includes('/tools/name-old-kanji-checker/'), 'Name checker must not remain in the Reference primary handoff block');
  check(!block.includes('/tools/place-old-kanji-checker/'), 'Place checker must not remain in the Reference primary handoff block');
  check(!block.includes('/tools/old-document-kanji-highlighter/'), 'Document highlighter must not remain in the Reference primary handoff block');
}

check(spec.includes('## Search cluster role'), 'Reference SPEC search-cluster role missing');
check(spec.includes('Individual-kanji indexable URLs are not part of the current contract.'), 'individual-kanji thin-page guard missing');
check(spec.includes('Current mapping data can contain identity/reference records'), 'mapping audit prerequisite missing');

if (failures.length) {
  console.error(`Old Kanji Reference SEO contract failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Old Kanji Reference SEO contract passed.');
