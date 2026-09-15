import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const payload = JSON.parse(fs.readFileSync(path.join(root, 'tools/phone-quickcheck/data/phones.json'), 'utf8'));
const phones = Array.isArray(payload.phones) ? payload.phones : [];
const failures = [];
const fail = (message) => failures.push(message);

const trustedSourceDomains = {
  Apple: ['apple.com'],
  Google: ['google.com', 'google'],
  Samsung: ['samsung.com'],
  Sony: ['sony.jp', 'sony.com'],
  SHARP: ['sharp.co.jp', 'jp.sharp'],
  OPPO: ['oppo.com'],
  Xiaomi: ['mi.com'],
  Motorola: ['motorola.com', 'motorola.co.jp'],
  ZTE: ['nubia.com', 'ymobile.jp']
};

function hostnameOf(value) {
  try { return new URL(value).hostname.toLowerCase(); }
  catch { return ''; }
}

function hostAllowed(host, suffixes) {
  return suffixes.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

function assertTrustedUrl(phone, label, value) {
  if (value === undefined || value === null || value === '') return;
  const host = hostnameOf(value);
  const allowed = trustedSourceDomains[phone.manufacturer] || [];
  if (!host || !hostAllowed(host, allowed)) {
    fail(`${phone.id}: ${label} host ${host || '<invalid>'} is outside trusted ${phone.manufacturer} primary-source domains`);
  }
}

for (const phone of phones) {
  if (!trustedSourceDomains[phone.manufacturer]) {
    fail(`${phone.id}: unsupported manufacturer for primary-source audit: ${phone.manufacturer}`);
    continue;
  }

  const sources = phone.sources || {};
  for (const key of ['specificationsUrl', 'manualUrl', 'releaseUrl', 'chargingUrl', 'wirelessUrl', 'waterUrl']) {
    assertTrustedUrl(phone, `sources.${key}`, sources[key]);
  }

  const charging = phone.charging || {};
  const battery = charging.battery || {};
  assertTrustedUrl(phone, 'charging.battery.sourceRef', battery.sourceRef);

  const protocols = Array.isArray(charging.protocols)
    ? charging.protocols.map((value) => String(value).toLowerCase())
    : [];
  if (charging.pps === 'required' && !protocols.some((value) => value.includes('pps'))) {
    fail(`${phone.id}: pps=required requires an explicit PPS protocol label`);
  }

  const hasWirelessStandard = typeof charging.wirelessStandard === 'string' && charging.wirelessStandard.trim() !== '';
  const hasWirelessWattage = charging.wirelessMaxW !== null && charging.wirelessMaxW !== undefined;
  if (hasWirelessWattage && !hasWirelessStandard) {
    fail(`${phone.id}: wirelessMaxW requires wirelessStandard`);
  }

  if (String(charging.connector || '').toLowerCase() === 'lightning' && phone.manufacturer !== 'Apple') {
    fail(`${phone.id}: Lightning connector is only expected on maintained Apple records`);
  }
}

if (failures.length) {
  console.error(`Phone QuickCheck source/semantic audit failed (${failures.length})`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`Phone QuickCheck source/semantic audit passed: ${phones.length} phones, trusted manufacturer/carrier primary sources, charging semantics consistent.`);
