import fs from 'node:fs';
import assert from 'node:assert/strict';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
assert.equal(payload.phones.length, 173, 'wave 8 must start from 173 phones');

const additions = [
  {
    id: 'motorola-razr-40-ultra', manufacturer: 'Motorola', model: 'motorola razr 40 ultra',
    aliases: ['Motorola razr 40 ultra', 'razr40ultra', 'razr 40 ultra', 'モトローラ razr 40 ultra'],
    market: ['JP'], releaseYear: 2023, formFactor: 'foldable',
    dimensionsFolded: { heightMm: 88.42, widthMm: 73.95, depthMm: 15.1 },
    dimensionsUnfolded: { heightMm: 170.83, widthMm: 73.95, depthMm: 6.99 },
    weightG: 188.5, displayInch: 6.9, waterRating: 'IP52',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 3800, valueClass: 'manufacturer', sourceRef: 'https://en-us.support.motorola.com/app/answers/detail/a_id/175749/' },
      wiredRecommendedW: null, wiredMaxW: 30, protocols: ['TurboPower'], pps: 'unknown',
      wirelessStandard: 'Qi', wirelessMaxW: 5
    },
    included: { cable: 'not_included', adapter: 'not_included' },
    sources: {
      specificationsUrl: 'https://en-us.support.motorola.com/app/answers/detail/a_id/175749/',
      manualUrl: 'https://jp-jp.support.motorola.com/',
      releaseUrl: 'https://store.motorola.co.jp/topics_detail.html?info_id=619',
      chargingUrl: 'https://store.motorola.co.jp/topics_detail.html?info_id=619',
      wirelessUrl: 'https://store.motorola.co.jp/topics_detail.html?info_id=619',
      verifiedAt: '2026-09-14'
    }, affiliateKeys: []
  },
  {
    id: 'motorola-razr-40', manufacturer: 'Motorola', model: 'motorola razr 40',
    aliases: ['Motorola razr 40', 'razr40', 'razr 40', 'モトローラ razr 40'],
    market: ['JP'], releaseYear: 2023, formFactor: 'foldable',
    dimensionsFolded: { heightMm: 88.24, widthMm: 73.95, depthMm: 15.8 },
    dimensionsUnfolded: { heightMm: 170.82, widthMm: 73.95, depthMm: 7.35 },
    weightG: 188.6, displayInch: 6.9, waterRating: 'IP52',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4200, valueClass: 'manufacturer', sourceRef: 'https://en-us.support.motorola.com/app/answers/detail/a_id/175748/' },
      wiredRecommendedW: null, wiredMaxW: 30, protocols: ['TurboPower'], pps: 'unknown',
      wirelessStandard: 'Qi', wirelessMaxW: 5
    },
    included: { cable: 'unknown', adapter: 'unknown' },
    sources: {
      specificationsUrl: 'https://en-us.support.motorola.com/app/answers/detail/a_id/175748/',
      manualUrl: 'https://jp-jp.support.motorola.com/',
      releaseUrl: 'https://store.motorola.co.jp/topics_detail.html?info_id=718',
      chargingUrl: 'https://en-us.support.motorola.com/app/answers/detail/a_id/175748/',
      wirelessUrl: 'https://en-us.support.motorola.com/app/answers/detail/a_id/175748/',
      verifiedAt: '2026-09-14'
    }, affiliateKeys: []
  },
  {
    id: 'zte-nubia-flip-3', manufacturer: 'ZTE', model: 'nubia Flip 3',
    aliases: ['nubia Flip3', 'nubia Flip 3', 'ヌビア Flip 3', 'A505ZT'],
    market: ['JP'], releaseYear: 2026, formFactor: 'foldable',
    dimensionsFolded: { heightMm: 87, widthMm: 76, depthMm: 15.9 },
    dimensionsUnfolded: { heightMm: 170, widthMm: 76, depthMm: 7.5 },
    weightG: 188, displayInch: 6.9, waterRating: 'IPX4 / IP5X',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4610, valueClass: 'official', sourceRef: 'https://www.ymobile.jp/biz/lineup/smartphone_a505zt/' },
      wiredRecommendedW: null, wiredMaxW: 33, protocols: ['PPS'], pps: 'required',
      wirelessStandard: null, wirelessMaxW: null
    },
    included: { cable: 'not_included', adapter: 'not_included' },
    sources: {
      specificationsUrl: 'https://www.ymobile.jp/biz/lineup/smartphone_a505zt/',
      manualUrl: 'https://www.ymobile.jp/biz/lineup/smartphone_a505zt/',
      releaseUrl: 'https://www.ymobile.jp/biz/lineup/smartphone_a505zt/',
      chargingUrl: 'https://www.ymobile.jp/biz/lineup/smartphone_a505zt/',
      verifiedAt: '2026-09-14'
    }, affiliateKeys: []
  },
  {
    id: 'zte-nubia-flip-2', manufacturer: 'ZTE', model: 'nubia Flip 2',
    aliases: ['nubia Flip2', 'nubia Flip 2', 'ヌビア Flip 2', 'A404ZT'],
    market: ['JP'], releaseYear: 2025, formFactor: 'foldable',
    dimensionsFolded: { heightMm: 87, widthMm: 76, depthMm: 15.8 },
    dimensionsUnfolded: { heightMm: 170, widthMm: 76, depthMm: 7.5 },
    weightG: 191, displayInch: 6.9, waterRating: 'IPX2 / IP4X',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4300, valueClass: 'official', sourceRef: 'https://www.ymobile.jp/lineup/smartphone/nubiaflip2/' },
      wiredRecommendedW: null, protocols: ['PPS'], pps: 'required',
      wirelessStandard: null, wirelessMaxW: null
    },
    included: { cable: 'not_included', adapter: 'not_included' },
    sources: {
      specificationsUrl: 'https://www.ymobile.jp/lineup/smartphone/nubiaflip2/',
      manualUrl: 'https://www.ymobile.jp/lineup/nubiaflip2/data/nubiaflip2_userguide.pdf',
      releaseUrl: 'https://www.ymobile.jp/lineup/smartphone/nubiaflip2/',
      chargingUrl: 'https://www.ymobile.jp/lineup/smartphone/nubiaflip2/',
      verifiedAt: '2026-09-14'
    }, affiliateKeys: []
  },
  {
    id: 'zte-nubia-flip-5g', manufacturer: 'ZTE', model: 'nubia Flip 5G',
    aliases: ['nubia Flip', 'nubia Flip 5G', 'ヌビア Flip 5G'],
    market: ['JP'], releaseYear: 2024, formFactor: 'foldable',
    dimensionsFolded: { heightMm: 88, widthMm: 76, depthMm: 15.5 },
    dimensionsUnfolded: { heightMm: 170, widthMm: 76, depthMm: 7.3 },
    weightG: 214, displayInch: 6.9, waterRating: 'IPX2 / IP4X',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4310, valueClass: 'manufacturer', sourceRef: 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-flip-5g' },
      wiredRecommendedW: null, wiredMaxW: 33, protocols: ['USB-PD', 'Quick Charge 4+'], pps: 'unknown',
      wirelessStandard: null, wirelessMaxW: null
    },
    included: { cable: 'unknown', adapter: 'unknown' },
    sources: {
      specificationsUrl: 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-flip-5g',
      manualUrl: 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-flip-5g',
      releaseUrl: 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-flip-5g',
      chargingUrl: 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-flip-5g',
      verifiedAt: '2026-09-14'
    }, affiliateKeys: []
  },
  {
    id: 'zte-libero-flip', manufacturer: 'ZTE', model: 'Libero Flip',
    aliases: ['LiberoFlip', 'Libero Flip', 'リベロ Flip', 'A304ZT'],
    market: ['JP'], releaseYear: 2024, formFactor: 'foldable',
    dimensionsFolded: { heightMm: 88, widthMm: 76, depthMm: 15.5 },
    dimensionsUnfolded: { heightMm: 170, widthMm: 76, depthMm: 7.3 },
    weightG: 214, displayInch: 6.9, waterRating: 'IPX2 / IP4X',
    charging: {
      connector: 'USB-C',
      battery: { capacityMah: 4310, valueClass: 'official', sourceRef: 'https://www.ymobile.jp/lineup/libero_flip/' },
      wiredRecommendedW: null, wiredMaxW: 33, protocols: ['USB-PD', 'Quick Charge 4+'], pps: 'unknown',
      wirelessStandard: null, wirelessMaxW: null
    },
    included: { cable: 'not_included', adapter: 'not_included' },
    sources: {
      specificationsUrl: 'https://www.ymobile.jp/lineup/libero_flip/',
      manualUrl: 'https://www.ymobile.jp/app/manual/libero_flip/sp/16-02.html',
      releaseUrl: 'https://www.ymobile.jp/lineup/libero_flip/',
      chargingUrl: 'https://www.ymobile.jp/lineup/libero_flip/',
      verifiedAt: '2026-09-14'
    }, affiliateKeys: []
  }
];

