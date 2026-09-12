import { readCsvFile, tableFromRows, parseCsvText } from './parser.mjs';
import { reconcile, summarize } from './reconcile-engine.mjs';
import { resultsToCsv, downloadText } from './export.mjs';

const FREE_MAX_ROWS = 500;
const FREE_MAX_BYTES = 5 * 1024 * 1024;
const state = { lang: localStorage.getItem('nw_lang') || (navigator.language.startsWith('ja') ? 'ja' : 'en'), a: null, b: null, results: [], filtered: [] };

const $ = (id) => document.getElementById(id);

function setLang(lang) {
  state.lang = lang === 'en' ? 'en' : 'ja';
  localStorage.setItem('nw_lang', state.lang);
  document.documentElement.lang = state.lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.hidden = node.dataset.i18n !== state.lang;
  });
  document.querySelectorAll('[data-lang]').forEach((button) => button.classList.toggle('active', button.dataset.lang === state.lang));
  renderStatus();
}

function message(ja, en) { return state.lang === 'ja' ? ja : en; }

function setNotice(text, kind = '') {
  const node = $('notice');
  node.textContent = text;
  node.className = `notice ${kind}`.trim();
}

function populateSelect(select, headers, placeholder) {
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
}

function guess(headers, patterns) {
  return headers.find((header) => patterns.some((pattern) => pattern.test(header))) || '';
}

function applyGuesses(side) {
  const table = state[side];
  if (!table) return;
  const suffix = side.toUpperCase();
  const headers = table.headers;
  const amount = guess(headers, [/amount/i, /金額/, /合計/, /total/i, /支払/]);
  const date = guess(headers, [/date/i, /日付/, /取引日/, /決済日/]);
  const reference = guess(headers, [/reference/i, /transaction.?id/i, /注文番号/, /取引id/i, /^id$/i]);
  const description = guess(headers, [/description/i, /摘要/, /内容/, /memo/i, /備考/]);
  $(`amount${suffix}`).value = amount;
  $(`date${suffix}`).value = date;
  $(`reference${suffix}`).value = reference;
  $(`description${suffix}`).value = description;
}

function renderPreview(side) {
  const table = state[side];
  const target = $(`preview${side.toUpperCase()}`);
  const meta = $(`meta${side.toUpperCase()}`);
  if (!table) {
    target.innerHTML = '<p class="muted">—</p>';
    meta.textContent = '';
    return;
  }
  meta.textContent = `${table.name} · ${table.rows.length} rows · ${table.headers.length} columns · ${table.encoding}`;
  const head = `<tr>${table.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  const body = table.rows.slice(0, 6).map((row) => `<tr>${table.headers.map((h) => `<td>${escapeHtml(row.values[h])}</td>`).join('')}</tr>`).join('');
  target.innerHTML = `<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

async function loadFile(side, file) {
  if (!file) return;
  if (file.size > FREE_MAX_BYTES) {
    setNotice(message('Free版は1ファイル5MBまでです。', 'Free supports files up to 5 MB each.'), 'error');
    return;
  }
  if (!file.name.toLowerCase().endsWith('.csv')) {
    setNotice(message('この実装波ではCSVのみ動作します。XLSXは次工程で接続します。', 'This implementation wave supports CSV only. XLSX is connected in a later wave.'), 'warning');
    return;
  }
  try {
    const parsed = await readCsvFile(file, { encoding: $('encoding').value, delimiter: $('delimiter').value });
    const headerRow = Number($('headerRow').value || 1);
    const table = tableFromRows(parsed.rows, headerRow);
    if (table.rows.length > FREE_MAX_ROWS) {
      setNotice(message(`Free版は500行までです（検出: ${table.rows.length}行）。`, `Free supports 500 rows per file (detected: ${table.rows.length}).`), 'error');
      return;
    }
    state[side] = { ...table, name: parsed.name, encoding: parsed.encoding, delimiter: parsed.delimiter };
    const suffix = side.toUpperCase();
    ['amount', 'date', 'reference', 'description'].forEach((field) => populateSelect($(`${field}${suffix}`), table.headers, message('未選択', 'Not selected')));
    applyGuesses(side);
    renderPreview(side);
    setNotice(message(`${side.toUpperCase()}を読み込みました。`, `Loaded file ${side.toUpperCase()}.`), 'success');
  } catch (error) {
    setNotice(message(`CSVを読み込めませんでした: ${error.message}`, `Could not load CSV: ${error.message}`), 'error');
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
      options: { dateToleranceDays: Number($('dateTolerance').value), amountTolerance: 0, dateMode: $('dateMode').value }
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
  $('summary').querySelectorAll('[data-status]').forEach((button) => button.addEventListener('click', () => { $('statusFilter').value = button.dataset.status; applyFilter(); }));
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
  const tbody = $('resultBody');
  tbody.innerHTML = state.filtered.map((item) => `<tr>
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
    return { ...table, name, encoding: 'utf-8', delimiter: ',' };
  };
  state.a = make(csvA, 'sample-sales.csv');
  state.b = make(csvB, 'sample-ledger.csv');
  for (const side of ['a', 'b']) {
    const suffix = side.toUpperCase();
    ['amount', 'date', 'reference', 'description'].forEach((field) => populateSelect($(`${field}${suffix}`), state[side].headers, message('未選択', 'Not selected')));
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
  $('sampleBtn').addEventListener('click', loadSample);
  $('reconcileBtn').addEventListener('click', run);
  $('statusFilter').addEventListener('change', applyFilter);
  $('resultSearch').addEventListener('input', applyFilter);
  $('exportCsvBtn').addEventListener('click', exportCsv);
  setLang(state.lang);
}

wire();
