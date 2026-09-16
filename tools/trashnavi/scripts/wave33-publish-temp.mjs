#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '332020', pref_slug: 'okayama', city_slug: 'kurashiki', city: '倉敷市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '342076', pref_slug: 'hiroshima', city_slug: 'fukuyama', city: '福山市', types: 'waste sorting / collection calendar / drop-off facility' },
  { lgcode: '272124', pref_slug: 'osaka', city_slug: 'yao', city: '八尾市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '272116', pref_slug: 'osaka', city_slug: 'ibaraki', city: '茨木市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '282103', pref_slug: 'hyogo', city_slug: 'kakogawa', city: '加古川市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '152021', pref_slug: 'niigata', city_slug: 'nagaoka', city: '長岡市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '202029', pref_slug: 'nagano', city_slug: 'matsumoto', city: '松本市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '222101', pref_slug: 'shizuoka', city_slug: 'fuji', city: '富士市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '112216', pref_slug: 'saitama', city_slug: 'soka', city: '草加市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '232068', pref_slug: 'aichi', city_slug: 'kasugai', city: '春日井市', types: 'waste sorting / collection calendar / bulky waste' }
];

const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);
const publishedCount = manifest.filter((x) => x.publish).length;
if (publishedCount !== 114) throw new Error(`Wave33 manifest must contain 114 published municipalities; got ${publishedCount}`);

const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace(/outputs\.length!==104/g, 'outputs.length!==114').replace(/municipality page count must be 104/g, 'municipality page count must be 114');
if (!generator.includes('outputs.length!==114') || !generator.includes('municipality page count must be 114')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace(/manifest\.length === 104/g, 'manifest.length === 114').replace(/expected 104 published municipality pages/g, 'expected 114 published municipality pages');
if (!affiliateCheck.includes('manifest.length === 114')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
ai.published_municipality_count = 114;
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
if (ai.municipalities.length !== 114) throw new Error(`AI reference must contain 114 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
if (!index.includes('/tools/trashnavi/okayama/kurashiki/')) {
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
if (!spec.includes('## Wave 33 ten-municipality publication')) {
  const lines = targets.map((t) => `- ${t.city} — \`/tools/trashnavi/${t.pref_slug}/${t.city_slug}/\` — ${t.types}`).join('\n');
  spec += `\n\n## Wave 33 ten-municipality publication\n\nWave 33は10自治体batch scaling ruleを継続し、公開閾値を変更せず **104自治体から114自治体** へ拡張する。対象は倉敷市・福山市・八尾市・茨木市・加古川市・長岡市・松本市・富士市・草加市・春日井市。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。福山市はwaste sorting / collection calendar / drop-off facilityの3種で公開し、bulky wasteを推測・重複計上しない。\n\n${lines}\n\nWave 33 readiness baselineは1,916 municipalities、2,430 valid HTTP(S) records、114 preferred candidates、36 direct-link datasets / 362 records / 343 unique URLs / 0 invalid URLsとする。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 114/114、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する福山市・八尾市・加古川市・松本市・富士市・草加市・春日井市だけ2026 calendar calloutを表示し、倉敷市・茨木市・長岡市には年次calloutを生成しない。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
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
  'tools/trashnavi/scripts/wave33-publish-temp.mjs',
  '.github/workflows/trashnavi-wave33-publication-temp.yml'
]) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave33 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave33 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave33-publication-20260916'], { cwd: root, stdio: 'inherit' });
