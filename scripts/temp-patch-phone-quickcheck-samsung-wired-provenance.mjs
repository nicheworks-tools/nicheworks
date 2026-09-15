import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const updates = new Map([
  ['samsung-galaxy-s24', 'https://news.samsung.com/global/enter-the-new-era-of-mobile-ai-with-samsung-galaxy-s24-series'],
  ['samsung-galaxy-s24-ultra', 'https://news.samsung.com/global/enter-the-new-era-of-mobile-ai-with-samsung-galaxy-s24-series'],
  ['samsung-galaxy-a55-5g', 'https://news.samsung.com/jp/au-uq-mobile-galaxy-a55-5g-0523'],
  ['samsung-galaxy-a36-5g', 'https://news.samsung.com/jp/galaxy-a36-onsale'],
  ['samsung-galaxy-s23', 'https://www.samsung.com/jp/explore/news/galaxy-unpacked-2023/']
]);

const touched = new Set();
for (const phone of payload.phones) {
  const url = updates.get(phone.id);
  if (!url) continue;
  if (!phone.sources) phone.sources = {};
  if (phone.sources.chargingUrl) throw new Error(`${phone.id}: chargingUrl already present`);
  phone.sources.chargingUrl = url;
  phone.sources.verifiedAt = '2026-09-16';
  touched.add(phone.id);
}
for (const id of updates.keys()) if (!touched.has(id)) throw new Error(`missing phone: ${id}`);
payload.updatedAt = '2026-09-16';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);