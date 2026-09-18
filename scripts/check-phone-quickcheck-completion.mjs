import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const payload = JSON.parse(fs.readFileSync(path.join(root, 'tools/phone-quickcheck/data/phones.json'), 'utf8'));
const phones = Array.isArray(payload.phones) ? payload.phones : [];
const failures = [];
const fail = (message) => failures.push(message);

const expected = {
  phoneCount: 181,
  foldableCount: 32,
  manufacturers: ['Apple', 'Google', 'Motorola', 'OPPO', 'SHARP', 'Samsung', 'Sony', 'Xiaomi', 'ZTE'],
  adapterUnknown: [
    'sony-xperia-1-vi',
    'sony-xperia-10-v',
    'sony-xperia-10-vi',
    'sony-xperia-5-v'
  ],
  cableUnknown: [
    'samsung-galaxy-a36-5g',
    'sharp-aquos-r5g',
    'sharp-aquos-r6',
    'sharp-aquos-sense5g',
    'sharp-aquos-zero5g-basic',
    'sony-xperia-1-v',
    'sony-xperia-1-vi',
    'sony-xperia-10-iv',
    'sony-xperia-10-v',
    'sony-xperia-10-vi',
    'sony-xperia-5-v'
  ],
  waterUnresolved: [
    'google-pixel-4a',
    'google-pixel-4a-5g',
    'oppo-a54-5g',
  ],
  appleBatteryUnknownCount: 33
};

const sort = (values) => [...values].sort();
const same = (a, b) => JSON.stringify(sort(a)) === JSON.stringify(sort(b));
const idsWhere = (predicate) => phones.filter(predicate).map((phone) => phone.id);

if (phones.length !== expected.phoneCount) fail(`phone count drift: expected ${expected.phoneCount}, got ${phones.length}`);

const manufacturers = sort(new Set(phones.map((phone) => phone.manufacturer)));
if (!same(manufacturers, expected.manufacturers)) {
  fail(`manufacturer set drift: expected ${expected.manufacturers.join(', ')}, got ${manufacturers.join(', ')}`);
}

const foldableCount = phones.filter((phone) => phone.formFactor === 'foldable').length;
if (foldableCount !== expected.foldableCount) fail(`foldable count drift: expected ${expected.foldableCount}, got ${foldableCount}`);

const adapterUnknown = idsWhere((phone) => phone.included?.adapter === 'unknown' || phone.included?.adapter == null);
const cableUnknown = idsWhere((phone) => phone.included?.cable === 'unknown' || phone.included?.cable == null);
const waterUnresolved = idsWhere((phone) => phone.waterRating == null && phone.waterStatus !== 'not_resistant');

if (!same(adapterUnknown, expected.adapterUnknown)) {
  fail(`adapter unknown backlog drift: expected [${sort(expected.adapterUnknown).join(', ')}], got [${sort(adapterUnknown).join(', ')}]`);
}
if (!same(cableUnknown, expected.cableUnknown)) {
  fail(`cable unknown backlog drift: expected [${sort(expected.cableUnknown).join(', ')}], got [${sort(cableUnknown).join(', ')}]`);
}
if (!same(waterUnresolved, expected.waterUnresolved)) {
  fail(`water unresolved backlog drift: expected [${sort(expected.waterUnresolved).join(', ')}], got [${sort(waterUnresolved).join(', ')}]`);
}

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
  console.error(`Phone QuickCheck completion baseline failed (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log([
  'Phone QuickCheck completion baseline passed:',
  `${phones.length} phones`,
  `${foldableCount} foldables`,
  `package unknown ${adapterUnknown.length} adapter / ${cableUnknown.length} cable`,
  `water unresolved ${waterUnresolved.length}`,
  `intentional Apple battery unknown ${batteryUnknown.length}`,
  `evidence-sensitive missing guidance/max/PPS/wireless ${chargerGuidanceMissing}/${wiredMaxMissing}/${ppsUnknown}/${wirelessMissing}`
].join(' '));
