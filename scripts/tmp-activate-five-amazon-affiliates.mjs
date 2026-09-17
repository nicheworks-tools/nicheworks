import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, value) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
};

const TRACKING_ID = 'nicheworks09-22';
const PROOF_URL = `https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=${TRACKING_ID}`;

const tools = {
  'dry-meter': {
    titleJa: '乾燥を助ける一般用品をAmazonで探す',
    titleEn: 'Find general laundry-drying gear on Amazon',
    noteJa: 'Dry Scoreや天気・入力値から購入の必要性を判定するものではありません。室内条件や製品仕様は商品ページで確認してください。',
    noteEn: 'These are general product-discovery links, not purchase recommendations derived from Dry Score, weather, location, or manual inputs.',
    offers: [
      ['temp-humidity-meter', 'room_measurement', '温湿度計 室内 デジタル', 'Amazonで室内用温湿度計を探す', 'Find an indoor thermo-hygrometer on Amazon'],
      ['air-circulator', 'air_circulation', 'サーキュレーター 部屋干し', 'Amazonでサーキュレーターを探す', 'Find an air circulator on Amazon'],
      ['indoor-drying-rack', 'drying_rack', '室内物干し 折りたたみ', 'Amazonで室内物干しを探す', 'Find an indoor drying rack on Amazon']
    ]
  },
  'light-check': {
    titleJa: '撮影・配信用の一般照明用品をAmazonで探す',
    titleEn: 'Find general shooting and streaming lighting gear on Amazon',
    noteJa: 'B/C/S/Fの値から特定の照明器具が必要だと判定しているものではありません。照度・色温度・フリッカー性能は商品仕様で確認してください。',
    noteEn: 'These links are general equipment discovery and are not calibrated recommendations derived from B/C/S/F values.',
    offers: [
      ['video-led-light', 'video_light', '撮影用 LEDライト', 'Amazonで撮影用LEDライトを探す', 'Find a video LED light on Amazon'],
      ['ring-light', 'ring_light', 'リングライト 撮影', 'Amazonでリングライトを探す', 'Find a ring light on Amazon'],
      ['reflector', 'reflector', 'レフ板 撮影', 'Amazonで撮影用レフ板を探す', 'Find a photo reflector on Amazon']
    ]
  },
  'laundry-code-decode': {
    titleJa: '一般的な洗濯用品をAmazonで探す',
    titleEn: 'Find general laundry accessories on Amazon',
    noteJa: '選択したJIS洗濯表示の意味から処置や商品の安全性を推奨するものではありません。衣類ラベル・メーカー指示・クリーニング店の案内を優先してください。',
    noteEn: 'These general accessory links do not interpret a JIS symbol as approval for a treatment or product. Follow the garment label and manufacturer guidance.',
    offers: [
      ['laundry-net', 'laundry_accessory', '洗濯ネット セット', 'Amazonで洗濯ネットを探す', 'Find laundry nets on Amazon'],
      ['laundry-bag', 'laundry_accessory', 'ランドリーバッグ 洗濯', 'Amazonでランドリーバッグを探す', 'Find a laundry bag on Amazon'],
      ['pinch-hanger', 'laundry_accessory', 'ピンチハンガー 洗濯', 'Amazonでピンチハンガーを探す', 'Find a pinch hanger on Amazon']
    ]
  },
  'moving-checklist-generator': {
    titleJa: '引っ越し・梱包用品をAmazonで探す',
    titleEn: 'Find general moving and packing supplies on Amazon',
    noteJa: 'チェック状態から購入必須と判定するものではありません。商品購入は行政・契約・ライフライン等の手続き完了を意味しません。',
    noteEn: 'These are general packing-supply links. Checklist state does not imply a purchase requirement or completion of any official procedure.',
    offers: [
      ['moving-boxes', 'packing_supply', '引越し ダンボール セット', 'Amazonで引っ越し用段ボールを探す', 'Find moving boxes on Amazon'],
      ['packing-tape', 'packing_supply', '梱包テープ 引越し', 'Amazonで梱包テープを探す', 'Find packing tape on Amazon'],
      ['packing-cushion', 'packing_supply', '緩衝材 梱包', 'Amazonで梱包用緩衝材を探す', 'Find packing cushioning on Amazon'],
      ['compression-bags', 'packing_supply', '衣類 圧縮袋 引越し', 'Amazonで衣類圧縮袋を探す', 'Find clothing compression bags on Amazon']
    ]
  },
  'moving-lease-final-check': {
    titleJa: '退去・引渡し前の一般用品をAmazonで探す',
    titleEn: 'Find general move-out handoff supplies on Amazon',
    noteJa: '退去費用・原状回復・契約上の必要性を判定する商品提案ではありません。契約書や管理会社の案内を優先してください。',
    noteEn: 'These are general move-out supplies, not a diagnosis of lease, restoration, legal, or handoff requirements.',
    offers: [
      ['masking-tape', 'handoff_supply', '養生テープ 引越し', 'Amazonで養生テープを探す', 'Find masking/protective tape on Amazon'],
      ['packing-labels', 'handoff_supply', '荷造り ラベル シール', 'Amazonで荷造りラベルを探す', 'Find packing labels on Amazon'],
      ['document-case', 'handoff_supply', '書類ケース A4', 'AmazonでA4書類ケースを探す', 'Find an A4 document case on Amazon']
    ]
  }
};

