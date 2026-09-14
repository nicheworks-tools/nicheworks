import fs from 'node:fs';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
if (!Array.isArray(payload.phones)) throw new Error('phones array missing');
if (payload.phones.length !== 168) throw new Error(`expected 168 phones before wave 7, got ${payload.phones.length}`);

const newIds = [
  'motorola-razr-fold',
  'motorola-razr-60-ultra',
  'motorola-razr-60',
  'motorola-razr-50-ultra',
  'motorola-razr-50'
];
for (const id of newIds) {
  if (payload.phones.some((phone) => phone.id === id)) throw new Error(`${id} already exists`);
}

const foldStore = 'https://store.motorola.co.jp/item/RAZRFOLD.html';
const foldManual = 'https://jp-jp.support.motorola.com/app/answers/detail/a_id/192470/~/ガイドとビデオ---motorola-razr-fold';
const foldRelease = 'https://store.motorola.co.jp/topics_list.html';
const ultra60Store = 'https://store.motorola.co.jp/category/RAZR/RAZR60ULTRA.html';
const ultra60Manual = 'https://jp-jp.support.motorola.com/app/answers/detail/a_id/189480/~/ユーザーガイド(html)---motorola-razr-60-ultra';
const ultra60Release = 'https://store.motorola.co.jp/topics_detail.html?info_id=1115';
const razr60Store = 'https://store.motorola.co.jp/item/RAZR60.html';
const razr60Manual = 'https://jp-jp.support.motorola.com/app/answers/detail/a_id/186111/~/ユーザーガイド(html)---motorola-razr-60';
const ultra50Spec = 'https://jp-jp.support.motorola.com/app/answers/detail/a_id/192370/~/仕様---motorola-razr-50-ultra';
const ultra50Manual = 'https://jp-jp.support.motorola.com/app/answers/detail/a_id/180995/~/ユーザーガイド(html)---motorola-razr-50-ultra';
const ultra50Release = 'https://store.motorola.co.jp/topics_list.html?SEARCH_MAX_ROW_LIST=100&request=max_row';
const razr50Store = 'https://store.motorola.co.jp/item/RAZR50.html';
const razr50Manual = 'https://jp-jp.support.motorola.com/app/answers/detail/a_id/181020/~/ユーザーガイド(html)---motorola-razr-50';
const razr50Release = 'https://store.motorola.co.jp/topics_detail.html?info_id=949';

