import fs from 'node:fs';

function replaceOnce(path, before, after) {
  const text = fs.readFileSync(path, 'utf8');
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${path}: expected exactly one replacement target, got ${count}`);
  fs.writeFileSync(path, text.replace(before, after));
}

function insertAfterKey(obj, anchor, entries) {
  const out = {};
  let inserted = false;
  for (const [key, value] of Object.entries(obj)) {
    out[key] = value;
    if (key === anchor) {
      Object.assign(out, entries);
      inserted = true;
    }
  }
  if (!inserted) throw new Error(`anchor ${anchor} missing`);
  return out;
}

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
if (!Array.isArray(payload.phones) || payload.phones.length < 182) throw new Error('unexpected Phone QuickCheck dataset');
payload.version = 7;
payload.updatedAt = '2026-09-15';

const waterEvidence = new Map([
  ['samsung-galaxy-z-fold2-5g', 'https://www.samsung.com/hk_en/support/mobile-devices/precautions-when-using-the-galaxy-z-fold2-device/'],
  ['samsung-galaxy-z-flip', 'https://www.samsung.com/sg/support/mobile-devices/common-questions-about-your-galaxy-z-flip/'],
  ['samsung-galaxy-fold-scv44', 'https://www.samsung.com/sg/support/mobile-devices/what-are-the-screen-precautions-for-samsung-galaxy-fold/']
]);

for (const [id, waterUrl] of waterEvidence) {
  const index = payload.phones.findIndex((phone) => phone.id === id);
  if (index < 0) throw new Error(`missing canonical phone ${id}`);
  const phone = payload.phones[index];
  if (phone.waterRating !== undefined && phone.waterRating !== null && phone.waterRating !== '') {
    throw new Error(`${id}: refusing to overwrite existing waterRating ${phone.waterRating}`);
  }
  const base = { ...phone };
  delete base.waterRating;
  delete base.waterStatus;
  const updated = insertAfterKey(base, 'displayInch', {
    waterRating: null,
    waterStatus: 'not_resistant'
  });
  const currentSources = updated.sources || {};
  const { verifiedAt: _verifiedAt, waterUrl: _waterUrl, ...sourceRest } = currentSources;
  updated.sources = {
    ...sourceRest,
    waterUrl,
    verifiedAt: '2026-09-15'
  };
  payload.phones[index] = updated;
}

const unresolved = payload.phones.find((phone) => phone.id === 'samsung-galaxy-z-flip-5g');
if (!unresolved) throw new Error('missing canonical Galaxy Z Flip 5G');
if (unresolved.waterStatus !== undefined || unresolved.sources?.waterUrl !== undefined) {
  throw new Error('Galaxy Z Flip 5G unexpectedly already has explicit water-state evidence');
}

fs.writeFileSync(phonesPath, `${JSON.stringify(payload, null, 2)}\n`);

const appPath = 'tools/phone-quickcheck/app.js';
replaceOnce(
  appPath,
  '      unknown: "不明",\n      supported: "対応",',
  '      unknown: "不明",\n      notWaterDustResistant: "非防水・非防塵",\n      supported: "対応",'
);
replaceOnce(
  appPath,
  '      unknown: "Unknown",\n      supported: "Supported",',
  '      unknown: "Unknown",\n      notWaterDustResistant: "Not water or dust resistant",\n      supported: "Supported",'
);
replaceOnce(
  appPath,
  "    const water = phone.waterRating || '—';",
  '    const water = waterLabel(phone);'
);
replaceOnce(
  appPath,
  '  function kv(label, value) {\n    return `<div class="kv"><span>${escapeHtml(label)}</span><b>${escapeHtml(value || \'—\')}</b></div>`;\n  }',
  '  function waterLabel(phone) {\n    if (typeof phone.waterRating === \'string\' && phone.waterRating.trim()) return phone.waterRating;\n    if (phone.waterStatus === \'not_resistant\') return msg(\'notWaterDustResistant\');\n    return \'—\';\n  }\n\n  function kv(label, value) {\n    return `<div class="kv"><span>${escapeHtml(label)}</span><b>${escapeHtml(value || \'—\')}</b></div>`;\n  }'
);

const validatorPath = 'scripts/check-phone-quickcheck-data.mjs';
replaceOnce(
  validatorPath,
  "  if (phone.displayInch !== null && phone.displayInch !== undefined && !finitePositive(phone.displayInch)) fail(`${label}: invalid displayInch`);\n\n  const charging = phone.charging || {};",
  "  if (phone.displayInch !== null && phone.displayInch !== undefined && !finitePositive(phone.displayInch)) fail(`${label}: invalid displayInch`);\n  if (phone.waterRating !== null && phone.waterRating !== undefined && (typeof phone.waterRating !== 'string' || !phone.waterRating.trim())) fail(`${label}: invalid waterRating`);\n  if (phone.waterStatus !== null && phone.waterStatus !== undefined && phone.waterStatus !== 'not_resistant') fail(`${label}: unsupported waterStatus`);\n  if (phone.waterStatus === 'not_resistant' && phone.waterRating !== null && phone.waterRating !== undefined && phone.waterRating !== '') fail(`${label}: not_resistant must not carry waterRating`);\n\n  const charging = phone.charging || {};"
);
replaceOnce(
  validatorPath,
  "  const sources = phone.sources || {};\n  if (!isHttps(sources.specificationsUrl)) fail(`${label}: HTTPS specificationsUrl required`);",
  "  const sources = phone.sources || {};\n  if (sources.waterUrl !== null && sources.waterUrl !== undefined && !isHttps(sources.waterUrl)) fail(`${label}: waterUrl must be HTTPS when present`);\n  if (phone.waterStatus === 'not_resistant' && !isHttps(sources.waterUrl)) fail(`${label}: not_resistant requires HTTPS sources.waterUrl`);\n  if (!isHttps(sources.specificationsUrl)) fail(`${label}: HTTPS specificationsUrl required`);"
);

const semanticPath = 'scripts/check-phone-quickcheck-source-semantics.mjs';
replaceOnce(
  semanticPath,
  "  for (const key of ['specificationsUrl', 'manualUrl', 'releaseUrl', 'chargingUrl', 'wirelessUrl']) {",
  "  for (const key of ['specificationsUrl', 'manualUrl', 'releaseUrl', 'chargingUrl', 'wirelessUrl', 'waterUrl']) {"
);

const specPath = 'tools/phone-quickcheck/SPEC.md';
replaceOnce(
  specPath,
  'The list view remains deliberately compact. Selecting a phone exposes detail information including dimensions, weight, display size where maintained, charging port, charger guidance, verified protocol labels, PPS state, wireless charging standard/wattage, battery capacity where an accepted value exists, included cable/adapter state, official specification/manual links, and last verification date.',
  'The list view remains deliberately compact. Selecting a phone exposes detail information including dimensions, weight, display size where maintained, water/dust rating or an explicitly source-backed non-resistant state, charging port, charger guidance, verified protocol labels, PPS state, wireless charging standard/wattage, battery capacity where an accepted value exists, included cable/adapter state, official specification/manual links, and last verification date.'
);
replaceOnce(
  specPath,
  'Phone records use stable model IDs, canonical manufacturer/model names, maintained aliases, dimensions in millimetres, mass in grams, charging facts, provenance/source URLs, verification date, and optional additive accessory keys. Standard phones use `dimensions`; foldables use `formFactor: foldable` plus complete `dimensionsFolded` and `dimensionsUnfolded` sets. Each dimension set keeps `heightMm` and `widthMm` plus either one `depthMm` value or, for a manufacturer-published variable foldable thickness, the paired `depthMmMin` / `depthMmMax` range. A range must never be collapsed into an inferred single depth. Foldables are listed and compact-sorted by folded dimensions while detail output shows both physical states.',
  'Phone records use stable model IDs, canonical manufacturer/model names, maintained aliases, dimensions in millimetres, mass in grams, charging facts, provenance/source URLs, verification date, and optional additive accessory keys. Standard phones use `dimensions`; foldables use `formFactor: foldable` plus complete `dimensionsFolded` and `dimensionsUnfolded` sets. Each dimension set keeps `heightMm` and `widthMm` plus either one `depthMm` value or, for a manufacturer-published variable foldable thickness, the paired `depthMmMin` / `depthMmMax` range. A range must never be collapsed into an inferred single depth. Foldables are listed and compact-sorted by folded dimensions while detail output shows both physical states.\n\n`waterRating` stores a published IP rating when one is maintained. An explicit negative state uses `waterStatus: not_resistant` plus a manufacturer-controlled `sources.waterUrl`; a missing/null `waterRating` without that status remains unknown/unverified. The absence of an IP rating must never be inferred as proof that a device is not water resistant.'
);
replaceOnce(
  specPath,
  '- [x] Manufacturer-nonpublic battery capacity is not silently presented as official.\n- [x] Unknown battery capacity produces no fabricated recharge estimate.',
  '- [x] Manufacturer-nonpublic battery capacity is not silently presented as official.\n- [x] Missing water ratings remain unknown; an explicit non-resistant state requires primary-source evidence and renders bilingually.\n- [x] Unknown battery capacity produces no fabricated recharge estimate.'
);

const docPath = 'docs/tools/phone-quickcheck.md';
replaceOnce(
  docPath,
  '- USB PD、PPS、Samsung Super Fast Charging、OPPO SUPERVOOC、Xiaomi HyperCharge/TurboCharge、Motorola TurboPower、Qi、Qi2等は維持済み事実から表示・分類する。',
  '- USB PD、PPS、Samsung Super Fast Charging、OPPO SUPERVOOC、Xiaomi HyperCharge/TurboCharge、Motorola TurboPower、Qi、Qi2等は維持済み事実から表示・分類する。\n- `waterRating` は維持済みIP等級のみを保持する。メーカー一次資料が明示的に非防水・非防塵とする場合だけ `waterStatus: not_resistant` と `sources.waterUrl` を記録し、単なる `waterRating` 欠落/nullは未確認のまま扱う。'
);
replaceOnce(
  docPath,
  '- 充電端子、充電器目安、充電規格、PPS状態、ワイヤレス充電情報。',
  '- 防水・防塵等級、またはメーカー一次資料で明示された非防水・非防塵状態。未確認は `—` のまま表示する。\n- 充電端子、充電器目安、充電規格、PPS状態、ワイヤレス充電情報。'
);
replaceOnce(
  docPath,
  '- バッテリー容量が不明な場合は0回や推測mAhを作らず、算出不可／未確認として扱う。',
  '- バッテリー容量が不明な場合は0回や推測mAhを作らず、算出不可／未確認として扱う。\n- `waterRating` が不明なだけでは非防水と断定しない。明示的な `not_resistant` はメーカー一次資料URLがある場合だけ許可する。'
);

const testsPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let tests = fs.readFileSync(testsPath, 'utf8');
const marker = '// Explicit manufacturer-backed non-resistance is localized; model-specific unknown remains unknown.';
if (tests.includes(marker)) throw new Error('water-state regression already present');
tests += `\n${marker}\n{\n  const explicitIds = ['samsung-galaxy-z-fold2-5g', 'samsung-galaxy-z-flip', 'samsung-galaxy-fold-scv44'];\n  for (const id of explicitIds) {\n    const phone = byId.get(id);\n    assert.ok(phone, \`fixture phone missing: \${id}\`);\n    assert.equal(phone.waterRating, null);\n    assert.equal(phone.waterStatus, 'not_resistant');\n    assert.match(phone.sources?.waterUrl || '', /^https:\\/\\/www\\.samsung\\.com\\//);\n    const h = await createHarness([id]);\n    assert.match(h.elements.desktopDetail.innerHTML, /非防水・非防塵/);\n    h.langEn.click();\n    assert.match(h.elements.desktopDetail.innerHTML, /Not water or dust resistant/);\n  }\n\n  const unresolved = byId.get('samsung-galaxy-z-flip-5g');\n  assert.ok(unresolved, 'Galaxy Z Flip 5G fixture missing');\n  assert.notEqual(unresolved.waterStatus, 'not_resistant');\n  assert.equal(unresolved.sources?.waterUrl, undefined);\n  const h = await createHarness(['samsung-galaxy-z-flip-5g']);\n  assert.doesNotMatch(h.elements.desktopDetail.innerHTML, /非防水・非防塵/);\n}\n`;
fs.writeFileSync(testsPath, tests);
