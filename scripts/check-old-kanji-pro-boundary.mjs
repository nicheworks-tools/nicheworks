import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const cluster = [
  'old-kanji-reference',
  'kanji-modernizer',
  'old-kanji-ocr-scanner',
  'old-document-kanji-highlighter',
  'unicode-kanji-checker',
  'variant-kanji-compare',
  'place-old-kanji-checker',
  'name-old-kanji-checker'
];

const entitlement = read('assets/nw-pro-entitlement.js');
check(entitlement.includes('normalizeBillingUnavailableProUi'), 'shared entitlement asset must normalize billing-unavailable Pro UI');
check(entitlement.includes("'課金未接続'"), 'shared Pro boundary must render Japanese billing-unavailable copy');
check(entitlement.includes("'Billing unavailable'"), 'shared Pro boundary must render English billing-unavailable copy');
check(entitlement.includes("'Pro は現在利用できません'"), 'shared Pro boundary must render Japanese unavailable CTA');
check(entitlement.includes("'Pro currently unavailable'"), 'shared Pro boundary must render English unavailable CTA');
check(entitlement.includes("button.disabled = true"), 'billing-unavailable Pro boundary must disable buttons');
check(entitlement.includes(".replace(/は Pro 機能です/g, 'は Pro 予定です')"), 'Japanese feature copy must be normalized to planned Pro language');
check(entitlement.includes(".replace(/ are Pro features/g, ' are planned for Pro')"), 'English feature copy must be normalized to planned Pro language');
check(entitlement.includes('現在は利用できません'), 'Japanese availability copy must state that planned Pro features are not currently available');
check(entitlement.includes('not currently available'), 'English availability copy must state that planned Pro features are not currently available');

for (const slug of cluster) {
  const html = read(`tools/${slug}/index.html`);
  if (slug === 'kanji-modernizer') {
    check(!html.includes('okj-pro-panel'), 'kanji-modernizer: no purchasable Pro panel should be introduced while billing is unavailable');
    check(!html.includes('$4.99'), 'kanji-modernizer: fixed Pro price must not be introduced');
    continue;
  }

  const hasPanel = html.includes('okj-pro-panel');
  check(hasPanel, `${slug}: expected existing Pro planning panel`);
  if (!hasPanel) continue;
  check(html.includes('billing-unavailable'), `${slug}: Pro panel must remain explicitly billing-unavailable`);
  check(html.includes('/assets/nw-pro-entitlement.js'), `${slug}: shared Pro boundary runtime must be loaded`);

  const panelStart = html.indexOf('okj-pro-panel');
  const panelEnd = html.indexOf('</section>', panelStart);
  const panel = panelEnd > panelStart ? html.slice(panelStart, panelEnd) : html.slice(panelStart);
  check(panel.includes('disabled'), `${slug}: billing-unavailable Pro panel must contain disabled controls`);
  check(panel.includes('aria-disabled="true"'), `${slug}: billing-unavailable Pro controls must expose aria-disabled=true`);
  check(!/href=["'][^"']*(checkout|billing|buy|purchase)/i.test(panel), `${slug}: billing-unavailable Pro panel must not contain checkout/purchase links`);
}

const reference = read('tools/old-kanji-reference/index.html');
check(!reference.includes('$4.99'), 'old-kanji-reference: normalized source must not advertise a fixed Pro price');
check(reference.includes('課金未接続') && reference.includes('Billing unavailable'), 'old-kanji-reference: source copy must explicitly state billing unavailable');
check(reference.includes('CSV / JSON / Markdown / 印刷は無料'), 'old-kanji-reference: current Free exports must remain explicitly free');

if (failures.length) {
  console.error(`Old Kanji Pro boundary contract failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Old Kanji Pro boundary contract passed for all eight tools.');
