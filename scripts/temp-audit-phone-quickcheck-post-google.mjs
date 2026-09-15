import fs from 'node:fs';

const payload = JSON.parse(fs.readFileSync('tools/phone-quickcheck/data/phones.json', 'utf8'));
const phones = Array.isArray(payload.phones) ? payload.phones : [];
const has = (v) => v !== undefined && v !== null && v !== '';
const ids = (fn) => phones.filter(fn).map((p) => p.id);

const gaps = {
  release_source_missing: ids((p) => !has(p.sources?.releaseUrl)),
  spec_source_missing: ids((p) => !has(p.sources?.specificationsUrl)),
  manual_source_missing: ids((p) => !has(p.sources?.manualUrl)),
  charging_source_missing: ids((p) => {
    const c = p.charging || {};
    const hasFact = has(c.wiredRecommendedW) || has(c.wiredMaxW) || (Array.isArray(c.protocols) && c.protocols.length > 0);
    return hasFact && !has(p.sources?.chargingUrl);
  }),
  wireless_source_missing: ids((p) => {
    const c = p.charging || {};
    const hasFact = has(c.wirelessStandard) || has(c.wirelessMaxW);
    return hasFact && !has(p.sources?.wirelessUrl);
  }),
  water_source_missing: ids((p) => (has(p.waterRating) || has(p.waterStatus)) && !has(p.sources?.waterUrl)),
  adapter_unknown: ids((p) => p.included?.adapter === 'unknown'),
  cable_unknown: ids((p) => p.included?.cable === 'unknown'),
  water_unknown: ids((p) => !has(p.waterRating) && !has(p.waterStatus)),
  wired_max_unknown: ids((p) => !has(p.charging?.wiredMaxW)),
  pps_unknown: ids((p) => p.charging?.pps === 'unknown'),
  wireless_unknown: ids((p) => !has(p.charging?.wirelessStandard) && !has(p.charging?.wirelessMaxW))
};

const report = { generatedAt: new Date().toISOString(), totalPhones: phones.length, counts: {}, gaps };
for (const [k, v] of Object.entries(gaps)) report.counts[k] = v.length;
fs.writeFileSync('phone-quickcheck-post-google-audit.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.counts, null, 2));