import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const updates = new Map([
  ['google-pixel-10-pro', { waterRating: 'IP68', waterUrl: 'https://store.google.com/jp/product/pixel_10_pro_specs?hl=ja' }],
  ['google-pixel-10-pro-xl', { waterRating: 'IP68', waterUrl: 'https://store.google.com/jp/product/pixel_10_pro_specs?hl=ja' }],
  ['google-pixel-5', { waterRating: 'IP68', waterUrl: 'https://support.google.com/pixelphone/answer/9910799?hl=ja' }],
  ['google-pixel-5a-5g', { waterRating: 'IP67', waterUrl: 'https://support.google.com/pixelphone/answer/10331506?hl=ja' }],
  ['samsung-galaxy-a51-5g', { waterRating: 'IPX5/IPX8 / IP6X', waterUrl: 'https://www.au.com/online-manual/scg07/scg07_01/m_01_00_04.html' }],
  ['samsung-galaxy-a32-5g', { waterRating: 'IPX5/IPX8 / IP6X', waterUrl: 'https://www.au.com/content/dam/au-com/support/service/mobile/guide/manual/scg08/pdf/scg08_safety_precautions.pdf' }],
  ['samsung-galaxy-a41', { waterRating: 'IPX5/IPX8 / IP6X', waterUrl: 'https://www.docomo.ne.jp/support/product/sc41a/spec.html' }],
  ['xiaomi-xiaomi-11t-pro', { waterRating: 'IP53', waterUrl: 'https://www.mi.com/jp/support/faq/details/KA-09438/' }],
  ['xiaomi-xiaomi-11t', { waterRating: 'IP53', waterUrl: 'https://www.mi.com/jp/support/faq/details/KA-09436/' }],
  ['xiaomi-mi-11-lite-5g', { waterRating: 'IP53', waterUrl: 'https://www.mi.com/jp/support/faq/details/KA-09407/' }]
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
