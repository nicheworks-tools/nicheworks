import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const releaseUrls = new Map([
  ['samsung-galaxy-s22', 'https://news.samsung.com/global/galaxy-s22'],
  ['samsung-galaxy-s22-ultra', 'https://news.samsung.com/global/samsung-galaxy-s22-ultra-offers-the-ultimate-and-most-premium-s-series-experience-yet'],
  ['samsung-galaxy-s21-5g', 'https://news.samsung.com/global/make-every-day-epic-with-samsung-galaxy-s21-and-galaxy-s21plus'],
  ['samsung-galaxy-s21-ultra-5g', 'https://news.samsung.com/global/samsung-galaxy-s21-ultra-the-ultimate-smartphone-experience-designed-to-be-epic-in-every-way'],
  ['samsung-galaxy-a54-5g', 'https://news.samsung.com/global/the-samsung-galaxy-a54-5g-and-galaxy-a34-5g-awesome-experiences-for-all'],
  ['samsung-galaxy-a53-5g', 'https://news.samsung.com/global/galaxy-a53-5g-and-galaxy-a33-5g-awesome-mobile-experiences-open-to-everyone'],
  ['samsung-galaxy-a35-5g', 'https://news.samsung.com/global/samsung-galaxy-a55-5g-and-galaxy-a35-5g-awesome-innovations-and-security-engineered-for-everyone']
]);

for (const [id, url] of releaseUrls) {
  const phone = payload.phones.find((item) => item.id === id);
  if (!phone) throw new Error(`${id}: missing`);
  if (phone.sources?.releaseUrl) throw new Error(`${id}: releaseUrl already populated: ${phone.sources.releaseUrl}`);
  phone.sources.releaseUrl = url;
  phone.sources.verifiedAt = '2026-09-15';
}
payload.updatedAt = '2026-09-15';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);