const sharedRuntime = `(() => {\n  \"use strict\";\n\n  const helper = window.NWAmazonAffiliate;\n  const config = window.NWAmazonStaticOffers;\n  const mount = document.getElementById(\"nwAmazonAffiliate\");\n  if (!helper || !config || !(mount instanceof Element)) return;\n\n  const verified = config.enabled === true && config.template?.status === \"verified\" && /^[A-Za-z0-9_-]+-\\d{2}$/.test(config.trackingId || \"\");\n  const offers = Array.isArray(config.offers) ? config.offers : [];\n  const proofUrl = config.template?.proofUrl || \"\";\n  const targets = Object.create(null);\n  for (const offer of offers) {\n    if (offer?.target) targets[offer.target] = proofUrl;\n  }\n\n  helper.configure({ enabled: verified, tool: config.tool, targets });\n\n  function lang() { return document.documentElement.lang === \"en\" ? \"en\" : \"ja\"; }\n\n  function amazonUrl(query) {\n    const url = new URL(\"https://www.amazon.co.jp/s\");\n    url.searchParams.set(\"k\", query);\n    url.searchParams.set(\"tag\", config.trackingId);\n    return url.toString();\n  }\n\n  function render() {\n    mount.replaceChildren();\n    mount.hidden = true;\n    if (!verified || !offers.length) return;\n\n    const language = lang();\n    const section = document.createElement(\"section\");\n    section.className = \"nw-amazon-card\";\n    section.setAttribute(\"aria-label\", language === \"en\" ? \"Amazon affiliate links\" : \"Amazonアフィリエイトリンク\");\n\n    const title = document.createElement(\"h2\");\n    title.className = \"nw-amazon-title\";\n    title.textContent = language === \"en\" ? (config.titleEn || config.titleJa) : config.titleJa;\n    section.appendChild(title);\n\n    const note = document.createElement(\"p\");\n    note.className = \"nw-amazon-note\";\n    note.textContent = language === \"en\" ? (config.noteEn || config.noteJa) : config.noteJa;\n    section.appendChild(note);\n\n    const grid = document.createElement(\"div\");\n    grid.className = \"nw-amazon-grid\";\n    section.appendChild(grid);\n\n    for (const offer of offers) {\n      if (!offer?.key || !offer?.target || !offer?.query) continue;\n      const slot = document.createElement(\"div\");\n      slot.className = \"nw-amazon-slot\";\n      grid.appendChild(slot);\n      helper.mountUrl({\n        container: slot,\n        target: offer.target,\n        url: amazonUrl(offer.query),\n        label: language === \"en\" ? (offer.labelEn || offer.labelJa) : offer.labelJa,\n        placement: config.placement || \"related_products\",\n        affiliateId: offer.key,\n        destinationKey: offer.target,\n        language,\n        className: \"nw-amazon-link\"\n      });\n    }\n\n    const disclosure = document.createElement(\"div\");\n    disclosure.className = \"nw-amazon-disclosure\";\n    section.appendChild(disclosure);\n    helper.renderDisclosure(disclosure, { includeEnglish: true });\n\n    mount.appendChild(section);\n    mount.hidden = false;\n  }\n\n  render();\n  const observer = new MutationObserver((mutations) => {\n    if (mutations.some((item) => item.type === \"attributes\" && item.attributeName === \"lang\")) render();\n  });\n  observer.observe(document.documentElement, { attributes: true, attributeFilter: [\"lang\"] });\n})();\n`;

