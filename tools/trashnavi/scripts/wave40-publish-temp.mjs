#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '112321', pref_slug: 'saitama', city_slug: 'kuki', city: '久喜市', types: 'waste search / collection calendar / bulky waste' },
  { lgcode: '112178', pref_slug: 'saitama', city_slug: 'konosu', city: '鴻巣市', types: 'waste search / collection calendar / bulky waste' },
  { lgcode: '112101', pref_slug: 'saitama', city_slug: 'kazo', city: '加須市', types: 'waste search / collection calendar / bulky waste' },
  { lgcode: '112453', pref_slug: 'saitama', city_slug: 'fujimino', city: 'ふじみ野市', types: 'waste search / collection calendar / drop-off facility' },
  { lgcode: '112062', pref_slug: 'saitama', city_slug: 'gyoda', city: '行田市', types: 'waste sorting / collection calendar / drop-off facility' },
  { lgcode: '112119', pref_slug: 'saitama', city_slug: 'honjo', city: '本庄市', types: 'waste sorting / waste app / drop-off facility' },
  { lgcode: '112283', pref_slug: 'saitama', city_slug: 'shiki', city: '志木市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '112313', pref_slug: 'saitama', city_slug: 'okegawa', city: '桶川市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '112232', pref_slug: 'saitama', city_slug: 'warabi', city: '蕨市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '112330', pref_slug: 'saitama', city_slug: 'kitamoto', city: '北本市', types: 'waste sorting / collection calendar / bulky waste' }
];

const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const before = manifest.filter((x) => x.publish).length;
if (before !== 174) throw new Error(`Wave40 publication must start from 174 published municipalities; got ${before}`);
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
const publishedCount = manifest.filter((x) => x.publish).length;
if (publishedCount !== 184) throw new Error(`Wave40 manifest must contain 184 published municipalities; got ${publishedCount}`);
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);

const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace('if(outputs.length!==174)', 'if(outputs.length!==184)').replace('municipality page count must be 174', 'municipality page count must be 184');
if (!generator.includes('if(outputs.length!==184)') || !generator.includes('municipality page count must be 184')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace('check(manifest.length === 174', 'check(manifest.length === 184').replace('expected 174 published municipality pages', 'expected 184 published municipality pages');
if (!affiliateCheck.includes('check(manifest.length === 184')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
if (Number(ai.published_municipality_count) !== 174) throw new Error(`AI reference must start at 174; got ${ai.published_municipality_count}`);
ai.published_municipality_count = 184;
const aiCodes = new Set(ai.municipalities.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (aiCodes.has(t.lgcode)) continue;
  ai.municipalities.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, url: `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/` });
}
if (ai.municipalities.length !== 184) throw new Error(`AI reference must contain 184 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
if (!index.includes('/tools/trashnavi/saitama/kuki/')) {
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
  blocks += `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-17</lastmod>\n  </url>\n`;
}
if (blocks) {
  if (!rootSitemap.includes('</urlset>')) throw new Error('root sitemap closing tag missing');
  rootSitemap = rootSitemap.replace('</urlset>', `${blocks}</urlset>`);
}
write(rootSitemapPath, rootSitemap);

const specPath = 'tools/trashnavi/SPEC.md';
let spec = read(specPath);
if (!spec.includes('## Wave 40 ten-municipality publication')) {
  const lines = targets.map((t) => `- ${t.city} — \`/tools/trashnavi/${t.pref_slug}/${t.city_slug}/\` — ${t.types}`).join('\n');
  spec += `\n\n## Wave 40 ten-municipality publication\n\nWave 40は10自治体batch scaling ruleを継続し、公開閾値を変更せず **174自治体から184自治体** へ拡張する。対象は久喜市・鴻巣市・加須市・ふじみ野市・行田市・本庄市・志木市・桶川市・蕨市・北本市。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。\n\n${lines}\n\nWave 40 readiness baselineは1,916 municipalities、2,640 valid HTTP(S) records、184 preferred candidates、43 direct-link datasets / 572 records / 553 unique URLs / 0 invalid URLsとする。Wave40の \`last_checked: 2026-09-17\` はWave39と同日なので、Readinessではsitemapを変更せず、未公開Wave40 URLも先出ししていない。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 184/184、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する久喜市・鴻巣市・加須市・ふじみ野市・行田市・桶川市・北本市だけ2026 calendar calloutを表示し、本庄市・志木市・蕨市には年次calloutを生成しない。本庄市はcollection calendarではなく自治体公式ごみ分別アプリを第三の独立typeとして採用する。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
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

for (const p of ['tools/trashnavi/scripts/wave40-publish-temp.mjs', '.github/workflows/trashnavi-wave40-publication-temp.yml']) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave40 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave40 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave40-publication-20260917'], { cwd: root, stdio: 'inherit' });
