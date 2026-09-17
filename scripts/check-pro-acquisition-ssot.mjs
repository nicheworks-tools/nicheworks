import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const check = (condition, message) => { if (!condition) failures.push(message); };

const classification = JSON.parse(read('MONETIZATION_CLASSIFICATION.json'));
check(classification.bundleBoundaryStatus === 'pending-freeze', 'bundleBoundaryStatus must remain pending-freeze for this guard');
for (const slug of ['ai-interaction-atlas', 'command-safety-checker']) {
  check(classification.classes?.PRO_BUNDLE?.includes(slug) === true, `${slug} must remain PRO_BUNDLE`);
}

const publicFiles = [
  'tools/ai-interaction-atlas/index.html',
  'tools/ai-interaction-atlas/ja/index.html',
  'tools/ai-interaction-atlas/pro-bridge.js',
  'tools/command-safety-checker/index.html',
  'tools/command-safety-checker/pro-authority-guard.js'
];
for (const rel of publicFiles) {
  const text = read(rel);
  check(!text.includes('buy.stripe.com'), `${rel}: direct Stripe purchase URL is forbidden while bundle migration is pending`);
  check(!text.includes('$2.99'), `${rel}: fixed legacy price is forbidden while bundle migration is pending`);
}

const aiEn = read('tools/ai-interaction-atlas/index.html');
const aiJa = read('tools/ai-interaction-atlas/ja/index.html');
const aiBridge = read('tools/ai-interaction-atlas/pro-bridge.js');
check(aiEn.includes('No purchase path is offered from this tool') || aiEn.includes('no purchase link'), 'AI Atlas EN must disclose that purchase is unavailable');
check(aiJa.includes('このツールから購入はできません') || aiJa.includes('購入リンクを提供していません'), 'AI Atlas JA must disclose that purchase is unavailable');
check(aiBridge.includes("status.active === true && status.entitlement === ENTITLEMENT"), 'AI Atlas legacy compatibility must require exact entitlement');
check(!aiBridge.includes('paymentLink'), 'AI Atlas bridge must not expose a legacy paymentLink');

const commandHtml = read('tools/command-safety-checker/index.html');
const commandGuard = read('tools/command-safety-checker/pro-authority-guard.js');
check(!commandHtml.includes('"offers"'), 'Command Safety structured data must not publish a fixed paid Offer while migration is pending');
check(commandHtml.includes('./pro-authority-guard.js'), 'Command Safety must load the fail-closed authority guard after the legacy bridge');
check(commandHtml.includes('今ここから購入できますか？'), 'Command Safety must disclose purchase-unavailable state');
check(commandGuard.includes('status.active === true && status.entitlement === EXPECTED_ENTITLEMENT'), 'Command Safety authority guard must require exact entitlement');
check(!commandGuard.includes('buy.stripe.com'), 'Command Safety authority guard must not contain a purchase URL');

if (failures.length) {
  console.error(`PRO acquisition SSOT check failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PRO acquisition SSOT check passed for AI Interaction Atlas and Command Safety Checker.');
