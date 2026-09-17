import fs from 'node:fs';

const path = 'tools/phone-quickcheck/data/phones.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const wish3 = data.phones.find((p) => p.id === 'sharp-aquos-wish3');
if (!wish3) throw new Error('sharp-aquos-wish3 not found');
if (!Array.isArray(wish3.market) || !wish3.market.includes('JP')) {
  throw new Error(`sharp-aquos-wish3: unexpected market: ${JSON.stringify(wish3.market)}`);
}
if (wish3.sources?.specificationsUrl !== 'https://jp.sharp/products/aquos-wish3/d/') {
  throw new Error(`sharp-aquos-wish3: unexpected specificationsUrl: ${wish3.sources?.specificationsUrl}`);
}
if (wish3.included?.adapter !== 'not_included' || wish3.included?.cable !== 'not_included') {
  throw new Error(`sharp-aquos-wish3: expected already-closed package state, got ${JSON.stringify(wish3.included)}`);
}

const wish2 = data.phones.find((p) => p.id === 'sharp-aquos-wish2');
if (!wish2) throw new Error('sharp-aquos-wish2 not found');
if (!Array.isArray(wish2.market) || !wish2.market.includes('JP')) {
  throw new Error(`sharp-aquos-wish2: unexpected market: ${JSON.stringify(wish2.market)}`);
}
if (wish2.sources?.specificationsUrl !== 'https://jp.sharp/products/aquos-wish2/d/') {
  throw new Error(`sharp-aquos-wish2: unexpected specificationsUrl: ${wish2.sources?.specificationsUrl}`);
}
if (wish2.included?.adapter !== 'unknown' || wish2.included?.cable !== 'unknown') {
  throw new Error(`sharp-aquos-wish2: unexpected package state: ${JSON.stringify(wish2.included)}`);
}
wish2.included.adapter = 'not_included';
wish2.included.cable = 'not_included';

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('Verified already-closed AQUOS wish3 and updated AQUOS wish2 SH-51C package truth from exact Docomo manual.');
