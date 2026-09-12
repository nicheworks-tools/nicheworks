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

// 31. Incident Update Generator — required status model and shared Pro gate remain active.
has('tools/incident-update-generator/app.js', 'const STATUS_MAP = {');
has('tools/incident-update-generator/app.js', 'includeUnknown');
has('tools/incident-update-generator/pro-bridge.js', 'NWPro.getLocalStatus');
has('tools/incident-update-generator/pro-bridge.js', 'nicheworks_pro');

// 32. JP Postal Lite — nationwide local data, bounded results, no automatic external backup fetch.
has('tools/jp-postal-lite/app.js', 'const LIMIT = 50;');
has('tools/jp-postal-lite/app.js', 'Object.fromEntries(PREFS.map');
has('tools/jp-postal-lite/app.js', 'fetch(`./data/${encodeURIComponent(file)}`)');
has('tools/jp-postal-lite/app.js', '外部バックアップJSONへの自動取得は行いません');

// 33. JSON Repair — current public runtime loads common Pro and gates advanced actions in app.js.
has('tools/json-repair/index.html', '/assets/nw-pro.js');
has('tools/json-repair/app.js', 'NWPro.getLocalStatus');
has('tools/json-repair/app.js', 'function guardPro()');
lacks('tools/json-repair/SPEC.md', 'tools/json-repair/pro-bridge.js', 'stale removed pro-bridge evidence');

// 34. JSON2Mermaid — public Free runtime and staged batch path share one bounded converter API.
has('tools/json2mermaid/app.js', 'const LIMITS = Object.freeze({');
has('tools/json2mermaid/app.js', 'maxInputBytes: 300 * 1024');
has('tools/json2mermaid/app.js', 'maxDepth: 12');
has('tools/json2mermaid/app.js', 'maxArrayItems: 50');
has('tools/json2mermaid/app.js', 'window.NWJSON2MermaidConverter = Object.freeze({');
has('tools/json2mermaid/app.js', 'const result = converter.convert(jsonText, options, currentLang);');
has('tools/json2mermaid/pro-shared-converter-integration.mjs', 'converterApi.convert');
lacks('tools/json2mermaid/index.html', 'pro-engine.mjs', 'staged Pro engine on public page');
lacks('tools/json2mermaid/index.html', 'mermaid-renderer-adapter.mjs', 'staged Mermaid adapter on public page');

// 35. Kanji Modernizer — local dictionary, ambiguity policy, and exclusion ranges remain wired.
has('tools/kanji-modernizer/app.js', 'fetch("./dict.json"');
has('tools/kanji-modernizer/app.js', 'policy === "conservative"');
has('tools/kanji-modernizer/app.js', 'function buildExclusionRanges');

// 36. Laundry Code Decode — photo helper remains bounded local template matching, not OCR.
has('tools/laundry-code-decode/app.js', 'const MAX_IMAGE_BYTES = 10 * 1024 * 1024;');
has('tools/laundry-code-decode/app.js', 'image/png", "image/jpeg", "image/webp", "image/gif');
has('tools/laundry-code-decode/app.js', 'Photo candidate search: simple template matching');
has('tools/laundry-code-decode/app.js', 'Prioritize the garment label');

// 37. Light Check — camera access is user-started, stoppable, and explicitly relative/not calibrated.
has('tools/light-check/app.js', 'navigator.mediaDevices.getUserMedia');
has('tools/light-check/app.js', 'function hardStopCamera()');
has('tools/light-check/app.js', 'Not a lux, color temperature, or flicker meter.');
has('tools/light-check/app.js', 'track.stop()');

// 38. LineBreak Doctor — platform-safe invisible-character behavior stays explicit and local.
has('tools/linebreak-doctor/app.js', 'platform-safe');
has('tools/linebreak-doctor/app.js', '\\u200B');
for (const platform of ['X', 'Instagram', 'LINE', 'Facebook', 'LinkedIn']) {
  has('tools/linebreak-doctor/app.js', `name: "${platform}"`);
}
has('tools/linebreak-doctor/app.js', 'Processing is done locally in your browser.');

