#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const toolDir = path.resolve(scriptDir, '..');
const dataDir = path.join(toolDir, 'data');
const manifestPath = path.join(toolDir, 'individual-page-manifest.staged.json');
const outputDir = path.join(toolDir, 'staged-pages');
const checkMode = process.argv.includes('--check');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const jsonFiles = (dir) => fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort()
  : [];
const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function effectiveRecords() {
  const base = readJson(path.join(dataDir, 'services.json'));
  const byId = new Map((base.records || []).map((record) => [record.id, record]));

  for (const name of jsonFiles(path.join(dataDir, 'additions'))) {
    const wave = readJson(path.join(dataDir, 'additions', name));
    for (const record of wave.records || []) {
      if (byId.has(record.id)) throw new Error(`duplicate addition id: ${record.id}`);
      byId.set(record.id, record);
    }
  }

  for (const name of jsonFiles(path.join(dataDir, 'reverification'))) {
    const wave = readJson(path.join(dataDir, 'reverification', name));
    for (const overlay of wave.records || []) {
      if (!byId.has(overlay.id)) throw new Error(`overlay targets unknown id: ${overlay.id}`);
      const previous = byId.get(overlay.id);
      byId.set(overlay.id, {
        ...previous,
        ...overlay,
        verification: {
          ...(previous.verification || {}),
          ...(overlay.verification || {})
        }
      });
    }
  }

  return byId;
}

function routeCard(route) {
  return `<article class="route-card"><h3>${esc(route.label)}</h3><p>${esc(route.detail)}</p></article>`;
}

function renderPage(entry, record) {
  const futureCanonical = `https://nicheworks.app/tools/unsubscribe-navi/${entry.slug}/`;
  const title = `${record.name}の解約方法・公式手続き｜解約どこナビ | NicheWorks`;
  const description = `${record.name}の解約・自動更新停止などを、契約経路ごとに公式情報ベースで整理。NicheWorks上では解約処理を行いません。`;
  const webPageJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: futureCanonical,
    description,
    isPartOf: {
      '@type': 'WebSite',
      name: 'NicheWorks',
      url: 'https://nicheworks.app/'
    }
  }).replaceAll('<', '\\u003c');
  const breadcrumbJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type':'ListItem', position:1, name:'NicheWorks', item:'https://nicheworks.app/'},
      {'@type':'ListItem', position:2, name:'解約どこナビ', item:'https://nicheworks.app/tools/unsubscribe-navi/'},
      {'@type':'ListItem', position:3, name:record.name, item:futureCanonical}
    ]
  }).replaceAll('<', '\\u003c');

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${futureCanonical}">
  <meta name="robots" content="noindex,nofollow">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NicheWorks">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${futureCanonical}">
  <meta property="og:image" content="https://nicheworks.app/assets/ogp.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="https://nicheworks.app/assets/ogp.png">
  <link rel="icon" href="/assets/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/favicon.ico">
  <link rel="stylesheet" href="../style.css">
  <link rel="stylesheet" href="../individual-page.css">
  <script type="application/ld+json">${webPageJson}</script>
  <script type="application/ld+json">${breadcrumbJson}</script>
