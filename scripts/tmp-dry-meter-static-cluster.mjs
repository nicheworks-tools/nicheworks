import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, value) => fs.writeFileSync(path.join(root, rel), value);

const dryRel = 'tools/dry-meter/index.html';
let dry = read(dryRel);
const dryAnchor = '    <section class="faq" aria-label="FAQ">';
if (!dry.includes(dryAnchor)) throw new Error('Dry Meter FAQ anchor not found');
if (!dry.includes('洗濯物が乾きやすい条件')) {
  const section = `    <section class="intro-card" aria-label="Laundry drying conditions">\n      <h2 data-i18n="ja">洗濯物が乾きやすい条件</h2>\n      <h2 data-i18n="en">What helps laundry dry</h2>\n      <p data-i18n="ja">一般に、湿度が低く、洗濯物の周囲の空気が動き、気温が高いほど水分は蒸発しやすくなります。Dry Meterは気温・湿度・風速を中心に、天気取得時は降水量と雲量も補正して「いまの乾きやすさ」をDry Scoreへまとめます。</p>\n      <p data-i18n="en">In general, lower humidity, moving air around the fabric, and warmer temperatures favor evaporation. Dry Meter combines temperature, humidity, and wind, with precipitation and cloud adjustments when weather is fetched, into a current-condition Dry Score.</p>\n      <p data-i18n="ja">部屋干しでは、屋外の風速より室内の空気循環や室内湿度の影響が大きくなります。室温・室内湿度・洗濯物に当たる風の条件が分かる場合は、現在天気をそのまま使わず手動入力へ合わせてください。</p>\n      <p data-i18n="en">For indoor drying, indoor airflow and humidity matter more than outdoor wind. If you know the room temperature, indoor humidity, and airflow around the laundry, use those manual values instead of treating outdoor weather as an indoor measurement.</p>\n    </section>\n\n`;
  dry = dry.replace(dryAnchor, section + dryAnchor);
  write(dryRel, dry);
}

const laundryRel = 'tools/laundry-code-decode/index.html';
let laundry = read(laundryRel);
const laundryAnchor = '      <div class="cat-tabs" role="tablist" aria-label="Laundry categories">';
if (!laundry.includes(laundryAnchor)) throw new Error('Laundry Code category anchor not found');
if (!laundry.includes('/tools/dry-meter/')) {
  const related = `      <p class="privacy-note" data-i18n="ja">洗濯表示の意味を確認したあと、今の気温・湿度・風から乾きやすさを見たい場合は <a href="/tools/dry-meter/">Dry Meter</a> を使えます。</p>\n      <p class="privacy-note" data-i18n="en">After checking the care symbol, use <a href="/tools/dry-meter/">Dry Meter</a> if you want a current drying-condition estimate from temperature, humidity, and airflow.</p>\n\n`;
  laundry = laundry.replace(laundryAnchor, related + laundryAnchor);
  write(laundryRel, laundry);
}

console.log('Applied Dry Meter static SEO explanation and laundry cluster link.');
