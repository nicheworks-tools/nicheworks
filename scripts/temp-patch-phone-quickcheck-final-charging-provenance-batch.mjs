import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const updates = new Map([
  ['oppo-reno13-a', { chargingUrl: 'https://www.oppo.com/jp/newsroom/press/reno13a-release/' }],
  ['oppo-reno11-a', { chargingUrl: 'https://www.oppo.com/jp/newsroom/press/oppo-reno11a-release/' }],
  ['oppo-a3-5g', { chargingUrl: 'https://www.oppo.com/jp/smartphones/series-a/a3-5g/specs/' }],
  ['xiaomi-15-ultra', { chargingUrl: 'https://www.mi.com/jp/support/faq/details/KA-536506/', wirelessUrl: 'https://www.mi.com/jp/support/faq/details/KA-536506/' }],
  ['xiaomi-14t-pro', { chargingUrl: 'https://www.mi.com/jp/product/xiaomi-14t-pro/specs/', wirelessUrl: 'https://www.mi.com/jp/product/xiaomi-14t-pro/specs/' }],
  ['motorola-edge-60-pro', { chargingUrl: 'https://store.motorola.co.jp/item/EDGE60PRO.html', wirelessUrl: 'https://store.motorola.co.jp/item/EDGE60PRO.html' }]
]);

const touched = new Set();
for (const phone of payload.phones) {
  const update = updates.get(phone.id);
  if (!update) continue;
  if (!phone.sources) phone.sources = {};
  if (update.chargingUrl) {
    if (phone.sources.chargingUrl) throw new Error(`${phone.id}: chargingUrl already present`);
    phone.sources.chargingUrl = update.chargingUrl;
  }
  if (update.wirelessUrl) {
    if (phone.sources.wirelessUrl) throw new Error(`${phone.id}: wirelessUrl already present`);
    phone.sources.wirelessUrl = update.wirelessUrl;
  }
  phone.sources.verifiedAt = '2026-09-16';
  touched.add(phone.id);
}
for (const id of updates.keys()) if (!touched.has(id)) throw new Error(`missing phone: ${id}`);
payload.updatedAt = '2026-09-16';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);