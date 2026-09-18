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

// 46. Microtool Launch Checklist — four bounded classes and local copy/download flow.
for (const type of ['converter', 'checker', 'generator', 'directory']) {
  has('tools/microtool-launch-checklist/app.js', `${type}:`);
}
has('tools/microtool-launch-checklist/app.js', 'saveChecklistMd');
has('tools/microtool-launch-checklist/app.js', 'saveChecklistTxt');
has('tools/microtool-launch-checklist/app.js', 'does not guarantee legal compliance');

// 47. Mini Game Utility — timer guard, local 50-entry score cap, and CSV export.
has('tools/mini-game-utility/app.js', 'const STORAGE_KEY = "nw_mini_game_scores"');
has('tools/mini-game-utility/app.js', 'if (timerId) return;');
has('tools/mini-game-utility/app.js', '.slice(0, 50)');
has('tools/mini-game-utility/app.js', 'name,score,time');

// 48. Minutes to Ops — free exports remain ungated; advanced actions use the expected shared entitlement.
has('tools/minutes-to-ops/app.js', "const HISTORY_KEY = 'nw_mto_history_v2'");
has('tools/minutes-to-ops/app.js', "els.dlCsv?.addEventListener('click'");
has('tools/minutes-to-ops/app.js', "els.dlMd?.addEventListener('click'");
has('tools/minutes-to-ops/pro-bridge.js', "current.entitlement === 'nicheworks_pro'");

// 49. Money Template Checker — fixed JPY contract and zero-income ratio guard.
has('tools/money-template-checker/app.js', 'currency: "JPY"');
has('tools/money-template-checker/app.js', 'summary.canJudgeRatios && summary.fixedRatio > 0.6');
has('tools/money-template-checker/app.js', 'Income is 0, so percentage-based checks are unavailable');
has('tools/money-template-checker/app.js', 'localStorage.setItem("nw_lang", lang)');

// 50. Motion Atlas — ADS_DONATION free mode keeps advanced compare/handoff available without entitlement or Stripe.
has('tools/motion-atlas/app.js', 'function compareLimit(){ return proActive ? 4 : 2; }');
has('tools/motion-atlas/app.js', 'motionAtlasFavorites');
has('tools/motion-atlas/app.js', 'motionAtlasRecent');
has('tools/motion-atlas/pro-bridge.js', 'document.documentElement.dataset.proActive = "true"');
has('tools/motion-atlas/pro-bridge.js', 'entitlement: "free"');
has('tools/motion-atlas/pro-bridge.js', 'source: "ads_donation"');
lacks('tools/motion-atlas/pro-bridge.js', 'nicheworks_pro', 'legacy paid entitlement authority');
lacks('tools/motion-atlas/pro-bridge.js', 'buy.stripe.com', 'Stripe acquisition URL');
lacks('tools/motion-atlas/index.html', 'buy.stripe.com', 'Stripe acquisition URL');
lacks('tools/motion-atlas/ja/index.html', 'buy.stripe.com', 'Stripe acquisition URL');
lacks('tools/motion-atlas/pro/index.html', 'buy.stripe.com', 'historical Pro sales URL');
lacks('tools/motion-atlas/ja/pro/index.html', 'buy.stripe.com', 'historical Japanese Pro sales URL');
has('tools/motion-atlas/pro/index.html', 'Advanced outputs are now free');
has('tools/motion-atlas/ja/pro/index.html', '高度出力は無料で利用できます');

// 51. Moving Checklist — condition-keyed check persistence, memo excluded, browser print only.
has('tools/moving-checklist-generator/app.js', 'const STORAGE_PREFIX = "moveChecklist:v2:"');
has('tools/moving-checklist-generator/app.js', 'function saveChecks(key, checks)');
has('tools/moving-checklist-generator/app.js', 'window.print()');
has('tools/moving-checklist-generator/index.html', '印刷用メモは保存しません');

