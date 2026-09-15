import fs from 'node:fs';

const path = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(path, 'utf8'));
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
fs.writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
