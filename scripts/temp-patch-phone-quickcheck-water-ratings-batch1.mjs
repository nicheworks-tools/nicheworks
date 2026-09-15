import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const updates = new Map([
  ['oppo-a77', { waterRating: 'IPX4 / IP5X', waterUrl: 'https://www.oppo.com/jp/smartphones/series-a/a77/' }],
  ['oppo-a55s-5g', { waterRating: 'IP68', waterUrl: 'https://www.oppo.com/jp/smartphones/series-a/a55s-5g/' }],
  ['sharp-aquos-sense5g', { waterRating: 'IPX5/IPX8 / IP6X', waterUrl: 'https://jp.sharp/products/aquos-sense5g/spec.html' }],
  ['sharp-aquos-sense4', { waterRating: 'IPX5/IPX8 / IP6X', waterUrl: 'https://jp.sharp/products/shm15/spec.html' }],
  ['sharp-aquos-wish', { waterRating: 'IPX5/IPX7 / IP6X', waterUrl: 'https://jp.sharp/products/aquos-wish/a/' }],
  ['sharp-aquos-r6', { waterRating: 'IPX5/IPX8 / IP6X', waterUrl: 'https://jp.sharp/products/aquos-r6/spec.html' }],
  ['sharp-aquos-zero6', { waterRating: 'IPX5/IPX8 / IP6X', waterUrl: 'https://jp.sharp/products/aquos-zero6/' }],
  ['sharp-aquos-r5g', { waterRating: 'IPX5/IPX8 / IP6X', waterUrl: 'https://jp.sharp/products/aquos-r5g/spec.html' }]
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
