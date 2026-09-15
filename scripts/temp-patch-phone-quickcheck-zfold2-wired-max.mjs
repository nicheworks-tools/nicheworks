import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const phone = payload.phones.find((item) => item.id === 'samsung-galaxy-z-fold2-5g');
if (!phone) throw new Error('samsung-galaxy-z-fold2-5g missing');
if (phone.charging?.wiredRecommendedW !== 25) throw new Error(`unexpected wiredRecommendedW: ${phone.charging?.wiredRecommendedW}`);
if (phone.charging?.wiredMaxW !== undefined && phone.charging?.wiredMaxW !== null) throw new Error(`wiredMaxW already populated: ${phone.charging.wiredMaxW}`);

const charging = {};
for (const [key, value] of Object.entries(phone.charging)) {
  charging[key] = value;
  if (key === 'wiredRecommendedW') charging.wiredMaxW = 25;
}
phone.charging = charging;
phone.sources.verifiedAt = '2026-09-15';
payload.updatedAt = '2026-09-15';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);

const testPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
const testText = fs.readFileSync(testPath, 'utf8');
const before = "  assert.doesNotMatch(html, /端末側の有線充電上限<\\/span><b>25W/);";
const after = "  assert.match(html, /端末側の有線充電上限<\\/span><b>25W/);";
const matches = testText.split(before).length - 1;
if (matches !== 1) throw new Error(`expected one Z Fold2 wired-max regression target, got ${matches}`);
fs.writeFileSync(testPath, testText.replace(before, after));
