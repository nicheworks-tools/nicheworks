#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '112020', pref_slug: 'saitama', city_slug: 'kumagaya', city: '熊谷市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '112305', pref_slug: 'saitama', city_slug: 'niiza', city: '新座市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '122203', pref_slug: 'chiba', city_slug: 'nagareyama', city: '流山市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '122211', pref_slug: 'chiba', city_slug: 'yachiyo', city: '八千代市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '122165', pref_slug: 'chiba', city_slug: 'narashino', city: '習志野市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132292', pref_slug: 'tokyo', city_slug: 'nishitokyo', city: '西東京市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132110', pref_slug: 'tokyo', city_slug: 'kodaira', city: '小平市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132021', pref_slug: 'tokyo', city_slug: 'tachikawa', city: '立川市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '142123', pref_slug: 'kanagawa', city_slug: 'atsugi', city: '厚木市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '142069', pref_slug: 'kanagawa', city_slug: 'odawara', city: '小田原市', types: 'waste sorting / collection calendar / bulky waste' }
];

const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);
const publishedCount = manifest.filter((x) => x.publish).length;
if (publishedCount !== 134) throw new Error(`Wave35 manifest must contain 134 published municipalities; got ${publishedCount}`);

const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace(/outputs\.length!==124/g, 'outputs.length!==134').replace(/municipality page count must be 124/g, 'municipality page count must be 134');
if (!generator.includes('outputs.length!==134') || !generator.includes('municipality page count must be 134')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace(/manifest\.length === 124/g, 'manifest.length === 134').replace(/expected 124 published municipality pages/g, 'expected 134 published municipality pages');
if (!affiliateCheck.includes('manifest.length === 134')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
ai.published_municipality_count = 134;
const aiCodes = new Set(ai.municipalities.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (aiCodes.has(t.lgcode)) continue;
  ai.municipalities.push({
    lgcode: t.lgcode,
    pref_slug: t.pref_slug,
    city_slug: t.city_slug,
    url: `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/`
  });
}
if (ai.municipalities.length !== 134) throw new Error(`AI reference must contain 134 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
if (!index.includes('/tools/trashnavi/saitama/kumagaya/')) {
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
if (!spec.includes('## Wave 35 ten-municipality publication')) {
  const lines = targets.map((t) => `- ${t.city} — \`/tools/trashnavi/${t.pref_slug}/${t.city_slug}/\` — ${t.types}`).join('\n');
  spec += `\n\n## Wave 35 ten-municipality publication\n\nWave 35は10自治体batch scaling ruleを継続し、公開閾値を変更せず **124自治体から134自治体** へ拡張する。対象は熊谷市・新座市・流山市・八千代市・習志野市・西東京市・小平市・立川市・厚木市・小田原市。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。\n\n${lines}\n\nWave 35 readiness baselineは1,916 municipalities、2,490 valid HTTP(S) records、134 preferred candidates、38 direct-link datasets / 422 records / 403 unique URLs / 0 invalid URLsとする。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 134/134、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する流山市・八千代市・習志野市・小平市・小田原市だけ2026 calendar calloutを表示し、熊谷市・新座市・西東京市・立川市・厚木市には年次calloutを生成しない。西東京市のcurrent calendarは令和7年10月から令和8年9月までの跨年期間なので、単一2026 calendarとして扱わない。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
  write(specPath, spec);
}

execFileSync(process.execPath, ['tools/trashnavi/scripts/generate-municipality-pages.mjs'], { cwd: root, stdio: 'inherit' });

for (const [script, args] of [
  ['tools/trashnavi/scripts/audit-coverage.mjs', ['--strict']],
  ['scripts/check-trashnavi-direct-links.mjs', ['--inventory']],
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs', ['--check']],
  ['tools/trashnavi/scripts/check-affiliate-contract.mjs', []],
  ['tools/trashnavi/scripts/check-runtime-contract.mjs', []]
]) {
  execFileSync(process.execPath, [script, ...args], { cwd: root, stdio: 'inherit' });
}

for (const p of [
  'tools/trashnavi/scripts/wave35-publish-temp.mjs',
  '.github/workflows/trashnavi-wave35-publication-temp.yml'
]) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave35 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave35 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave35-publication-20260916'], { cwd: root, stdio: 'inherit' });
