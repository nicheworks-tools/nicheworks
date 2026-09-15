import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const phone = payload.phones.find((item) => item.id === 'samsung-galaxy-z-flip');
if (!phone) throw new Error('samsung-galaxy-z-flip missing');
if (phone.charging?.wirelessStandard !== 'Qi') throw new Error(`unexpected wirelessStandard: ${phone.charging?.wirelessStandard}`);
if (phone.charging?.wirelessMaxW !== undefined && phone.charging?.wirelessMaxW !== null) throw new Error(`wirelessMaxW already populated: ${phone.charging.wirelessMaxW}`);
if (phone.waterStatus !== 'not_resistant') throw new Error(`unexpected waterStatus: ${phone.waterStatus}`);

const charging = {};
for (const [key, value] of Object.entries(phone.charging)) {
  charging[key] = value;
  if (key === 'wirelessStandard') charging.wirelessMaxW = 9;
}
phone.charging = charging;
phone.sources.wirelessUrl = 'https://news.samsung.com/mx/comienza-en-mexico-la-preventa-online-del-nuevo-galaxy-z-flip';
phone.sources.verifiedAt = '2026-09-15';
payload.updatedAt = '2026-09-15';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);

const testPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let tests = fs.readFileSync(testPath, 'utf8');
const marker = '// Original Galaxy Z Flip renders its Samsung-source-backed 9W Qi maximum.';
if (tests.includes(marker)) throw new Error('Galaxy Z Flip wireless regression already present');
tests += `\n${marker}\n{\n  const phone = byId.get('samsung-galaxy-z-flip');\n  assert.ok(phone, 'Galaxy Z Flip fixture missing');\n  assert.equal(phone.waterStatus, 'not_resistant');\n  assert.equal(phone.charging?.wirelessMaxW, 9);\n  assert.match(phone.sources?.wirelessUrl || '', /^https:\\/\\/news\\.samsung\\.com\\//);\n  const h = await createHarness(['samsung-galaxy-z-flip']);\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /Qi \\/ 9W/);\n  assert.match(html, /非防水・非防塵/);\n}\n`;
fs.writeFileSync(testPath, tests);
