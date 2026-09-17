import fs from 'node:fs';

const path = 'tools/phone-quickcheck/data/phones.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const targets = [
  ['sharp-aquos-wish3', 'https://jp.sharp/products/aquos-wish3/d/'],
  ['sharp-aquos-wish2', 'https://jp.sharp/products/aquos-wish2/d/'],
];

for (const [id, expectedSpec] of targets) {
  const phone = data.phones.find((p) => p.id === id);
  if (!phone) throw new Error(`${id} not found`);
  if (!Array.isArray(phone.market) || !phone.market.includes('JP')) {
    throw new Error(`${id}: unexpected market: ${JSON.stringify(phone.market)}`);
  }
  if (phone.sources?.specificationsUrl !== expectedSpec) {
    throw new Error(`${id}: unexpected specificationsUrl: ${phone.sources?.specificationsUrl}`);
  }
  if (phone.included?.adapter !== 'unknown' || phone.included?.cable !== 'unknown') {
    throw new Error(`${id}: unexpected package state: ${JSON.stringify(phone.included)}`);
  }
  phone.included.adapter = 'not_included';
  phone.included.cable = 'not_included';
}

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('Updated AQUOS wish3 SH-53D / wish2 SH-51C package truth from exact Docomo manuals.');
