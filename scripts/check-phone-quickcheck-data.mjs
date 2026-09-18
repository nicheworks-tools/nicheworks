import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phonesPath = path.join(root, 'tools/phone-quickcheck/data/phones.json');
const accessoriesPath = path.join(root, 'tools/phone-quickcheck/data/accessories.json');
const failures = [];
const fail = (message) => failures.push(message);
const isHttps = (value) => typeof value === 'string' && /^https:\/\//i.test(value);
const finitePositive = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

const phonePayload = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
const accessoryPayload = JSON.parse(fs.readFileSync(accessoriesPath, 'utf8'));
const phones = Array.isArray(phonePayload.phones) ? phonePayload.phones : [];
const accessories = Array.isArray(accessoryPayload.accessories) ? accessoryPayload.accessories : [];

if (phones.length < 181) fail(`expected at least 181 phones, got ${phones.length}`);
if (!/^2026-\d{2}-\d{2}$/.test(String(phonePayload.updatedAt || ''))) fail('phones updatedAt must be a 2026 ISO date');

const ids = new Set();
const identities = new Set();
for (const phone of phones) {
  const label = phone?.id || phone?.model || '<unknown>';
  if (!phone || typeof phone !== 'object') { fail('phone record must be an object'); continue; }
  if (!phone.id || typeof phone.id !== 'string') fail(`${label}: missing id`);
  else if (ids.has(phone.id)) fail(`${label}: duplicate id`);
  else ids.add(phone.id);

  if (!phone.manufacturer || !phone.model) fail(`${label}: manufacturer/model required`);
  const identity = `${String(phone.manufacturer).toLowerCase()}::${String(phone.model).toLowerCase()}`;
  if (identities.has(identity)) fail(`${label}: duplicate manufacturer/model identity`);
  identities.add(identity);

  if (!Array.isArray(phone.aliases)) fail(`${label}: aliases must be an array`);
  if (phone.market !== undefined && (!Array.isArray(phone.market) || !phone.market.includes('JP'))) fail(`${label}: maintained market must include JP when present`);
  if (!Number.isInteger(Number(phone.releaseYear)) || Number(phone.releaseYear) < 2018 || Number(phone.releaseYear) > 2026) fail(`${label}: invalid releaseYear`);

  const isFoldable = phone.formFactor === 'foldable';
  if (phone.formFactor !== undefined && phone.formFactor !== 'foldable') fail(`${label}: unsupported formFactor`);
  const dimensionSets = isFoldable
    ? [['dimensionsFolded', phone.dimensionsFolded], ['dimensionsUnfolded', phone.dimensionsUnfolded]]
    : [['dimensions', phone.dimensions]];
  for (const [dimensionLabel, d] of dimensionSets) {
    for (const key of ['heightMm', 'widthMm']) {
      if (!finitePositive(d?.[key])) fail(`${label}: invalid ${dimensionLabel}.${key}`);
    }
    const hasDepth = d?.depthMm !== undefined && d?.depthMm !== null;
    const hasDepthMin = d?.depthMmMin !== undefined && d?.depthMmMin !== null;
    const hasDepthMax = d?.depthMmMax !== undefined && d?.depthMmMax !== null;
    const hasDepthRange = hasDepthMin || hasDepthMax;
    if (hasDepth && hasDepthRange) {
      fail(`${label}: ${dimensionLabel} must not mix depthMm with depthMmMin/depthMmMax`);
    } else if (hasDepth) {
      if (!finitePositive(d.depthMm)) fail(`${label}: invalid ${dimensionLabel}.depthMm`);
    } else if (hasDepthRange) {
      if (!isFoldable) fail(`${label}: depth ranges are only supported for foldable dimensions`);
      if (!finitePositive(d?.depthMmMin) || !finitePositive(d?.depthMmMax)) {
        fail(`${label}: ${dimensionLabel} depth range requires positive depthMmMin and depthMmMax`);
      } else if (Number(d.depthMmMin) > Number(d.depthMmMax)) {
        fail(`${label}: ${dimensionLabel}.depthMmMin must be <= depthMmMax`);
      }
    } else {
      fail(`${label}: ${dimensionLabel} requires depthMm or depthMmMin/depthMmMax`);
    }
  }
  if (isFoldable && phone.dimensions !== undefined) fail(`${label}: foldable records must use dimensionsFolded/dimensionsUnfolded, not dimensions`);
  if (!finitePositive(phone.weightG)) fail(`${label}: invalid weightG`);
  if (phone.displayInch !== null && phone.displayInch !== undefined && !finitePositive(phone.displayInch)) fail(`${label}: invalid displayInch`);
  if (phone.waterRating !== null && phone.waterRating !== undefined && (typeof phone.waterRating !== 'string' || !phone.waterRating.trim())) fail(`${label}: invalid waterRating`);
  if (phone.waterStatus !== null && phone.waterStatus !== undefined && phone.waterStatus !== 'not_resistant') fail(`${label}: unsupported waterStatus`);
  if (phone.waterStatus === 'not_resistant' && phone.waterRating !== null && phone.waterRating !== undefined && phone.waterRating !== '') fail(`${label}: not_resistant must not carry waterRating`);

  const charging = phone.charging || {};
  if (!charging.connector || typeof charging.connector !== 'string') fail(`${label}: charging.connector required`);
  for (const key of ['wiredRecommendedW', 'wiredMaxW', 'wirelessMaxW']) {
    if (charging[key] !== null && charging[key] !== undefined && !finitePositive(charging[key])) fail(`${label}: invalid charging.${key}`);
  }
  if (charging.protocols !== undefined && !Array.isArray(charging.protocols)) fail(`${label}: charging.protocols must be an array`);

  const battery = charging.battery || {};
  if (String(phone.manufacturer).toLowerCase() === 'apple' && battery.capacityMah !== null && battery.capacityMah !== undefined) {
    fail(`${label}: Apple mAh must remain unknown unless policy is explicitly revised`);
  }
  if (battery.capacityMah !== null && battery.capacityMah !== undefined) {
    if (!finitePositive(battery.capacityMah)) fail(`${label}: invalid battery capacityMah`);
    if (!['official', 'manufacturer', 'third_party_reference'].includes(String(battery.valueClass || ''))) fail(`${label}: unsupported battery valueClass`);
    if (!isHttps(battery.sourceRef)) fail(`${label}: accepted battery value requires HTTPS sourceRef`);
  }

  const sources = phone.sources || {};
  if (sources.waterUrl !== null && sources.waterUrl !== undefined && !isHttps(sources.waterUrl)) fail(`${label}: waterUrl must be HTTPS when present`);
  if (phone.waterStatus === 'not_resistant' && !isHttps(sources.waterUrl)) fail(`${label}: not_resistant requires HTTPS sources.waterUrl`);
  if (!isHttps(sources.specificationsUrl)) fail(`${label}: HTTPS specificationsUrl required`);
  if (!isHttps(sources.manualUrl)) fail(`${label}: HTTPS manualUrl required`);
  if (sources.releaseUrl !== undefined && sources.releaseUrl !== null && !isHttps(sources.releaseUrl)) fail(`${label}: releaseUrl must be HTTPS when present`);
  if (!/^2026-\d{2}-\d{2}$/.test(String(sources.verifiedAt || ''))) fail(`${label}: verifiedAt must be a 2026 ISO date`);
}

const accessoryKeys = new Set();
for (const item of accessories) {
  if (!item?.key) { fail('accessory missing key'); continue; }
  if (accessoryKeys.has(item.key)) fail(`duplicate accessory key: ${item.key}`);
  accessoryKeys.add(item.key);
  if (!item.labelJa || !item.labelEn) fail(`${item.key}: bilingual labels required`);
}

for (const phone of phones) {
  for (const key of Array.isArray(phone.affiliateKeys) ? phone.affiliateKeys : []) {
    if (!accessoryKeys.has(key)) fail(`${phone.id}: unknown affiliateKey ${key}`);
  }
}

if (!accessoryKeys.has('cable-usbc-usbc')) fail('USB-C cable accessory missing');
if (!accessoryKeys.has('cable-usbc-lightning')) fail('USB-C to Lightning cable accessory missing');

if (failures.length) {
  console.error(`Phone QuickCheck data contract failed (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

const makers = [...new Set(phones.map((phone) => phone.manufacturer))].sort();
console.log(`Phone QuickCheck data contract passed: ${phones.length} phones, ${accessories.length} accessories, ${makers.length} manufacturers (${makers.join(', ')}).`);
