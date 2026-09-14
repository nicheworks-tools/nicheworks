import fs from 'node:fs';
import assert from 'node:assert/strict';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
assert.equal(payload.phones.length, 179, 'wave 9 must start from 179 phones');

const phone = {
  id: 'oppo-find-n6',
  manufacturer: 'OPPO',
  model: 'OPPO Find N6',
  aliases: ['Find N6', 'OPPO FindN6', 'FindN6', 'オッポ Find N6', 'CPH2765'],
  market: ['JP'],
  releaseYear: 2026,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 160, widthMm: 74, depthMm: 8.9 },
  dimensionsUnfolded: { heightMm: 160, widthMm: 146, depthMm: 4.2 },
  weightG: 225,
  displayInch: 8.1,
  waterRating: 'IP56 / IP58 / IP59',
  charging: {
    connector: 'USB-C',
    battery: {
      capacityMah: 6000,
      valueClass: 'manufacturer',
      sourceRef: 'https://www.oppo.com/jp/smartphones/series-find-n/find-n6/specs/'
    },
    wiredRecommendedW: null,
    wiredMaxW: 80,
    protocols: ['SUPERVOOC'],
    pps: 'unknown',
    wirelessStandard: 'AIRVOOC',
    wirelessMaxW: 50
  },
  included: { cable: 'included', adapter: 'included' },
  sources: {
    specificationsUrl: 'https://www.oppo.com/jp/smartphones/series-find-n/find-n6/specs/',
    releaseUrl: 'https://www.oppo.com/jp/newsroom/press/findn6-release/',
    chargingUrl: 'https://www.oppo.com/jp/newsroom/press/findn6-release/',
    wirelessUrl: 'https://www.oppo.com/jp/newsroom/press/findn6-release/',
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};
assert.ok(!payload.phones.some((existing) => existing.id === phone.id), 'OPPO Find N6 already exists');
payload.phones.push(phone);
assert.equal(payload.phones.length, 180);
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
  const matches = text.match(/\b179\b/g) || [];
  assert.equal(matches.length, expected, `${file}: unexpected 179 occurrence count`);
  text = text.replace(/\b179\b/g, '180');
  fs.writeFileSync(file, text);
}

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = "console.log('Phone QuickCheck behavior tests passed: search/i18n, recharge estimates, Apple unknown capacity, Lightning guidance, proprietary charging, and mobile sheet.');";
assert.ok(behavior.includes(marker), 'behavior marker missing');
assert.ok(!behavior.includes("oppo-find-n6']),"), 'wave 9 behavior already applied');
const regression = `// Japan-market OPPO Find N6 preserves foldable dimensions and proprietary wired/wireless charging classes.\n{\n  const h = await createHarness(['oppo-find-n6']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('160 × 74 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /160 × 74 × 8\\.9 mm/);\n  assert.match(html, /160 × 146 × 4\\.2 mm/);\n  assert.match(html, /6000 mAh/);\n  assert.match(html, /80W/);\n  assert.match(html, /SUPERVOOC/);\n  assert.match(html, /AIRVOOC \\/ 50W/);\n}\n\n`;
behavior = behavior.replace(marker, regression + marker);
fs.writeFileSync(behaviorPath, behavior);

console.log('Applied Phone QuickCheck OPPO Find N6 wave 9: 179 -> 180 phones.');
