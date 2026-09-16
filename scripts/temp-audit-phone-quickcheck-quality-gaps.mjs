import fs from 'node:fs';

const payload = JSON.parse(fs.readFileSync('tools/phone-quickcheck/data/phones.json', 'utf8'));
const phones = Array.isArray(payload.phones) ? payload.phones : [];
const isHttps = (value) => typeof value === 'string' && /^https:\/\//i.test(value);

const row = (p) => ({
  id: p.id,
  manufacturer: p.manufacturer,
  model: p.model,
  adapter: p.included?.adapter ?? null,
  cable: p.included?.cable ?? null,
  wiredRecommendedW: p.charging?.wiredRecommendedW ?? null,
  wiredMaxW: p.charging?.wiredMaxW ?? null,
  pps: p.charging?.pps ?? null,
  wirelessStandard: p.charging?.wirelessStandard ?? null,
  wirelessMaxW: p.charging?.wirelessMaxW ?? null,
  waterRating: p.waterRating ?? null,
  waterStatus: p.waterStatus ?? null,
  specificationsUrl: p.sources?.specificationsUrl ?? null,
  manualUrl: p.sources?.manualUrl ?? null,
  releaseUrl: p.sources?.releaseUrl ?? null,
  chargingUrl: p.sources?.chargingUrl ?? null,
  wirelessUrl: p.sources?.wirelessUrl ?? null,
  waterUrl: p.sources?.waterUrl ?? null,
});

const filters = {
  release_source_missing: (p) => !isHttps(p.sources?.releaseUrl),
  spec_source_missing: (p) => !isHttps(p.sources?.specificationsUrl),
  manual_source_missing: (p) => !isHttps(p.sources?.manualUrl),
  charging_source_missing: (p) => !isHttps(p.sources?.chargingUrl),
  wireless_source_missing: (p) => {
    const c = p.charging || {};
    const hasWireless = (typeof c.wirelessStandard === 'string' && c.wirelessStandard.trim()) || c.wirelessMaxW != null;
    return Boolean(hasWireless) && !isHttps(p.sources?.wirelessUrl);
  },
  adapter_unknown: (p) => p.included?.adapter === 'unknown',
  cable_unknown: (p) => p.included?.cable === 'unknown',
  wired_max_unknown: (p) => p.charging?.wiredMaxW == null,
  pps_unknown: (p) => p.charging?.pps == null || p.charging?.pps === 'unknown',
  wireless_unknown: (p) => {
    const c = p.charging || {};
    return !(typeof c.wirelessStandard === 'string' && c.wirelessStandard.trim()) && c.wirelessMaxW == null;
  },
  water_unknown: (p) => (p.waterRating == null || p.waterRating === '') && p.waterStatus !== 'not_resistant',
};

const report = {
  version: payload.version,
  updatedAt: payload.updatedAt,
  totalPhones: phones.length,
  counts: {},
  rows: {},
};

for (const [name, filter] of Object.entries(filters)) {
  const matches = phones.filter(filter).map(row);
  report.counts[name] = matches.length;
  report.rows[name] = matches;
}

fs.writeFileSync('phone-quickcheck-quality-gap-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.counts, null, 2));
