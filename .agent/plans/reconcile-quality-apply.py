from pathlib import Path

BRANCH = "fix/reconcile-quality-performance-20260913"


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"anchor missing: {label}")
    return text.replace(old, new, 1)


app_path = Path("tools/reconcile/app.mjs")
app = app_path.read_text()
if "const RESULT_PAGE_SIZE = 250;" not in app:
    app = replace_once(
        app,
        "const FREE_MAX_ROWS = 500;\n",
        "const FREE_MAX_ROWS = 500;\nconst RESULT_PAGE_SIZE = 250;\n",
        "page size constant",
    )
    app = replace_once(
        app,
        "  filtered: [],\n  runContext: null\n",
        "  filtered: [],\n  resultPage: 1,\n  runContext: null\n",
        "result page state",
    )
    app = replace_once(
        app,
        "async function loadCsv(side, file) {\n  const selectedDelimiter = $('delimiter').value === 'tab' ? '\\t' : $('delimiter').value;\n  const parsed = await readCsvFile(file, { encoding: $('encoding').value, delimiter: selectedDelimiter });\n",
        "function selectedCsvDelimiter() {\n  return $('delimiter').value === 'tab' ? '\\t' : $('delimiter').value;\n}\n\nfunction currentSideMapping(side) {\n  const suffix = side.toUpperCase();\n  return Object.fromEntries(['amount', 'date', 'reference', 'description'].map((field) => [field, $(`${field}${suffix}`).value]));\n}\n\nasync function reparseLoadedCsv(side) {\n  const current = state[side];\n  if (!current || current.type !== 'csv' || !current.sourceFile) return false;\n  const previous = currentSideMapping(side);\n  const parsed = await readCsvFile(current.sourceFile, { encoding: $('encoding').value, delimiter: selectedCsvDelimiter() });\n  const table = tableFromRows(parsed.rows, Number($('headerRow').value || 1));\n  if (!rowLimitOk(table, 'csv')) return false;\n  state[side] = {\n    ...current,\n    ...table,\n    name: parsed.name,\n    size: parsed.size,\n    encoding: parsed.encoding,\n    delimiter: parsed.delimiter,\n    rawRows: parsed.rows\n  };\n  const suffix = side.toUpperCase();\n  for (const field of ['amount', 'date', 'reference', 'description']) {\n    populateSelect($(`${field}${suffix}`), table.headers, message('未選択', 'Not selected'), previous[field]);\n  }\n  renderPreview(side);\n  return true;\n}\n\nasync function reparseLoadedCsvs({ announce = true } = {}) {\n  let reparsed = 0;\n  try {\n    for (const side of ['a', 'b']) {\n      if (await reparseLoadedCsv(side)) reparsed += 1;\n    }\n  } catch (error) {\n    setNotice(message(`CSV解析設定を適用できませんでした: ${error.message}`, `Could not apply CSV parser settings: ${error.message}`), 'error');\n    return false;\n  }\n  if (announce && reparsed) {\n    setNotice(message(`CSV解析設定を${reparsed}ファイルに再適用しました。`, `Reapplied CSV parser settings to ${reparsed} loaded file(s).`), 'success');\n  }\n  return true;\n}\n\nasync function loadCsv(side, file) {\n  const selectedDelimiter = selectedCsvDelimiter();\n  const parsed = await readCsvFile(file, { encoding: $('encoding').value, delimiter: selectedDelimiter });\n",
        "csv reparse helpers",
    )
    app = replace_once(
        app,
        "    delimiter: parsed.delimiter,\n    rawRows: parsed.rows\n",
        "    delimiter: parsed.delimiter,\n    rawRows: parsed.rows,\n    sourceFile: file\n",
        "retain in-memory csv file",
    )
    app = replace_once(app, "function applyProfile(profile) {\n", "async function applyProfile(profile) {\n", "async applyProfile")
    app = replace_once(
        app,
        "  if (state.a) rebuildSide('a');\n  if (state.b) rebuildSide('b');\n  const missing = [...setMapping('a', config.mappingA), ...setMapping('b', config.mappingB)];\n",
        "  if (!(await reparseLoadedCsvs({ announce: false }))) return;\n  if (state.a?.type === 'xlsx') rebuildSide('a');\n  if (state.b?.type === 'xlsx') rebuildSide('b');\n  const missing = [...setMapping('a', config.mappingA), ...setMapping('b', config.mappingB)];\n",
        "profile reparses csv",
    )
    app = replace_once(
        app,
        "function selectProfile() {\n  if (!requirePro()) return;\n  const id = $('profileSelect').value;\n  const profile = profileStore.list().find((item) => item.id === id);\n  if (!profile) return;\n  applyProfile(profile);\n}\n",
        "async function selectProfile() {\n  if (!requirePro()) return;\n  const id = $('profileSelect').value;\n  const profile = profileStore.list().find((item) => item.id === id);\n  if (!profile) return;\n  await applyProfile(profile);\n}\n",
        "async profile selection",
    )
    app = replace_once(
        app,
        "function applyFilter() {\n  const status = $('statusFilter').value;\n",
        "function applyFilter() {\n  state.resultPage = 1;\n  const status = $('statusFilter').value;\n",
        "filter resets page",
    )
    old_render = """function renderResults() {
  $('resultBody').innerHTML = state.filtered.map((item) => `<tr>
    <td><span class=\"status status-${item.status}\">${escapeHtml(item.status)}</span></td>
    <td>${escapeHtml(item.relation)}</td>
    <td>${escapeHtml(item.aRows.join(', ') || '—')}</td>
    <td>${escapeHtml(item.bRows.join(', ') || '—')}</td>
    <td>${item.amount ?? '—'}</td>
    <td>${escapeHtml(item.date || '—')}</td>
    <td>${escapeHtml(item.reason)}</td>
  </tr>`).join('');
  $('resultCount').textContent = `${state.filtered.length} / ${state.results.length}`;
}
"""
    new_render = """function renderResults() {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / RESULT_PAGE_SIZE));
  state.resultPage = Math.min(totalPages, Math.max(1, state.resultPage));
  const start = (state.resultPage - 1) * RESULT_PAGE_SIZE;
  const pageRows = state.filtered.slice(start, start + RESULT_PAGE_SIZE);
  $('resultBody').innerHTML = pageRows.map((item) => `<tr>
    <td><span class=\"status status-${item.status}\">${escapeHtml(item.status)}</span></td>
    <td>${escapeHtml(item.relation)}</td>
    <td>${escapeHtml(item.aRows.join(', ') || '—')}</td>
    <td>${escapeHtml(item.bRows.join(', ') || '—')}</td>
    <td>${item.amount ?? '—'}</td>
    <td>${escapeHtml(item.date || '—')}</td>
    <td>${escapeHtml(item.reason)}</td>
  </tr>`).join('');
  $('resultCount').textContent = `${state.filtered.length} / ${state.results.length}`;
  const pageLabel = $('resultPage');
  if (pageLabel) pageLabel.textContent = state.filtered.length ? `${state.resultPage} / ${totalPages}` : '0 / 0';
  const prev = $('resultPrevBtn');
  const next = $('resultNextBtn');
  if (prev) prev.disabled = state.filtered.length === 0 || state.resultPage <= 1;
  if (next) next.disabled = state.filtered.length === 0 || state.resultPage >= totalPages;
}

function changeResultPage(delta) {
  state.resultPage += delta;
  renderResults();
}
"""
    app = replace_once(app, old_render, new_render, "paginated renderer")
    app = replace_once(
        app,
        "  $('fileA').addEventListener('change', (event) => loadFile('a', event.target.files[0]));\n  $('fileB').addEventListener('change', (event) => loadFile('b', event.target.files[0]));\n",
        "  $('fileA').addEventListener('change', (event) => loadFile('a', event.target.files[0]));\n  $('fileB').addEventListener('change', (event) => loadFile('b', event.target.files[0]));\n  $('encoding').addEventListener('change', () => reparseLoadedCsvs());\n  $('delimiter').addEventListener('change', () => reparseLoadedCsvs());\n",
        "parser control listeners",
    )
    app = replace_once(
        app,
        "  $('resultSearch').addEventListener('input', applyFilter);\n  $('exportCsvBtn').addEventListener('click', exportCsv);\n",
        "  $('resultSearch').addEventListener('input', applyFilter);\n  $('resultPrevBtn').addEventListener('click', () => changeResultPage(-1));\n  $('resultNextBtn').addEventListener('click', () => changeResultPage(1));\n  $('exportCsvBtn').addEventListener('click', exportCsv);\n",
        "pagination listeners",
    )
    app_path.write_text(app)

