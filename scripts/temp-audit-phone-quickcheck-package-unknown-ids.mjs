import fs from 'node:fs';
const payload = JSON.parse(fs.readFileSync('tools/phone-quickcheck/data/phones.json','utf8'));
const phones = Array.isArray(payload.phones) ? payload.phones : [];
const compact = (p) => ({id:p.id, manufacturer:p.manufacturer, model:p.model, specificationsUrl:p.sources?.specificationsUrl ?? null});
const report = {
  adapter_unknown: phones.filter((p) => p.included?.adapter === 'unknown').map(compact),
  cable_unknown: phones.filter((p) => p.included?.cable === 'unknown').map(compact)
};
fs.writeFileSync('phone-quickcheck-package-unknown-ids.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({adapter_unknown: report.adapter_unknown.length, cable_unknown: report.cable_unknown.length}));
