import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, value) => fs.writeFileSync(path.join(root, rel), value);

const rel = 'tools/laundry-code-decode/index.html';
let html = read(rel);

const oldH1 = '<h1>洗濯表示記号デコーダ</h1>';
const newH1 = '<h1><span data-i18n="ja">洗濯表示記号の意味</span><span data-i18n="en">Laundry Care Symbol Meanings</span></h1>';
if (!html.includes(oldH1)) throw new Error('Laundry Code H1 anchor not found');
html = html.replace(oldH1, newH1);

const anchor = '      <p class="privacy-note" data-i18n="ja">洗濯表示の意味を確認したあと、今の気温・湿度・風から乾きやすさを見たい場合は <a href="/tools/dry-meter/">Dry Meter</a> を使えます。</p>';
if (!html.includes(anchor)) throw new Error('Dry Meter contextual-link anchor not found');

if (!html.includes('洗濯表示の見方')) {
  const guide = `      <section class="notice-card" aria-label="洗濯表示の見方">\n        <h2 data-i18n="ja">洗濯表示の見方</h2>\n        <h2 data-i18n="en">How to read laundry care symbols</h2>\n        <p data-i18n="ja">現行のJIS L 0001:2024は、洗濯おけ・三角形・正方形・アイロン・円の5つの基本記号を使います。表示は原則として、家庭洗濯、漂白、乾燥、アイロン、商業クリーニングの順に読みます。このツールでは乾燥をタンブル乾燥と自然乾燥、商業クリーニングをドライクリーニングとウエットクリーニングに分け、公式7表・43記号を収録しています。</p>\n        <p data-i18n="en">JIS L 0001:2024 uses five basic shapes: wash tub, triangle, square, iron, and circle. They are read in the general order of washing, bleaching, drying, ironing, and professional cleaning. This tool splits drying into tumble/natural drying and professional cleaning into dry/wet cleaning, covering the 43 symbols in the seven official tables.</p>\n        <ul>\n          <li data-i18n="ja"><strong>洗濯おけ：</strong>数字は液温の上限、下線は処理の弱さを示します。例：記号141は「40℃まで・弱い洗濯」です。</li>\n          <li data-i18n="en"><strong>Wash tub:</strong> the number is the maximum wash temperature and underlines indicate gentler treatment. Example: symbol 141 means gentle wash up to 40°C.</li>\n          <li data-i18n="ja"><strong>三角形：</strong>漂白の可否、<strong>正方形：</strong>タンブル乾燥・自然乾燥の方法を示します。</li>\n          <li data-i18n="en"><strong>Triangle:</strong> bleaching instructions; <strong>square:</strong> tumble or natural drying instructions.</li>\n          <li data-i18n="ja"><strong>アイロン：</strong>底面温度の上限を示します。記号511は「120℃まで・スチーム禁止」です。</li>\n          <li data-i18n="en"><strong>Iron:</strong> shows the sole-plate temperature limit. Symbol 511 means iron up to 120°C without steam.</li>\n          <li data-i18n="ja"><strong>円：</strong>ドライクリーニングやウエットクリーニングなど、専門業者による処理を示します。</li>\n          <li data-i18n="en"><strong>Circle:</strong> indicates professional care such as dry cleaning or wet cleaning.</li>\n        </ul>\n        <p data-i18n="ja">記号番号が分かる場合は、検索欄へ「141」「511」のように入力すると直接絞り込めます。実際の衣類では、記号の近くにある「洗濯ネット使用」などの付記用語も合わせて確認してください。</p>\n        <p data-i18n="en">If you know the official number, enter a value such as “141” or “511” in the search box. On an actual garment, also read any nearby supplementary wording such as laundry-net instructions.</p>\n      </section>\n\n`;
  html = html.replace(anchor, guide + anchor);
}
write(rel, html);

const specRel = 'tools/laundry-code-decode/SPEC.md';
let spec = read(specRel);
const contractAnchor = '- Search by Japanese/English meaning, internal ID, professional-care letter, temperature where applicable, and official JIS symbol number.\n';
if (!spec.includes(contractAnchor)) throw new Error('SPEC functional anchor not found');
if (!spec.includes('crawlable static overview')) {
  spec = spec.replace(contractAnchor, contractAnchor + '- Keep a crawlable static overview of the five basic care-symbol shapes, official reading order, seven-table/43-symbol scope, and representative symbol-number examples so the core meaning is available before JavaScript renders the interactive grid.\n');
}
const acceptanceAnchor = '- [ ] Search accepts official symbol numbers such as `141` and `511`.\n';
if (!spec.includes(acceptanceAnchor)) throw new Error('SPEC acceptance anchor not found');
if (!spec.includes('Public H1 and static overview')) {
  spec = spec.replace(acceptanceAnchor, acceptanceAnchor + '- [ ] Public H1 and static overview describe the page as a guide to the meaning of laundry care symbols and expose the basic symbol families without requiring the JavaScript grid.\n');
}
write(specRel, spec);

console.log('Applied Laundry Code crawlable static guide and H1 alignment.');
