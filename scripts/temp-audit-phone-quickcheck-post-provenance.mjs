import fs from 'node:fs';

const dataPath = 'tools/phone-quickcheck/data/phones.json';
const outPath = 'phone-quickcheck-post-provenance-audit.json';
const payload = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const phones = Array.isArray(payload.phones) ? payload.phones : [];

const ids = (fn) => phones.filter(fn).map((p) => p.id);
const has = (v) => v !== undefined && v !== null && v !== '';

const report = {
  generatedAt: new Date().toISOString(),
  totalPhones: phones.length,
  counts: {},
  gaps: {}
};

const gaps = {
  release_source_missing: ids((p) => !has(p.sources?.releaseUrl)),
  spec_source_missing: ids((p) => !has(p.sources?.specificationsUrl)),
  manual_source_missing: ids((p) => !has(p.sources?.manualUrl)),
  charging_source_missing: ids((p) => {
    const c = p.charging || {};
    const hasChargingFact = has(c.wiredRecommendedW) || has(c.wiredMaxW) || (Array.isArray(c.protocols) && c.protocols.length > 0);
    return hasChargingFact && !has(p.sources?.chargingUrl);
  }),
  wireless_source_missing: ids((p) => {
    const c = p.charging || {};
    const hasWirelessFact = has(c.wirelessStandard) || has(c.wirelessMaxW);
    return hasWirelessFact && !has(p.sources?.wirelessUrl);
  }),
  water_source_missing: ids((p) => {
    const hasWaterFact = has(p.waterRating) || has(p.waterStatus);
    return hasWaterFact && !has(p.sources?.waterUrl);
  }),
  adapter_unknown: ids((p) => p.included?.adapter === 'unknown'),
  cable_unknown: ids((p) => p.included?.cable === 'unknown'),
  water_unknown: ids((p) => !has(p.waterRating) && !has(p.waterStatus)),
  wired_max_unknown: ids((p) => !has(p.charging?.wiredMaxW)),
  pps_unknown: ids((p) => p.charging?.pps === 'unknown'),
  wireless_unknown: ids((p) => !has(p.charging?.wirelessStandard) && !has(p.charging?.wirelessMaxW)),
};

report.gaps = gaps;
for (const [key, value] of Object.entries(gaps)) report.counts[key] = value.length;

report.source_link_candidates = {
  charging_missing_but_spec_exists: ids((p) => {
    const c = p.charging || {};
    const hasChargingFact = has(c.wiredRecommendedW) || has(c.wiredMaxW) || (Array.isArray(c.protocols) && c.protocols.length > 0);
    return hasChargingFact && !has(p.sources?.chargingUrl) && has(p.sources?.specificationsUrl);
  }),
  wireless_missing_but_spec_exists: ids((p) => {
    const c = p.charging || {};
    const hasWirelessFact = has(c.wirelessStandard) || has(c.wirelessMaxW);
    return hasWirelessFact && !has(p.sources?.wirelessUrl) && has(p.sources?.specificationsUrl);
  }),
  water_missing_but_spec_exists: ids((p) => {
    const hasWaterFact = has(p.waterRating) || has(p.waterStatus);
    return hasWaterFact && !has(p.sources?.waterUrl) && has(p.sources?.specificationsUrl);
  })
};

fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.counts, null, 2));