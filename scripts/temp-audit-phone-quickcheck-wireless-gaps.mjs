import fs from 'node:fs';
const payload = JSON.parse(fs.readFileSync('tools/phone-quickcheck/data/phones.json','utf8'));
const rows = payload.phones.filter((p) => {
  const c = p.charging || {};
  const hasWireless = (typeof c.wirelessStandard === 'string' && c.wirelessStandard.trim()) || c.wirelessMaxW != null;
  return hasWireless && !p.sources?.wirelessUrl;
}).map((p) => ({
  id: p.id,
  manufacturer: p.manufacturer,
  model: p.model,
  wirelessStandard: p.charging?.wirelessStandard ?? null,
  wirelessMaxW: p.charging?.wirelessMaxW ?? null,
  specificationsUrl: p.sources?.specificationsUrl ?? null,
  chargingUrl: p.sources?.chargingUrl ?? null
}));
fs.writeFileSync('phone-quickcheck-wireless-gap-audit.json', JSON.stringify({count: rows.length, rows}, null, 2) + '\n');
console.log(JSON.stringify({count: rows.length, rows}, null, 2));