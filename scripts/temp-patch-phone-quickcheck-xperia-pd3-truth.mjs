import fs from 'node:fs';

const path = 'tools/phone-quickcheck/data/phones.json';
const payload = JSON.parse(fs.readFileSync(path, 'utf8'));
const phones = Array.isArray(payload.phones) ? payload.phones : [];

const targets = [
  {
    id: 'sony-xperia-5-ii',
    specificationsUrl: 'https://www.sony.jp/xperia/xperia/xperia5m2/spec_docomo.html',
    chargingUrl: 'https://www.docomo.ne.jp/support/product/so52a/spec.html'
  },
  {
    id: 'sony-xperia-10-iii',
    specificationsUrl: 'https://www.sony.jp/xperia/xperia/xperia10m3/spec_docomo.html',
    chargingUrl: 'https://www.docomo.ne.jp/support/product/so52b/spec.html'
  }
];

for (const target of targets) {
  const phone = phones.find((item) => item?.id === target.id);
  if (!phone) throw new Error(`${target.id}: record not found`);
  if (phone.sources?.specificationsUrl !== target.specificationsUrl) {
    throw new Error(`${target.id}: unexpected specificationsUrl ${phone.sources?.specificationsUrl}`);
  }
  if (!Array.isArray(phone.charging?.protocols) || phone.charging.protocols.length !== 0) {
    throw new Error(`${target.id}: expected empty protocols, got ${JSON.stringify(phone.charging?.protocols)}`);
  }
  if (phone.charging?.pps !== 'unknown') {
    throw new Error(`${target.id}: expected pps=unknown, got ${phone.charging?.pps}`);
  }
  if (phone.sources?.chargingUrl !== undefined && phone.sources?.chargingUrl !== null) {
    throw new Error(`${target.id}: chargingUrl already exists: ${phone.sources.chargingUrl}`);
  }

  phone.charging.protocols = ['USB PD 3.0'];
  phone.sources.chargingUrl = target.chargingUrl;
  phone.sources.verifiedAt = '2026-09-16';
}

fs.writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Patched ${targets.length} exact DOCOMO Xperia records with primary-source USB PD 3.0 provenance; PPS remains unknown.`);
