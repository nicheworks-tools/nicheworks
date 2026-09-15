import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('tools/phone-quickcheck/data/phones.json', 'utf8'));
const rows = data.phones.map((phone) => {
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
  if (!sources.specificationsUrl) gaps.push('spec_source_missing');
  if (!sources.manualUrl) gaps.push('manual_source_missing');
  if (!sources.releaseUrl) gaps.push('release_source_missing');
  if (!sources.chargingUrl && (charging.wiredRecommendedW || charging.wiredMaxW || (Array.isArray(charging.protocols) && charging.protocols.length))) gaps.push('charging_source_missing');
  if (!sources.wirelessUrl && (charging.wirelessStandard || charging.wirelessMaxW)) gaps.push('wireless_source_missing');
  return { id: phone.id, manufacturer: phone.manufacturer, model: phone.model, formFactor: phone.formFactor || 'standard', gaps };
});

console.log(`PHONE_QUICKCHECK_ALL_AUDIT dataset=${rows.length} version=${data.version} updatedAt=${data.updatedAt}`);
const counts = {};
for (const row of rows) for (const gap of row.gaps) counts[gap] = (counts[gap] || 0) + 1;
console.log(`PHONE_QUICKCHECK_ALL_GAP_COUNTS ${JSON.stringify(counts)}`);

const priority = [
  'release_source_missing',
  'spec_source_missing',
  'manual_source_missing',
  'charging_source_missing',
  'wireless_source_missing',
  'cable_unknown',
  'adapter_unknown',
  'water_unknown',
  'protocols_unknown',
  'wired_max_unknown',
  'wired_guidance_unknown',
  'pps_unknown',
  'wireless_unknown'
];
for (const gap of priority) {
  const matched = rows.filter((row) => row.gaps.includes(gap));
  console.log(`GAP ${gap} count=${matched.length}`);
  for (const row of matched) console.log(`  ${row.id}\t${row.manufacturer}\t${row.model}\t${row.formFactor}`);
}
