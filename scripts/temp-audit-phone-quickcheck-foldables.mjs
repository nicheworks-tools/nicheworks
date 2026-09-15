import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('tools/phone-quickcheck/data/phones.json', 'utf8'));
const foldables = data.phones.filter((phone) => phone.formFactor === 'foldable');

const normalize = (value) => value === undefined ? null : value;

const rows = foldables.map((phone) => {
  const charging = phone.charging || {};
  const included = phone.included || {};
  const sources = phone.sources || {};
  const gaps = [];

  if (!(typeof phone.waterRating === 'string' && phone.waterRating.trim()) && phone.waterStatus !== 'not_resistant') gaps.push('water_unknown');
  if (included.cable === undefined || included.cable === null || included.cable === 'unknown') gaps.push('cable_unknown');
  if (included.adapter === undefined || included.adapter === null || included.adapter === 'unknown') gaps.push('adapter_unknown');
  if (charging.wiredRecommendedW === undefined || charging.wiredRecommendedW === null) gaps.push('wired_guidance_unknown');
  if (charging.wiredMaxW === undefined || charging.wiredMaxW === null) gaps.push('wired_max_unknown');
  if (!Array.isArray(charging.protocols) || charging.protocols.length === 0) gaps.push('protocols_unknown');
  if (charging.pps === undefined || charging.pps === null || charging.pps === 'unknown') gaps.push('pps_unknown');
  if (!charging.wirelessStandard && (charging.wirelessMaxW === undefined || charging.wirelessMaxW === null)) gaps.push('wireless_unknown');
  if (!sources.releaseUrl) gaps.push('release_source_missing');
  if (!sources.chargingUrl) gaps.push('charging_source_missing');
  if (!sources.wirelessUrl && (charging.wirelessStandard || charging.wirelessMaxW)) gaps.push('wireless_source_missing');

  return {
    id: phone.id,
    manufacturer: phone.manufacturer,
    model: phone.model,
    releaseYear: phone.releaseYear,
    waterRating: normalize(phone.waterRating),
    waterStatus: normalize(phone.waterStatus),
    cable: normalize(included.cable),
    adapter: normalize(included.adapter),
    wiredRecommendedW: normalize(charging.wiredRecommendedW),
    wiredMaxW: normalize(charging.wiredMaxW),
    protocols: normalize(charging.protocols),
    pps: normalize(charging.pps),
    wirelessStandard: normalize(charging.wirelessStandard),
    wirelessMaxW: normalize(charging.wirelessMaxW),
    specificationsUrl: normalize(sources.specificationsUrl),
    manualUrl: normalize(sources.manualUrl),
    releaseUrl: normalize(sources.releaseUrl),
    chargingUrl: normalize(sources.chargingUrl),
    wirelessUrl: normalize(sources.wirelessUrl),
    waterUrl: normalize(sources.waterUrl),
    gaps
  };
});

console.log(`PHONE_QUICKCHECK_FOLDABLE_AUDIT count=${rows.length} dataset=${data.phones.length} version=${data.version}`);
for (const row of rows) console.log(JSON.stringify(row));
const gapRows = rows.filter((row) => row.gaps.length);
console.log(`PHONE_QUICKCHECK_FOLDABLE_GAPS rows=${gapRows.length}`);
const counts = {};
for (const row of gapRows) for (const gap of row.gaps) counts[gap] = (counts[gap] || 0) + 1;
console.log(`PHONE_QUICKCHECK_FOLDABLE_GAP_COUNTS ${JSON.stringify(counts)}`);
