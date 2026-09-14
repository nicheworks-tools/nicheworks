import fs from 'node:fs';
import assert from 'node:assert/strict';

const phonesPath='tools/phone-quickcheck/data/phones.json';
const payload=JSON.parse(fs.readFileSync(phonesPath,'utf8'));
assert.equal(payload.phones.length,181,'wave 11 must start from 181 phones');

const phone={
  id:'zte-nubia-fold',
  manufacturer:'ZTE',
  model:'nubia Fold',
  aliases:['nubia Fold','nubiaFold','A502ZT','ヌビア Fold','ヌビア フォールド'],
  market:['JP'],
  releaseYear:2025,
  formFactor:'foldable',
  dimensionsFolded:{heightMm:160,widthMm:73,depthMm:11.1},
  dimensionsUnfolded:{heightMm:160,widthMm:144,depthMm:5.4},
  weightG:249,
  displayInch:8,
  waterRating:'IPX4 / IP5X',
  charging:{
    connector:'USB-C',
    battery:{capacityMah:6560,valueClass:'manufacturer',sourceRef:'https://www.nubia.com/jp/products/smartphones/nubia/nubia-fold'},
    wiredRecommendedW:null,
    wiredMaxW:55,
    protocols:['PPS'],
    pps:'required',
    wirelessStandard:null,
    wirelessMaxW:null
  },
  included:{cable:'not_included',adapter:'not_included'},
  sources:{
    specificationsUrl:'https://www.nubia.com/jp/products/smartphones/nubia/nubia-fold',
    manualUrl:'https://www.ymobile.jp/lineup/smartphone/nubia_fold/',
    releaseUrl:'https://www.softbank.jp/corp/news/press/sbkk/2025/20251202_03/',
    chargingUrl:'https://www.softbank.jp/corp/news/press/sbkk/2025/20251202_03/',
    verifiedAt:'2026-09-15'
  },
  affiliateKeys:[]
};
assert.ok(!payload.phones.some(p=>p.id===phone.id),'nubia Fold already exists');
payload.phones.push(phone);
assert.equal(payload.phones.length,182);
fs.writeFileSync(phonesPath,JSON.stringify(payload,null,2)+'\n');

const replacements=[
 ['tools/phone-quickcheck/index.html',5],
 ['tools/phone-quickcheck/usage.html',2],
 ['tools/phone-quickcheck/SPEC.md',3],
 ['docs/tools/phone-quickcheck.md',3],
 ['scripts/check-phone-quickcheck-data.mjs',2]
];
for(const [file,expected] of replacements){
 let text=fs.readFileSync(file,'utf8');
 const matches=text.match(/\b181\b/g)||[];
 assert.equal(matches.length,expected,`${file}: unexpected 181 occurrence count`);
 text=text.replace(/\b181\b/g,'182');
 fs.writeFileSync(file,text);
}

const semanticsPath='scripts/check-phone-quickcheck-source-semantics.mjs';
let semantics=fs.readFileSync(semanticsPath,'utf8');
const oldZte="ZTE: ['nubia.com', 'ymobile.jp']";
assert.ok(semantics.includes(oldZte),'ZTE trusted-source line changed');
semantics=semantics.replace(oldZte,"ZTE: ['nubia.com', 'ymobile.jp', 'softbank.jp']");
fs.writeFileSync(semanticsPath,semantics);

const behaviorPath='tools/phone-quickcheck/tests/behavior.test.mjs';
let behavior=fs.readFileSync(behaviorPath,'utf8');
const marker="console.log('Phone QuickCheck behavior tests passed: search/i18n, recharge estimates, Apple unknown capacity, Lightning guidance, proprietary charging, and mobile sheet.');";
assert.ok(behavior.includes(marker),'behavior marker missing');
assert.ok(!behavior.includes("zte-nubia-fold']),"),'nubia Fold behavior already applied');
const regression=`// Japan-market nubia Fold preserves foldable dimensions, 55W handset max, PPS, and carrier-proven package exclusions.\n{\n  const h = await createHarness(['zte-nubia-fold']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('160 × 73 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /160 × 73 × 11\\.1 mm/);\n  assert.match(html, /160 × 144 × 5\\.4 mm/);\n  assert.match(html, /6560 mAh/);\n  assert.match(html, /55W/);\n  assert.match(html, /PPS/);\n  assert.match(html, /IPX4 \\/ IP5X/);\n}\n\n`;
behavior=behavior.replace(marker,regression+marker);
fs.writeFileSync(behaviorPath,behavior);
console.log('Applied Phone QuickCheck nubia Fold wave 11: 181 -> 182 phones.');
