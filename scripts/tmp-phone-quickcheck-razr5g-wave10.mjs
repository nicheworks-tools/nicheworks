import fs from 'node:fs';
import assert from 'node:assert/strict';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
assert.equal(payload.phones.length, 180, 'wave 10 must start from 180 phones');

const phone = {
  id: 'motorola-razr-5g',
  manufacturer: 'Motorola',
  model: 'motorola razr 5G',
  aliases: ['Motorola razr 5G', 'razr 5G', 'razr5G', 'レーザー 5G', 'PAJR0005JP'],
  market: ['JP'],
  releaseYear: 2021,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 91.7, widthMm: 72.6, depthMm: 16 },
  dimensionsUnfolded: { heightMm: 169.2, widthMm: 72.6, depthMm: 7.9 },
  weightG: 192,
  displayInch: 6.2,
  waterRating: 'Water-repellent',
  charging: {
    connector: 'USB-C',
    battery: {
      capacityMah: 2800,
      valueClass: 'manufacturer',
      sourceRef: 'https://www.motorola.com/ru/smartphones-razr-5g/p?skuId=279'
    },
    wiredRecommendedW: 15,
    wiredMaxW: 15,
    protocols: ['TurboPower'],
    pps: 'unknown',
    wirelessStandard: null,
    wirelessMaxW: null
  },
  included: { cable: 'unknown', adapter: 'unknown' },
  sources: {
    specificationsUrl: 'https://www.motorola.com/ru/smartphones-razr-5g/p?skuId=279',
    manualUrl: 'https://jp-jp.support.motorola.com/app/answers/detail/a_id/158713/~/motorola-razr-5g%C2%A0-%C2%A0-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%82%AC%E3%82%A4%E3%83%89%28html%29',
    releaseUrl: 'https://store.motorola.co.jp/topics_detail.html?info_id=95',
    chargingUrl: 'https://www.motorola.com/ru/smartphones-razr-5g/p?skuId=279',
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};
assert.ok(!payload.phones.some((existing) => existing.id === phone.id), 'motorola razr 5G already exists');
payload.phones.push(phone);
assert.equal(payload.phones.length, 181);
fs.writeFileSync(phonesPath, `${JSON.stringify(payload, null, 2)}\n`);

const replacements = [
  ['tools/phone-quickcheck/index.html', 5],
  ['tools/phone-quickcheck/usage.html', 2],
  ['tools/phone-quickcheck/SPEC.md', 3],
  ['docs/tools/phone-quickcheck.md', 3],
  ['scripts/check-phone-quickcheck-data.mjs', 2]
];
for (const [file, expected] of replacements) {
  let text = fs.readFileSync(file, 'utf8');
  const matches = text.match(/\b180\b/g) || [];
  assert.equal(matches.length, expected, `${file}: unexpected 180 occurrence count`);
  text = text.replace(/\b180\b/g, '181');
  fs.writeFileSync(file, text);
}

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = "console.log('Phone QuickCheck behavior tests passed: search/i18n, recharge estimates, Apple unknown capacity, Lightning guidance, proprietary charging, and mobile sheet.');";
assert.ok(behavior.includes(marker), 'behavior marker missing');
assert.ok(!behavior.includes("motorola-razr-5g']),"), 'wave 10 behavior already applied');
const regression = `// Japan-market motorola razr 5G preserves legacy foldable dimensions and 15W TurboPower semantics.\n{\n  const h = await createHarness(['motorola-razr-5g']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('91.7 × 72.6 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /91\\.7 × 72\\.6 × 16 mm/);\n  assert.match(html, /169\\.2 × 72\\.6 × 7\\.9 mm/);\n  assert.match(html, /2800 mAh/);\n  assert.match(html, /15W/);\n  assert.match(html, /TurboPower/);\n}\n\n`;
behavior = behavior.replace(marker, regression + marker);
fs.writeFileSync(behaviorPath, behavior);

console.log('Applied Phone QuickCheck motorola razr 5G wave 10: 180 -> 181 phones.');
