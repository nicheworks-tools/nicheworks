import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phonesPayload = JSON.parse(fs.readFileSync(path.join(root, 'tools/phone-quickcheck/data/phones.json'), 'utf8'));
const reviewedPayload = JSON.parse(fs.readFileSync(path.join(root, 'tools/phone-quickcheck/data/reviewed-unknowns.json'), 'utf8'));
const phones = Array.isArray(phonesPayload.phones) ? phonesPayload.phones : [];
const reviewed = Array.isArray(reviewedPayload.entries) ? reviewedPayload.entries : [];
const failures = [];
const fail = (message) => failures.push(message);

const expected = {
  phoneCount: 204,
  foldableCount: 36,
  manufacturers: ['Apple', 'Google', 'Motorola', 'OPPO', 'SHARP', 'Samsung', 'Sony', 'Xiaomi', 'ZTE'],
  appleBatteryUnknownCount: 34
};

const sort = (values) => [...values].sort();
const same = (a, b) => JSON.stringify(sort(a)) === JSON.stringify(sort(b));
const isHttps = (value) => typeof value === 'string' && /^https:\/\//i.test(value);
const phoneById = new Map(phones.map((phone) => [phone.id, phone]));

if (phones.length !== expected.phoneCount) fail(`phone count drift: expected ${expected.phoneCount}, got ${phones.length}`);

const manufacturers = sort(new Set(phones.map((phone) => phone.manufacturer)));
if (!same(manufacturers, expected.manufacturers)) {
  fail(`manufacturer set drift: expected ${expected.manufacturers.join(', ')}, got ${manufacturers.join(', ')}`);
}

const foldableCount = phones.filter((phone) => phone.formFactor === 'foldable').length;
if (foldableCount !== expected.foldableCount) fail(`foldable count drift: expected ${expected.foldableCount}, got ${foldableCount}`);

const actionableUnknownKeys = [];
for (const phone of phones) {
  if (phone.included?.adapter === 'unknown' || phone.included?.adapter == null) actionableUnknownKeys.push(`${phone.id}:included.adapter`);
  if (phone.included?.cable === 'unknown' || phone.included?.cable == null) actionableUnknownKeys.push(`${phone.id}:included.cable`);
  if (phone.waterRating == null && phone.waterStatus !== 'not_resistant') actionableUnknownKeys.push(`${phone.id}:water`);
}

const reviewedKeys = [];
const seenReviewed = new Set();
for (const entry of reviewed) {
  const key = `${entry?.phoneId || ''}:${entry?.field || ''}`;
  if (!entry || typeof entry !== 'object') { fail('reviewed unknown entry must be an object'); continue; }
  if (!phoneById.has(entry.phoneId)) fail(`${key}: phoneId does not exist in canonical dataset`);
  if (!['included.adapter', 'included.cable', 'water'].includes(entry.field)) fail(`${key}: unsupported reviewed field`);
  if (entry.status !== 'reviewed_unresolved') fail(`${key}: status must be reviewed_unresolved`);
  if (!entry.reasonCode || !entry.reason) fail(`${key}: reasonCode and reason are required`);
  if (!/^2026-\d{2}-\d{2}$/.test(String(entry.reviewedAt || ''))) fail(`${key}: reviewedAt must be a 2026 ISO date`);
  if (!Array.isArray(entry.evidenceUrls) || entry.evidenceUrls.length === 0 || entry.evidenceUrls.some((url) => !isHttps(url))) {
    fail(`${key}: at least one HTTPS evidence URL is required`);
  }
  if (seenReviewed.has(key)) fail(`${key}: duplicate reviewed unknown entry`);
  seenReviewed.add(key);
  reviewedKeys.push(key);
}

if (!same(actionableUnknownKeys, reviewedKeys)) {
  const actual = new Set(actionableUnknownKeys);
  const recorded = new Set(reviewedKeys);
  const unreviewed = sort(actionableUnknownKeys.filter((key) => !recorded.has(key)));
  const stale = sort(reviewedKeys.filter((key) => !actual.has(key)));
  if (unreviewed.length) fail(`unreviewed actionable unknowns: ${unreviewed.join(', ')}`);
  if (stale.length) fail(`stale reviewed-unknown entries: ${stale.join(', ')}`);
}

const packageUnknown = actionableUnknownKeys.filter((key) => key.includes(':included.'));
const waterUnknown = actionableUnknownKeys.filter((key) => key.endsWith(':water'));

const batteryUnknown = phones.filter((phone) => phone.charging?.battery?.capacityMah == null);
const nonAppleBatteryUnknown = batteryUnknown.filter((phone) => phone.manufacturer !== 'Apple');
if (nonAppleBatteryUnknown.length) {
  fail(`non-Apple battery unknowns require review: ${nonAppleBatteryUnknown.map((phone) => phone.id).join(', ')}`);
}
if (batteryUnknown.length !== expected.appleBatteryUnknownCount) {
  fail(`Apple battery unknown baseline drift: expected ${expected.appleBatteryUnknownCount}, got ${batteryUnknown.length}`);
}

const chargerGuidanceMissing = phones.filter((phone) => phone.charging?.wiredRecommendedW == null).length;
const wiredMaxMissing = phones.filter((phone) => phone.charging?.wiredMaxW == null).length;
const ppsUnknown = phones.filter((phone) => phone.charging?.pps == null || phone.charging?.pps === 'unknown').length;
const wirelessMissing = phones.filter((phone) => phone.charging?.wirelessStandard == null).length;

if (failures.length) {
  console.error(`Phone QuickCheck completion audit failed (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log([
  'Phone QuickCheck completion audit passed:',
  `${phones.length} phones`,
  `${foldableCount} foldables`,
  `reviewed package unknown fields ${packageUnknown.length}`,
  `reviewed water unknowns ${waterUnknown.length}`,
  'unreviewed package/water unknowns 0',
  `intentional Apple battery unknown ${batteryUnknown.length}`,
  `evidence-sensitive missing guidance/max/PPS/wireless ${chargerGuidanceMissing}/${wiredMaxMissing}/${ppsUnknown}/${wirelessMissing}`
].join(' '));
