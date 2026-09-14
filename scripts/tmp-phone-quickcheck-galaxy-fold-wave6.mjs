import fs from 'node:fs';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
if (!Array.isArray(payload.phones)) throw new Error('phones array missing');
if (payload.phones.length !== 167) throw new Error(`expected 167 phones before wave 6, got ${payload.phones.length}`);
if (payload.phones.some((phone) => phone.id === 'samsung-galaxy-fold-scv44')) throw new Error('Galaxy Fold SCV44 already exists');

const foldLaunch = 'https://news.samsung.com/global/samsung-galaxy-fold-now-available';
const samsungAfc = 'https://www.samsung.com/ca/support/mobile-devices/galaxy-phone-wall-chargers-and-charging/';
const jpWireless = 'https://www.samsung.com/jp/support/mobile-devices/issues-with-wireless-charging/';
const fold = {
  id: 'samsung-galaxy-fold-scv44',
  manufacturer: 'Samsung',
  model: 'Galaxy Fold',
  aliases: ['Samsung Galaxy Fold', 'Galaxy Fold SCV44', 'SCV44', 'SM-F900J', 'ギャラクシー Fold', 'ギャラクシーフォールド'],
  market: ['JP'],
  releaseYear: 2019,
  formFactor: 'foldable',
  dimensionsFolded: { heightMm: 160.9, widthMm: 62.8, depthMmMin: 15.7, depthMmMax: 17.1 },
  dimensionsUnfolded: { heightMm: 160.9, widthMm: 117.9, depthMmMin: 6.9, depthMmMax: 7.6 },
  weightG: 276,
  displayInch: 7.3,
  charging: {
    connector: 'USB-C',
    battery: { capacityMah: 4380, valueClass: 'official', sourceRef: foldLaunch },
    wiredRecommendedW: 15,
    protocols: ['Adaptive Fast Charging', 'QC2.0'],
    pps: 'unknown',
    wirelessStandard: 'Qi'
  },
  included: { cable: 'included', adapter: 'not_included' },
  sources: {
    specificationsUrl: foldLaunch,
    manualUrl: 'https://www.samsung.com/jp/support/model/SM-F900JZSAKDI/',
    releaseUrl: foldLaunch,
    chargingUrl: samsungAfc,
    wirelessUrl: jpWireless,
    verifiedAt: '2026-09-14'
  },
  affiliateKeys: []
};

for (const id of ['samsung-galaxy-z-flip', 'samsung-galaxy-z-flip-5g', 'samsung-galaxy-z-flip3-5g']) {
  const phone = payload.phones.find((item) => item.id === id);
  if (!phone) throw new Error(`${id} missing`);
  phone.charging.protocols = ['Adaptive Fast Charging', 'QC2.0'];
}
const flipIndex = payload.phones.findIndex((phone) => phone.id === 'samsung-galaxy-z-flip');
if (flipIndex < 0) throw new Error('Galaxy Z Flip insertion anchor missing');
payload.phones.splice(flipIndex + 1, 0, fold);
fs.writeFileSync(phonesPath, JSON.stringify(payload, null, 2) + '\n');

const accessoriesPath = 'tools/phone-quickcheck/data/accessories.json';
const accessoryPayload = JSON.parse(fs.readFileSync(accessoriesPath, 'utf8'));
if (accessoryPayload.accessories.some((item) => item.key === 'charger-samsung-afc-15w')) throw new Error('AFC accessory already exists');
const samsung25Index = accessoryPayload.accessories.findIndex((item) => item.key === 'charger-samsung-25w');
if (samsung25Index < 0) throw new Error('Samsung 25W accessory anchor missing');
accessoryPayload.version = Math.max(Number(accessoryPayload.version) || 0, 5);
accessoryPayload.accessories.splice(samsung25Index, 0, {
  key: 'charger-samsung-afc-15w',
  labelJa: 'Galaxy Adaptive Fast Charging対応 15W充電器',
  labelEn: '15W Galaxy Adaptive Fast Charging charger',
  noteJa: '15W Adaptive Fast Charging（AFC）対応を明記した充電器を選んでください。',
  noteEn: 'Choose a charger that explicitly supports Samsung 15W Adaptive Fast Charging (AFC).',
  amazonUrl: null
});
fs.writeFileSync(accessoriesPath, JSON.stringify(accessoryPayload, null, 2) + '\n');

