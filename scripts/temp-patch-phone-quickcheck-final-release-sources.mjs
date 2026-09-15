import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const releaseUrls = new Map([
  ['oppo-reno9-a', 'https://www.oppo.com/jp/newsroom/press/oppo-tv-reno9a/'],
  ['oppo-reno7-a', 'https://www.oppo.com/jp/newsroom/press/opporeno7a-conceptvideo/'],
  ['oppo-a77', 'https://www.oppo.com/jp/newsroom/press/oppo-a77-launch/'],
  ['xiaomi-redmi-note-13-pro-plus-5g', 'https://www.mi.com/jp/support/policy/redminote13proplus-5g-premium-service/'],
  ['xiaomi-redmi-note-13-pro-5g', 'https://www.mi.com/jp/support/terms/redmi-note-13-pro-5g-event-terms/'],
  ['xiaomi-redmi-note-11-pro-5g', 'https://www.mi.com/jp/service/support/imei-redemption.html'],
  ['motorola-moto-g64-5g', 'https://store.motorola.co.jp/topics_detail.html?info_id=883'],
  ['motorola-edge-50-pro', 'https://store.motorola.co.jp/topics_detail.html?info_id=916']
]);

for (const [id, releaseUrl] of releaseUrls) {
  const phone = payload.phones.find((item) => item.id === id);
  if (!phone) throw new Error(`${id} missing`);
  if (phone.sources?.releaseUrl) throw new Error(`${id} already has releaseUrl: ${phone.sources.releaseUrl}`);
  phone.sources.releaseUrl = releaseUrl;
  phone.sources.verifiedAt = '2026-09-16';
}

payload.updatedAt = '2026-09-16';
fs.writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);
