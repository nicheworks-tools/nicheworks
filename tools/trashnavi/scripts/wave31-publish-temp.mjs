#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const rel = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(rel(p), 'utf8');
const write = (p, v) => fs.writeFileSync(rel(p), v, 'utf8');

const targets = [
  { lgcode: '272272', pref_slug: 'osaka', city_slug: 'higashiosaka', city: '東大阪市' },
  { lgcode: '282022', pref_slug: 'hyogo', city_slug: 'amagasaki', city: '尼崎市' },
  { lgcode: '142051', pref_slug: 'kanagawa', city_slug: 'fujisawa', city: '藤沢市' },
  { lgcode: '112011', pref_slug: 'saitama', city_slug: 'kawagoe', city: '川越市' },
  { lgcode: '232114', pref_slug: 'aichi', city_slug: 'toyota', city: '豊田市' },
  { lgcode: '272035', pref_slug: 'osaka', city_slug: 'toyonaka', city: '豊中市' },
  { lgcode: '142018', pref_slug: 'kanagawa', city_slug: 'yokosuka', city: '横須賀市' },
  { lgcode: '232025', pref_slug: 'aichi', city_slug: 'okazaki', city: '岡崎市' },
  { lgcode: '232033', pref_slug: 'aichi', city_slug: 'ichinomiya', city: '一宮市' },
  { lgcode: '102024', pref_slug: 'gunma', city_slug: 'takasaki', city: '高崎市' }
];

const manifestPath = 'tools/trashnavi/municipality-page-manifest.json';
const manifest = JSON.parse(read(manifestPath));
const existingCodes = new Set(manifest.map((x) => String(x.lgcode)));
for (const t of targets) {
  if (!existingCodes.has(t.lgcode)) manifest.push({ lgcode: t.lgcode, pref_slug: t.pref_slug, city_slug: t.city_slug, publish: true });
}
write(manifestPath, `[\n${manifest.map((x) => `  ${JSON.stringify(x)}`).join(',\n')}\n]\n`);
const updatedManifest = JSON.parse(read(manifestPath));
const publishedCount = updatedManifest.filter((x) => x.publish).length;
if (publishedCount !== 94) throw new Error(`Wave31 manifest must contain 94 published municipalities; got ${publishedCount}`);

const generatorPath = 'tools/trashnavi/scripts/generate-municipality-pages.mjs';
let generator = read(generatorPath);
generator = generator.replace(/outputs\.length!==84/g, 'outputs.length!==94').replace(/municipality page count must be 84/g, 'municipality page count must be 94');
if (!generator.includes('outputs.length!==94') || !generator.includes('municipality page count must be 94')) throw new Error('generator count update failed');
write(generatorPath, generator);

const affiliateCheckPath = 'tools/trashnavi/scripts/check-affiliate-contract.mjs';
let affiliateCheck = read(affiliateCheckPath);
affiliateCheck = affiliateCheck.replace(/manifest\.length === 84/g, 'manifest.length === 94').replace(/expected 84 published municipality pages/g, 'expected 94 published municipality pages');
if (!affiliateCheck.includes('manifest.length === 94')) throw new Error('affiliate count update failed');
write(affiliateCheckPath, affiliateCheck);

const aiPath = 'tools/trashnavi/ai-reference.json';
const ai = JSON.parse(read(aiPath));
ai.published_municipality_count = 94;
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
if (ai.municipalities.length !== 94) throw new Error(`AI reference must contain 94 entries; got ${ai.municipalities.length}`);
write(aiPath, `${JSON.stringify(ai, null, 2)}\n`);

const indexPath = 'tools/trashnavi/index.html';
let index = read(indexPath);
const marker = '<a href="/tools/trashnavi/tokyo/machida/">町田市</a>';
if (!index.includes(marker)) throw new Error('TrashNavi publication-link insertion marker missing');
const newAnchors = targets.map((t) => `<a href="/tools/trashnavi/${t.pref_slug}/${t.city_slug}/">${t.city}</a>`).join('');
if (!index.includes('/tools/trashnavi/osaka/higashiosaka/')) index = index.replace(marker, `${marker}${newAnchors}`);
write(indexPath, index);

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