const appPath = 'tools/phone-quickcheck/app.js';
let app = fs.readFileSync(appPath, 'utf8');
const oldRoute = `    } else if (manufacturer === 'samsung' && watts) {\n      if (watts >= 60) keys.add('charger-samsung-60w');\n      else if (watts >= 45) keys.add('charger-samsung-45w');\n      else keys.add('charger-samsung-25w');\n    } else if (protocols.includes('usb pd') && watts) {\n`;
const newRoute = `    } else if (manufacturer === 'samsung' && watts && protocols.includes('super fast charging')) {\n      if (watts >= 60) keys.add('charger-samsung-60w');\n      else if (watts >= 45) keys.add('charger-samsung-45w');\n      else keys.add('charger-samsung-25w');\n    } else if (manufacturer === 'samsung' && watts && (protocols.includes('adaptive fast charging') || protocols.includes('qc2.0'))) {\n      keys.add('charger-samsung-afc-15w');\n    } else if (protocols.includes('usb pd') && watts) {\n`;
if (!app.includes(oldRoute)) throw new Error('Samsung accessory routing block missing');
app = app.replace(oldRoute, newRoute);
fs.writeFileSync(appPath, app);

const affiliatePath = 'tools/phone-quickcheck/affiliate-config.js';
let affiliate = fs.readFileSync(affiliatePath, 'utf8');
const affiliateAnchor = `    offer("charger-samsung-25w", "wired_charger", "Samsung Super Fast Charging 25W 充電器", "AmazonでGalaxy 25W充電器を探す", "Find a Galaxy 25W charger on Amazon"),\n`;
if (!affiliate.includes(affiliateAnchor)) throw new Error('affiliate Samsung 25W anchor missing');
affiliate = affiliate.replace(affiliateAnchor, `    offer("charger-samsung-afc-15w", "wired_charger", "Samsung Adaptive Fast Charging 15W 充電器", "AmazonでGalaxy 15W AFC充電器を探す", "Find a Galaxy 15W AFC charger on Amazon"),\n${affiliateAnchor}`);
fs.writeFileSync(affiliatePath, affiliate);

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

replaceAllExact('tools/phone-quickcheck/index.html', '167', '168', 5);
replaceAllExact('tools/phone-quickcheck/usage.html', '167', '168', 2);
replaceExact('tools/phone-quickcheck/SPEC.md', 'Current dataset: `167 verified models`', 'Current dataset: `168 verified models`');
replaceExact('tools/phone-quickcheck/SPEC.md', 'The maintained public dataset contains 167 verified models across', 'The maintained public dataset contains 168 verified models across');
replaceExact('tools/phone-quickcheck/SPEC.md', '- [x] The maintained public dataset contains 167 maintained models.', '- [x] The maintained public dataset contains 168 maintained models.');
replaceExact('docs/tools/phone-quickcheck.md', 'The maintained public dataset contains 167 smartphone records across', 'The maintained public dataset contains 168 smartphone records across');
replaceExact('docs/tools/phone-quickcheck.md', '- 167機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。', '- 168機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。');
replaceExact('docs/tools/phone-quickcheck.md', '- [x] 167 maintained models load from the static phone dataset.', '- [x] 168 maintained models load from the static phone dataset.');
replaceExact('scripts/check-phone-quickcheck-data.mjs', 'if (phones.length < 167) fail(`expected at least 167 phones, got ${phones.length}`);', 'if (phones.length < 168) fail(`expected at least 168 phones, got ${phones.length}`);');

const behaviorPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let behavior = fs.readFileSync(behaviorPath, 'utf8');
const marker = '// Galaxy Z Fold2 5G proves production data can preserve depth ranges in both folded and unfolded states.\n';
if (!behavior.includes(marker)) throw new Error('Fold2 behavior marker missing');
const regression = `// First-generation Galaxy Fold SCV44 keeps JP-market hardware facts and Adaptive Fast Charging distinct from SFC.\n{\n  const h = await createHarness(['samsung-galaxy-fold-scv44']);\n  assert.ok(h.elements.phoneList.innerHTML.includes('160.9 × 62.8 mm (折りたたみ時)'));\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /160\\.9 × 62\\.8 × 15\\.7–17\\.1 mm/);\n  assert.match(html, /160\\.9 × 117\\.9 × 6\\.9–7\\.6 mm/);\n  assert.match(html, /276 g/);\n  assert.match(html, /4380 mAh/);\n  assert.match(html, /充電器目安<\\/span><b>15W\\+/);\n  assert.doesNotMatch(html, /端末側の有線充電上限<\\/span><b>15W/);\n  assert.match(html, /Adaptive Fast Charging \/ QC2\\.0/);\n  assert.match(html, /Galaxy Adaptive Fast Charging対応 15W充電器/);\n  assert.doesNotMatch(html, /Galaxy Super Fast Charging対応 25W充電器/);\n}\n\n`;
behavior = behavior.replace(marker, regression + marker);
fs.writeFileSync(behaviorPath, behavior);

console.log(`Applied Galaxy Fold wave 6: ${payload.phones.length} phones, ${accessoryPayload.accessories.length} accessory classes.`);
