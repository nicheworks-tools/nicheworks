import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

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

// 61. Ops Weekly Report Generator — required period/body gate, bilingual local exports.
has('tools/ops-weekly-report-generator/app.js', 'const hasBodyInput = (data) =>');
has('tools/ops-weekly-report-generator/app.js', 'if (!data.period)');
has('tools/ops-weekly-report-generator/app.js', 'if (!hasBodyInput(data))');
has('tools/ops-weekly-report-generator/app.js', 'ops-weekly-report-ja-');
has('tools/ops-weekly-report-generator/app.js', 'ops-weekly-report-en-');
has('tools/ops-weekly-report-generator/app.js', 'text/markdown;charset=utf-8');
lacks('tools/ops-weekly-report-generator/app.js', 'fetch(', 'generation backend request');

// 62. Outsource Spec Generator — required fields stay free; shared Pro is entitlement-isolated.
has('tools/outsource-spec-generator/app.js', 'function validateRequired()');
for (const field of ['workType', 'deliverables', 'deadline', 'budget', 'acceptanceMethod']) {
  has('tools/outsource-spec-generator/app.js', `value('${field}')`);
}
has('tools/outsource-spec-generator/app.js', 'function buildFreeSpec');
has('tools/outsource-spec-generator/pro-bridge.js', "const EXPECTED_ENTITLEMENT = 'nicheworks_pro'");
has('tools/outsource-spec-generator/pro-bridge.js', 'status.active && status.entitlement === EXPECTED_ENTITLEMENT');

// 63. Pages Deploy Guide — Free checklist stays local; forgeable legacy code is not authoritative.
has('tools/pages-deploy-guide/app.js', 'function platformItems(s)');
has('tools/pages-deploy-guide/app.js', 'copyAll');
has('tools/pages-deploy-guide/index.html', '<script src="/assets/nw-pro.js"></script>');
has('tools/pages-deploy-guide/index.html', '<script src="./pro-bridge.js"></script>');
has('tools/pages-deploy-guide/pro-bridge.js', 'const EXPECTED_ENTITLEMENT = "nicheworks_pro"');
has('tools/pages-deploy-guide/pro-bridge.js', 'status.active && status.entitlement === EXPECTED_ENTITLEMENT');
has('tools/pages-deploy-guide/pro-bridge.js', 'localStorage.removeItem(LEGACY_KEY)');
has('tools/pages-deploy-guide/SPEC.md', 'a legacy `NW-PDG-...` code or `pdg_pro_key` alone cannot unlock them');
{
  const html = read('tools/pages-deploy-guide/index.html');
  const nwPro = html.indexOf('<script src="/assets/nw-pro.js"></script>');
  const bridge = html.indexOf('<script src="./pro-bridge.js"></script>');
  const app = html.indexOf('<script src="./app.js"></script>');
  check(nwPro >= 0 && nwPro < bridge && bridge < app, 'tools/pages-deploy-guide/index.html: shared Pro scripts must load before legacy app.js');

  const bridgeText = read('tools/pages-deploy-guide/pro-bridge.js');
  const code = bridgeText.match(/BRIDGE_CODE = "([^"]+)"/)?.[1] || '';
  const match = /^NW-PDG-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{2})$/.exec(code);
  check(Boolean(match), 'tools/pages-deploy-guide/pro-bridge.js: compatibility bridge code must keep legacy shape');
  if (match) {
    const raw = `${match[1]}${match[2]}PDG`;
    let sum = 0;
    for (const ch of raw) sum = (sum + ch.charCodeAt(0)) % 97;
    const expected = sum.toString(36).toUpperCase().padStart(2, '0').slice(-2);
    check(match[3] === expected, 'tools/pages-deploy-guide/pro-bridge.js: compatibility bridge code checksum must match legacy validator');
  }
}

// 64. Pattern Atlas — dataset-driven rendering, current edited export, cultural acknowledgement.
has('tools/pattern-atlas/js/app.js', "import { patterns } from './data/patterns-all.js';");
has('tools/pattern-atlas/js/app.js', 'setupPatternFilters({ root, patterns, isJapanese });');
has('tools/pattern-atlas/js/app.js', 'setupSvgExport({ root, patterns, isJapanese });');
has('tools/pattern-atlas/js/export-ui.js', 'pattern?.exportSafety?.requireWarning');
has('tools/pattern-atlas/js/export-ui.js', 'proceed.disabled = true');
has('tools/pattern-atlas/js/export-ui.js', "if (!(await confirmCulturalWarning(root, currentPattern, isJapanese))) return;");
has('tools/pattern-atlas/js/export-ui.js', "format === 'png'");
has('tools/pattern-atlas/js/export-ui.js', "format === 'css'");

