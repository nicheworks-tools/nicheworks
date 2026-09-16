#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '131059', pref_slug: 'tokyo', city_slug: 'bunkyo', city: '文京区' },
  { lgcode: '131067', pref_slug: 'tokyo', city_slug: 'taito', city: '台東区' },
  { lgcode: '131075', pref_slug: 'tokyo', city_slug: 'sumida', city: '墨田区' },
  { lgcode: '131181', pref_slug: 'tokyo', city_slug: 'arakawa', city: '荒川区' },
  { lgcode: '132012', pref_slug: 'tokyo', city_slug: 'hachioji', city: '八王子市' },
  { lgcode: '122041', pref_slug: 'chiba', city_slug: 'funabashi', city: '船橋市' },
  { lgcode: '112038', pref_slug: 'saitama', city_slug: 'kawaguchi', city: '川口市' },
  { lgcode: '122076', pref_slug: 'chiba', city_slug: 'matsudo', city: '松戸市' },
  { lgcode: '122033', pref_slug: 'chiba', city_slug: 'ichikawa', city: '市川市' },
  { lgcode: '132098', pref_slug: 'tokyo', city_slug: 'machida', city: '町田市' }
];

// Extend the canonical publication manifest deterministically.
const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);
const updatedManifest = JSON.parse(read(manifestPath));
const publishedCount = updatedManifest.filter((x) => x.publish).length;
if (publishedCount !== 84) throw new Error(`Wave30 manifest must contain 84 published municipalities; got ${publishedCount}`);

// Lock generated-page and affiliate acceptance counts to Wave30 total.
const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace(/outputs\.length!==74/g, 'outputs.length!==84').replace(/municipality page count must be 74/g, 'municipality page count must be 84');
if (!generator.includes('outputs.length!==84') || !generator.includes('municipality page count must be 84')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace(/manifest\.length === 74/g, 'manifest.length === 84').replace(/expected 74 published municipality pages/g, 'expected 84 published municipality pages');
if (!affiliateCheck.includes('manifest.length === 84')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

// Machine-readable AI discovery index follows the publication manifest exactly.
const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
ai.published_municipality_count = 84;
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
if (ai.municipalities.length !== 84) throw new Error(`AI reference must contain 84 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

// Root TrashNavi page: append Wave30 links without disturbing existing order/content.
const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
const marker = '<a href="/tools/trashnavi/tokyo/meguro/">目黒区</a>';
if (!index.includes(marker)) throw new Error('TrashNavi publication-link insertion marker missing');
const newAnchors = targets.map((t) => `<a href="/tools/trashnavi/${t.pref_slug}/${t.city_slug}/">${t.city}</a>`).join('');
if (!index.includes('/tools/trashnavi/tokyo/bunkyo/')) index = index.replace(marker, `${marker}${newAnchors}`);
write(indexPath, index);

// Root sitemap is shared across tools; preserve all existing entries and append Wave30 only.
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

// Record the measured readiness baseline and publication acceptance contract.
const specPath = 'tools/trashnavi/SPEC.md';
let spec = read(specPath);
if (!spec.includes('## Wave 30 ten-municipality publication')) {
  spec += `\n\n## Wave 30 ten-municipality publication\n\nWave 30は10自治体batch scaling ruleを継続し、公開閾値を変更せず **74自治体から84自治体** へ拡張する。東京都は残る文京区・台東区・墨田区・荒川区を加えることで23特別区すべてを公開対象にし、あわせて八王子市・船橋市・川口市・松戸市・市川市・町田市を追加する。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。\n\n- 東京都 文京区 — \`/tools/trashnavi/tokyo/bunkyo/\` — waste sorting / collection calendar / bulky waste\n- 東京都 台東区 — \`/tools/trashnavi/tokyo/taito/\` — waste sorting / collection calendar / bulky waste\n- 東京都 墨田区 — \`/tools/trashnavi/tokyo/sumida/\` — waste sorting / collection calendar / bulky waste\n- 東京都 荒川区 — \`/tools/trashnavi/tokyo/arakawa/\` — waste sorting / collection calendar / bulky waste\n- 東京都 八王子市 — \`/tools/trashnavi/tokyo/hachioji/\` — waste sorting / collection calendar / bulky waste\n- 千葉県 船橋市 — \`/tools/trashnavi/chiba/funabashi/\` — waste sorting / collection calendar / bulky waste\n- 埼玉県 川口市 — \`/tools/trashnavi/saitama/kawaguchi/\` — waste sorting / collection calendar / bulky waste\n- 千葉県 松戸市 — \`/tools/trashnavi/chiba/matsudo/\` — waste sorting / collection calendar / bulky waste\n- 千葉県 市川市 — \`/tools/trashnavi/chiba/ichikawa/\` — waste sorting / collection calendar / bulky waste\n- 東京都 町田市 — \`/tools/trashnavi/tokyo/machida/\` — waste sorting / collection calendar / bulky waste\n\nWave 30 readiness baselineは1,916 municipalities、2,340 valid HTTP(S) records、84 preferred candidates、33 direct-link datasets / 272 records / 253 unique URLs / 0 invalid URLsとする。東京都のpreferred candidatesは25となり、23特別区に八王子市・町田市を加えた状態である。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 84/84、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する台東区・墨田区・八王子市・川口市・松戸市・市川市だけ2026 calendar calloutを表示し、文京区・荒川区・船橋市・町田市には年次calloutを生成しない。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
  write(specPath, spec);
}

// Generate all canonical municipality pages + dedicated sitemap.
execFileSync(process.execPath, ['tools/trashnavi/scripts/generate-municipality-pages.mjs'], { cwd: root, stdio: 'inherit' });

// Publication acceptance before committing.
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
  'tools/trashnavi/scripts/wave30-publish-temp.mjs',
  '.github/workflows/trashnavi-wave30-publication-temp.yml'
]) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave30 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave30 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave30-publication-20260916'], { cwd: root, stdio: 'inherit' });
