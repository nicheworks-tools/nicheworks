import { readCsvFile, tableFromRows, parseCsvText } from './parser.mjs';
import { reconcile, summarize } from './reconcile-engine.mjs';
import { resultsToCsv, downloadText } from './export.mjs';
import { ensureXlsxAvailable, readXlsxFile, tableFromXlsx } from './xlsx-adapter.mjs';

const FREE_MAX_ROWS = 500;
const FREE_MAX_BYTES = 5 * 1024 * 1024;
const state = {
  lang: localStorage.getItem('nw_lang') || (navigator.language.startsWith('ja') ? 'ja' : 'en'),
  a: null,
  b: null,
  results: [],
  filtered: []
};

const $ = (id) => document.getElementById(id);
const message = (ja, en) => state.lang === 'ja' ? ja : en;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function setNotice(text, kind = '') {
  const node = $('notice');
  node.textContent = text;
  node.className = `notice ${kind}`.trim();
}

function setLang(lang) {
  state.lang = lang === 'en' ? 'en' : 'ja';
  localStorage.setItem('nw_lang', state.lang);
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.hidden = node.dataset.i18n !== state.lang;
  });
  document.querySelectorAll('[data-lang]').forEach((button) => button.classList.toggle('active', button.dataset.lang === state.lang));
  if (state.a) refreshMappingPlaceholders('a');
  if (state.b) refreshMappingPlaceholders('b');
  renderStatus();
}

function populateSelect(select, headers, placeholder, selected = '') {
  select.innerHTML = '';
  const first = document.createElement('option');
  first.value = '';
  first.textContent = placeholder;
  select.appendChild(first);
  for (const header of headers) {
    const option = document.createElement('option');
    option.value = header;
    option.textContent = header;
    select.appendChild(option);
  }
  if (selected && headers.includes(selected)) select.value = selected;
}

function refreshMappingPlaceholders(side) {
  const table = state[side];
  if (!table) return;
  const suffix = side.toUpperCase();
  for (const field of ['amount', 'date', 'reference', 'description']) {
    const select = $(`${field}${suffix}`);
    const selected = select.value;
    populateSelect(select, table.headers, message('未選択', 'Not selected'), selected);
  }
}

function guess(headers, patterns) {
  return headers.find((header) => patterns.some((pattern) => pattern.test(header))) || '';
}

function applyGuesses(side) {
  const table = state[side];
  if (!table) return;
  const suffix = side.toUpperCase();
  const headers = table.headers;
  $(`amount${suffix}`).value = guess(headers, [/amount/i, /金額/, /合計/, /total/i, /支払/]);
  $(`date${suffix}`).value = guess(headers, [/date/i, /日付/, /取引日/, /決済日/]);
  $(`reference${suffix}`).value = guess(headers, [/reference/i, /transaction.?id/i, /注文番号/, /取引id/i, /^id$/i]);
  $(`description${suffix}`).value = guess(headers, [/description/i, /摘要/, /内容/, /memo/i, /備考/]);
}

function renderPreview(side) {
  const table = state[side];
  const suffix = side.toUpperCase();
  const target = $(`preview${suffix}`);
  const meta = $(`meta${suffix}`);
  if (!table) {
    target.innerHTML = '<p class="muted">—</p>';
    meta.textContent = '';
    return;
  }
  const sourceLabel = table.type === 'xlsx' ? `${table.name} · ${table.sheetName}` : `${table.name} · ${table.encoding}`;
  meta.textContent = `${sourceLabel} · ${table.rows.length} rows · ${table.headers.length} columns`;
  const head = `<tr>${table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  const body = table.rows.slice(0, 6).map((row) => `<tr>${table.headers.map((h) => `<td>${escapeHtml(row.values[h])}</td>`).join('')}</tr>`).join('');
  target.innerHTML = `<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

function rowLimitOk(table) {
  if (table.rows.length <= FREE_MAX_ROWS) return true;
  setNotice(message(`Free版は500行までです（検出: ${table.rows.length}行）。`, `Free supports 500 rows per file (detected: ${table.rows.length}).`), 'error');
  return false;
}

function installTable(side, table, metadata, { guessColumns = true } = {}) {
  if (!rowLimitOk(table)) return false;
  state[side] = { ...metadata, ...table };
  const suffix = side.toUpperCase();
  for (const field of ['amount', 'date', 'reference', 'description']) {
    populateSelect($(`${field}${suffix}`), table.headers, message('未選択', 'Not selected'));
  }
  if (guessColumns) applyGuesses(side);
  renderPreview(side);
  return true;
}

function configureSheetSelect(side, sheetNames, selected) {
  const suffix = side.toUpperCase();
  const wrap = $(`sheetWrap${suffix}`);
  const select = $(`sheet${suffix}`);
  select.innerHTML = '';
  for (const name of sheetNames) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  }
  select.value = selected;
  wrap.hidden = sheetNames.length <= 1;
}