const phones = [
  {
    id: 'motorola-razr-fold',
    manufacturer: 'Motorola',
    model: 'motorola razr fold',
    aliases: ['Motorola razr fold', 'razr fold', 'motorola razr Fold', 'モトローラ razr fold', 'モトローラ razr フォールド'],
    market: ['JP'],
    releaseYear: 2026,
    formFactor: 'foldable',
    dimensionsFolded: { heightMm: 160.05, widthMm: 73.6, depthMm: 9.89 },
    dimensionsUnfolded: { heightMm: 160.05, widthMm: 144.47, depthMm: 4.55 },
    weightG: 243,
    displayInch: 8.1,
    waterRating: 'IP48 / IP49',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 6000, valueClass: 'manufacturer', sourceRef: foldStore },
      wiredRecommendedW: null,
      wiredMaxW: 80,
      protocols: ['TurboPower'],
      pps: 'unknown',
      wirelessStandard: 'Qi',
      wirelessMaxW: 15
    },
    included: { cable: 'not_included', adapter: 'not_included' },
    sources: {
      specificationsUrl: foldStore,
      manualUrl: foldManual,
      releaseUrl: foldRelease,
      chargingUrl: foldStore,
      wirelessUrl: foldStore,
      verifiedAt: '2026-09-14'
    },
    affiliateKeys: []
  },
  {
    id: 'motorola-razr-60-ultra',
    manufacturer: 'Motorola',
    model: 'motorola razr 60 ultra',
    aliases: ['Motorola razr 60 ultra', 'razr60ultra', 'razr 60 ultra', 'モトローラ razr 60 ultra', 'モトローラ razr 60 ウルトラ'],
    market: ['JP'],
    releaseYear: 2025,
    formFactor: 'foldable',
    dimensionsFolded: { heightMm: 88.12, widthMm: 73.99, depthMm: 15.69 },
    dimensionsUnfolded: { heightMm: 171.48, widthMm: 73.99, depthMm: 7.19 },
    weightG: 199,
    displayInch: 7.0,
    waterRating: 'IP48',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4700, valueClass: 'manufacturer', sourceRef: ultra60Store },
      wiredRecommendedW: null,
      wiredMaxW: 68,
      protocols: ['TurboPower'],
      pps: 'unknown',
      wirelessStandard: 'Qi',
      wirelessMaxW: 30
    },
    included: { cable: 'unknown', adapter: 'unknown' },
    sources: {
      specificationsUrl: ultra60Store,
      manualUrl: ultra60Manual,
      releaseUrl: ultra60Release,
      chargingUrl: ultra60Store,
      wirelessUrl: ultra60Store,
      verifiedAt: '2026-09-14'
    },
    affiliateKeys: []
  },
  {
    id: 'motorola-razr-60',
    manufacturer: 'Motorola',
    model: 'motorola razr 60',
    aliases: ['Motorola razr 60', 'razr60', 'razr 60', 'モトローラ razr 60'],
    market: ['JP'],
    releaseYear: 2025,
    formFactor: 'foldable',
    dimensionsFolded: { heightMm: 88.08, widthMm: 73.99, depthMm: 15.85 },
    dimensionsUnfolded: { heightMm: 171.3, widthMm: 73.99, depthMm: 7.25 },
    weightG: 188,
    displayInch: 6.9,
    waterRating: 'IP48',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4500, valueClass: 'manufacturer', sourceRef: razr60Store },
      wiredRecommendedW: null,
      wiredMaxW: 30,
      protocols: ['TurboPower'],
      pps: 'unknown',
      wirelessStandard: 'Qi',
      wirelessMaxW: 15
    },
    included: { cable: 'not_included', adapter: 'not_included' },
    sources: {
      specificationsUrl: razr60Store,
      manualUrl: razr60Manual,
      chargingUrl: razr60Store,
      wirelessUrl: razr60Store,
      verifiedAt: '2026-09-14'
    },
    affiliateKeys: []
  },
  {
    id: 'motorola-razr-50-ultra',
    manufacturer: 'Motorola',
    model: 'motorola razr 50 ultra',
    aliases: ['Motorola razr 50 ultra', 'razr50ultra', 'razr 50 ultra', 'モトローラ razr 50 ultra', 'モトローラ razr 50 ウルトラ'],
    market: ['JP'],
    releaseYear: 2024,
    formFactor: 'foldable',
    dimensionsFolded: { heightMm: 88.09, widthMm: 73.99, depthMm: 15.32 },
    dimensionsUnfolded: { heightMm: 171.42, widthMm: 73.99, depthMm: 7.09 },
    weightG: 189,
    displayInch: 6.9,
    waterRating: 'IPX8',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4000, valueClass: 'manufacturer', sourceRef: ultra50Spec },
      wiredRecommendedW: null,
      wiredMaxW: 45,
      protocols: ['TurboPower'],
      pps: 'unknown',
      wirelessStandard: 'Qi',
      wirelessMaxW: 15
    },
    included: { cable: 'unknown', adapter: 'included' },
    sources: {
      specificationsUrl: ultra50Spec,
      manualUrl: ultra50Manual,
      releaseUrl: ultra50Release,
      chargingUrl: ultra50Spec,
      wirelessUrl: ultra50Spec,
      verifiedAt: '2026-09-14'
    },
    affiliateKeys: []
  },
  {
    id: 'motorola-razr-50',
    manufacturer: 'Motorola',
    model: 'motorola razr 50',
    aliases: ['Motorola razr 50', 'razr50', 'razr 50', 'モトローラ razr 50'],
    market: ['JP'],
    releaseYear: 2024,
    formFactor: 'foldable',
    dimensionsFolded: { heightMm: 88.08, widthMm: 73.99, depthMm: 15.85 },
    dimensionsUnfolded: { heightMm: 171.3, widthMm: 73.99, depthMm: 7.25 },
    weightG: 188,
    displayInch: 6.9,
    waterRating: 'IPX8',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4200, valueClass: 'manufacturer', sourceRef: razr50Store },
      wiredRecommendedW: null,
      wiredMaxW: 30,
      protocols: ['TurboPower'],
      pps: 'unknown',
      wirelessStandard: 'Qi',
      wirelessMaxW: 15
    },
    included: { cable: 'not_included', adapter: 'not_included' },
    sources: {
      specificationsUrl: razr50Store,
      manualUrl: razr50Manual,
      releaseUrl: razr50Release,
      chargingUrl: razr50Store,
      wirelessUrl: razr50Store,
      verifiedAt: '2026-09-14'
    },
    affiliateKeys: []
  }
];