const sharedCss = `.nw-amazon-mount{margin:18px 0}\n.nw-amazon-card{border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#fff}\n.nw-amazon-title{margin:0 0 6px;font-size:16px}\n.nw-amazon-note{margin:0 0 12px;color:#6b7280;font-size:12px;line-height:1.6}\n.nw-amazon-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}\n.nw-amazon-slot{min-width:0}\n.nw-amazon-link{display:flex;align-items:center;justify-content:center;min-height:42px;padding:9px 10px;border:1px solid #d1d5db;border-radius:10px;background:#fff;color:#111827;text-decoration:none;font-size:13px;line-height:1.35;text-align:center}\n.nw-amazon-link:hover{background:#f9fafb}\n.nw-amazon-disclosure{margin-top:10px;color:#6b7280;font-size:11px;line-height:1.5}\n.nw-amazon-disclosure p{margin:2px 0}\n@media(max-width:480px){.nw-amazon-grid{grid-template-columns:1fr}}\n`;

write('assets/amazon-static-offers.js', sharedRuntime);
write('assets/amazon-static-offers.css', sharedCss);

function configSource(slug, cfg) {
  const offers = cfg.offers.map(([key, target, query, labelJa, labelEn]) => `    Object.freeze(${JSON.stringify({ key, target, query, labelJa, labelEn })})`).join(',\n');
  return `(() => {\n  \"use strict\";\n  const TRACKING_ID = ${JSON.stringify(TRACKING_ID)};\n  window.NWAmazonStaticOffers = Object.freeze({\n    enabled: true,\n    tool: ${JSON.stringify(slug)},\n    trackingId: TRACKING_ID,\n    placement: \"related_products\",\n    template: Object.freeze({\n      templateId: \"nicheworks_fixed_amazon_search\",\n      provider: \"amazon\",\n      kind: \"amazon_search\",\n      status: \"verified\",\n      verifiedAt: \"2026-09-17\",\n      verificationMethod: \"shared_link_checker_validated_tagged_search_format\",\n      proofUrl: ${JSON.stringify(PROOF_URL)}\n    }),\n    titleJa: ${JSON.stringify(cfg.titleJa)},\n    titleEn: ${JSON.stringify(cfg.titleEn)},\n    noteJa: ${JSON.stringify(cfg.noteJa)},\n    noteEn: ${JSON.stringify(cfg.noteEn)},\n    offers: Object.freeze([\n${offers}\n    ])\n  });\n})();\n`;
}

