import fs from 'node:fs';
import assert from 'node:assert/strict';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
assert.equal(payload.phones.length, 181, 'wave 11 must start from 181 phones');
assert.ok(!payload.phones.some((phone) => phone.id === 'zte-nubia-fold'), 'nubia Fold already exists');

const phone = {
  id: 'zte-nubia-fold',
  manufacturer: 'ZTE',
  model: 'nubia Fold',
  aliases: ['nubia Fold', 'nubiaFold', 'A502ZT', 'ヌビア Fold', 'ヌビア フォールド'],
  market: ['JP'],
  releaseYear: 2025,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 160, widthMm: 73, depthMm: 11.1 },
  dimensionsUnfolded: { heightMm: 160, widthMm: 144, depthMm: 5.4 },
  weightG: 249,
  displayInch: 8,
  waterRating: 'IPX4 / IP5X',
  charging: {
    connector: 'USB-C',
    battery: {
      capacityMah: 6560,
      valueClass: 'official',
      sourceRef: 'https://www.ymobile.jp/biz/lineup/smartphone_a502zt/'
    },
    wiredRecommendedW: null,
    wiredMaxW: 55,
    protocols: ['USB-PD', 'PPS'],
    pps: 'required',
    wirelessStandard: null,
    wirelessMaxW: null
  },
  included: { cable: 'not_included', adapter: 'not_included' },
  sources: {
    specificationsUrl: 'https://www.ymobile.jp/biz/lineup/smartphone_a502zt/',
    manualUrl: 'https://www.ymobile.jp/lineup/nubia_fold/data/nubia_fold_quickstart.pdf',
    releaseUrl: 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-fold',
    chargingUrl: 'https://www.ymobile.jp/biz/lineup/smartphone_a502zt/',
    verifiedAt: '2026-09-15'
  },
  affiliateKeys: []
};

const insertAt = payload.phones.findIndex((item) => item.id === 'oppo-find-n6');
assert.ok(insertAt >= 0, 'OPPO Find N6 insertion anchor missing');
payload.phones.splice(insertAt, 0, phone);
payload.updatedAt = '2026-09-15';
assert.equal(payload.phones.length, 182);
fs.writeFileSync(phonesPath, JSON.stringify(payload, null, 2) + '\n');

const replacements = [
  ['tools/phone-quickcheck/index.html', 5],
  ['tools/phone-quickcheck/usage.html', 2],
  ['tools/phone-quickcheck/SPEC.md', 3],
  ['docs/tools/phone-quickcheck.md', 3],
  ['scripts/check-phone-quickcheck-data.mjs', 2]
];
for (const [file, expected] of replacements) {
  let text = fs.readFileSync(file, 'utf8');
  const matches = text.match(/\b181\b/g) || [];
  assert.equal(matches.length, expected, `${file}: unexpected 181 occurrence count`);
  text = text.replace(/\b181\b/g, '182');
  text = text.replace(/Apple、Google、Samsung、Sony、SHARP、OPPO、Xiaomi、Motorola/g, 'Apple、Google、Samsung、Sony、SHARP、OPPO、Xiaomi、Motorola、ZTE');
  text = text.replace(/Apple, Google, Samsung, Sony, SHARP, OPPO, Xiaomi, and Motorola/g, 'Apple, Google, Samsung, Sony, SHARP, OPPO, Xiaomi, Motorola, and ZTE');
  fs.writeFileSync(file, text);
}

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = "console.log('Phone QuickCheck behavior tests passed: search/i18n, recharge estimates, Apple unknown capacity, Lightning guidance, proprietary charging, and mobile sheet.');";
assert.ok(behavior.includes(marker), 'behavior marker missing');
assert.ok(!behavior.includes("createHarness(['zte-nubia-fold'])"), 'nubia Fold behavior already applied');
const regression = `// Japan-market nubia Fold preserves foldable dimensions, 55W device-side charging, USB PD-PPS, and package exclusions.\n{\n  const h = await createHarness(['zte-nubia-fold']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('160 × 73 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /160 × 73 × 11\\.1 mm/);\n  assert.match(html, /160 × 144 × 5\\.4 mm/);\n  assert.match(html, /249 g/);\n  assert.match(html, /6560 mAh/);\n  assert.match(html, /端末側の有線充電上限<\\/span><b>55W/);\n  assert.match(html, /USB-PD/);\n  assert.match(html, /PPS/);\n  assert.doesNotMatch(html, /充電器目安<\\/span><b>55W\\+/);\n}\n\n`;
behavior = behavior.replace(marker, regression + marker);
fs.writeFileSync(behaviorPath, behavior);

console.log('Applied Phone QuickCheck nubia Fold wave 11: 181 -> 182 phones.');