import fs from 'node:fs';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
if (!Array.isArray(payload.phones)) throw new Error('phones array missing');
if (payload.phones.length !== 164) throw new Error(`expected 164 phones before wave 5, got ${payload.phones.length}`);

const ids = new Set(payload.phones.map((phone) => phone.id));
for (const id of ['samsung-galaxy-z-fold2-5g', 'samsung-galaxy-z-flip-5g', 'samsung-galaxy-z-flip']) {
  if (ids.has(id)) throw new Error(`${id} already exists`);
}

const fold2Launch = 'https://news.samsung.com/global/introducing-the-galaxy-z-fold2-change-the-shape-of-the-future';
const fold2Power = 'https://www.samsung.com/au/smartphones/galaxy-z-fold2/design/';
const flip5gLaunch = 'https://news.samsung.com/global/introducing-galaxy-z-flip-5g-express-yourself-with-a-stylish-5g-enabled-foldable-smartphone';
const flipDatasheet = 'https://image-us.samsung.com/SamsungUS/samsungbusiness/pdfs/datasheet/Galaxy-Z-Flip_Z-Flip-5G-Datasheet-Generic.pdf';
const jpWireless = 'https://www.samsung.com/jp/support/mobile-devices/issues-with-wireless-charging/';

const fold2 = {
  id: 'samsung-galaxy-z-fold2-5g',
  manufacturer: 'Samsung',
  model: 'Galaxy Z Fold2 5G',
  aliases: ['Samsung Galaxy Z Fold2 5G', 'GalaxyZFold2', 'Galaxy Z Fold2', 'Galaxy Fold2', 'ギャラクシーZ Fold2 5G', 'ギャラクシーZフォールド2'],
  market: ['JP'],
  releaseYear: 2020,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 159.2, widthMm: 68.0, depthMmMin: 13.8, depthMmMax: 16.8 },
  dimensionsUnfolded: { heightMm: 159.2, widthMm: 128.2, depthMmMin: 6.0, depthMmMax: 6.9 },
  weightG: 282,
  displayInch: 7.6,
  charging: {
    connector: 'USB-C',
    battery: { capacityMah: 4500, valueClass: 'official', sourceRef: fold2Launch },
    wiredRecommendedW: 25,
    protocols: ['Super Fast Charging'],
    pps: 'unknown',
    wirelessStandard: 'Qi'
  },
  included: { cable: 'unknown', adapter: 'unknown' },
  sources: {
    specificationsUrl: fold2Launch,
    manualUrl: 'https://www.samsung.com/jp/support/model/SM-F916JZNAKDI/',
    releaseUrl: fold2Launch,
    chargingUrl: fold2Power,
    wirelessUrl: jpWireless,
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};

const flip5g = {
  id: 'samsung-galaxy-z-flip-5g',
  manufacturer: 'Samsung',
  model: 'Galaxy Z Flip 5G',
  aliases: ['Samsung Galaxy Z Flip 5G', 'GalaxyZFlip5G', 'Galaxy Z Flip 5G SCG04', 'ギャラクシーZ Flip 5G', 'ギャラクシーZフリップ5G'],
  market: ['JP'],
  releaseYear: 2020,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 87.4, widthMm: 73.6, depthMmMin: 15.4, depthMmMax: 17.4 },
  dimensionsUnfolded: { heightMm: 167.3, widthMm: 73.6, depthMmMin: 6.9, depthMmMax: 7.2 },
  weightG: 183,
  displayInch: 6.7,
  charging: {
    connector: 'USB-C',
    battery: { capacityMah: 3300, valueClass: 'official', sourceRef: flip5gLaunch },
    wiredRecommendedW: 15,
    wiredMaxW: 15,
    protocols: [],
    pps: 'unknown',
    wirelessStandard: 'Qi'
  },
  included: { cable: 'unknown', adapter: 'unknown' },
  sources: {
    specificationsUrl: flip5gLaunch,
    manualUrl: 'https://www.samsung.com/jp/support/model/SM-F707JZNAKDI/',
    releaseUrl: flip5gLaunch,
    chargingUrl: flipDatasheet,
    wirelessUrl: jpWireless,
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};