function patchIndex(slug) {
  const rel = `tools/${slug}/index.html`;
  let html = read(rel);
  if (!html.includes('/assets/amazon-static-offers.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/amazon-static-offers.css">\n</head>');
  }
  if (!html.includes('id="nwAmazonAffiliate"')) {
    const block = '    <div id="nwAmazonAffiliate" class="nw-amazon-mount" hidden></div>\n\n';
    const donateIndex = html.search(/<(?:div|section)[^>]*class=["'][^"']*nw-donate/);
    if (donateIndex >= 0) html = html.slice(0, donateIndex) + block + html.slice(donateIndex);
    else html = html.replace('</main>', `${block}</main>`);
  }
  if (!html.includes('/assets/amazon-static-offers.js')) {
    const scripts = '  <script src="/assets/amazon-affiliate.js"></script>\n  <script src="./affiliate-config.js"></script>\n  <script src="/assets/amazon-static-offers.js"></script>\n';
    html = html.replace('</body>', `${scripts}</body>`);
  }
  write(rel, html);
}

for (const [slug, cfg] of Object.entries(tools)) {
  write(`tools/${slug}/affiliate-config.js`, configSource(slug, cfg));
  patchIndex(slug);
}

function replaceRequired(rel, from, to) {
  const current = read(rel);
  if (!current.includes(from)) throw new Error(`${rel}: expected text not found`);
  write(rel, current.replace(from, to));
}

replaceRequired(
  'tools/dry-meter/SPEC.md',
  'The canonical monetization class is `AFFILIATE`, but classification alone does not authorize a live commerce block. No Amazon CTA may render until a verified Amazon Special Link/configuration has been supplied for this tool.',
  'The canonical monetization class is `AFFILIATE`. The live commerce block uses the validated NicheWorks Amazon Japan tagged-search template with tracking ID `nicheworks09-22`. Only fixed, tool-owned category queries are used; Dry Score, weather, geolocation, and manual inputs never enter an Amazon URL.'
);
replaceRequired('tools/dry-meter/SPEC.md', '- [ ] No Amazon affiliate CTA renders unless a verified tool-specific affiliate configuration exists.\n- [ ] Any future affiliate placement remains non-diagnostic and does not claim that Dry Score determines a product need.', '- [ ] The active Amazon block uses only fixed general-equipment queries and the shared `nicheworks09-22` tagged-search template.\n- [ ] Affiliate placement remains non-diagnostic and does not claim that Dry Score determines a product need.');

replaceRequired(
  'tools/light-check/SPEC.md',
  'The canonical monetization class is `AFFILIATE`, but no live Amazon CTA may render until a verified Amazon Special Link/configuration has been supplied for this tool.',
  'The canonical monetization class is `AFFILIATE`. The live commerce block uses the validated NicheWorks Amazon Japan tagged-search template with tracking ID `nicheworks09-22` and fixed shooting/streaming equipment queries only. Camera frames and B/C/S/F values never enter an Amazon URL.'
);
replaceRequired('tools/light-check/SPEC.md', '- [ ] No Amazon affiliate CTA renders unless a verified tool-specific affiliate configuration exists.\n- [ ] Any future affiliate placement remains a general shooting/streaming equipment path and is not presented as a calibrated recommendation from B/C/S/F.', '- [ ] The active Amazon block uses only fixed general shooting/streaming equipment queries and the shared `nicheworks09-22` tagged-search template.\n- [ ] Affiliate placement remains a general equipment path and is not presented as a calibrated recommendation from B/C/S/F.');

replaceRequired(
  'tools/laundry-code-decode/SPEC.md',
  'The canonical monetization class is `AFFILIATE`, but no live Amazon CTA may render until a verified Amazon Special Link/configuration has been supplied for this tool.',
  'The canonical monetization class is `AFFILIATE`. The live commerce block uses the validated NicheWorks Amazon Japan tagged-search template with tracking ID `nicheworks09-22` and fixed general laundry-accessory queries only. Selected symbols, search text, uploaded images, and candidate scores never enter an Amazon URL.'
);
replaceRequired('tools/laundry-code-decode/SPEC.md', '- [ ] No Amazon affiliate CTA renders unless a verified tool-specific affiliate configuration exists.\n- [ ] Affiliate content never changes or extends the meaning of a JIS symbol or recommends a garment treatment from the symbol alone.', '- [ ] The active Amazon block uses only fixed general laundry-accessory queries and the shared `nicheworks09-22` tagged-search template.\n- [ ] Affiliate content never changes or extends the meaning of a JIS symbol or recommends a garment treatment from the symbol alone.');

replaceRequired(
  'tools/moving-checklist-generator/SPEC.md',
  'The canonical monetization class is `AFFILIATE`, but no live Amazon CTA may render until a verified Amazon Special Link/configuration has been supplied for this tool.',
  'The canonical monetization class is `AFFILIATE`. The live commerce block uses the validated NicheWorks Amazon Japan tagged-search template with tracking ID `nicheworks09-22` and fixed general moving/packing-supply queries only. Move date, household/home type, memo text, checklist state, and completion progress never enter an Amazon URL.'
);
replaceRequired('tools/moving-checklist-generator/SPEC.md', '- [ ] No Amazon affiliate CTA renders unless a verified tool-specific affiliate configuration exists.\n- [ ] Affiliate content remains limited to general moving/packing supplies and never represents an official checklist requirement.', '- [ ] The active Amazon block uses only fixed general moving/packing-supply queries and the shared `nicheworks09-22` tagged-search template.\n- [ ] Affiliate content remains limited to general moving/packing supplies and never represents an official checklist requirement.');

replaceRequired(
  'tools/moving-lease-final-check/SPEC.md',
  'This tool may remain a future affiliate candidate because final-stage move-out work can have contextual physical-product needs. However, no Amazon CTA or product claim may be added without a verified Special Link and a clearly relevant placement. The checklist result must not be used to diagnose a need to buy a product.',
  'The canonical monetization class is `AFFILIATE`. The live commerce block uses the validated NicheWorks Amazon Japan tagged-search template with tracking ID `nicheworks09-22` and fixed general move-out/handoff-supply queries only. Exit date, home type, checklist state, inspection notes, and progress never enter an Amazon URL. The checklist result must not be used to diagnose a need to buy a product or to infer lease/restoration obligations.'
);
replaceRequired('tools/moving-lease-final-check/SPEC.md', '- [ ] The page explicitly sends broad moving preparation to `moving-checklist-generator`.', '- [ ] The page explicitly sends broad moving preparation to `moving-checklist-generator`.\n- [ ] The active Amazon block uses only fixed general handoff-supply queries and the shared `nicheworks09-22` tagged-search template; it does not infer lease or restoration requirements.');

for (const slug of Object.keys(tools)) {
  const rel = `tools/${slug}/SPEC.md`;
  let spec = read(rel);
  if (!spec.includes(`tools/${slug}/affiliate-config.js`)) {
    spec = spec.replace(`- \`tools/${slug}/style.css\``, `- \`tools/${slug}/style.css\`\n- \`tools/${slug}/affiliate-config.js\``);
    write(rel, spec);
  }
}

let common = read('common-spec/amazon-affiliate.md');
common = common.replace(
  'Status: active implementation contract, integration disabled until valid Associate links are configured.',
  'Status: active implementation contract. Individual tools remain fail-closed until their validated configuration is enabled; several production tools use the shared validated tagged-search format.'
);
if (!common.includes('## 6A. Shared validated NicheWorks tagged-search template')) {
  common = common.replace('## 7. Release gate', `## 6A. Shared validated NicheWorks tagged-search template\n\nNicheWorks production tools may reuse the already validated Amazon Japan tagged-search format with tracking ID \`nicheworks09-22\` when all query terms are fixed tool-owned metadata. The representative proof URL and verification method are recorded in each active tool configuration. A tool does not need a separate SiteStripe short link for every fixed category when it reuses this validated format.\n\nAs of 2026-09-17, the retained affiliate-candidate rollout also activates fixed-query commerce blocks for:\n\n- Dry Meter — room measurement / air circulation / indoor drying-rack discovery;\n- Light Check — shooting/streaming lighting accessories;\n- Laundry Code Decode — general laundry accessories, separated from JIS interpretation;\n- Moving Checklist Generator — general moving/packing supplies;\n- Moving / Lease Final Check — general move-out/handoff supplies.\n\nFor these tools, user inputs, tool results, scores, measurements, selected symbols, dates, checklist state, or uploaded content MUST NOT alter the Amazon query or affiliate analytics metadata.\n\n## 7. Release gate`);
}
write('common-spec/amazon-affiliate.md', common);

const checkScript = `import fs from 'node:fs';\nimport path from 'node:path';\nimport vm from 'node:vm';\n\nconst root = process.cwd();\nconst failures = [];\nconst read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');\nconst check = (condition, message) => { if (!condition) failures.push(message); };\nconst retained = ['dry-meter','light-check','laundry-code-decode','moving-checklist-generator','moving-lease-final-check'];\nconst classification = JSON.parse(read('MONETIZATION_CLASSIFICATION.json'));\nconst affiliateSet = new Set(classification.classes.AFFILIATE || []);\nconst TRACKING_ID = 'nicheworks09-22';\n\nfunction loadConfig(slug) {\n  const sandbox = { window: {} };\n  vm.runInNewContext(read(\`tools/\${slug}/affiliate-config.js\`), sandbox, { filename: slug });\n  return sandbox.window.NWAmazonStaticOffers;\n}\n\nfor (const slug of retained) {\n  check(affiliateSet.has(slug), \`\${slug}: must remain canonical AFFILIATE\`);\n  const cfg = loadConfig(slug);\n  check(cfg?.enabled === true, \`\${slug}: affiliate config must be enabled\`);\n  check(cfg?.tool === slug, \`\${slug}: config tool slug mismatch\`);\n  check(cfg?.trackingId === TRACKING_ID, \`\${slug}: tracking ID mismatch\`);\n  check(cfg?.template?.status === 'verified', \`\${slug}: template must be verified\`);\n  check(String(cfg?.template?.proofUrl || '').includes('amazon.co.jp/s?'), \`\${slug}: proof URL must be Amazon Japan search\`);\n  check(String(cfg?.template?.proofUrl || '').includes(\`tag=\${TRACKING_ID}\`), \`\${slug}: proof URL must carry maintained tracking ID\`);\n  check(Array.isArray(cfg?.offers) && cfg.offers.length >= 3, \`\${slug}: expected at least three fixed offers\`);\n  const keys = new Set();\n  for (const offer of cfg?.offers || []) {\n    check(Boolean(offer.key && offer.target && offer.query && offer.labelJa), \`\${slug}: offer fields incomplete\`);\n    check(!keys.has(offer.key), \`\${slug}: duplicate offer key \${offer.key}\`);\n    keys.add(offer.key);\n    check(!/[{}$]/.test(offer.query), \`\${slug}: offer query must be fixed metadata\`);\n    const url = new URL('https://www.amazon.co.jp/s');\n    url.searchParams.set('k', offer.query);\n    url.searchParams.set('tag', cfg.trackingId);\n    check(url.hostname === 'www.amazon.co.jp' && url.searchParams.get('tag') === TRACKING_ID, \`\${slug}: generated tagged search invalid\`);\n  }\n  const html = read(\`tools/\${slug}/index.html\`);\n  for (const needle of ['/assets/amazon-static-offers.css','id=\"nwAmazonAffiliate\"','/assets/amazon-affiliate.js','./affiliate-config.js','/assets/amazon-static-offers.js']) {\n    check(html.includes(needle), \`\${slug}: missing affiliate wiring \${needle}\`);\n  }\n  const spec = read(\`tools/\${slug}/SPEC.md\`);\n  check(spec.includes('nicheworks09-22'), \`\${slug}: specification must record active shared tracking template\`);\n}\n\nconst runtime = read('assets/amazon-static-offers.js');\nfor (const needle of ['url.searchParams.set(\"k\", query)','url.searchParams.set(\"tag\", config.trackingId)','helper.mountUrl({','affiliateId: offer.key','destinationKey: offer.target','helper.renderDisclosure']) {\n  check(runtime.includes(needle), \`shared static runtime missing \${needle}\`);\n}\nfor (const forbidden of ['location.search','localStorage','sessionStorage','offer.query =','gtag(\"event\"']) {\n  check(!runtime.includes(forbidden), \`shared static runtime must not derive commerce from user/page state: \${forbidden}\`);\n}\n\nif (failures.length) {\n  console.error(\`Retained Amazon affiliate rollout failed (\${failures.length})\`);\n  for (const failure of failures) console.error(\`- \${failure}\`);\n  process.exit(1);\n}\nconsole.log('PASS: five retained affiliate tools use fixed NicheWorks Amazon Japan tagged-search offers with shared analytics/disclosure.');\n`;
write('scripts/check-retained-amazon-affiliates.mjs', checkScript);

const permanentWorkflow = `name: Retained Amazon affiliate rollout\n\non:\n  pull_request:\n    paths:\n      - 'assets/amazon-affiliate.js'\n      - 'assets/amazon-static-offers.js'\n      - 'assets/amazon-static-offers.css'\n      - 'common-spec/amazon-affiliate.md'\n      - 'MONETIZATION_CLASSIFICATION.json'\n      - 'tools/dry-meter/**'\n      - 'tools/light-check/**'\n      - 'tools/laundry-code-decode/**'\n      - 'tools/moving-checklist-generator/**'\n      - 'tools/moving-lease-final-check/**'\n      - 'scripts/check-retained-amazon-affiliates.mjs'\n      - '.github/workflows/check-retained-amazon-affiliates.yml'\n  push:\n    branches: [main]\n    paths:\n      - 'assets/amazon-affiliate.js'\n      - 'assets/amazon-static-offers.js'\n      - 'assets/amazon-static-offers.css'\n      - 'common-spec/amazon-affiliate.md'\n      - 'MONETIZATION_CLASSIFICATION.json'\n      - 'tools/dry-meter/**'\n      - 'tools/light-check/**'\n      - 'tools/laundry-code-decode/**'\n      - 'tools/moving-checklist-generator/**'\n      - 'tools/moving-lease-final-check/**'\n      - 'scripts/check-retained-amazon-affiliates.mjs'\n      - '.github/workflows/check-retained-amazon-affiliates.yml'\n\npermissions:\n  contents: read\n\njobs:\n  validate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: '24'\n      - run: node scripts/check-retained-amazon-affiliates.mjs\n`;
write('.github/workflows/check-retained-amazon-affiliates.yml', permanentWorkflow);

fs.rmSync(path.join(root, 'scripts/tmp-activate-five-amazon-affiliates.mjs'), { force: true });
fs.rmSync(path.join(root, '.github/workflows/tmp-activate-five-amazon-affiliates.yml'), { force: true });

console.log('Applied five-tool Amazon affiliate rollout and removed temporary finalizer files.');
