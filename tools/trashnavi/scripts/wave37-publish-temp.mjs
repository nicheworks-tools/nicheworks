#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '132101', pref_slug: 'tokyo', city_slug: 'koganei', city: '小金井市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132071', pref_slug: 'tokyo', city_slug: 'akishima', city: '昭島市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132152', pref_slug: 'tokyo', city_slug: 'kunitachi', city: '国立市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132250', pref_slug: 'tokyo', city_slug: 'inagi', city: '稲城市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132195', pref_slug: 'tokyo', city_slug: 'komae', city: '狛江市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132217', pref_slug: 'tokyo', city_slug: 'kiyose', city: '清瀬市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132225', pref_slug: 'tokyo', city_slug: 'higashikurume', city: '東久留米市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '142140', pref_slug: 'kanagawa', city_slug: 'isehara', city: '伊勢原市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '132209', pref_slug: 'tokyo', city_slug: 'higashiyamato', city: '東大和市', types: 'waste sorting / collection calendar / bulky waste' },
  { lgcode: '122220', pref_slug: 'chiba', city_slug: 'abiko', city: '我孫子市', types: 'waste sorting / collection calendar / bulky waste' }
];

const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);
const publishedCount = manifest.filter((x) => x.publish).length;
if (publishedCount !== 154) throw new Error(`Wave37 manifest must contain 154 published municipalities; got ${publishedCount}`);

const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace(/outputs\.length!==144/g, 'outputs.length!==154').replace(/municipality page count must be 144/g, 'municipality page count must be 154');
if (!generator.includes('outputs.length!==154') || !generator.includes('municipality page count must be 154')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace(/manifest\.length === 144/g, 'manifest.length === 154').replace(/expected 144 published municipality pages/g, 'expected 154 published municipality pages');
if (!affiliateCheck.includes('manifest.length === 154')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
ai.published_municipality_count = 154;
const aiCodes = new Set(ai.municipalities.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (aiCodes.has(t.lgcode)) continue;
  ai.municipalities.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, url: `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/` });
}
if (ai.municipalities.length !== 154) throw new Error(`AI reference must contain 154 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
if (!index.includes('/tools/trashnavi/tokyo/koganei/')) {
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
if (!spec.includes('## Wave 37 ten-municipality publication')) {
  const lines = targets.map((t) => `- ${t.city} — \`/tools/trashnavi/${t.pref_slug}/${t.city_slug}/\` — ${t.types}`).join('\n');
  spec += `\n\n## Wave 37 ten-municipality publication\n\nWave 37は10自治体batch scaling ruleを継続し、公開閾値を変更せず **144自治体から154自治体** へ拡張する。対象は小金井市・昭島市・国立市・稲城市・狛江市・清瀬市・東久留米市・伊勢原市・東大和市・我孫子市。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。\n\n${lines}\n\nWave 37 readiness baselineは1,916 municipalities、2,550 valid HTTP(S) records、154 preferred candidates、40 direct-link datasets / 482 records / 463 unique URLs / 0 invalid URLsとする。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 154/154、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する小金井市・昭島市・国立市・稲城市・狛江市・清瀬市・伊勢原市・我孫子市だけ2026 calendar calloutを表示し、東久留米市・東大和市には年次calloutを生成しない。東大和市のcollection sourceは令和8年10月から令和9年9月までの跨年期間なので、単一2026 calendarとして扱わない。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
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

for (const p of ['tools/trashnavi/scripts/wave37-publish-temp.mjs', '.github/workflows/trashnavi-wave37-publication-temp.yml']) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave37 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave37 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave37-publication-20260916'], { cwd: root, stdio: 'inherit' });
