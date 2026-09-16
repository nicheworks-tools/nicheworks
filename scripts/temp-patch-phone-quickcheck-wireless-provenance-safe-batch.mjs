import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const updates = new Map([
  ['sony-xperia-1-vi', 'https://www.sony.jp/xperia/xperia/xperia1m6/spec.html'],
  ['sony-xperia-5-v', 'https://www.sony.jp/xperia/xperia/xperia5m5/spec.html'],
  ['samsung-galaxy-s20-5g', 'https://news.samsung.com/global/introducing-the-samsung-galaxy-s20-change-the-way-you-experience-the-world'],
  ['samsung-galaxy-s20-plus-5g', 'https://news.samsung.com/global/introducing-the-samsung-galaxy-s20-change-the-way-you-experience-the-world'],
  ['samsung-galaxy-s20-ultra-5g', 'https://news.samsung.com/global/introducing-the-samsung-galaxy-s20-change-the-way-you-experience-the-world'],
  ['samsung-galaxy-note20-ultra-5g', 'https://news.samsung.com/global/samsung-unveils-five-new-power-devices-in-the-galaxy-ecosystem-to-empower-your-work-and-play']
]);

const touched = new Set();
for (const phone of payload.phones) {
  const url = updates.get(phone.id);
  if (!url) continue;
  if (!phone.sources) phone.sources = {};
  if (phone.sources.wirelessUrl) throw new Error(`${phone.id}: wirelessUrl already present`);
  if (phone.charging?.wirelessMaxW != null) throw new Error(`${phone.id}: batch is only for non-numeric wireless facts`);
  if (!phone.charging?.wirelessStandard) throw new Error(`${phone.id}: no wireless standard to source`);
  phone.sources.wirelessUrl = url;
  phone.sources.verifiedAt = '2026-09-16';
  touched.add(phone.id);
}
for (const id of updates.keys()) if (!touched.has(id)) throw new Error(`missing phone: ${id}`);
payload.updatedAt = '2026-09-16';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);