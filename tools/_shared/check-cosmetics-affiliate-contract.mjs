import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const config = read('tools/_shared/cosmetics-affiliate-config.js');
const adapter = read('tools/_shared/cosmetics-affiliate-slot.js');
const lite = read('tools/cosmetic-ingredient-checker-lite/index.html');
const fast = read('tools/inci-fastscan/index.html');

check(config.includes('enabled: false'), 'affiliate config must stay disabled before activation');
check(config.includes('associateTag: ""'), 'associate tag must be empty before activation');
check(!/https?:\/\/[^"']*amazon\./i.test(config), 'config must not contain live Amazon URLs before activation');
check(config.includes('"cosmetic-ingredient-checker-lite"'), 'Lite slot config missing');
check(config.includes('"inci-fastscan"'), 'FastScan slot config missing');

for (const [name, html, placement] of [
  ['Lite', lite, 'after-summary'],
  ['FastScan', fast, 'after-results']
]) {
  check(html.includes('id="amazonAffiliateSlot"'), `${name}: stable amazonAffiliateSlot missing`);
  check(html.includes(`data-affiliate-placement="${placement}"`), `${name}: stable placement missing`);
  check(html.includes('data-affiliate-state="inactive"'), `${name}: slot must default inactive`);
  check(html.includes('/tools/_shared/cosmetics-affiliate-slot.css'), `${name}: shared affiliate CSS missing`);
  check(html.includes('/tools/_shared/cosmetics-affiliate-config.js'), `${name}: shared affiliate config missing`);
  check(html.includes('/tools/_shared/cosmetics-affiliate-slot.js'), `${name}: shared affiliate adapter missing`);
}

for (const eventName of ['affiliate_impression', 'affiliate_click']) {
  check(adapter.includes(eventName), `adapter missing event ${eventName}`);
}

for (const safeKey of ['tool', 'provider', 'placement', 'link_key']) {
  check(adapter.includes(safeKey), `adapter missing generic metadata ${safeKey}`);
}

for (const forbidden of ['inciInput', 'fast-input', 'jb-input', 'ocr-file', 'ingredients', 'analysis', 'filename']) {
  check(!adapter.includes(forbidden), `adapter must not reference raw user-data surface: ${forbidden}`);
}

if (failures.length) {
  console.error(`Cosmetics affiliate contract check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Cosmetics affiliate contract check passed');