// 65. PDF Page Tools Mini — local bytes, recoverable protected/range errors, edited-copy export.
has('tools/pdf-page-tools-mini/app.js', 'browser-only PDF page editor');
has('tools/pdf-page-tools-mini/app.js', 'function isProtectionError(err)');
has('tools/pdf-page-tools-mini/app.js', 'function parseRangeText(text, max)');
has('tools/pdf-page-tools-mini/app.js', 'protected_or_special_pdf');
has('tools/pdf-page-tools-mini/app.js', 'saveExtracted');
has('tools/pdf-page-tools-mini/vendor/pdf-lib/pdf-lib.min.js', 'PDFLib');

// 66. PDF2CSV Local — 30 MB, no OCR, local PDF bytes; only XLSX library loader may use network.
has('tools/pdf2csv-local/app.js', "const MAX_FILE_SIZE = 30 * 1024 * 1024;");
has('tools/pdf2csv-local/app.js', 'const buffer = await file.arrayBuffer();');
has('tools/pdf2csv-local/app.js', 'window.pdfjsLib.getDocument({ data: buffer })');
has('tools/pdf2csv-local/app.js', '画像スキャンのみのPDF');
lacks('tools/pdf2csv-local/app.js', 'Tesseract', 'OCR runtime');
has('tools/pdf2csv-local/vendor/xlsx.full.min.js', 'https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js');

// 67. Place Old Kanji Checker — same-site reference lookup and explicit official-use caution.
has('tools/place-old-kanji-checker/app.js', "fetch('../old-kanji-reference/dict.json')");
has('tools/place-old-kanji-checker/app.js', 'ここで表示される候補は、公式な住所表記や行政上の有効性を判断するものではありません。');
has('tools/place-old-kanji-checker/app.js', "productId: 'okj.toolkit_pro'");
has('tools/place-old-kanji-checker/SPEC.md', 'billing-unavailable/locked');

// 68. Product Founder OS — documentation page, repository link, no hosted product input.
has('tools/product-founder-os/index.html', 'https://github.com/nicheworks-tools/product-founder-os/tree/main');
has('tools/product-founder-os/index.html', 'Discover → define → plan → build → adjust → ship');
has('tools/product-founder-os/index.html', 'Does bootstrap_new_product.py generate a finished product?');
has('tools/product-founder-os/index.html', 'It generates starter docs only');

// 69. Redirect Unwrapper — local string analysis only, no external redirect fetch.
has('tools/redirect-unwrapper/app.js', 'Does not fetch external URLs');
has('tools/redirect-unwrapper/app.js', 'const DESTINATION_PARAM_KEYS = new Set');
has('tools/redirect-unwrapper/app.js', 'function analyzeUrlString(input)');
has('tools/redirect-unwrapper/app.js', 'function findHttpUrls(text)');
lacks('tools/redirect-unwrapper/app.js', 'fetch(', 'network redirect resolution');

// 70. Release Guardian — documentation-only external repository modes and safety boundary.
for (const mode of ['report-only', 'safe-fix', 'blocker-first', 'release-report']) {
  has('tools/release-guardian/index.html', mode);
}
has('tools/release-guardian/index.html', 'https://github.com/nicheworks-tools/release-guardian');
has('tools/release-guardian/index.html', 'commit or stash');
has('tools/release-guardian/SPEC.md', 'not a security, legal, accessibility, privacy, or compliance audit');

// 71. Rename Wizard — filename-only normalization and mapping export; no content reads/renames.
has('tools/rename-wizard/app.js', 'originalNames.push(f.name)');
has('tools/rename-wizard/app.js', 'str.normalize("NFKC")');
has('tools/rename-wizard/app.js', 'function rowsToTsv(rows)');
has('tools/rename-wizard/app.js', 'function rowsToCsv(rows)');
lacks('tools/rename-wizard/app.js', 'FileReader', 'file content reader');
lacks('tools/rename-wizard/app.js', 'arrayBuffer(', 'file content byte read');

