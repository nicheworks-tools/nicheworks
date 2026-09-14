import fs from 'node:fs';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
if (!Array.isArray(payload.phones)) throw new Error('phones array missing');
if (payload.phones.length !== 162) throw new Error(`expected 162 phones before wave 4B, got ${payload.phones.length}`);

const ids = new Set(payload.phones.map((phone) => phone.id));
for (const id of ['samsung-galaxy-z-fold3-5g', 'samsung-galaxy-z-flip3-5g']) {
  if (ids.has(id)) throw new Error(`${id} already exists`);
}

const launchSource = 'https://news.samsung.com/global/the-next-chapter-in-mobile-innovation-unfold-your-world-with-galaxy-z-fold3-5g-and-galaxy-z-flip3-5g';
const chargingSupport = 'https://www.samsung.com/jp/support/mobile-devices/my-device-displays-a-water-drop-icon-and-will-not-charge/';

const fold3 = {
  id: 'samsung-galaxy-z-fold3-5g',
  manufacturer: 'Samsung',
  model: 'Galaxy Z Fold3 5G',
  aliases: ['Samsung Galaxy Z Fold3 5G', 'GalaxyZFold3', 'Galaxy Z Fold3', 'Galaxy Fold3', 'ギャラクシーZ Fold3 5G', 'ギャラクシーZフォールド3'],
  market: ['JP'],
  releaseYear: 2021,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 158.2, widthMm: 67.1, depthMmMin: 14.4, depthMmMax: 16.0 },
  dimensionsUnfolded: { heightMm: 158.2, widthMm: 128.1, depthMm: 6.4 },
  weightG: 271,
  displayInch: 7.6,
  waterRating: 'IPX8',
  charging: {
    connector: 'USB-C',
    battery: { capacityMah: 4400, valueClass: 'official', sourceRef: launchSource },
    wiredRecommendedW: 25,
    wiredMaxW: 25,
    protocols: ['Super Fast Charging'],
    pps: 'unknown',
    wirelessStandard: 'Qi',
    wirelessMaxW: 10
  },
  included: { cable: 'unknown', adapter: 'unknown' },
  sources: {
    specificationsUrl: 'https://www.samsung.com/jp/smartphones/galaxy-z-fold3-5g/specs/',
    manualUrl: 'https://www.samsung.com/jp/support/model/SM-F926JZKAKDI/',
    releaseUrl: launchSource,
    chargingUrl: chargingSupport,
    wirelessUrl: launchSource,
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};

const flip3 = {
  id: 'samsung-galaxy-z-flip3-5g',
  manufacturer: 'Samsung',
  model: 'Galaxy Z Flip3 5G',
  aliases: ['Samsung Galaxy Z Flip3 5G', 'GalaxyZFlip3', 'Galaxy Z Flip3', 'Galaxy Flip3', 'ギャラクシーZ Flip3 5G', 'ギャラクシーZフリップ3'],
  market: ['JP'],
  releaseYear: 2021,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 86.4, widthMm: 72.2, depthMmMin: 15.9, depthMmMax: 17.1 },
  dimensionsUnfolded: { heightMm: 166.0, widthMm: 72.2, depthMm: 6.9 },
  weightG: 183,
  displayInch: 6.7,
  waterRating: 'IPX8',
  charging: {
    connector: 'USB-C',
    battery: { capacityMah: 3300, valueClass: 'official', sourceRef: launchSource },
    wiredRecommendedW: 15,
    wiredMaxW: 15,
    protocols: [],
    pps: 'unknown',
    wirelessStandard: 'Qi',
    wirelessMaxW: 10
  },
  included: { cable: 'unknown', adapter: 'unknown' },
  sources: {
    specificationsUrl: 'https://www.samsung.com/jp/smartphones/galaxy-z-flip3-5g/specs/',
    manualUrl: 'https://www.samsung.com/jp/support/model/SM-F711JZEEKDI/',
    releaseUrl: launchSource,
    chargingUrl: chargingSupport,
    wirelessUrl: launchSource,
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};

const flip4Index = payload.phones.findIndex((phone) => phone.id === 'samsung-galaxy-z-flip4');
if (flip4Index < 0) throw new Error('Galaxy Z Flip4 insertion anchor missing');
payload.phones.splice(flip4Index + 1, 0, fold3, flip3);
fs.writeFileSync(phonesPath, JSON.stringify(payload, null, 2) + '\n');

function replaceExact(path, from, to) {
  const text = fs.readFileSync(path, 'utf8');
  if (!text.includes(from)) throw new Error(`${path}: expected text not found: ${from}`);
  fs.writeFileSync(path, text.replace(from, to));
}
function replaceAllExact(path, from, to, expectedCount) {
  const text = fs.readFileSync(path, 'utf8');
  const count = text.split(from).length - 1;
  if (count !== expectedCount) throw new Error(`${path}: expected ${expectedCount} occurrences of ${from}, got ${count}`);
  fs.writeFileSync(path, text.split(from).join(to));
}

replaceAllExact('tools/phone-quickcheck/index.html', '162', '164', 5);
replaceAllExact('tools/phone-quickcheck/usage.html', '162', '164', 2);
replaceExact('tools/phone-quickcheck/SPEC.md', 'Current dataset: `162 verified models`', 'Current dataset: `164 verified models`');
replaceExact('tools/phone-quickcheck/SPEC.md', 'The maintained public dataset contains 162 verified models across', 'The maintained public dataset contains 164 verified models across');
replaceExact('tools/phone-quickcheck/SPEC.md', '- [x] The maintained public dataset contains 162 maintained models.', '- [x] The maintained public dataset contains 164 maintained models.');
replaceExact('docs/tools/phone-quickcheck.md', 'The maintained public dataset contains 162 smartphone records across', 'The maintained public dataset contains 164 smartphone records across');
replaceExact('docs/tools/phone-quickcheck.md', '- 162機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。', '- 164機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。');
replaceExact('docs/tools/phone-quickcheck.md', '- [x] 162 maintained models load from the static phone dataset.', '- [x] 164 maintained models load from the static phone dataset.');
replaceExact('scripts/check-phone-quickcheck-data.mjs', 'if (phones.length < 162) fail(`expected at least 162 phones, got ${phones.length}`);', 'if (phones.length < 164) fail(`expected at least 164 phones, got ${phones.length}`);');

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
const behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = '// Galaxy Z Fold4 proves production data preserves an official folded-thickness range.\n';
if (!behavior.includes(marker)) throw new Error('Fold4 behavior marker missing');
const test = `// Galaxy Z Fold3 5G preserves the older hinge-depth range and model-specific 10W wireless maximum.\n{\n  const h = await createHarness(['samsung-galaxy-z-fold3-5g']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('158.2 × 67.1 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /158\\.2 × 67\\.1 × 14\\.4–16 mm/);\n  assert.match(html, /158\\.2 × 128\\.1 × 6\\.4 mm/);\n  assert.match(html, /271 g/);\n  assert.match(html, /4400 mAh/);\n  assert.match(html, /充電器目安<\\/span><b>25W\\+/);\n  assert.match(html, /端末側の有線充電上限<\\/span><b>25W/);\n  assert.match(html, /Super Fast Charging/);\n  assert.match(html, /Qi \\/ 10W/);\n}\n\n`;
fs.writeFileSync(behaviorPath, behavior.replace(marker, test + marker));

console.log(`Applied foldable wave 4B: ${payload.phones.length} phones.`);