normalize_path = Path("tools/reconcile/normalize.mjs")
normalize = normalize_path.read_text()
if "Some exports place a currency token before a parenthesized negative" not in normalize:
    normalize = replace_once(
        normalize,
        "    .replace(/[\\s'’]/g, '');\n\n  if (/^[+-]/.test(text)) {\n",
        "    .replace(/[\\s'’]/g, '');\n\n  // Some exports place a currency token before a parenthesized negative, e.g. JPY (5,000).\n  if (/^\\(.*\\)$/.test(text)) {\n    negative = true;\n    text = text.slice(1, -1).trim();\n  }\n\n  if (/^[+-]/.test(text)) {\n",
        "currency-prefixed parenthesized negative",
    )
    normalize_path.write_text(normalize)

for html_name in ["index.html", "development.html"]:
    path = Path("tools/reconcile") / html_name
    html = path.read_text()
    if 'id="resultPrevBtn"' not in html:
        anchor = '        <span id="resultCount" class="muted">0 / 0</span>\n        <button class="btn" id="exportCsvBtn" type="button">CSV export</button>'
        replacement = '        <span id="resultCount" class="muted">0 / 0</span>\n        <button class="btn" id="resultPrevBtn" type="button" disabled aria-label="Previous result page">←</button>\n        <span id="resultPage" class="muted" aria-live="polite">0 / 0</span>\n        <button class="btn" id="resultNextBtn" type="button" disabled aria-label="Next result page">→</button>\n        <button class="btn" id="exportCsvBtn" type="button">CSV export</button>'
        if anchor not in html:
            raise SystemExit(f"anchor missing: pagination controls in {html_name}")
        path.write_text(html.replace(anchor, replacement, 1))

