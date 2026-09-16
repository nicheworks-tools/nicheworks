import fs from 'node:fs';

const path = 'tools/phone-quickcheck/data/phones.json';
const outPath = '.tmp-phone-quickcheck-gaps.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const phones = data.phones ?? [];

const ids = (pred) => phones.filter(pred).map((p) => p.id).sort();
const candidateIds = [
  'motorola-moto-g24',
  'motorola-moto-g64-5g',
  'motorola-moto-g13',
  'motorola-moto-g32',
  'motorola-razr-40'
];
const report = {
  generatedAt: new Date().toISOString(),
  total: phones.length,
  adapterUnknown: ids((p) => p.included?.adapter === 'unknown'),
  cableUnknown: ids((p) => p.included?.cable === 'unknown'),
  wiredMaxUnknown: ids((p) => p.charging?.wiredMaxW == null),
  ppsUnknown: ids((p) => p.charging?.pps === 'unknown'),
  wirelessUnknown: ids((p) => p.charging?.wirelessMaxW == null),
  waterUnknown: ids((p) => p.waterRating == null || p.waterRating === 'unknown'),
  candidates: Object.fromEntries(candidateIds.map((id) => {
    const p = phones.find((phone) => phone.id === id);
    return [id, p ? {
      model: p.model,
      market: p.market ?? null,
      included: p.included,
      charging: p.charging,
      sources: p.sources
    } : null];
  }))
};
report.counts = Object.fromEntries(
  Object.entries(report)
    .filter(([k, v]) => Array.isArray(v))
    .map(([k, v]) => [k, v.length])
);
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.counts, null, 2));