function hideSheetSelect(side) {
  $(`sheetWrap${side.toUpperCase()}`).hidden = true;
}

function rebuildSide(side) {
  const current = state[side];
  if (!current) return;
  const suffix = side.toUpperCase();
  const previous = {
    amount: $(`amount${suffix}`).value,
    date: $(`date${suffix}`).value,
    reference: $(`reference${suffix}`).value,
    description: $(`description${suffix}`).value
  };
  const headerRow = Number($('headerRow').value || 1);
  const table = current.type === 'csv'
    ? tableFromRows(current.rawRows, headerRow)
    : tableFromXlsx(current.xlsxSource, current.sheetName, headerRow);
  if (!rowLimitOk(table)) return;
  state[side] = { ...current, ...table };
  for (const field of ['amount', 'date', 'reference', 'description']) {
    populateSelect($(`${field}${suffix}`), table.headers, message('未選択', 'Not selected'), previous[field]);
  }
  renderPreview(side);
}

async function loadCsv(side, file) {
  const selectedDelimiter = $('delimiter').value === 'tab' ? '\t' : $('delimiter').value;
  const parsed = await readCsvFile(file, { encoding: $('encoding').value, delimiter: selectedDelimiter });
  const table = tableFromRows(parsed.rows, Number($('headerRow').value || 1));
  hideSheetSelect(side);
  if (!installTable(side, table, {
    type: 'csv',
    name: parsed.name,
    size: parsed.size,
    encoding: parsed.encoding,
    delimiter: parsed.delimiter,
    rawRows: parsed.rows
  })) return;
  setNotice(message(`${side.toUpperCase()}のCSVを読み込みました。`, `Loaded CSV file ${side.toUpperCase()}.`), 'success');
}

async function loadXlsx(side, file) {
  await ensureXlsxAvailable();
  const source = await readXlsxFile(file);
  const sheetName = source.sheetNames[0];
  const table = tableFromXlsx(source, sheetName, Number($('headerRow').value || 1));
  configureSheetSelect(side, source.sheetNames, sheetName);
  if (!installTable(side, table, {
    type: 'xlsx',
    name: source.name,
    size: source.size,
    encoding: 'xlsx',
    xlsxSource: source,
    sheetName
  })) return;
  setNotice(message(`${side.toUpperCase()}のExcelを読み込みました。`, `Loaded Excel file ${side.toUpperCase()}.`), 'success');
}

async function loadFile(side, file) {
  if (!file) return;
  if (file.size > FREE_MAX_BYTES) {
    setNotice(message('Free版は1ファイル5MBまでです。', 'Free supports files up to 5 MB each.'), 'error');
    return;
  }
  const lower = file.name.toLowerCase();
  try {
    if (lower.endsWith('.csv')) await loadCsv(side, file);
    else if (lower.endsWith('.xlsx')) await loadXlsx(side, file);
    else setNotice(message('CSVまたはXLSXを選択してください。', 'Choose a CSV or XLSX file.'), 'error');
  } catch (error) {
    const code = String(error?.message || error);
    if (code === 'xlsx_library_missing' || code === 'xlsx_vendor_load_failed') {
      setNotice(message('XLSX処理ライブラリはまだこの開発ブランチへ同梱されていません。CSVは利用できます。', 'The XLSX processing library has not been vendored into this development branch yet. CSV remains available.'), 'warning');
      return;
    }
    setNotice(message(`ファイルを読み込めませんでした: ${code}`, `Could not load file: ${code}`), 'error');
  }
}

function mapping(side) {
  const suffix = side.toUpperCase();
  return {
    amount: $(`amount${suffix}`).value,
    date: $(`date${suffix}`).value,
    reference: $(`reference${suffix}`).value,
    description: $(`description${suffix}`).value
  };
}

function run() {
  if (!state.a || !state.b) return setNotice(message('ファイルAとBを読み込んでください。', 'Load both file A and file B.'), 'error');
  const mappingA = mapping('a');
  const mappingB = mapping('b');
  if (!mappingA.amount || !mappingB.amount) return setNotice(message('両方の金額列を指定してください。', 'Select an amount column for both files.'), 'error');
  try {
    state.results = reconcile({
      rowsA: state.a.rows,
      rowsB: state.b.rows,
      mappingA,
      mappingB,
      options: {
        dateToleranceDays: Number($('dateTolerance').value),
        amountTolerance: 0,
        dateMode: $('dateMode').value,
        signMode: 'normal',
        groupMatching: false
      }
    });
    renderSummary();
    applyFilter();
    setNotice(message('照合が完了しました。', 'Reconciliation complete.'), 'success');
  } catch (error) {
    setNotice(message(`照合できませんでした: ${error.message}`, `Reconciliation failed: ${error.message}`), 'error');
  }
}