spec_path = Path("tools/reconcile/SPEC.md")
spec = spec_path.read_text()
if "bounded 250-row UI pages" not in spec:
    spec = replace_once(
        spec,
        "- Provide result counts, status filtering, text search, CSV audit export, and a seven-sheet XLSX report implementation.\n",
        "- Provide result counts, status filtering, text search, CSV audit export, and a seven-sheet XLSX report implementation. Large result sets are rendered in bounded 250-row UI pages while filtering/searching/export continue to operate on the complete result set.\n",
        "spec pagination",
    )
if "selected in-memory `File` objects" not in spec:
    spec = replace_once(
        spec,
        "- Parsed transaction rows, file bytes, and reconciliation results remain in page memory and disappear on reload.\n",
        "- Parsed transaction rows, selected in-memory `File` objects, file bytes, and reconciliation results remain in page memory and disappear on reload. Loaded CSV files are reparsed in memory when encoding/delimiter settings change; the file is not re-uploaded.\n",
        "spec parser reparse",
    )
if "Changing CSV encoding/delimiter settings reparses" not in spec:
    spec = replace_once(
        spec,
        "- [x] Japanese/English switching preserves the current reconciliation state and the wide result workflow remains usable with mobile stacking/scrolling.\n",
        "- [x] Japanese/English switching preserves the current reconciliation state and the wide result workflow remains usable with mobile stacking/scrolling.\n- [x] Changing CSV encoding/delimiter settings reparses already loaded CSV files in memory; applying a saved profile applies its parser settings before restoring saved mappings.\n- [x] Large result sets render at most 250 result rows per UI page; paging does not change the complete reconciliation result or export contents.\n- [x] Synthetic stress coverage verifies the declared 100,000-row Pro CSV ceiling and 50,000-row Pro XLSX parsing ceiling without imposing a brittle wall-clock pass/fail threshold.\n",
        "spec acceptance",
    )
spec_path.write_text(spec)

