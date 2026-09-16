#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '012041', pref_slug: 'hokkaido', city_slug: 'asahikawa', city: '旭川市' },
  { lgcode: '112224', pref_slug: 'saitama', city_slug: 'koshigaya', city: '越谷市' },
  { lgcode: '112089', pref_slug: 'saitama', city_slug: 'tokorozawa', city: '所沢市' },
  { lgcode: '072036', pref_slug: 'fukushima', city_slug: 'koriyama', city: '郡山市' },
  { lgcode: '282049', pref_slug: 'hyogo', city_slug: 'nishinomiya', city: '西宮市' },
  { lgcode: '272108', pref_slug: 'osaka', city_slug: 'hirakata', city: '枚方市' },
  { lgcode: '272051', pref_slug: 'osaka', city_slug: 'suita', city: '吹田市' },
  { lgcode: '272078', pref_slug: 'osaka', city_slug: 'takatsuki', city: '高槻市' },
  { lgcode: '232017', pref_slug: 'aichi', city_slug: 'toyohashi', city: '豊橋市' },
  { lgcode: '282031', pref_slug: 'hyogo', city_slug: 'akashi', city: '明石市' }
];

const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);
const publishedCount = manifest.filter((x) => x.publish).length;
if (publishedCount !== 104) throw new Error(`Wave32 manifest must contain 104 published municipalities; got ${publishedCount}`);

const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace(/outputs\.length!==94/g, 'outputs.length!==104').replace(/municipality page count must be 94/g, 'municipality page count must be 104');
if (!generator.includes('outputs.length!==104') || !generator.includes('municipality page count must be 104')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace(/manifest\.length === 94/g, 'manifest.length === 104').replace(/expected 94 published municipality pages/g, 'expected 104 published municipality pages');
if (!affiliateCheck.includes('manifest.length === 104')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
ai.published_municipality_count = 104;
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
if (ai.municipalities.length !== 104) throw new Error(`AI reference must contain 104 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
if (!index.includes('/tools/trashnavi/hokkaido/asahikawa/')) {
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
if (!spec.includes('## Wave 32 ten-municipality publication')) {
  spec += `\n\n## Wave 32 ten-municipality publication\n\nWave 32は10自治体batch scaling ruleを継続し、公開閾値を変更せず **94自治体から104自治体** へ拡張する。対象は旭川市・越谷市・所沢市・郡山市・西宮市・枚方市・吹田市・高槻市・豊橋市・明石市。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。\n\n- 北海道 旭川市 — \`/tools/trashnavi/hokkaido/asahikawa/\` — waste sorting / collection calendar / bulky waste\n- 埼玉県 越谷市 — \`/tools/trashnavi/saitama/koshigaya/\` — waste sorting / collection calendar / bulky waste\n- 埼玉県 所沢市 — \`/tools/trashnavi/saitama/tokorozawa/\` — waste sorting / collection calendar / bulky waste\n- 福島県 郡山市 — \`/tools/trashnavi/fukushima/koriyama/\` — waste sorting / collection calendar / bulky waste\n- 兵庫県 西宮市 — \`/tools/trashnavi/hyogo/nishinomiya/\` — waste sorting / collection calendar / bulky waste\n- 大阪府 枚方市 — \`/tools/trashnavi/osaka/hirakata/\` — waste sorting / collection calendar / bulky waste\n- 大阪府 吹田市 — \`/tools/trashnavi/osaka/suita/\` — waste sorting / collection calendar / bulky waste\n- 大阪府 高槻市 — \`/tools/trashnavi/osaka/takatsuki/\` — waste sorting / collection calendar / bulky waste\n- 愛知県 豊橋市 — \`/tools/trashnavi/aichi/toyohashi/\` — waste sorting / collection calendar / bulky waste\n- 兵庫県 明石市 — \`/tools/trashnavi/hyogo/akashi/\` — waste sorting / collection calendar / bulky waste\n\nWave 32 readiness baselineは1,916 municipalities、2,400 valid HTTP(S) records、104 preferred candidates、35 direct-link datasets / 332 records / 313 unique URLs / 0 invalid URLsとする。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 104/104、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する旭川市・郡山市・枚方市・豊橋市・明石市だけ2026 calendar calloutを表示し、越谷市・所沢市・西宮市・吹田市・高槻市には年次calloutを生成しない。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
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
  'tools/trashnavi/scripts/wave32-publish-temp.mjs',
  '.github/workflows/trashnavi-wave32-publication-temp.yml'
]) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave32 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave32 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave32-publication-20260916'], { cwd: root, stdio: 'inherit' });