const motorolaIndex = payload.phones.findIndex((phone) => phone.manufacturer === 'Motorola');
if (motorolaIndex < 0) throw new Error('Motorola insertion anchor missing');
payload.phones.splice(motorolaIndex, 0, ...phones);
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

replaceAllExact('tools/phone-quickcheck/index.html', '168', '173', 5);
replaceAllExact('tools/phone-quickcheck/usage.html', '168', '173', 2);
replaceExact('tools/phone-quickcheck/SPEC.md', 'Current dataset: `168 verified models`', 'Current dataset: `173 verified models`');
replaceExact('tools/phone-quickcheck/SPEC.md', 'The maintained public dataset contains 168 verified models across', 'The maintained public dataset contains 173 verified models across');
replaceExact('tools/phone-quickcheck/SPEC.md', '- [x] The maintained public dataset contains 168 maintained models.', '- [x] The maintained public dataset contains 173 maintained models.');
replaceExact('docs/tools/phone-quickcheck.md', 'The maintained public dataset contains 168 smartphone records across', 'The maintained public dataset contains 173 smartphone records across');
replaceExact('docs/tools/phone-quickcheck.md', '- 168機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。', '- 173機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。');
replaceExact('docs/tools/phone-quickcheck.md', '- [x] 168 maintained models load from the static phone dataset.', '- [x] 173 maintained models load from the static phone dataset.');
replaceExact('scripts/check-phone-quickcheck-data.mjs', 'if (phones.length < 168) fail(`expected at least 168 phones, got ${phones.length}`);', 'if (phones.length < 173) fail(`expected at least 173 phones, got ${phones.length}`);');

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = '// First-generation Galaxy Fold SCV44 keeps JP-market hardware facts and Adaptive Fast Charging distinct from SFC.\n';
if (!behavior.includes(marker)) throw new Error('Galaxy Fold behavior marker missing');
const regression = `// Motorola razr fold uses JP-market store charging facts and keeps TurboPower proprietary.\n{\n  const h = await createHarness(['motorola-razr-fold']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('160.05 × 73.6 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /160\\.05 × 73\\.6 × 9\\.89 mm/);\n  assert.match(html, /160\\.05 × 144\\.47 × 4\\.55 mm/);\n  assert.match(html, /243 g/);\n  assert.match(html, /6000 mAh/);\n  assert.match(html, /端末側の有線充電上限<\\/span><b>80W/);\n  assert.match(html, /TurboPower/);\n  assert.match(html, /Qi \\/ 15W/);\n  assert.match(html, /Motorola TurboPower対応充電器/);\n  assert.doesNotMatch(html, /充電器目安<\\/span><b>80W\\+/);\n}\n\n// Motorola razr 60 ultra preserves its 68W TurboPower and 30W Qi class.\n{\n  const h = await createHarness(['motorola-razr-60-ultra']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('88.12 × 73.99 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /88\\.12 × 73\\.99 × 15\\.69 mm/);\n  assert.match(html, /171\\.48 × 73\\.99 × 7\\.19 mm/);\n  assert.match(html, /199 g/);\n  assert.match(html, /4700 mAh/);\n  assert.match(html, /端末側の有線充電上限<\\/span><b>68W/);\n  assert.match(html, /TurboPower/);\n  assert.match(html, /Qi \\/ 30W/);\n  assert.match(html, /Motorola TurboPower対応充電器/);\n}\n\n`;
behavior = behavior.replace(marker, regression + marker);
fs.writeFileSync(behaviorPath, behavior);

console.log(`Applied Motorola foldable wave 7: ${payload.phones.length} phones.`);