Path("tools/reconcile/tests/reconcile-quality.test.mjs").write_text(r'''import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseCsvText, tableFromRows } from '../parser.mjs';
import { normalizeAmount, normalizeDate } from '../normalize.mjs';
import { reconcile, summarize } from '../reconcile-engine.mjs';

const quoted = parseCsvText('\ufeffDate;Reference;Description;Amount\n2026-09-01;JP-1;"振込, 手数料込み";"¥12,800"\n\n2026-09-02;EU-2;"line 1\nline 2";"1.234,56"\n', ';');
const quotedTable = tableFromRows(quoted.rows, 1);
assert.equal(quotedTable.rows.length, 2);
assert.equal(quotedTable.rows[0].sourceRow, 2);
assert.equal(quotedTable.rows[1].sourceRow, 4);
assert.equal(quotedTable.rows[1].values.Description, 'line 1\nline 2');
assert.equal(normalizeAmount(quotedTable.rows[0].values.Amount), 12800);
assert.equal(normalizeAmount(quotedTable.rows[1].values.Amount), 1234.56);
assert.equal(normalizeAmount('JPY (5,000)'), -5000);
assert.equal(normalizeAmount('1,23,4'), null);
assert.equal(normalizeDate('04/05/2026').error, 'ambiguous_date');
assert.equal(normalizeDate('04/05/2026', 'mdy').iso, '2026-04-05');
assert.equal(normalizeDate('04/05/2026', 'dmy').iso, '2026-05-04');

function table(csv, delimiter = 'auto') {
  const parsed = parseCsvText(csv, delimiter);
  return tableFromRows(parsed.rows, 1);
}

const a = table('Date,Reference,Description,Amount\n2026-09-01,R-1,Exact,100\n2026-09-02,R-2,Tolerant,200\n2026-09-03,R-3,Conflict,300\n2026-09-04,,Candidate,400\n2026-09-05,DUP,Duplicate,500\n2026-09-05,DUP,Duplicate,500\n2026-09-06,R-6,A only,600\n');
const b = table('Date,Reference,Description,Amount\n2026-09-01,R-1,Exact,100\n2026-09-03,R-2,Tolerant,200\n2026-09-03,R-3,Conflict,333\n2026-09-04,,Candidate B1,400\n2026-09-05,,Candidate B2,400\n2026-09-07,R-7,B only,700\n');
const mappings = { amount: 'Amount', date: 'Date', reference: 'Reference', description: 'Description' };
const first = reconcile({ rowsA: a.rows, rowsB: b.rows, mappingA: mappings, mappingB: mappings, options: { dateToleranceDays: 1 } });
const counts = summarize(first);
assert.equal(counts.exact_match, 1);
assert.equal(counts.tolerant_match, 1);
assert.equal(counts.conflict, 1);
assert.equal(counts.duplicate, 1);
assert.ok(counts.candidate >= 1);
assert.ok(counts.a_only >= 1);
assert.ok(counts.b_only >= 1);
assert.deepEqual(reconcile({ rowsA: a.rows, rowsB: b.rows, mappingA: mappings, mappingB: mappings, options: { dateToleranceDays: 1 } }), first);

const signA = table('Date,Amount\n2026-09-01,150\n');
const signB = table('Date,Amount\n2026-09-01,-100\n2026-09-01,-50\n');
const grouped = reconcile({ rowsA: signA.rows, rowsB: signB.rows, mappingA: { amount: 'Amount', date: 'Date' }, mappingB: { amount: 'Amount', date: 'Date' }, options: { signMode: 'invert_b', groupMatching: true, maxGroupSize: 5 } });
assert.ok(grouped.some((row) => row.relation === '1:2' && row.status === 'tolerant_match'));

const here = dirname(fileURLToPath(import.meta.url));
const appSource = await readFile(resolve(here, '../app.mjs'), 'utf8');
const indexSource = await readFile(resolve(here, '../index.html'), 'utf8');
assert.match(appSource, /const RESULT_PAGE_SIZE = 250;/);
assert.match(appSource, /const pageRows = state\.filtered\.slice\(start, start \+ RESULT_PAGE_SIZE\);/);
assert.match(appSource, /sourceFile: file/);
assert.match(appSource, /reparseLoadedCsvs/);
assert.match(indexSource, /id="resultPrevBtn"/);
assert.match(indexSource, /id="resultNextBtn"/);

console.log('reconcile realistic quality tests: OK');
''')

