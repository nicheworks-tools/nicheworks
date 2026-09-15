import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const updates = new Map([
  ['xiaomi-xiaomi-12t-pro', { waterRating: 'IP53', waterUrl: 'https://www.mi.com/uk/support/faq/details/KA-11593/' }],
  ['motorola-moto-g24', { waterRating: 'IP52', waterUrl: 'https://store.motorola.co.jp/topics_detail.html?info_id=784' }]
]);

for (const [id, update] of updates) {
  const phone = payload.phones.find((item) => item.id === id);
  if (!phone) throw new Error(`${id} missing`);
  if (phone.waterRating !== null && phone.waterRating !== undefined) throw new Error(`${id} already has waterRating: ${phone.waterRating}`);
  if (phone.waterStatus !== undefined) throw new Error(`${id} unexpectedly has waterStatus: ${phone.waterStatus}`);
  phone.waterRating = update.waterRating;
  phone.sources.waterUrl = update.waterUrl;
  phone.sources.verifiedAt = '2026-09-16';
}

payload.updatedAt = '2026-09-16';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);