</head>
<body>
  <header class="nw-header">
    <h1>${esc(record.name)}の解約方法</h1>
    <p>解約どこナビ — 公式情報から契約経路ごとの入口を確認</p>
  </header>

  <main class="nw-main individual-page">
    <nav class="individual-breadcrumb" aria-label="パンくず"><a href="../index.staged.html">解約どこナビ</a><span>›</span><span>${esc(record.name)}</span></nav>

    <section class="staged-banner" aria-label="公開状態">
      <strong>正式公開前・検証用ページ</strong>
      <span>このページはテンプレート品質確認中のため検索エンジンには公開しません。</span>
    </section>

    <section class="individual-hero">
      <p class="individual-category">${esc(record.category)}</p>
      <h2>${esc(entry.headline)}</h2>
      <p>${esc(entry.lead)}</p>
      <div class="individual-meta">
        <span>状態: 検証済み</span>
        <span>最終確認: ${esc(entry.last_verified_at)}</span>
        <span>手続き種別: ${esc(record.procedure_type || '未分類')}</span>
      </div>
      <div class="individual-primary-actions">
        <a class="primary" href="${esc(entry.source_url)}" target="_blank" rel="noopener noreferrer">公式の手続き情報を開く</a>
        <a href="${esc(record.official_site_url)}" target="_blank" rel="noopener noreferrer">公式サイト</a>
      </div>
    </section>

    <section class="individual-section">
      <h2>まず契約経路を確認</h2>
      <p>同じサービスでも購入元・請求元によって解約先が異なる場合があります。該当する経路を確認してください。</p>
      <div class="route-grid">${entry.route_groups.map(routeCard).join('')}</div>
    </section>

    <section class="individual-section caution-section">
      <h2>解約前に確認すること</h2>
      <ul>${entry.cautions.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    </section>

    <section class="individual-section source-section">
      <h2>確認した公式情報</h2>
      <p><strong>${esc(entry.source_title)}</strong></p>
      <p>最終確認日: ${esc(entry.last_verified_at)}</p>
      <a href="${esc(entry.source_url)}" target="_blank" rel="noopener noreferrer">公式ソースを開く</a>
    </section>

    <section class="individual-section boundary-section">
      <h2>このページでできること / できないこと</h2>
      <p>解約どこナビは公式手続きへの入口と契約経路の違いを整理します。NicheWorks上で解約、退会、MNP、返金、アカウント削除などの処理は行いません。ログイン情報・契約情報・決済情報も入力しないでください。</p>
    </section>

    <p class="individual-back"><a href="../index.staged.html">← 解約どこナビの一覧へ戻る</a></p>
  </main>

  <footer class="nw-footer">
    <p>© NicheWorks — Small Web Tools for Boring Tasks</p>
    <p>掲載内容は確認日時点の公式情報を要約したものです。最終的な条件・手順は必ずリンク先の公式情報をご確認ください。</p>
  </footer>
</body>
</html>
`;
}

const manifest = readJson(manifestPath);
if (!Array.isArray(manifest) || manifest.length === 0) throw new Error('individual page manifest must be a non-empty array');

const records = effectiveRecords();
const seenSlugs = new Set();
const expectedFiles = new Map();

for (const entry of manifest) {
  if (!entry.record_id || !entry.slug) throw new Error('manifest entry requires record_id and slug');
  if (seenSlugs.has(entry.slug)) throw new Error(`duplicate staged page slug: ${entry.slug}`);
  seenSlugs.add(entry.slug);

  const record = records.get(entry.record_id);
  if (!record) throw new Error(`${entry.record_id}: record not found`);
  if (record.publication_state !== 'verified') throw new Error(`${entry.record_id}: individual page requires verified record`);
  if (!record.procedure_url) throw new Error(`${entry.record_id}: individual page requires procedure_url`);
  if (record.procedure_url !== entry.source_url) throw new Error(`${entry.record_id}: staged source must match effective procedure_url`);
  if (!Array.isArray(entry.route_groups) || entry.route_groups.length === 0) throw new Error(`${entry.record_id}: route_groups required`);
  if (!Array.isArray(entry.cautions) || entry.cautions.length === 0) throw new Error(`${entry.record_id}: cautions required`);
  if (record.verification?.last_verified_at !== entry.last_verified_at) throw new Error(`${entry.record_id}: verification date mismatch`);

  expectedFiles.set(`${entry.slug}.html`, renderPage(entry, record));
}

if (checkMode) {
  const actualNames = fs.existsSync(outputDir)
    ? fs.readdirSync(outputDir).filter((name) => name.endsWith('.html')).sort()
    : [];
  const expectedNames = [...expectedFiles.keys()].sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    throw new Error(`staged page file set mismatch: expected ${expectedNames.join(', ')}, got ${actualNames.join(', ')}`);
  }
  for (const [name, expected] of expectedFiles) {
    const actual = fs.readFileSync(path.join(outputDir, name), 'utf8');
    if (actual !== expected) throw new Error(`${name}: generated output is stale`);
  }
  console.log(`unsubscribe-navi staged individual pages: OK (${expectedFiles.size})`);
  process.exit(0);
}

fs.mkdirSync(outputDir, { recursive: true });
for (const existing of fs.readdirSync(outputDir).filter((name) => name.endsWith('.html'))) {
  if (!expectedFiles.has(existing)) fs.unlinkSync(path.join(outputDir, existing));
}
for (const [name, content] of expectedFiles) fs.writeFileSync(path.join(outputDir, name), content);
console.log(`generated ${expectedFiles.size} staged unsubscribe individual pages`);
