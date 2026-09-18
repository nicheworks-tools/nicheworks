import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const canonicalPrefix = 'https://nicheworks.app/tools/old-kanji-reference/kanji/';
const allowlist = [
  {
    slug: 'ga-kaku',
    source: '畫',
    target: '画',
    query: '計画 旧字体',
    demandMarker: '11 impressions',
    plan: '.agent/plans/2026-09-16-old-kanji-wave1-ga-kaku.md'
  },
  {
    slug: 'sho-shou',
    source: '將',
    target: '将',
    query: '将 旧字体',
    demandMarker: '1 impression',
    plan: '.agent/plans/2026-09-17-old-kanji-wave2-sho-shou.md'
  },
  {
    slug: 'kyu-old',
    source: '舊',
    target: '旧',
    query: '旧 旧字体',
    demandMarker: '1 impression',
    plan: '.agent/plans/2026-09-17-old-kanji-wave3-kyu.md'
  }
];

const expectedSlugs = allowlist.map((item) => item.slug).sort();
const kanjiDir = path.join(root, 'tools/old-kanji-reference/kanji');
const publishedSlugs = fs.readdirSync(kanjiDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(kanjiDir, entry.name, 'index.html')))
  .map((entry) => entry.name)
  .sort();

check(
  JSON.stringify(publishedSlugs) === JSON.stringify(expectedSlugs),
  `individual-page filesystem inventory must equal reviewed allowlist: expected ${expectedSlugs.join(', ')}, got ${publishedSlugs.join(', ')}`
);

const sitemap = read('sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>(https:\/\/nicheworks\.app\/tools\/old-kanji-reference\/kanji\/[^<]+)<\/loc>/g)]
  .map((match) => match[1]);
const expectedUrls = allowlist.map((item) => `${canonicalPrefix}${item.slug}/`).sort();

check(
  JSON.stringify([...sitemapUrls].sort()) === JSON.stringify(expectedUrls),
  `sitemap individual-page inventory must equal reviewed allowlist: ${JSON.stringify(sitemapUrls)}`
);
for (const url of expectedUrls) {
  check(sitemapUrls.filter((value) => value === url).length === 1, `sitemap must contain exactly one entry for ${url}`);
}

const audit = JSON.parse(read('tools/old-kanji-reference/dictionary-audit.json'));
check(audit.summary?.issueRecords === 0, 'dictionary audit must have zero blocking issue records');
check(
  audit.summary?.seoCandidates === audit.seoCandidates?.length,
  'dictionary audit SEO candidate summary must match seoCandidates array length'
);
check(
  Number(audit.summary?.seoCandidates || 0) > allowlist.length,
  'repository SEO candidates must remain a candidate pool, not equivalent to publication inventory'
);

for (const item of allowlist) {
  const rel = `tools/old-kanji-reference/kanji/${item.slug}/index.html`;
  const html = read(rel);
  const canonical = `${canonicalPrefix}${item.slug}/`;

  check(html.includes(`<link rel="canonical" href="${canonical}">`), `${item.slug}: self-canonical missing`);
  check(html.includes('<meta name="robots" content="index,follow">'), `${item.slug}: index/follow robots contract missing`);
  check(html.includes('"@type":"Article"'), `${item.slug}: Article structured data missing`);
  check(html.includes(`"mainEntityOfPage":"${canonical}"`), `${item.slug}: structured-data canonical mismatch`);
  check(
    html.includes('https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/index.html'),
    `${item.slug}: Culture Agency primary-source link missing`
  );

  const record = audit.records?.find((entry) => entry.source === item.source && entry.target === item.target);
  check(Boolean(record), `${item.slug}: current dictionary audit record missing for ${item.source}→${item.target}`);
  if (record) {
    check(record.classification === 'old_to_modern', `${item.slug}: mapping is no longer old_to_modern`);
    check(record.seoCandidate === true, `${item.slug}: current dictionary/source SEO gate no longer passes`);
    check(Array.isArray(record.issues) && record.issues.length === 0, `${item.slug}: current audit has blocking mapping issues`);
  }

  const plan = read(item.plan);
  check(plan.includes('authenticated Google Search Console property'), `${item.slug}: preserved authenticated GSC evidence provenance missing`);
  check(plan.includes(item.query), `${item.slug}: preserved demand query missing: ${item.query}`);
  check(plan.includes(item.demandMarker), `${item.slug}: preserved demand measurement missing: ${item.demandMarker}`);
  check(plan.includes('Primary-source gate') || plan.includes('External authority'), `${item.slug}: preserved primary-source publication gate missing`);
}

const cluster = read('tools/OLD_KANJI_CLUSTER.md');
check(cluster.includes('Publication is allowlist-only.'), 'cluster allowlist-only publication rule missing');
check(cluster.includes('**dictionary/source gate**'), 'cluster dictionary/source publication gate missing');
check(cluster.includes('**demand gate**'), 'cluster GSC demand publication gate missing');
check(cluster.includes('must never turn the full candidate set into pages automatically'), 'candidate-to-page automation prohibition missing');

const spec = read('tools/old-kanji-reference/SPEC.md');
for (const item of allowlist) {
  check(spec.includes(`kanji/${item.slug}/`), `Reference SPEC allowlist missing ${item.slug}`);
}
check(spec.includes('Repository-side `seoCandidate` status is not publication approval'), 'Reference SPEC candidate/publication distinction missing');

if (failures.length) {
  console.error(`Old Kanji SEO inventory gate failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Old Kanji SEO inventory gate passed: ${allowlist.length} published / ${audit.summary.seoCandidates} repository candidates; new pages authorized by this check: 0.`
);
