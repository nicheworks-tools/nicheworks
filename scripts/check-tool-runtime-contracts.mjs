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

// 16. Cover Letter Lite — deterministic local template system, not an AI request path.
has('tools/cover-letter-lite/app.js', 'TEMPLATE_STYLES');
has('tools/cover-letter-lite/app.js', 'TEMPLATE_LENGTHS');
has('tools/cover-letter-lite/app.js', './templates/${safeStyle}-${safeLength}.txt');
has('tools/cover-letter-lite/index.html', '<html lang="en">');

// 17. CSV Tidy — bounded preview, encoding/delimiter handling, and optional UTF-8 BOM export.
has('tools/csv-tidy/app.js', 'PREVIEW_MAX_ROWS = 50');
has('tools/csv-tidy/app.js', 'shift_jis');
has('tools/csv-tidy/app.js', 'parseCSV');
has('tools/csv-tidy/app.js', 'const bom = state.options.bom');

// 18. Design Request Builder — required brief fields and tiered bilingual output.
for (const field of ['projectType', 'purpose', 'deliverables', 'deadline', 'budget']) {
  has('tools/design-request-builder/app.js', field);
}
for (const tier of ['short', 'standard', 'detailed']) {
  has('tools/design-request-builder/app.js', tier);
}
has('tools/design-request-builder/app.js', 'missingReq');

// 19. Dry Meter — local settings plus explicit Open-Meteo weather lookup.
has('tools/dry-meter/app.js', 'nw_drymeter_v1');
has('tools/dry-meter/app.js', 'https://api.open-meteo.com/v1/forecast');
has('tools/dry-meter/app.js', 'temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m');
has('tools/dry-meter/app.js', 'computeDryScore');

// 20. Earth Alerts — must remain an explicit non-active status page.
has('tools/earth-alerts/index.html', 'No notifications are sent yet.');
has('tools/earth-alerts/index.html', 'Real-data alert logic is not implemented yet.');
has('tools/earth-alerts/index.html', '/tools/earth-map-suite/');

// 21. Earth Map Suite — synthetic previews must remain distinct from metadata-only real status.
has('tools/earth-map-suite/app.js', '/api/earth-map-suite/precipitation');
has('tools/earth-map-suite/app.js', 'stormFramesMax: 48');
has('tools/earth-map-suite/app.js', 'synthetic_preview');
has('tools/earth-map-suite/app.js', 'metadata_only');
has('tools/earth-map-suite/app.js', 'Raster precipitation values are not sampled');

// 22. Earth Timeseries — must remain an explicit coming-soon/no-observed-values page.
has('tools/earth-timeseries/index.html', 'Earth Timeseries is not usable today.');
has('tools/earth-timeseries/index.html', 'Raster precipitation values are not sampled on this page.');
has('tools/earth-timeseries/index.html', '/tools/earth-map-suite/');

// 23. EXIF Cleaner Mini — browser regeneration plus post-output metadata-container scan.
has('tools/exif-cleaner-mini/app.js', 'scanMetadata');
has('tools/exif-cleaner-mini/app.js', 'ctx.drawImage(img, 0, 0)');
has('tools/exif-cleaner-mini/app.js', 'canvasToBlob');
has('tools/exif-cleaner-mini/app.js', 'outputScanResult = scanMetadata');

// 24. FileType Sniffer — inspect only the first 4096 bytes and do not claim safety.
has('tools/filetype-sniffer/app.js', 'READ_LIMIT_BYTES = 4096');
has('tools/filetype-sniffer/app.js', 'file.slice(0, READ_LIMIT_BYTES).arrayBuffer()');
has('tools/filetype-sniffer/app.js', 'Safety is not verified.');

// 25. Form Tool Selector — produce generic categories and explicit provider-verification warning.
has('tools/form-tool-selector/app.js', 'Simple collection form');
has('tools/form-tool-selector/app.js', 'Payment-ready form');
has('tools/form-tool-selector/app.js', 'Privacy-first form');
has('tools/form-tool-selector/app.js', 'not a recommendation or fit guarantee for a specific service');

// 26. Growth Log Template Generator — numeric anonymization covers KPI and freeform user fields.
has('tools/growth-log-template-generator/index.html', 'function scrubNumbers');
has('tools/growth-log-template-generator/index.html', 'scrubNumbers(v.hypothesis)');
has('tools/growth-log-template-generator/index.html', 'scrubNumbers(v.learnings)');
has('tools/growth-log-template-generator/index.html', 'scrubNumbers(v.notes)');
has('tools/growth-log-template-generator/SPEC.md', 'numeric substrings in KPI values, hypothesis, learnings, and notes');

// 27. Habit Plan Generator — deterministic presets, local language, and configurable checklist.
has('tools/habit-plan-generator/app.js', 'localStorage.setItem("nw_lang", lang)');
for (const preset of ['exercise', 'study', 'sleep']) {
  has('tools/habit-plan-generator/app.js', `${preset}:`);
}
has('tools/habit-plan-generator/app.js', 'checklistLength');
has('tools/habit-plan-generator/app.js', 'buildPlanText');

// 28. Image Compression Inspector — supported static inputs, JPEG white flatten, current-blob download.
has('tools/image-compression-inspector/app.js', 'SUPPORTED_INPUT_TYPES');
has('tools/image-compression-inspector/app.js', 'MAX_PIXELS = 40_000_000');
has('tools/image-compression-inspector/app.js', 'ctx.fillStyle = "#ffffff"');
has('tools/image-compression-inspector/app.js', 'state.outputBlob = blob');
has('tools/image-compression-inspector/app.js', 'link.href = state.outputUrl');

// 29. Image Redact — manual masks, solid/blur/pixelate, weak-mask preflight, PNG flatten/export.
has('tools/image-redact/app.js', 'type: "solid"');
has('tools/image-redact/app.js', 'm.type === "blur"');
has('tools/image-redact/app.js', 'm.type === "pixelate"');
has('tools/image-redact/app.js', 'function preflight(blockWeak)');
has('tools/image-redact/app.js', 'out.toBlob');
has('tools/image-redact/index.html', 'Use EXIF Cleaner Mini as well if you need metadata removal');

// 30. INCI FastScan — external OCR library is disclosed and image recognition stays browser-side.
has('tools/inci-fastscan/index.html', 'https://unpkg.com/tesseract.js@5.0.3/dist/tesseract.min.js');
has('tools/inci-fastscan/index.html', 'OCR runs in your browser, but the OCR library is loaded from an external CDN.');
has('tools/inci-fastscan/js/web_ocr.js', 'Tesseract.recognize');
has('tools/inci-fastscan/index.html', 'unknown items');
has('tools/inci-fastscan/index.html', 'not medical advice or a safety guarantee');

if (failures.length) {
  console.error(`Tool runtime contract audit failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Tool runtime contract audit passed for waves 1-2 (30 tools).');
