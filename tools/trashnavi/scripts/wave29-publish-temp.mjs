#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '131113', pref_slug: 'tokyo', city_slug: 'ota', city: '大田区' },
  { lgcode: '131237', pref_slug: 'tokyo', city_slug: 'edogawa', city: '江戸川区' },
  { lgcode: '131211', pref_slug: 'tokyo', city_slug: 'adachi', city: '足立区' },
  { lgcode: '131199', pref_slug: 'tokyo', city_slug: 'itabashi', city: '板橋区' },
  { lgcode: '131083', pref_slug: 'tokyo', city_slug: 'koto', city: '江東区' },
  { lgcode: '131091', pref_slug: 'tokyo', city_slug: 'shinagawa', city: '品川区' },
  { lgcode: '131172', pref_slug: 'tokyo', city_slug: 'kita', city: '北区' },
  { lgcode: '131148', pref_slug: 'tokyo', city_slug: 'nakano', city: '中野区' },
  { lgcode: '131164', pref_slug: 'tokyo', city_slug: 'toshima', city: '豊島区' },
  { lgcode: '131105', pref_slug: 'tokyo', city_slug: 'meguro', city: '目黒区' }
];

// Manifest: parse the canonical file, append only missing targets, then preserve the compact one-entry-per-line convention.
const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
const compactManifest = `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`;
write(manifestPath, compactManifest);
const updatedManifest = JSON.parse(read(manifestPath));
if (updatedManifest.filter((x) => x.publish).length !== 74) throw new Error(`Wave29 manifest must contain 74 published municipalities; got ${updatedManifest.filter((x) => x.publish).length}`);

// Lock generated-page and affiliate acceptance counts to the new publication total.
const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace(/outputs\.length!==64/g, 'outputs.length!==74').replace(/municipality page count must be 64/g, 'municipality page count must be 74');
if (!generator.includes('outputs.length!==74') || !generator.includes('municipality page count must be 74')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace(/manifest\.length === 64/g, 'manifest.length === 74').replace(/expected 64 published municipality pages/g, 'expected 74 published municipality pages');
if (!affiliateCheck.includes('manifest.length === 74')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

// Machine-readable AI discovery index follows the publication manifest exactly.
const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
ai.published_municipality_count = 74;
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
if (ai.municipalities.length !== 74) throw new Error(`AI reference must contain 74 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

// Root TrashNavi page: append the ten new internal links without disturbing existing order/content.
const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
const marker = '<a href="/tools/trashnavi/fukuoka/kitakyushu/">北九州市</a>';
if (!index.includes(marker)) throw new Error('TrashNavi publication-link insertion marker missing');
const newAnchors = targets.map((t) => `<a href="/tools/trashnavi/${t.pref_slug}/${t.city_slug}/">${t.city}</a>`).join('');
if (!index.includes('/tools/trashnavi/tokyo/ota/')) index = index.replace(marker, `${marker}${newAnchors}`);
write(indexPath, index);

// Root sitemap is shared with other tools: preserve every existing entry and append Wave29 only.
const rootSitemapPath = 'sitemap.xml';
let rootSitemap = read(rootSitemapPath);
let blocks = '';
for (const t of targets) {
  const url = `https://nicheworks.app/tools/trashnavi/${t.pref_slug}/${t.city_slug}/`;
  if (rootSitemap.includes(`<loc>${url}</loc>`)) continue;
  blocks += `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-16</lastmod>\n  </url>\n`;
}
if (blocks) rootSitemap = rootSitemap.replace('</urlset>', `${blocks}</urlset>`);
write(rootSitemapPath, rootSitemap);

// Document the exact Wave29 acceptance baseline and source-derived year callouts.
const specPath = 'tools/trashnavi/SPEC.md';
let spec = read(specPath);
if (!spec.includes('## Wave 29 ten-municipality publication')) {
  spec += `\n\n## Wave 29 ten-municipality publication\n\nWave 29は50自治体到達後の10自治体batch scaling ruleを継続し、公開閾値を変更せず **64自治体から74自治体** へ拡張する。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。\n\n- 東京都 大田区 — \`/tools/trashnavi/tokyo/ota/\` — waste sorting / collection calendar / bulky waste\n- 東京都 江戸川区 — \`/tools/trashnavi/tokyo/edogawa/\` — waste sorting / collection calendar / bulky waste\n- 東京都 足立区 — \`/tools/trashnavi/tokyo/adachi/\` — waste sorting / collection calendar / bulky waste\n- 東京都 板橋区 — \`/tools/trashnavi/tokyo/itabashi/\` — waste sorting / collection calendar / bulky waste\n- 東京都 江東区 — \`/tools/trashnavi/tokyo/koto/\` — waste sorting / collection calendar / bulky waste\n- 東京都 品川区 — \`/tools/trashnavi/tokyo/shinagawa/\` — waste sorting / collection calendar / bulky waste\n- 東京都 北区 — \`/tools/trashnavi/tokyo/kita/\` — waste sorting / collection calendar / bulky waste\n- 東京都 中野区 — \`/tools/trashnavi/tokyo/nakano/\` — waste sorting / collection calendar / bulky waste\n- 東京都 豊島区 — \`/tools/trashnavi/tokyo/toshima/\` — waste sorting / collection calendar / bulky waste\n- 東京都 目黒区 — \`/tools/trashnavi/tokyo/meguro/\` — waste sorting / collection calendar / bulky waste\n\nWave 29 readiness baselineは1,916 municipalities、2,314 valid HTTP(S) records、74 preferred candidates、32 direct-link datasets / 246 records / 227 unique URLs / 0 invalid URLsとする。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 74/74、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する大田区・足立区・板橋区・江東区・品川区・目黒区だけ2026 calendar calloutを表示し、江戸川区・北区・中野区・豊島区には年次calloutを生成しない。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
  write(specPath, spec);
}

// Generate the 74 canonical municipality pages + dedicated sitemap from the repository's canonical generator.
execFileSync(process.execPath, ['tools/trashnavi/scripts/generate-municipality-pages.mjs'], { cwd: root, stdio: 'inherit' });

// Local publication acceptance before committing.
for (const [script, args] of [
  ['tools/trashnavi/scripts/audit-coverage.mjs', ['--strict']],
  ['scripts/check-trashnavi-direct-links.mjs', ['--inventory']],
  ['tools/trashnavi/scripts/generate-municipality-pages.mjs', ['--check']],
  ['tools/trashnavi/scripts/check-affiliate-contract.mjs', []],
  ['tools/trashnavi/scripts/check-runtime-contract.mjs', []]
]) {
  execFileSync(process.execPath, [script, ...args], { cwd: root, stdio: 'inherit' });
}

// Temporary automation must not remain in the final publication tree.
for (const p of [
  'tools/trashnavi/scripts/wave29-publish-temp.mjs',
  '.github/workflows/trashnavi-wave29-publication-temp.yml'
]) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave29 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave29 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave29-publication-20260916'], { cwd: root, stdio: 'inherit' });
