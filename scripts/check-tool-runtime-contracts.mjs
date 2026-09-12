import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const check = (condition, message) => { if (!condition) failures.push(message); };
const has = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  check(read(rel).includes(needle), `${rel}: missing ${label}`);
};
const lacks = (rel, needle, label = needle) => {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  check(!read(rel).includes(needle), `${rel}: forbidden ${label}`);
};

// 1. AI Interaction Atlas — local state, free limits, legacy shared Pro bridge.
has('tools/ai-interaction-atlas/app.js', 'nw_aiia_favorites');
has('tools/ai-interaction-atlas/app.js', 'nw_aiia_recent');
has('tools/ai-interaction-atlas/app.js', 'nw_aiia_compare');
has('tools/ai-interaction-atlas/pro-bridge.js', 'NWPro.getLocalStatus');
has('tools/ai-interaction-atlas/pro-bridge.js', 'nicheworks_pro');

// 2. AI Project Pack — repository-first guide and bounded workflow remain visible.
has('tools/ai-project-pack/index.html', 'https://github.com/nicheworks-tools/ai-project-pack/tree/main');
has('tools/ai-project-pack/index.html', 'report-only');
has('tools/ai-project-pack/index.html', 'safe-update');
has('tools/ai-project-pack/index.html', '<code>updates/</code>');
has('tools/ai-project-pack/ja/index.html', 'https://github.com/nicheworks-tools/ai-project-pack/tree/main');

// 3. Analytics Privacy Kit — provider drafting and local clear/copy/export controls.
has('tools/analytics-privacy-kit/app.js', 'Google Analytics 4');
has('tools/analytics-privacy-kit/app.js', 'Cloudflare Web Analytics');
has('tools/analytics-privacy-kit/app.js', 'download');
has('tools/analytics-privacy-kit/app.js', 'clear');

// 4. API Key Token Redactor — secret detection plus preview/export hardening.
has('tools/api-key-token-redactor/app.js', 'PRIVATE KEY');
has('tools/api-key-token-redactor/app.js', 'Authorization');
has('tools/api-key-token-redactor/pro-bridge.js', "const SAFE_PREVIEW = '[REDACTED PREVIEW]'", 'secret-safe preview marker');
has('tools/api-key-token-redactor/pro-bridge.js', 'hardenClipboard');
has('tools/api-key-token-redactor/pro-bridge.js', 'hardenDownloads');
has('tools/api-key-token-redactor/SPEC.md', 'do not reproduce raw first/last credential fragments');

// 5. ATS Paste Doctor — free/Pro limits and shared legacy entitlement.
has('tools/ats-paste-doctor/app.js', 'FREE_LIMIT = 30000');
has('tools/ats-paste-doctor/app.js', 'PRO_LIMIT = 200000');
has('tools/ats-paste-doctor/pro-bridge.js', 'NWPro.getLocalStatus');

// 6. Codex Product Shipping Playbooks — ordered shipping stages remain present.
for (const stage of ['intake-repo', 'spec-delta', 'plan-change', 'define-acceptance', 'ship-check', 'write-release-artifacts', 'review-diff', 'post-ship-retro']) {
  has('tools/codex-product-shipping-playbooks/index.html', stage);
}

// 7. Codex Usage Forecaster — public page must use the current runtime, not stale app.js.
has('tools/codex-usage-forecaster/index.html', './app-fixed.js');
has('tools/codex-usage-forecaster/app-fixed.js', 'nw_cuf_v2');
has('tools/codex-usage-forecaster/app-fixed.js', 'nw_cuf_profiles_v1');
has('tools/codex-usage-forecaster/SPEC.md', 'app-fixed.js');

// 8. Codex Work OS — all five operator packs remain represented.
for (const pack of ['sales-pack', 'pm-pack', 'exec-assist-pack', 'research-pack', 'cs-pack']) {
  has('tools/codex-work-os/index.html', pack);
}

// 9. Cold Email Requirement Checker — no query-param/localStorage self-unlock.
has('tools/cold-email-requirement-checker/pro-addon.js', 'NWPro.getLocalStatus');
has('tools/cold-email-requirement-checker/pro-addon.js', "ENTITLEMENT = 'nicheworks_pro'");
lacks('tools/cold-email-requirement-checker/pro-addon.js', "searchParams.get('pro')", '?pro=1 self-unlock');
lacks('tools/cold-email-requirement-checker/pro-addon.js', 'nw_pro_cold_email_requirement_checker', 'tool-local Pro bypass key');

// 10. Color Replace Lite — browser processing, 4MP cap, PNG output.
has('tools/color-replace/app.js', 'MAX_MEGAPIXELS = 4');
has('tools/color-replace/app.js', "canvasAfter.toDataURL('image/png')");
has('tools/color-replace/app.js', 'pickColor');

// 11. Command Safety Checker — active runtime and Pro bridge must match public page.
has('tools/command-safety-checker/index.html', './app-core.js');
has('tools/command-safety-checker/index.html', './pro-bridge.js');
has('tools/command-safety-checker/pro-bridge.js', 'NWPro.getLocalStatus');
has('tools/command-safety-checker/SPEC.md', 'app-core.js');

// 12. Construction Tools Atlas — current runtime plus local favorite transfer.
has('tools/construction-tools-atlas/index.html', './app.runtime.js');
has('tools/construction-tools-atlas/app.runtime.js', 'cta_favs');
has('tools/construction-tools-atlas/app.runtime.js', 'exportFavsBtn');
has('tools/construction-tools-atlas/app.runtime.js', 'importFavsBtn');
has('tools/construction-tools-atlas/SPEC.md', 'app.runtime.js');

// 13. Contract Cleaner — local rule-based analysis and non-authoritative wording.
has('tools/contract-cleaner/app.js', 'Rule-based contract term checker');
has('tools/contract-cleaner/app.js', '検出されない＝安全ではありません');
has('tools/contract-cleaner/app.js', 'only_matched');

// 14. Contract Risk Highlighter — free finding cap and shared Pro gate remain wired.
has('tools/contract-risk-highlighter/app.js', 'MAX_FREE_FINDINGS = 3');
has('tools/contract-risk-highlighter/app.js', 'root.dataset.proActive === "true"');
has('tools/contract-risk-highlighter/index.html', '/assets/nw-pro.js');
has('tools/contract-risk-highlighter/index.html', './pro-bridge.js');
has('tools/contract-risk-highlighter/pro-bridge.js', 'NWPro.getLocalStatus');

// 15. Cosmetic Ingredient Checker Lite — unknown entries must stay explicitly unclassified.
has('tools/cosmetic-ingredient-checker-lite/app.js', 'この簡易辞書では分類できません');
has('tools/cosmetic-ingredient-checker-lite/index.html', '日本語のみ');

if (failures.length) {
  console.error(`Tool runtime contract audit failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Tool runtime contract audit passed for wave 1 (15 tools).');
