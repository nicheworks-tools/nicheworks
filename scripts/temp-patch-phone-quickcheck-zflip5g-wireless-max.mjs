import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const phone = payload.phones.find((item) => item.id === 'samsung-galaxy-z-flip-5g');
if (!phone) throw new Error('samsung-galaxy-z-flip-5g missing');
if (phone.charging?.wirelessStandard !== 'Qi') throw new Error(`unexpected wirelessStandard: ${phone.charging?.wirelessStandard}`);
if (phone.charging?.wirelessMaxW !== undefined && phone.charging?.wirelessMaxW !== null) throw new Error(`wirelessMaxW already populated: ${phone.charging.wirelessMaxW}`);
if (phone.waterStatus !== undefined && phone.waterStatus !== null) throw new Error(`waterStatus unexpectedly resolved: ${phone.waterStatus}`);

const charging = {};
for (const [key, value] of Object.entries(phone.charging)) {
  charging[key] = value;
  if (key === 'wirelessStandard') charging.wirelessMaxW = 9;
}
phone.charging = charging;
phone.sources.wirelessUrl = 'https://www.samsung.com/hk_en/news/product/introducing-galaxy-z-flip-5g/';
phone.sources.verifiedAt = '2026-09-15';
payload.updatedAt = '2026-09-15';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);

const testPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let tests = fs.readFileSync(testPath, 'utf8');
const marker = '// Galaxy Z Flip 5G keeps water protection unresolved while rendering its source-backed 9W Qi maximum.';
if (tests.includes(marker)) throw new Error('Z Flip 5G wireless regression already present');
tests += `\n${marker}\n{\n  const phone = byId.get('samsung-galaxy-z-flip-5g');\n  assert.ok(phone, 'Galaxy Z Flip 5G fixture missing');\n  assert.equal(phone.waterStatus, undefined);\n  assert.equal(phone.charging?.wirelessMaxW, 9);\n  assert.match(phone.sources?.wirelessUrl || '', /^https:\\/\\/www\\.samsung\\.com\\//);\n  const h = await createHarness(['samsung-galaxy-z-flip-5g']);\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /Qi \\/ 9W/);\n  assert.doesNotMatch(html, /非防水・非防塵/);\n}\n`;
fs.writeFileSync(testPath, tests);
