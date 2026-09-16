#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '132276', pref_slug: 'tokyo', city_slug: 'hamura', city: '羽村市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132284', pref_slug: 'tokyo', city_slug: 'akiruno', city: 'あきる野市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132233', pref_slug: 'tokyo', city_slug: 'musashimurayama', city: '武蔵村山市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '122068', pref_slug: 'chiba', city_slug: 'kisarazu', city: '木更津市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '122084', pref_slug: 'chiba', city_slug: 'noda', city: '野田市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '122271', pref_slug: 'chiba', city_slug: 'urayasu', city: '浦安市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '122246', pref_slug: 'chiba', city_slug: 'kamagaya', city: '鎌ケ谷市', types: 'waste sorting / collection calendar / drop-off facility' },
  { lgcode: '112275', pref_slug: 'saitama', city_slug: 'asaka', city: '朝霞市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '112291', pref_slug: 'saitama', city_slug: 'wako', city: '和光市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '112241', pref_slug: 'saitama', city_slug: 'toda', city: '戸田市', types: 'waste sorting / collection calendar / bulky waste' }
];

const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);
const publishedCount = manifest.filter((x) => x.publish).length;
if (publishedCount !== 164) throw new Error(`Wave38 manifest must contain 164 published municipalities; got ${publishedCount}`);

const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace(/outputs\.length!==154/g, 'outputs.length!==164').replace(/municipality page count must be 154/g, 'municipality page count must be 164');
if (!generator.includes('outputs.length!==164') || !generator.includes('municipality page count must be 164')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace(/manifest\.length === 154/g, 'manifest.length === 164').replace(/expected 154 published municipality pages/g, 'expected 164 published municipality pages');
if (!affiliateCheck.includes('manifest.length === 164')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
ai.published_municipality_count = 164;
const aiCodes = new Set(ai.municipalities.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (aiCodes.has(t.lgcode)) continue;
  ai.municipalities.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, url: `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/` });
}
if (ai.municipalities.length !== 164) throw new Error(`AI reference must contain 164 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
if (!index.includes('/tools/trashnavi/tokyo/hamura/')) {
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
  if (rootSitemap.includes(`<loc>${url}</loc>`)) continue;
  blocks += `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-16</lastmod>\n  </url>\n`;
}
if (blocks) {
  if (!rootSitemap.includes('</urlset>')) throw new Error('root sitemap closing tag missing');
  rootSitemap = rootSitemap.replace('</urlset>', `${blocks}</urlset>`);
}
write(rootSitemapPath, rootSitemap);

const specPath = 'tools/trashnavi/SPEC.md';
let spec = read(specPath);
if (!spec.includes('## Wave 38 ten-municipality publication')) {
  const lines = targets.map((t) => `- ${t.city} — \`/tools/trashnavi/${t.pref_slug}/${t.city_slug}/\` — ${t.types}`).join('\n');
  spec += `\n\n## Wave 38 ten-municipality publication\n\nWave 38は10自治体batch scaling ruleを継続し、公開閾値を変更せず **154自治体から164自治体** へ拡張する。対象は羽村市・あきる野市・武蔵村山市・木更津市・野田市・浦安市・鎌ケ谷市・朝霞市・和光市・戸田市。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。鎌ケ谷市だけ第三種別をmunicipality-officialの持込施設情報とし、他9市は粗大ごみ情報を第三種別とする。\n\n${lines}\n\nWave 38 readiness baselineは1,916 municipalities、2,580 valid HTTP(S) records、164 preferred candidates、41 direct-link datasets / 512 records / 493 unique URLs / 0 invalid URLsとする。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 164/164、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する羽村市・木更津市・鎌ケ谷市・戸田市だけ2026 calendar calloutを表示する。あきる野市・武蔵村山市のcollection sourceは複数年または跨年期間なので単一2026 calendarとして扱わず、野田市・浦安市・朝霞市・和光市も選択したcollection source自体に単年2026表記がないため年次calloutを生成しない。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
  write(specPath, spec);
}

execFileSync(process.execPath, ['tools/trashnavi/scripts/generate-municipality-pages.mjs'], { cwd: root, stdio: 'inherit' });
for (const [script, args] of [
  ['tools/trashnavi/scripts/audit-coverage.mjs', ['--strict']],
  ['scripts/check-trashnavi-direct-links.mjs', ['--inventory']],
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs', ['--check']],
  ['tools/trashnavi/scripts/check-affiliate-contract.mjs', []],
  ['tools/trashnavi/scripts/check-runtime-contract.mjs', []]
]) execFileSync(process.execPath, [script, ...args], { cwd: root, stdio: 'inherit' });

for (const p of ['tools/trashnavi/scripts/wave38-publish-temp.mjs', '.github/workflows/trashnavi-wave38-publication-temp.yml']) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave38 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave38 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave38-publication-20260916'], { cwd: root, stdio: 'inherit' });