// 39. LogFormatter — unparsed lines remain copy/export candidates and advanced actions use shared Pro.
has('tools/log-formatter/app.js', 'It is still included in filters and copy/export output.');
has('tools/log-formatter/app.js', 'lastErrorLines');
has('tools/log-formatter/pro-bridge.js', 'NWPro.getLocalStatus');
has('tools/log-formatter/app.js', 'document.documentElement.dataset.proActive === "true"');

// 40. Logistics Compliance Kit JP — memo is output-only and advanced artifacts use shared Pro.
has('tools/logistics-compliance-kit-jp/app.js', '現状メモは判定ロジックには使わず、出力メモとして記録します。');
has('tools/logistics-compliance-kit-jp/app.js', 'var memo = getMemo();');
has('tools/logistics-compliance-kit-jp/pro-bridge.js', 'NWPro.getLocalStatus');
has('tools/logistics-compliance-kit-jp/pro-bridge.js', 'nicheworks_pro');

// 41. LP Skeleton Generator — user input is escaped in HTML and local MD/HTML exports remain available.
has('tools/lp-skeleton-generator/app.js', 'const escapeHtml = (input)');
has('tools/lp-skeleton-generator/app.js', 'downloadText("lp-skeleton.md"');
has('tools/lp-skeleton-generator/app.js', 'downloadText("lp-skeleton.html"');
has('tools/lp-skeleton-generator/app.js', 'escapeHtml(product)');

// 42. ManualFinder — current runtime merges maintained waves, paginates, and preserves shared official targets.
has('tools/manual-finder/app.paged.js', 'const FULL =');
has('tools/manual-finder/app.paged.js', 'const WAVE2 =');
has('tools/manual-finder/app.paged.js', 'sharedTarget: Boolean(x.sharedTarget)');
has('tools/manual-finder/app.paged.js', 'per: 48');
has('tools/manual-finder/app.paged.js', 'Official shared page');

// 43. Membership Offer Builder — no legacy self-unlock; all contract inputs feed the free draft.
lacks('tools/membership-offer-builder/app.js', "searchParams.get('pro')", '?pro=1 self-unlock');
lacks('tools/membership-offer-builder/app.js', 'nw_pro_key', 'legacy shared local key');
lacks('tools/membership-offer-builder/app.js', 'nw_pro_membership_offer_builder', 'tool-local Pro bypass key');
has('tools/membership-offer-builder/app.js', 'availableTime: value("timeInput"');
has('tools/membership-offer-builder/app.js', 'workloadLimit: value("workloadLimitInput"');
has('tools/membership-offer-builder/app.js', 'async function copyText');

// 44. Message Generator — UI language and selected culture are separate; culture controls body language.
has('tools/message-generator/app.js', 'const CULTURES = {');
has('tools/message-generator/app.js', 'function selectedContentLanguage(culture)');
has('tools/message-generator/app.js', 'const purposeOptions = PURPOSE[context.purpose]?.[contentLang]');
has('tools/message-generator/app.js', 'regenerate && lastContext');
lacks('tools/message-generator/app.js', 'Codex will implement', 'placeholder click handler');

// 45. MetadataSnap — proxy disclosure/order and visible failure handling stay aligned.
has('tools/metadatasnap/app.js', 'curly-meadow-fda4.nicheworks-tools.workers.dev');
has('tools/metadatasnap/app.js', 'api.allorigins.win/raw');
has('tools/metadatasnap/app.js', "setError('fetchFailed')");
has('tools/metadatasnap/index.html', 'input URL is sent to a NicheWorks Worker');
has('tools/metadatasnap/index.html', 'AllOrigins');
has('tools/metadatasnap/SPEC.md', 'The public page now discloses this Worker-first / AllOrigins-fallback behavior');

if (failures.length) {
  console.error(`Tool runtime contract audit failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Tool runtime contract audit passed for waves 1-3 (45 tools).');
