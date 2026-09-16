import fs from 'node:fs';

const dictPath = 'tools/kanji-modernizer/dict.json';
const metaPath = 'tools/old-kanji-reference/meta-extra-2.json';
const compatibilityPath = 'tools/old-kanji-reference/compatibility-notes.json';

function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`Missing expected anchor: ${label}`);
  if (text.indexOf(before, first + before.length) >= 0) throw new Error(`Anchor is not unique: ${label}`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}

function appendEntry(text, key, entry, label) {
  const parsed = JSON.parse(text);
  if (Object.prototype.hasOwnProperty.call(parsed.entries || {}, key)) {
    throw new Error(`${label}: ${key} already exists`);
  }
  const marker = '\n  }\n}';
  const pos = text.lastIndexOf(marker);
  if (pos < 0) throw new Error(`${label}: closing entries marker not found`);
  const serialized = JSON.stringify(entry, null, 2)
    .split('\n')
    .map((line, index) => index === 0 ? line : `    ${line}`)
    .join('\n');
  return `${text.slice(0, pos)},\n    ${JSON.stringify(key)}: ${serialized}${text.slice(pos)}`;
}

let dict = fs.readFileSync(dictPath, 'utf8');
if (dict.includes('"贈": "贈"')) throw new Error('贈→贈 already exists in forward dictionary');

dict = replaceOnce(
  dict,
  '    "贈": "贈",\n    "赦": "赦",',
  '    "贈": "贈",\n    "贈": "贈",\n    "赦": "赦",',
  'forward 贈/赦'
);

dict = replaceOnce(
  dict,
  '    "質": ["質"],\n    "赦": ["赦"],',
  '    "質": ["質"],\n    "贈": ["贈"],\n    "赦": ["赦"],',
  'reverse 質/赦'
);

JSON.parse(dict);
fs.writeFileSync(dictPath, dict);

let meta = fs.readFileSync(metaPath, 'utf8');
meta = appendEntry(meta, '贈', {
  modern: '贈',
  category: 'document',
  verified: true,
  dataStatus: 'verified',
  confidence: 'high',
  sourceNote: '文化庁「常用漢字表」の「贈（贈）」に基づく旧字体・新字体対応'
}, 'meta-extra-2.json');
JSON.parse(meta);
fs.writeFileSync(metaPath, meta);

let compatibility = fs.readFileSync(compatibilityPath, 'utf8');
compatibility = appendEntry(compatibility, '贈', {
  old: '贈',
  modern: '贈',
  riskLevel: 'high',
  riskTypes: ['compatibility-ideograph', 'font-dependent', 'copy-destination'],
  summaryJa: 'CJK互換漢字のため、環境によって通常の「贈」と同じ字形で表示されることがあります。',
  summaryEn: 'As a CJK compatibility ideograph, this character may render identically to 贈 depending on the environment.',
  copyNoteJa: '貼り付け先で通常の「贈」に正規化・置換される場合があります。',
  copyNoteEn: 'The destination may normalize or replace it with the regular character 贈.',
  technicalJa: 'Unicode U+FA65のCJK互換漢字で、U+8D08「贈」と互換等価です。',
  technicalEn: 'This is CJK Compatibility Ideograph U+FA65, compatibility-equivalent to U+8D08 贈.',
  recommendedCheckJa: '字形だけでなくUnicodeコードポイントも確認してください。',
  recommendedCheckEn: 'Check the Unicode code point as well as the rendered glyph.'
}, 'compatibility-notes.json');
JSON.parse(compatibility);
fs.writeFileSync(compatibilityPath, compatibility);

console.log('Applied exact 贈→贈 dictionary repair.');
