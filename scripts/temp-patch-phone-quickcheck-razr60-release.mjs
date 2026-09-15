import fs from 'node:fs';

const path = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(path, 'utf8'));
const phone = payload.phones.find((item) => item.id === 'motorola-razr-60');
if (!phone) throw new Error('motorola-razr-60 missing');
if (phone.sources?.releaseUrl) throw new Error(`releaseUrl already populated: ${phone.sources.releaseUrl}`);
phone.sources.releaseUrl = 'https://moto-bu.motorola.co.jp/products/razr60/display-support.html';
phone.sources.verifiedAt = '2026-09-15';
payload.updatedAt = '2026-09-15';
fs.writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
