import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const releaseUrls = new Map([
  ['sharp-aquos-sense8', 'https://corporate.jp.sharp/news/231003-e.html'],
  ['sharp-aquos-sense7', 'https://corporate.jp.sharp/news/220926-e.html'],
  ['sharp-aquos-sense6', 'https://corporate.jp.sharp/news/210928-e.html'],
  ['sharp-aquos-wish3', 'https://corporate.jp.sharp/news/230509-h.html'],
  ['sharp-aquos-wish2', 'https://corporate.jp.sharp/news/220509-d.html'],
  ['sharp-aquos-r8', 'https://corporate.jp.sharp/news/230509-i.html'],
  ['sharp-aquos-r8-pro', 'https://corporate.jp.sharp/news/230509-j.html']
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