// 52. Moving / Lease Final Check — free-only condition-keyed storage and local outputs; retired Pro must stay absent.
has('tools/moving-lease-final-check/app.js', 'nw_moving_final_v1:${date}:${type}');
has('tools/moving-lease-final-check/app.js', 'async function copyTxt()');
has('tools/moving-lease-final-check/app.js', 'function saveTxt()');
has('tools/moving-lease-final-check/app.js', 'window.print()');
lacks('tools/moving-lease-final-check/app.js', 'requirePro', 'retired Pro runtime gate');
lacks('tools/moving-lease-final-check/index.html', '/assets/nw-pro.js', 'retired shared Pro client');
lacks('tools/moving-lease-final-check/index.html', 'buy.stripe.com', 'retired Stripe purchase URL');
check(!exists('tools/moving-lease-final-check/pro-bridge.js'), 'tools/moving-lease-final-check/pro-bridge.js: retired Pro bridge must be absent');

// 53. Name Old Kanji Checker — same-site mappings, optional metadata fallback, no unfinished public sales UI.
has('tools/name-old-kanji-checker/app.js', "const DICT_URL = '../old-kanji-reference/dict.json'");
has('tools/name-old-kanji-checker/app.js', "state.dataStatus = optionalLoadFailed ? 'partial_error' : 'ready'");
lacks('tools/name-old-kanji-checker/index.html', 'okj-pro-panel', 'unfinished public Pro panel');
lacks('tools/name-old-kanji-checker/index.html', '$4.99', 'unfinished fixed Pro price');

// 54. Newsletter Kit Generator — deterministic local bilingual output with explicit missing placeholders.
has('tools/newsletter-kit-generator/app.js', 'const buildKit = () =>');
has('tools/newsletter-kit-generator/app.js', '【JP】');
has('tools/newsletter-kit-generator/app.js', '【EN】');
has('tools/newsletter-kit-generator/app.js', '(テーマ未入力)');

// 55. Niche Job Starter Kit — generic blank guidance, local candidate-header template, caution wording.
has('tools/niche-job-starter-kit/app.js', 'Not specified');
has('tools/niche-job-starter-kit/app.js', 'candidate-sheet-columns.csv');
has('tools/niche-job-starter-kit/app.js', 'const buildCsvDownload = (lang) =>');
has('tools/niche-job-starter-kit/app.js', 'discriminatory wording');

// 56. Notion Form Design Kit — local drafting only, field controls drive output, no Notion API request path.
for (const preset of ['simple', 'detailed', 'inquiry', 'application', 'recruiting', 'bug', 'creative']) {
  has('tools/notion-form-design-kit/app.js', `${preset}:`);
}
has('tools/notion-form-design-kit/app.js', 'fieldCatalog');
lacks('tools/notion-form-design-kit/app.js', 'api.notion.com', 'Notion API transport');
lacks('tools/notion-form-design-kit/app.js', 'fetch(', 'network fetch in design runtime');

// 57. OG Image Maker — fixed canvas, local settings, safe-area export exclusion, and safe shared Pro override order.
has('tools/og-image-maker/index.html', '<canvas id="preview" width="1200" height="630"');
has('tools/og-image-maker/app.js', 'const STORAGE_KEY = "nw_og_settings"');
has('tools/og-image-maker/app.js', 'if (state.showSafeArea && !isExport)');
has('tools/og-image-maker/pro-bridge.js', 'status.active && (!status.entitlement || status.entitlement === ENTITLEMENT)');
{
  const html = read('tools/og-image-maker/index.html');
  check(html.indexOf('<script src="./app.js"></script>') < html.indexOf('<script src="./pro-bridge.js"></script>'), 'tools/og-image-maker/index.html: Pro bridge must load after app.js so legacy helper cannot override the shared entitlement gate');
}