const specPath = 'tools/trashnavi/SPEC.md';
let spec = read(specPath);
if (!spec.includes('## Wave 31 ten-municipality publication')) {
  spec += `\n\n## Wave 31 ten-municipality publication\n\nWave 31は10自治体batch scaling ruleを継続し、公開閾値を変更せず **84自治体から94自治体** へ拡張する。人口規模と利用需要が大きい未公開の一般市を優先し、東大阪市・尼崎市・藤沢市・川越市・豊田市・豊中市・横須賀市・岡崎市・一宮市・高崎市を追加する。柏市は柏地域と沼南地域でごみルールが分かれるため、単一自治体ページへ一般化せず今回のbatchから除外する。公開条件は従来どおり \`municipal_home\` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。\n\n- 大阪府 東大阪市 — \`/tools/trashnavi/osaka/higashiosaka/\` — waste sorting / collection calendar / bulky waste\n- 兵庫県 尼崎市 — \`/tools/trashnavi/hyogo/amagasaki/\` — waste sorting / collection calendar / bulky waste\n- 神奈川県 藤沢市 — \`/tools/trashnavi/kanagawa/fujisawa/\` — waste sorting / collection calendar / bulky waste\n- 埼玉県 川越市 — \`/tools/trashnavi/saitama/kawagoe/\` — waste sorting / collection calendar / bulky waste\n- 愛知県 豊田市 — \`/tools/trashnavi/aichi/toyota/\` — waste sorting / collection calendar / bulky waste\n- 大阪府 豊中市 — \`/tools/trashnavi/osaka/toyonaka/\` — waste sorting / collection calendar / bulky waste\n- 神奈川県 横須賀市 — \`/tools/trashnavi/kanagawa/yokosuka/\` — waste sorting / collection calendar / bulky waste\n- 愛知県 岡崎市 — \`/tools/trashnavi/aichi/okazaki/\` — waste sorting / collection calendar / bulky waste\n- 愛知県 一宮市 — \`/tools/trashnavi/aichi/ichinomiya/\` — waste sorting / collection calendar / bulky waste\n- 群馬県 高崎市 — \`/tools/trashnavi/gunma/takasaki/\` — waste sorting / collection calendar / bulky waste\n\nWave 31 readiness baselineは1,916 municipalities、2,370 valid HTTP(S) records、94 preferred candidates、34 direct-link datasets / 302 records / 283 unique URLs / 0 invalid URLsとする。\n\nPublication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block \`[PR]\`、AI reference 94/94、両sitemapへのcanonical 1件ずつを検証する。\`fiscal_year: 2026\` を明示する川越市・豊中市・横須賀市・岡崎市・一宮市だけ2026 calendar calloutを表示し、東大阪市・尼崎市・藤沢市・豊田市・高崎市には年次calloutを生成しない。Amazon契約は既存の \`nicheworks09-22\` / 4 fixed searches / municipality・runtime state非送信を継承する。\n`;
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
  'tools/trashnavi/scripts/wave31-publish-temp.mjs',
  '.github/workflows/trashnavi-wave31-publication-temp.yml'
]) {
  if (fs.existsSync(rel(p))) fs.rmSync(rel(p));
}

execFileSync('git', ['config', 'user.name', 'github-actions[bot]'], { cwd: root });
execFileSync('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com'], { cwd: root });
execFileSync('git', ['add', '-A'], { cwd: root, stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
if (!status.trim()) throw new Error('Wave31 publication produced no changes');
execFileSync('git', ['commit', '-m', 'feat(trashnavi): publish Wave31 ten-municipality batch'], { cwd: root, stdio: 'inherit' });
execFileSync('git', ['push', 'origin', 'HEAD:feat/trashnavi-wave31-publication-20260916'], { cwd: root, stdio: 'inherit' });