// 72. Screenshot Stitcher — supported local formats, tall-output warning, single/split export paths.
has('tools/screenshot-stitcher/app.js', '/^image\\/(png|jpeg|webp)$/');
has('tools/screenshot-stitcher/app.js', 'warnHeight');
has('tools/screenshot-stitcher/app.js', 'warnStrongHeight');
has('tools/screenshot-stitcher/app.js', 'async function canvasToBlob');
has('tools/screenshot-stitcher/app.js', 'screenshot-stitcher-split.zip');
has('tools/screenshot-stitcher/index.html', '処理はブラウザ内のみ。画像データは外部送信しません。');

// 73. Size Converter — bundled reference tables and local measurement heuristics.
has('tools/size-converter/app.js', 'const DATA = {');
has('tools/size-converter/app.js', 'footLength');
has('tools/size-converter/app.js', 'clothWaist');
has('tools/size-converter/app.js', 'function parseDecimal(val)');
has('tools/size-converter/app.js', 'brand.json');
has('tools/size-converter/SPEC.md', 'Results are approximate');

// 74. Sponsor Page Builder — tier count, missing-price caution, local bilingual drafting.
has('tools/sponsor-page-builder/app.js', 'const buildTiers = (lang, count) =>');
has('tools/sponsor-page-builder/app.js', 'Price needs adjustment');
has('tools/sponsor-page-builder/app.js', 'const buildChecklist = (lang) =>');
has('tools/sponsor-page-builder/app.js', 'buildCopy("ja")');
has('tools/sponsor-page-builder/app.js', 'buildCopy("en")');
lacks('tools/sponsor-page-builder/app.js', 'fetch(', 'copywriting backend request');

// 75. SQL DB Risk Checker — destructive/read-only rules plus nested-WHERE hardening.
has('tools/sql-db-risk-checker/index.html', './app-sdrc.js');
has('tools/sql-db-risk-checker/app-sdrc.js', '!hasTopWhere(s)');
has('tools/sql-db-risk-checker/app-sdrc.js', 'DROP DATABASE');
has('tools/sql-db-risk-checker/app-sdrc.js', 'readOnly &&');
has('tools/sql-db-risk-checker/pro-bridge.js', 'function hasTopLevelWhere(sql)');
has('tools/sql-db-risk-checker/pro-bridge.js', 'window.hasTopWhere = hasTopLevelWhere');
has('tools/sql-db-risk-checker/SPEC.md', 'ネストしたサブクエリにだけWHERE');
{
  const code = read('tools/sql-db-risk-checker/pro-bridge.js');
  let domReady = null;
  const sandbox = {
    window: {
      NWPro: { getLocalStatus: () => ({ active: false, entitlement: 'nicheworks_pro' }) },
      dispatchEvent() {}
    },
    document: {
      documentElement: { dataset: {} },
      querySelectorAll: () => [],
      addEventListener: (name, callback) => { if (name === 'DOMContentLoaded') domReady = callback; }
    },
    CustomEvent: function CustomEvent() {},
    console
  };
  vm.runInNewContext(code, sandbox, { filename: 'tools/sql-db-risk-checker/pro-bridge.js' });
  check(typeof domReady === 'function', 'tools/sql-db-risk-checker/pro-bridge.js: DOMContentLoaded safety install missing');
  if (domReady) domReady();
  const fn = sandbox.window.SQLDbRiskHasTopLevelWhere;
  check(typeof fn === 'function', 'tools/sql-db-risk-checker/pro-bridge.js: top-level WHERE test hook missing');
  if (typeof fn === 'function') {
    check(fn('UPDATE users SET flag=(SELECT 1 FROM other WHERE other.id=users.id)') === false, 'SQL guard: nested WHERE must not count as update limiter');
    check(fn('UPDATE users SET flag=(SELECT 1 FROM other WHERE other.id=users.id) WHERE id=1') === true, 'SQL guard: outer WHERE must be recognized');
    check(fn("UPDATE users SET note='where' WHERE id=1") === true, 'SQL guard: quoted where must not hide real outer WHERE');
  }
}

if (failures.length) {
  console.error(`Tool runtime contract audit wave 5 failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Tool runtime contract audit wave 5 passed for tools 61-75.');
