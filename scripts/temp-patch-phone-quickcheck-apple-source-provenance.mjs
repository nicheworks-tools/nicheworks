import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const ids = [
  'apple-iphone-14', 'apple-iphone-14-plus', 'apple-iphone-14-pro', 'apple-iphone-14-pro-max',
  'apple-iphone-13', 'apple-iphone-13-mini', 'apple-iphone-13-pro', 'apple-iphone-13-pro-max',
  'apple-iphone-12', 'apple-iphone-12-mini', 'apple-iphone-12-pro', 'apple-iphone-12-pro-max',
  'apple-iphone-11', 'apple-iphone-11-pro', 'apple-iphone-11-pro-max',
  'apple-iphone-se-3', 'apple-iphone-se-2',
  'apple-iphone-xs', 'apple-iphone-xs-max', 'apple-iphone-xr'
];

for (const id of ids) {
  const phone = payload.phones.find((item) => item.id === id);
  if (!phone) throw new Error(`${id} missing`);
  const spec = phone.sources?.specificationsUrl;
  if (!spec || !/^https:\/\/(?:www\.)?(?:support\.)?apple\.com\//.test(spec)) throw new Error(`${id} unexpected specificationsUrl: ${spec}`);
  if (phone.sources.chargingUrl) throw new Error(`${id} already has chargingUrl: ${phone.sources.chargingUrl}`);
  if (phone.sources.wirelessUrl) throw new Error(`${id} already has wirelessUrl: ${phone.sources.wirelessUrl}`);
  phone.sources.chargingUrl = spec;
  phone.sources.wirelessUrl = spec;
  phone.sources.verifiedAt = '2026-09-16';
}

payload.updatedAt = '2026-09-16';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);