// 58. Old Document Kanji Highlighter — local mechanical mapping with no unfinished public sales surface.
has('tools/old-document-kanji-highlighter/app.js', "fetch('../old-kanji-reference/dict.json')");
has('tools/old-document-kanji-highlighter/app.js', 'renderModernPreview');
lacks('tools/old-document-kanji-highlighter/index.html', 'okj-pro-panel', 'unfinished public Pro panel');
lacks('tools/old-document-kanji-highlighter/index.html', '$4.99', 'unfinished fixed Pro price');

// 59. Old Kanji OCR Scanner — active contextual Amazon follows OCR/manual result state.
has('tools/old-kanji-ocr-scanner/index.html', 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
has('tools/old-kanji-ocr-scanner/app.js', "Tesseract.recognize(file, 'jpn'");
has('tools/old-kanji-ocr-scanner/app.js', "document.getElementById('manual-text').value = text || ''");
has('tools/old-kanji-ocr-scanner/index.html', '外部OCR APIには送信しません');
lacks('tools/old-kanji-ocr-scanner/index.html', 'okj-pro-panel', 'unfinished public Pro panel');
has('tools/old-kanji-ocr-scanner/index.html', '/assets/amazon-affiliate.js');
has('tools/old-kanji-ocr-scanner/index.html', '/assets/old-kanji-amazon-context.js');
lacks('tools/old-kanji-ocr-scanner/index.html', './affiliate-config.js', 'obsolete tool-local affiliate config load');
lacks('tools/old-kanji-ocr-scanner/index.html', './affiliate.js', 'obsolete tool-local affiliate runtime load');
has('assets/old-kanji-amazon-context.js', '"old-kanji-ocr-scanner"');
has('assets/old-kanji-amazon-context.js', 'CZUR ET24 Pro ブックスキャナー');
has('assets/old-kanji-amazon-context.js', 'activation: { type: "value", selector: "#manual-text" }');

// 60. Old Kanji Reference — active contextual Amazon follows the completed reference task.
for (const key of ['oldKanjiReference.recent.v1', 'oldKanjiReference.displayMode.v1', 'oldKanjiReference.favorites.v1', 'oldKanjiReference.quizStats.v1']) {
  has('tools/old-kanji-reference/app-meaning-v4.js', key);
}
has('tools/old-kanji-reference/index.html', 'Export (currently free)');
has('tools/old-kanji-reference/app-meaning-v4.js', 'exportCsvBtn.addEventListener("click", exportCsv)');
has('tools/old-kanji-reference/app-meaning-v4.js', 'exportJsonBtn.addEventListener("click", exportJson)');
lacks('tools/old-kanji-reference/index.html', 'okj-pro-panel', 'unfinished public Pro panel');
lacks('tools/old-kanji-reference/index.html', '$4.99', 'unfinished fixed Pro price');
has('tools/old-kanji-reference/index.html', './amazon-layout.css');
has('tools/old-kanji-reference/index.html', '/assets/amazon-affiliate.js');
has('tools/old-kanji-reference/index.html', '/assets/old-kanji-amazon-context.js');
lacks('tools/old-kanji-reference/index.html', './affiliate-config.js', 'obsolete tool-local affiliate config load');
lacks('tools/old-kanji-reference/index.html', './affiliate.js', 'obsolete tool-local affiliate runtime load');
has('assets/old-kanji-amazon-context.js', '"old-kanji-reference"');
has('assets/old-kanji-amazon-context.js', '9784309412443 異体字の世界 最新版 小池和夫');
has('tools/old-kanji-reference/amazon-layout.css', '.shape-note-grid');
has('tools/old-kanji-reference/amazon-layout.css', '.stroke-note-grid');
has('tools/old-kanji-reference/amazon-layout.css', 'grid-template-columns: repeat(2, minmax(0, 1fr));');
has('tools/old-kanji-reference/amazon-layout.css', 'overflow-wrap: anywhere;');
has('tools/old-kanji-reference/amazon-layout.css', '@media (max-width: 720px)');


if (failures.length) {
  console.error(`Tool runtime contract audit wave 4 failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Tool runtime contract audit wave 4 passed for tools 46-60.');
