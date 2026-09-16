import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const phone = payload.phones.find((item) => item.id === 'samsung-galaxy-a41');
if (!phone) throw new Error('Galaxy A41 missing');
if (!phone.sources) phone.sources = {};
if (phone.sources.chargingUrl) throw new Error('Galaxy A41 chargingUrl already present');
phone.sources.chargingUrl = 'https://www.docomo.ne.jp/support/product/sc41a/spec.html';
phone.sources.verifiedAt = '2026-09-16';
payload.updatedAt = '2026-09-16';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);