function renderSummary() {
  const summary = summarize(state.results);
  const cards = [
    ['exact_match', '完全一致', 'Exact'], ['tolerant_match', '条件一致', 'Tolerant'], ['candidate', '候補', 'Candidates'],
    ['a_only', 'Aのみ', 'A only'], ['b_only', 'Bのみ', 'B only'], ['duplicate', '重複', 'Duplicates'], ['conflict', '競合', 'Conflicts']
  ];
  $('summary').innerHTML = cards.map(([key, ja, en]) => `<button type="button" class="summary-card" data-status="${key}"><strong>${summary[key]}</strong><span>${state.lang === 'ja' ? ja : en}</span></button>`).join('');
  $('summary').querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', () => {
    $('statusFilter').value = button.dataset.status;
    applyFilter();
  }));
}

function applyFilter() {
  const status = $('statusFilter').value;
  const query = $('resultSearch').value.trim().toLowerCase();
  state.filtered = state.results.filter((item) => {
    if (status && item.status !== status) return false;
    if (!query) return true;
    return [item.status, item.relation, item.aRows.join(' '), item.bRows.join(' '), item.amount, item.date, item.reason].join(' ').toLowerCase().includes(query);
  });
  renderResults();
}

function renderResults() {
  $('resultBody').innerHTML = state.filtered.map((item) => `<tr>
    <td><span class="status status-${item.status}">${escapeHtml(item.status)}</span></td>
    <td>${escapeHtml(item.relation)}</td>
    <td>${escapeHtml(item.aRows.join(', ') || '—')}</td>
    <td>${escapeHtml(item.bRows.join(', ') || '—')}</td>
    <td>${item.amount ?? '—'}</td>
    <td>${escapeHtml(item.date || '—')}</td>
    <td>${escapeHtml(item.reason)}</td>
  </tr>`).join('');
  $('resultCount').textContent = `${state.filtered.length} / ${state.results.length}`;
}

function exportCsv() {
  if (!state.results.length) return setNotice(message('先に照合してください。', 'Run reconciliation first.'), 'error');
  downloadText(`nicheworks-reconcile-${new Date().toISOString().slice(0, 10)}.csv`, resultsToCsv(state.results));
}

function loadSample() {
  const csvA = 'Date,Reference,Description,Amount\n2026-09-01,ORD-001,Alpha,12800\n2026-09-02,ORD-002,Beta,5500\n2026-09-03,ORD-003,Gamma,20000\n2026-09-04,ORD-004,Delta,10000\n';
  const csvB = 'Transaction Date,Transaction ID,Memo,Total\n2026-09-01,ORD-001,Alpha settlement,12800\n2026-09-03,ORD-002,Beta settlement,5500\n2026-09-03,ORD-003,Gamma settlement,20000\n2026-09-05,ORD-999,Other,7777\n';
  const make = (text, name) => {
    const parsed = parseCsvText(text);
    const table = tableFromRows(parsed.rows, 1);
    return { ...table, type: 'csv', name, encoding: 'utf-8', delimiter: ',', rawRows: parsed.rows };
  };
  state.a = make(csvA, 'sample-sales.csv');
  state.b = make(csvB, 'sample-ledger.csv');
  hideSheetSelect('a');
  hideSheetSelect('b');
  for (const side of ['a', 'b']) {
    refreshMappingPlaceholders(side);
    applyGuesses(side);
    renderPreview(side);
  }
  setNotice(message('サンプルデータを読み込みました。', 'Loaded sample data.'), 'success');
}

function renderStatus() {
  if (!state.results.length) return;
  renderSummary();
  renderResults();
}

function wire() {
  document.querySelectorAll('[data-lang]').forEach((button) => button.addEventListener('click', () => setLang(button.dataset.lang)));
  $('fileA').addEventListener('change', (event) => loadFile('a', event.target.files[0]));
  $('fileB').addEventListener('change', (event) => loadFile('b', event.target.files[0]));
  $('sheetA').addEventListener('change', (event) => {
    if (!state.a?.xlsxSource) return;
    state.a.sheetName = event.target.value;
    rebuildSide('a');
  });
  $('sheetB').addEventListener('change', (event) => {
    if (!state.b?.xlsxSource) return;
    state.b.sheetName = event.target.value;
    rebuildSide('b');
  });
  $('headerRow').addEventListener('change', () => {
    if (state.a) rebuildSide('a');
    if (state.b) rebuildSide('b');
  });
  $('sampleBtn').addEventListener('click', loadSample);
  $('reconcileBtn').addEventListener('click', run);
  $('statusFilter').addEventListener('change', applyFilter);
  $('resultSearch').addEventListener('input', applyFilter);
  $('exportCsvBtn').addEventListener('click', exportCsv);
  setLang(state.lang);
}

wire();
