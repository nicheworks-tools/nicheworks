import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const config = read('tools/_shared/cosmetics-affiliate-config.js');
const adapter = read('tools/_shared/cosmetics-affiliate-slot.js');
const parser = read('tools/_shared/cosmetic-ingredient-parser.js');
const lite = read('tools/cosmetic-ingredient-checker-lite/index.html');
const fast = read('tools/inci-fastscan/index.html');

check(config.includes('enabled: true'), 'affiliate config must be active after verified Special Link activation');
check(config.includes('trackingMode: "special_link"'), 'activation must use explicit special_link tracking mode');
check(config.includes('associateTag: ""'), 'do not invent a separate Associate tag for a supplied Special Link');
check(config.includes('href: "https://amzn.to/4xNbcDO"'), 'verified cosmetics Special Link missing');
check(config.includes('verifiedAt: "2026-09-13"'), 'verified Special Link date missing');
check(config.includes('labelJa: "Amazonでスキンケアを探す [PR]"'), 'Japanese neutral Amazon CTA missing');
check(config.includes('labelEn: "Find skincare on Amazon [PR]"'), 'English neutral Amazon CTA missing');
check(config.includes('Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。'), 'required Japanese Amazon Associates disclosure missing');
check(config.includes('As an Amazon Associate, NicheWorks earns from qualifying purchases.'), 'English Amazon Associates disclosure missing');
check(config.includes('"cosmetic-ingredient-checker-lite"'), 'Lite slot config missing');
check(config.includes('"inci-fastscan"'), 'FastScan slot config missing');
check((config.match(/links: Object\.freeze\(\[skincareSearch\]\)/g) || []).length === 2, 'verified skincare Special Link must be mapped to both cosmetics slots');

for (const [name, html, placement] of [
  ['Lite', lite, 'after-summary'],
  ['FastScan', fast, 'after-results']
]) {
  check(html.includes('id="amazonAffiliateSlot"'), `${name}: stable amazonAffiliateSlot missing`);
  check(html.includes(`data-affiliate-placement="${placement}"`), `${name}: stable placement missing`);
  check(html.includes('data-affiliate-state="inactive"'), `${name}: HTML slot must remain fail-closed before runtime activation`);
}

for (const asset of [
  '/tools/_shared/cosmetics-affiliate-slot.css',
  '/tools/_shared/cosmetics-affiliate-config.js',
  '/tools/_shared/cosmetics-affiliate-slot.js'
]) {
  check(parser.includes(asset), `shared cosmetics runtime must bootstrap ${asset}`);
}
check(parser.includes('getElementById("amazonAffiliateSlot")'), 'affiliate runtime must only bootstrap when a slot exists');

check(adapter.includes('config.trackingMode === "special_link"'), 'adapter must explicitly support supplied Special Links without a fabricated tag');
check(adapter.includes('host === "amzn.to"'), 'adapter must allowlist amzn.to');
check(adapter.includes('host === "amazon.co.jp"'), 'adapter must allowlist amazon.co.jp');
check(adapter.includes('host.endsWith(".amazon.co.jp")'), 'adapter must allowlist Amazon Japan subdomains');
check(adapter.includes('url.protocol !== "https:"'), 'adapter must reject non-HTTPS affiliate URLs');
check(adapter.includes('rel = "sponsored noopener noreferrer"'), 'affiliate link sponsored/noopener/noreferrer semantics missing');

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
