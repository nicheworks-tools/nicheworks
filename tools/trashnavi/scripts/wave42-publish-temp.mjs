#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '114651', pref_slug: 'saitama', city_slug: 'matsubushi', city: '松伏町', types: 'collection calendar / waste sorting / bulky waste', callout2026: true },
  { lgcode: '113859', pref_slug: 'saitama', city_slug: 'kamisato', city: '上里町', types: 'waste sorting / bulky waste / waste app', callout2026: false },
  { lgcode: '113468', pref_slug: 'saitama', city_slug: 'kawajima', city: '川島町', types: 'collection calendar / waste sorting / waste app', callout2026: true },
  { lgcode: '113476', pref_slug: 'saitama', city_slug: 'yoshimi', city: '吉見町', types: 'collection calendar / waste sorting / bulky waste', callout2026: true },
  { lgcode: '113425', pref_slug: 'saitama', city_slug: 'ranzan', city: '嵐山町', types: 'collection calendar / waste sorting / waste search', callout2026: true },
  { lgcode: '113263', pref_slug: 'saitama', city_slug: 'moroyama', city: '毛呂山町', types: 'collection calendar / bulky waste / waste search', callout2026: true },
  { lgcode: '113832', pref_slug: 'saitama', city_slug: 'kamikawa', city: '神川町', types: 'waste sorting / bulky waste / waste app', callout2026: false },
  { lgcode: '113816', pref_slug: 'saitama', city_slug: 'misato-town', city: '美里町', types: 'waste sorting / waste search / waste app', callout2026: false },
  { lgcode: '113620', pref_slug: 'saitama', city_slug: 'minano', city: '皆野町', types: 'collection calendar / waste sorting / bulky waste', callout2026: true },
  { lgcode: '113417', pref_slug: 'saitama', city_slug: 'namegawa', city: '滑川町', types: 'collection calendar / waste search / bulky waste', callout2026: true }
];

const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const before = manifest.filter((x) => x.publish).length;
if (before !== 194) throw new Error(`Wave42 publication must start from 194 published municipalities; got ${before}`);
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
const existingPaths = new Set(manifest.map((x) => `${x.pref_slug}/${x.city_slug}`));
if (!existingPaths.has('saitama/misato')) throw new Error('existing Misato City slug lock missing');
for (const t of targets) {
  if (existingCodes.has(t.lgcode)) throw new Error(`Wave42 target already published: ${t.city} (${t.lgcode})`);
  const p = `${t.pref_slug}/${t.city_slug}`;
  if (existingPaths.has(p)) throw new Error(`Wave42 slug collision: ${p}`);
  manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
  existingPaths.add(p);
}
const publishedCount = manifest.filter((x) => x.publish).length;
if (publishedCount !== 204) throw new Error(`Wave42 manifest must contain 204 published municipalities; got ${publishedCount}`);
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);

