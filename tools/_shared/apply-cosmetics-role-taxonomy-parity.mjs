import fs from 'node:fs';

function replaceOnce(file, from, to) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(from)) throw new Error(`${file}: expected patch anchor missing`);
  const next = source.replace(from, to);
  if (next === source) throw new Error(`${file}: patch produced no change`);
  fs.writeFileSync(file, next);
}

const lite = 'tools/cosmetic-ingredient-checker-lite/app.js';
replaceOnce(
  lite,
  "  'viscosity adjuster': { ja: '粘度調整', en: 'Viscosity adjuster' },\n  general: { ja: '情報不足', en: 'Information incomplete' }",
  "  'viscosity adjuster': { ja: '粘度調整', en: 'Viscosity adjuster' },\n  buffer: { ja: 'pH安定化', en: 'Buffer' },\n  conditioning: { ja: 'コンディショニング', en: 'Conditioning' },\n  'skin conditioning': { ja: '整肌', en: 'Skin conditioning' },\n  'hair conditioning': { ja: '毛髪コンディショニング', en: 'Hair conditioning' },\n  'plant extract': { ja: '植物エキス', en: 'Plant extract' },\n  general: { ja: '情報不足', en: 'Information incomplete' }"
);
replaceOnce(
  lite,
  "  'viscosity adjuster': { ja: '製品の粘度を調整する目的で使われる成分です。', en: 'Used to adjust product viscosity.' }\n};",
  "  'viscosity adjuster': { ja: '製品の粘度を調整する目的で使われる成分です。', en: 'Used to adjust product viscosity.' },\n  buffer: { ja: '製品のpHを安定させる目的で使われる成分です。', en: 'Used to help stabilize product pH.' },\n  conditioning: { ja: '肌や毛髪の感触を整える目的で使われる成分です。', en: 'Used for skin or hair conditioning.' },\n  'skin conditioning': { ja: '肌の状態や感触を整える目的で使われる成分です。', en: 'Used for skin conditioning.' },\n  'hair conditioning': { ja: '毛髪の状態や感触を整える目的で使われる成分です。', en: 'Used for hair conditioning.' },\n  'plant extract': { ja: '植物などから得られたエキス成分です。', en: 'A plant-derived extract ingredient.' }\n};"
);

const fast = 'tools/inci-fastscan/js/web_ui.js';
replaceOnce(
  fast,
  "  extract: { ja: \"植物エキス\", en: \"Extract\" },\n  peptide: { ja: \"ペプチド\", en: \"Peptide\" },",
  "  extract: { ja: \"植物エキス\", en: \"Extract\" },\n  \"plant extract\": { ja: \"植物エキス\", en: \"Plant extract\" },\n  peptide: { ja: \"ペプチド\", en: \"Peptide\" },"
);
replaceOnce(
  fast,
  "  extract: { ja: \"植物などから得られたエキス成分です。\", en: \"An extract-derived ingredient.\" },\n  peptide: { ja: \"ペプチド系のコンディショニング成分です。\", en: \"A peptide used for conditioning functions.\" },",
  "  extract: { ja: \"植物などから得られたエキス成分です。\", en: \"An extract-derived ingredient.\" },\n  \"plant extract\": { ja: \"植物などから得られたエキス成分です。\", en: \"A plant-derived extract ingredient.\" },\n  peptide: { ja: \"ペプチド系のコンディショニング成分です。\", en: \"A peptide used for conditioning functions.\" },"
);

console.log('Applied cosmetics role-taxonomy parity patch.');
