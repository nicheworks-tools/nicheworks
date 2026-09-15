import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const releaseUrls = new Map([
  ['sony-xperia-1-v', 'https://www.sony.jp/CorporateCruise/Press/202305/23-0511/'],
  ['sony-xperia-1-iv', 'https://www.sony.jp/CorporateCruise/Press/202209/22-0912/'],
  ['sony-xperia-5-iv', 'https://www.sony.jp/CorporateCruise/Press/202209/22-0929/'],
  ['sony-xperia-10-iv', 'https://www.sony.jp/CorporateCruise/Press/202303/23-0302/'],
  ['sony-xperia-ace-iii', 'https://www.sony.jp/xperia/xperia/acem3/']
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