for (const phone of additions) {
  assert.ok(!payload.phones.some((existing) => existing.id === phone.id), `already exists: ${phone.id}`);
  payload.phones.push(phone);
}
assert.equal(payload.phones.length, 179);
fs.writeFileSync(phonesPath, `${JSON.stringify(payload, null, 2)}\n`);

const replacements = [
  ['tools/phone-quickcheck/index.html', 5],
  ['tools/phone-quickcheck/usage.html', 2],
  ['tools/phone-quickcheck/SPEC.md', 3],
  ['docs/tools/phone-quickcheck.md', 3],
  ['scripts/check-phone-quickcheck-data.mjs', 1]
];
for (const [file, expected] of replacements) {
  let text = fs.readFileSync(file, 'utf8');
  const matches = text.match(/\b173\b/g) || [];
  assert.equal(matches.length, expected, `${file}: unexpected 173 occurrence count`);
  text = text.replace(/\b173\b/g, '179');
  fs.writeFileSync(file, text);
}

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = "console.log('Phone QuickCheck behavior tests passed: search/i18n, recharge estimates, Apple unknown capacity, Lightning guidance, proprietary charging, and mobile sheet.');";
assert.ok(behavior.includes(marker), 'behavior marker missing');
assert.ok(!behavior.includes("motorola-razr-40-ultra']),"), 'wave 8 behavior already applied');
const regression = `// Legacy Japan-market Motorola foldables preserve official dimensions and proprietary TurboPower charging.\n{\n  const h = await createHarness(['motorola-razr-40-ultra']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('88.42 × 73.95 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /88\\.42 × 73\\.95 × 15\\.1 mm/);\n  assert.match(html, /170\\.83 × 73\\.95 × 6\\.99 mm/);\n  assert.match(html, /3800 mAh/);\n  assert.match(html, /30W/);\n  assert.match(html, /TurboPower/);\n  assert.match(html, /Qi \\/ 5W/);\n}\n\n// Current Y!mobile nubia Flip generation keeps carrier-published PPS and 33W device-side charging facts.\n{\n  const h = await createHarness(['zte-nubia-flip-3']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('87 × 76 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /87 × 76 × 15\\.9 mm/);\n  assert.match(html, /170 × 76 × 7\\.5 mm/);\n  assert.match(html, /4610 mAh/);\n  assert.match(html, /33W/);\n  assert.match(html, /PPS/);\n}\n\n`;
behavior = behavior.replace(marker, regression + marker);
fs.writeFileSync(behaviorPath, behavior);

console.log('Applied Phone QuickCheck foldable wave 8: 173 -> 179 phones.');