const flip = {
  id: 'samsung-galaxy-z-flip',
  manufacturer: 'Samsung',
  model: 'Galaxy Z Flip',
  aliases: ['Samsung Galaxy Z Flip', 'GalaxyZFlip', 'Galaxy Z Flip SCV47', 'ギャラクシーZ Flip', 'ギャラクシーZフリップ'],
  market: ['JP'],
  releaseYear: 2020,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 87.4, widthMm: 73.6, depthMmMin: 15.4, depthMmMax: 17.3 },
  dimensionsUnfolded: { heightMm: 167.3, widthMm: 73.6, depthMmMin: 6.9, depthMmMax: 7.2 },
  weightG: 183,
  displayInch: 6.7,
  charging: {
    connector: 'USB-C',
    battery: { capacityMah: 3300, valueClass: 'official', sourceRef: flipDatasheet },
    wiredRecommendedW: 15,
    wiredMaxW: 15,
    protocols: [],
    pps: 'unknown',
    wirelessStandard: 'Qi'
  },
  included: { cable: 'unknown', adapter: 'unknown' },
  sources: {
    specificationsUrl: flipDatasheet,
    manualUrl: 'https://www.samsung.com/jp/support/model/SM-F700JZKAKDI/',
    chargingUrl: flipDatasheet,
    wirelessUrl: jpWireless,
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};

const flip3Index = payload.phones.findIndex((phone) => phone.id === 'samsung-galaxy-z-flip3-5g');
if (flip3Index < 0) throw new Error('Galaxy Z Flip3 insertion anchor missing');
payload.phones.splice(flip3Index + 1, 0, fold2, flip5g, flip);
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

replaceAllExact('tools/phone-quickcheck/index.html', '164', '167', 5);
replaceAllExact('tools/phone-quickcheck/usage.html', '164', '167', 2);
replaceExact('tools/phone-quickcheck/SPEC.md', 'Current dataset: `164 verified models`', 'Current dataset: `167 verified models`');
replaceExact('tools/phone-quickcheck/SPEC.md', 'The maintained public dataset contains 164 verified models across', 'The maintained public dataset contains 167 verified models across');
replaceExact('tools/phone-quickcheck/SPEC.md', '- [x] The maintained public dataset contains 164 maintained models.', '- [x] The maintained public dataset contains 167 maintained models.');
replaceExact('docs/tools/phone-quickcheck.md', 'The maintained public dataset contains 164 smartphone records across', 'The maintained public dataset contains 167 smartphone records across');
replaceExact('docs/tools/phone-quickcheck.md', '- 164機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。', '- 167機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。');
replaceExact('docs/tools/phone-quickcheck.md', '- [x] 164 maintained models load from the static phone dataset.', '- [x] 167 maintained models load from the static phone dataset.');
replaceExact('scripts/check-phone-quickcheck-data.mjs', 'if (phones.length < 164) fail(`expected at least 164 phones, got ${phones.length}`);', 'if (phones.length < 167) fail(`expected at least 167 phones, got ${phones.length}`);');

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
const behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = '// Galaxy Z Fold3 5G preserves the older hinge-depth range and model-specific 10W wireless maximum.\n';
if (!behavior.includes(marker)) throw new Error('Fold3 behavior marker missing');
const test = `// Galaxy Z Fold2 5G proves production data can preserve depth ranges in both folded and unfolded states.\n{\n  const h = await createHarness(['samsung-galaxy-z-fold2-5g']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('159.2 × 68 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /159\\.2 × 68 × 13\\.8–16\\.8 mm/);\n  assert.match(html, /159\\.2 × 128\\.2 × 6–6\\.9 mm/);\n  assert.match(html, /282 g/);\n  assert.match(html, /4500 mAh/);\n  assert.match(html, /充電器目安<\\/span><b>25W\\+/);\n  assert.match(html, /Super Fast Charging/);\n  assert.doesNotMatch(html, /端末側の有線充電上限<\\/span><b>25W/);\n}\n\n`;
fs.writeFileSync(behaviorPath, behavior.replace(marker, test + marker));

console.log(`Applied foldable wave 5: ${payload.phones.length} phones.`);