const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace('if(outputs.length!==194)', 'if(outputs.length!==204)').replace('municipality page count must be 194', 'municipality page count must be 204');
if (!generator.includes('if(outputs.length!==204)') || !generator.includes('municipality page count must be 204')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace('check(manifest.length === 194', 'check(manifest.length === 204').replace('expected 194 published municipality pages', 'expected 204 published municipality pages');
if (!affiliateCheck.includes('check(manifest.length === 204')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
if (Number(ai.published_municipality_count) !== 194) throw new Error(`AI reference must start at 194; got ${ai.published_municipality_count}`);
ai.published_municipality_count = 204;
const aiCodes = new Set(ai.municipalities.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (aiCodes.has(t.lgcode)) throw new Error(`AI reference already contains Wave42 target: ${t.city}`);
  ai.municipalities.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, url: `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/` });
}
if (ai.municipalities.length !== 204) throw new Error(`AI reference must contain 204 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
if (!index.includes('/tools/trashnavi/saitama/matsubushi/')) {
  const startMarker = '<div class="municipality-related-links">';
  const start = index.indexOf(startMarker);
  if (start < 0) throw new Error('TrashNavi municipality link container missing');
  const close = index.indexOf('</div>', start + startMarker.length);
  if (close < 0) throw new Error('TrashNavi municipality link container closing tag missing');
  const anchors = targets.map((t) => `<a href="/tools/trashnavi/${t.pref_slug}/${t.city_slug}/">${t.city}</a>`).join('');
  index = `${index.slice(0, close)}${anchors}${index.slice(close)}`;
}
write(indexPath, index);

const rootSitemapPath = 'sitemap.xml';
let rootSitemap = read(rootSitemapPath);
let blocks = '';
for (const t of targets) {
  const url = `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/`;
  if (rootSitemap.includes(`<loc>${url}</loc>`)) throw new Error(`Wave42 URL already present in root sitemap: ${url}`);
  blocks += `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-17</lastmod>\n  </url>\n`;
}
if (!rootSitemap.includes('</urlset>')) throw new Error('root sitemap closing tag missing');
rootSitemap = rootSitemap.replace('</urlset>', `${blocks}</urlset>`);
write(rootSitemapPath, rootSitemap);

const specPath = 'tools/trashnavi/SPEC.md';
let spec = read(specPath);
if (!spec.includes('## Wave 42 ten-municipality publication')) {
  const lines = targets.map((t) => `- ${t.city} — \`/tools/trashnavi/${t.pref_slug}/${t.city_slug}/\` — ${t.types}`).join('\n');
  spec += `\n\n## Wave 42 ten-municipality publication\n\nWave 42は10自治体batch scaling ruleを継続し、公開閾値を変更せず **194自治体から204自治体** へ拡張する。対象は松伏町・上里町・川島町・吉見町・嵐山町・毛呂山町・神川町・美里町・皆野町・滑川町。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部衛生組合・委託先等による閾値補完は行わない。\n\n${lines}\n\nWave 42 readiness baselineは1,916 municipalities、2,700 valid HTTP(S) records、204 preferred candidates、45 direct-link datasets / 632 records / 613 unique URLs / 0 invalid URLsとする。Wave42の \`last_checked: 2026-09-17\` はWave41と同日なので、Readinessではsitemapを変更せず、未公開Wave42 URLも先出ししていない。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 204/204、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する松伏町・川島町・吉見町・嵐山町・毛呂山町・皆野町・滑川町だけ2026 calendar calloutを表示し、上里町・神川町・美里町には年次calloutを生成しない。美里町は既存の三郷市 \`/tools/trashnavi/saitama/misato/\` とURL衝突しないよう \`/tools/trashnavi/saitama/misato-town/\` をcanonical pathとして使用する。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
  write(specPath, spec);
}

execFileSync(process.execPath, ['tools/trashnavi/scripts/generate-municipality-pages.mjs'], { cwd: root, stdio: 'inherit' });

const wave42Rows = JSON.parse(read('tools/trashnavi/data/direct-waste-links-supply-wave42.json'));
const rowsByCode = new Map();
for (const row of wave42Rows) {
  const code = String(row.lgcode);
  const arr = rowsByCode.get(code) || [];
  arr.push(row);
  rowsByCode.set(code, arr);
}
for (const t of targets) {
  const pagePath = `tools/trashnavi/${t.pref_slug}/${t.city_slug}/index.html`;
  const html = read(pagePath);
  const canonical = `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/`;
  const canonicalCount = html.split(`<link rel="canonical" href="${canonical}">`).length - 1;
  if (canonicalCount !== 1) throw new Error(`${t.city}: canonical count ${canonicalCount}`);
  const cardCount = (html.match(/<article class="official-link-card">/g) || []).length;
  if (cardCount !== 3) throw new Error(`${t.city}: expected exactly 3 official cards, got ${cardCount}`);
  const calloutCount = (html.match(/class="current-calendar-callout"/g) || []).length;
  if (calloutCount !== (t.callout2026 ? 1 : 0)) throw new Error(`${t.city}: unexpected 2026 callout count ${calloutCount}`);
  if (!html.includes('ごみ出し・片付け用品 [PR]')) throw new Error(`${t.city}: affiliate [PR] block missing`);
  if (!html.includes('/assets/amazon-affiliate.js') || !html.includes('/tools/trashnavi/affiliate-config.js') || !html.includes('/tools/trashnavi/affiliate-runtime.js')) throw new Error(`${t.city}: affiliate assets missing`);
  const sourceRows = rowsByCode.get(t.lgcode) || [];
  if (sourceRows.length !== 3) throw new Error(`${t.city}: Wave42 source rows must equal 3`);
  for (const row of sourceRows) if (!html.includes(`href="${row.url}"`)) throw new Error(`${t.city}: source URL missing from generated page: ${row.url}`);
}
if (fs.existsSync(rel('tools/trashnavi/saitama/misato-town/index.html')) === false) throw new Error('Misato Town page missing');
const misatoCity = read('tools/trashnavi/saitama/misato/index.html');
if (!misatoCity.includes('三郷市')) throw new Error('existing Misato City page was unexpectedly changed/replaced');

const aiAfter = JSON.parse(read(aiPath));
if (aiAfter.published_municipality_count !== 204 || aiAfter.municipalities.length !== 204) throw new Error('AI reference 204/204 contract failed');
const dedicatedSitemap = read('sitemap-trashnavi.xml');
const rootAfter = read('sitemap.xml');
for (const t of targets) {
  const url = `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/`;
  for (const [label, content] of [['dedicated sitemap', dedicatedSitemap], ['root sitemap', rootAfter]]) {
    const n = content.split(`<loc>${url}</loc>`).length - 1;
    if (n !== 1) throw new Error(`${label}: ${t.city} canonical count ${n}`);
  }
}

for (const [script, args] of [
  ['tools/trashnavi/scripts/audit-coverage.mjs', ['--strict']],
  ['scripts/check-trashnavi-direct-links.mjs', ['--inventory']],
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs', ['--check']],
  ['tools/trashnavi/scripts/check-affiliate-contract.mjs', []],
  ['tools/trashnavi/scripts/check-runtime-contract.mjs', []]
]) execFileSync(process.execPath, [script, ...args], { cwd: root, stdio: 'inherit' });

console.log(`Wave42 publication contract: ${targets.length} pages / 204 published / 7 calendar callouts / AI 204/204 / sitemap exact-once`);

for (const p of ['tools/trashnavi/scripts/wave42-publish-temp.mjs', '.github/workflows/trashnavi-wave42-publication-temp.yml']) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave42 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave42 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave42-publication-20260917'], { cwd: root, stdio: 'inherit' });