Path("tools/reconcile/tests/reconcile-stress.test.mjs").write_text(r'''import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseCsvText, tableFromRows } from '../parser.mjs';
import { reconcile, summarize } from '../reconcile-engine.mjs';
import { EXPECTED_XLSX_VERSION, readXlsxFile, tableFromXlsx } from '../xlsx-adapter.mjs';

const CSV_ROWS = 100000;
const csvStart = performance.now();
const csvLines = ['Date,Reference,Amount'];
for (let i = 0; i < CSV_ROWS; i += 1) csvLines.push(`2026-09-01,R${i},${i + 1}`);
const parsed = parseCsvText(csvLines.join('\n'));
const csvTable = tableFromRows(parsed.rows, 1);
assert.equal(csvTable.rows.length, CSV_ROWS);
const csvParseMs = performance.now() - csvStart;

const reconcileStart = performance.now();
const rowsB = csvTable.rows.map((row) => ({ sourceRow: row.sourceRow, values: { ...row.values } }));
const matched = reconcile({
  rowsA: csvTable.rows,
  rowsB,
  mappingA: { amount: 'Amount', date: 'Date', reference: 'Reference' },
  mappingB: { amount: 'Amount', date: 'Date', reference: 'Reference' }
});
assert.equal(matched.length, CSV_ROWS);
assert.equal(summarize(matched).exact_match, CSV_ROWS);
const reconcileMs = performance.now() - reconcileStart;

const here = dirname(fileURLToPath(import.meta.url));
const vendorPath = resolve(here, '../vendor/xlsx.mini.min.js');
const vendorBytes = await readFile(vendorPath);
assert.equal(createHash('sha256').update(vendorBytes).digest('hex'), '0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939');
const context = vm.createContext({ console, Uint8Array, Int8Array, Uint16Array, Int16Array, Uint32Array, Int32Array, Float32Array, Float64Array, ArrayBuffer, DataView, TextEncoder, TextDecoder, Date, Math, JSON, Map, Set, RegExp, Error, TypeError, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, escape, unescape });
vm.runInContext(vendorBytes.toString('utf8'), context, { filename: 'xlsx.mini.min.js' });
const XLSX = context.XLSX;
assert.equal(XLSX.version, EXPECTED_XLSX_VERSION);

const XLSX_ROWS = 50000;
const xlsxStart = performance.now();
const aoa = [['Date', 'Reference', 'Amount']];
for (let i = 0; i < XLSX_ROWS; i += 1) aoa.push(['2026-09-01', `X${i}`, i + 1]);
const book = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(aoa), 'Transactions');
const bytes = XLSX.write(book, { bookType: 'xlsx', type: 'array', compression: true });
const file = {
  name: 'stress.xlsx',
  size: bytes.byteLength,
  async arrayBuffer() {
    return bytes instanceof ArrayBuffer ? bytes : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  }
};
const source = await readXlsxFile(file, XLSX);
const xlsxTable = tableFromXlsx(source, 'Transactions', 1, XLSX);
assert.equal(xlsxTable.rows.length, XLSX_ROWS);
const xlsxMs = performance.now() - xlsxStart;

console.log(JSON.stringify({ csvRows: CSV_ROWS, csvParseMs: Math.round(csvParseMs), reconcileMs: Math.round(reconcileMs), xlsxRows: XLSX_ROWS, xlsxBytes: bytes.byteLength, xlsxMs: Math.round(xlsxMs), heapMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) }));
console.log('reconcile stress tests: OK');
''')

Path(".github/workflows/reconcile-quality-check.yml").write_text("""name: Reconcile quality check

on:
  pull_request:
    paths:
      - 'tools/reconcile/**'
      - '.agent/plans/2026-09-13-reconcile-quality-performance.md'
      - '.github/workflows/reconcile-quality-check.yml'
  push:
    branches:
      - main
    paths:
      - 'tools/reconcile/**'
      - '.agent/plans/2026-09-13-reconcile-quality-performance.md'
      - '.github/workflows/reconcile-quality-check.yml'

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Syntax
        run: |
          node --check tools/reconcile/app.mjs
          node --check tools/reconcile/parser.mjs
          node --check tools/reconcile/normalize.mjs
          node --check tools/reconcile/reconcile-engine.mjs
          node --check tools/reconcile/export.mjs
          node --check tools/reconcile/xlsx-adapter.mjs
          node --check tools/reconcile/rules-store.mjs
      - name: Reconcile tests
        run: |
          for test in tools/reconcile/tests/*.test.mjs; do
            echo "==> $test"
            node "$test"
          done
""")

Path(__file__).unlink()
