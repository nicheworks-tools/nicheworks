import fs from 'node:fs';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
if (!Array.isArray(payload.phones)) throw new Error('phones array missing');
if (payload.phones.length !== 160) throw new Error(`expected 160 phones before wave 4A, got ${payload.phones.length}`);

const ids = new Set(payload.phones.map((phone) => phone.id));
for (const id of ['samsung-galaxy-z-fold4', 'samsung-galaxy-z-flip4']) {
  if (ids.has(id)) throw new Error(`${id} already exists`);
}

const chargingSupport = 'https://www.samsung.com/jp/support/mobile-devices/my-device-displays-a-water-drop-icon-and-will-not-charge/';
const wirelessSupport = 'https://www.samsung.com/jp/support/mobile-devices/issues-with-wireless-charging/';
const waterSupport = 'https://www.samsung.com/jp/support/mobile-devices/galaxy-phone-water-resistance/';

const fold4 = {
  id: 'samsung-galaxy-z-fold4',
  manufacturer: 'Samsung',
  model: 'Galaxy Z Fold4',
  aliases: ['Samsung Galaxy Z Fold4', 'GalaxyZFold4', 'Galaxy Fold4', 'ギャラクシーZ Fold4', 'ギャラクシーZフォールド4'],
  market: ['JP'],
  releaseYear: 2022,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 155.1, widthMm: 67.1, depthMmMin: 14.2, depthMmMax: 15.8 },
  dimensionsUnfolded: { heightMm: 155.1, widthMm: 130.1, depthMm: 6.3 },
  weightG: 263,
  displayInch: 7.6,
  waterRating: 'IPX8',
  charging: {
    connector: 'USB-C',
    battery: {
      capacityMah: 4400,
      valueClass: 'official',
      sourceRef: 'https://www.samsung.com/jp/smartphones/galaxy-z/galaxy-z-fold4-graygreen-256gb-sm-f936jzaakdi/'
    },
    wiredRecommendedW: 25,
    wiredMaxW: 25,
    protocols: ['Super Fast Charging'],
    pps: 'unknown',
    wirelessStandard: 'Qi',
    wirelessMaxW: 15
  },
  included: { cable: 'unknown', adapter: 'unknown' },
  sources: {
    specificationsUrl: 'https://www.samsung.com/jp/smartphones/galaxy-z/galaxy-z-fold4-graygreen-256gb-sm-f936jzaakdi/',
    manualUrl: 'https://www.samsung.com/jp/support/model/SM-F936JZAAKDI/',
    releaseUrl: 'https://news.samsung.com/global/galaxy-fold4-flip4',
    chargingUrl: chargingSupport,
    wirelessUrl: wirelessSupport,
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};

const flip4 = {
  id: 'samsung-galaxy-z-flip4',
  manufacturer: 'Samsung',
  model: 'Galaxy Z Flip4',
  aliases: ['Samsung Galaxy Z Flip4', 'GalaxyZFlip4', 'Galaxy Flip4', 'ギャラクシーZ Flip4', 'ギャラクシーZフリップ4'],
  market: ['JP'],
  releaseYear: 2022,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 84.9, widthMm: 71.9, depthMmMin: 15.9, depthMmMax: 17.1 },
  dimensionsUnfolded: { heightMm: 165.2, widthMm: 71.9, depthMm: 6.9 },
  weightG: 187,
  displayInch: 6.7,
  waterRating: 'IPX8',
  charging: {
    connector: 'USB-C',
    battery: {
      capacityMah: 3700,
      valueClass: 'official',
      sourceRef: 'https://www.samsung.com/au/business/smartphones/galaxy-z/galaxy-z-flip4-sm-f721bzafats/'
    },
    wiredRecommendedW: 25,
    wiredMaxW: 25,
    protocols: ['Super Fast Charging'],
    pps: 'unknown',
    wirelessStandard: 'Qi',
    wirelessMaxW: 15
  },
  included: { cable: 'unknown', adapter: 'unknown' },
  sources: {
    specificationsUrl: 'https://www.samsung.com/au/business/smartphones/galaxy-z/galaxy-z-flip4-sm-f721bzafats/',
    manualUrl: 'https://www.samsung.com/jp/support/model/SM-F721JZAAKDI/',
    releaseUrl: 'https://news.samsung.com/global/galaxy-fold4-flip4',
    chargingUrl: chargingSupport,
    wirelessUrl: wirelessSupport,
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};

// IPX8 is separately confirmed by the current Samsung Japan water-resistance support matrix.
if (!waterSupport.includes('samsung.com/jp/')) throw new Error('water support contract broken');

const flip5Index = payload.phones.findIndex((phone) => phone.id === 'samsung-galaxy-z-flip5');
if (flip5Index < 0) throw new Error('Galaxy Z Flip5 insertion anchor missing');
payload.phones.splice(flip5Index + 1, 0, fold4, flip4);
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

replaceAllExact('tools/phone-quickcheck/index.html', '160', '162', 5);
replaceAllExact('tools/phone-quickcheck/usage.html', '160', '162', 2);

replaceExact('tools/phone-quickcheck/SPEC.md', 'Current dataset: `160 verified models`', 'Current dataset: `162 verified models`');
replaceExact('tools/phone-quickcheck/SPEC.md', 'The maintained public dataset contains 160 verified models across', 'The maintained public dataset contains 162 verified models across');
replaceExact('tools/phone-quickcheck/SPEC.md', '- [x] The maintained public dataset contains 160 maintained models.', '- [x] The maintained public dataset contains 162 maintained models.');

replaceExact('docs/tools/phone-quickcheck.md', 'The maintained public dataset contains 160 smartphone records across', 'The maintained public dataset contains 162 smartphone records across');
replaceExact('docs/tools/phone-quickcheck.md', '- 160機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。', '- 162機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。');
replaceExact('docs/tools/phone-quickcheck.md', '- [x] 160 maintained models load from the static phone dataset.', '- [x] 162 maintained models load from the static phone dataset.');

replaceExact('scripts/check-phone-quickcheck-data.mjs', 'if (phones.length < 160) fail(`expected at least 160 phones, got ${phones.length}`);', 'if (phones.length < 162) fail(`expected at least 162 phones, got ${phones.length}`);');

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
const behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = '// Foldable depth ranges render without collapsing an official variable-thickness specification.\n';
if (!behavior.includes(marker)) throw new Error('depth-range behavior marker missing');
const realRangeTest = `// Galaxy Z Fold4 proves production data preserves an official folded-thickness range.\n{\n  const h = await createHarness(['samsung-galaxy-z-fold4']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('155.1 × 67.1 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /155\\.1 × 67\\.1 × 14\\.2–15\\.8 mm/);\n  assert.match(html, /155\\.1 × 130\\.1 × 6\\.3 mm/);\n  assert.match(html, /263 g/);\n  assert.match(html, /4400 mAh/);\n  assert.match(html, /充電器目安<\\/span><b>25W\\+/);\n  assert.match(html, /端末側の有線充電上限<\\/span><b>25W/);\n  assert.match(html, /Super Fast Charging/);\n  assert.match(html, /Qi \\/ 15W/);\n}\n\n`;
fs.writeFileSync(behaviorPath, behavior.replace(marker, realRangeTest + marker));

console.log(`Applied foldable wave 4A: ${payload.phones.length} phones.`);
