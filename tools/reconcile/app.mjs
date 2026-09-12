import { readCsvFile, tableFromRows, parseCsvText } from './parser.mjs';
import { reconcile, summarize } from './reconcile-engine.mjs';
import { resultsToCsv, downloadText, downloadBytes } from './export.mjs';
import { ensureXlsxAvailable, readXlsxFile, tableFromXlsx, resultsWorkbookBytes } from './xlsx-adapter.mjs';
import { createProfileStore } from './rules-store.mjs';

const FREE_MAX_ROWS = 500;
const FREE_MAX_BYTES = 5 * 1024 * 1024;
const PRO_CSV_MAX_ROWS = 100000;
const PRO_CSV_MAX_BYTES = 50 * 1024 * 1024;
const PRO_XLSX_MAX_ROWS = 50000;
const PRO_XLSX_MAX_BYTES = 25 * 1024 * 1024;
const RECONCILE_PRODUCT_ID = 'reconcile.pro_v1';
const RECONCILE_FEATURE_ID = 'reconcile_pro_v1';
const profileStore = createProfileStore(localStorage);

const state = {
  lang: localStorage.getItem('nw_lang') || (navigator.language.startsWith('ja') ? 'ja' : 'en'),
  proEnabled: false,
  proStatus: 'checking',
  checkoutBusy: false,
  selectedProfileId: '',
  a: null,
  b: null,
  results: [],
  filtered: [],
  runContext: null
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

function renderProState() {
  document.querySelectorAll('[data-pro-state]').forEach((node) => {
    if (state.proEnabled) {
      node.textContent = message('Pro有効', 'Pro active');
      return;
    }
    if (state.proStatus === 'checking') {
      node.textContent = message('確認中', 'Checking');
      return;
    }
    if (state.proStatus === 'error') {
      node.textContent = message('確認エラー', 'Check error');
      return;
    }
    node.textContent = 'Free';
  });
  const checkoutButton = $('proCheckoutBtn');
  if (checkoutButton) checkoutButton.disabled = state.proEnabled || state.checkoutBusy;
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
  renderProfileList();
  renderProState();
  renderStatus();
}

function setProState(enabled, status = enabled ? 'active' : 'free') {
  state.proEnabled = Boolean(enabled);
  state.proStatus = status;
  document.querySelectorAll('[data-pro-control]').forEach((node) => {
    node.disabled = !state.proEnabled;
  });
  renderProState();
  renderProfileList();
}

function requirePro() {
  if (state.proEnabled) return true;
  setNotice(message('この機能はReconcile Pro用です。購入済みの場合はページを再読み込みして権利を再確認してください。', 'This feature requires Reconcile Pro. If you already purchased it, reload the page to re-check the entitlement.'), 'warning');
  return false;
}

async function refreshProEntitlement() {
  const adapter = window.NicheWorksProEntitlement;
  setProState(false, 'checking');
  if (!adapter || typeof adapter.refreshProState !== 'function') {
    setProState(false, 'error');
    return;
  }
  try {
    const result = await adapter.refreshProState({
      productId: RECONCILE_PRODUCT_ID,
      featureId: RECONCILE_FEATURE_ID
    });
    setProState(Boolean(result?.active), result?.active ? 'active' : (result?.state === 'entitlement-error' ? 'error' : 'free'));
  } catch {
    setProState(false, 'error');
  }
}

async function startProCheckout() {
  if (state.proEnabled || state.checkoutBusy) return;
  state.checkoutBusy = true;
  renderProState();
  setNotice(message('安全な決済ページを準備しています。', 'Preparing secure checkout.'), '');
  try {
    const response = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: RECONCILE_PRODUCT_ID, returnPath: '/tools/reconcile/' })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok || typeof data?.url !== 'string') {
      throw new Error(data?.error || 'checkout_unavailable');
    }
    const checkoutUrl = new URL(data.url);
    if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.stripe.com') {
      throw new Error('checkout_url_invalid');
    }
    location.assign(checkoutUrl.toString());
  } catch (error) {
    state.checkoutBusy = false;
    renderProState();
    const code = String(error?.message || error);
    setNotice(message(`Reconcile Proの決済を開始できませんでした (${code})。`, `Could not start Reconcile Pro checkout (${code}).`), 'error');
  }
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

function rowLimitOk(table, type = 'csv') {
  const maxRows = state.proEnabled
    ? (type === 'xlsx' ? PRO_XLSX_MAX_ROWS : PRO_CSV_MAX_ROWS)
    : FREE_MAX_ROWS;
  if (table.rows.length <= maxRows) return true;
  const label = state.proEnabled
    ? (type === 'xlsx' ? '50,000' : '100,000')
    : '500';
  setNotice(message(`このプランでは1ファイル${label}行までです（検出: ${table.rows.length}行）。`, `This plan supports up to ${label} rows per file (detected: ${table.rows.length}).`), 'error');
  return false;
}

function installTable(side, table, metadata, { guessColumns = true } = {}) {
  if (!rowLimitOk(table, metadata.type)) return false;
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
  if (!rowLimitOk(table, current.type)) return;
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

function maxFileBytesFor(type) {
  if (!state.proEnabled) return FREE_MAX_BYTES;
  return type === 'xlsx' ? PRO_XLSX_MAX_BYTES : PRO_CSV_MAX_BYTES;
}

async function loadFile(side, file) {
  if (!file) return;
  const lower = file.name.toLowerCase();
  const type = lower.endsWith('.xlsx') ? 'xlsx' : lower.endsWith('.csv') ? 'csv' : '';
  if (!type) {
    setNotice(message('CSVまたはXLSXを選択してください。', 'Choose a CSV or XLSX file.'), 'error');
    return;
  }
  const maxBytes = maxFileBytesFor(type);
  if (file.size > maxBytes) {
    const label = state.proEnabled ? (type === 'xlsx' ? '25MB' : '50MB') : '5MB';
    setNotice(message(`このプランでは${type.toUpperCase()}は1ファイル${label}までです。`, `This plan supports ${type.toUpperCase()} files up to ${label} each.`), 'error');
    return;
  }
  try {
    if (type === 'csv') await loadCsv(side, file);
    else await loadXlsx(side, file);
  } catch (error) {
    const code = String(error?.message || error);
    if (code === 'xlsx_library_missing' || code === 'xlsx_vendor_load_failed') {
      setNotice(message('XLSX処理ライブラリを読み込めませんでした。ローカルvendorの読み込みに失敗したためXLSX処理を停止しました。', 'The XLSX library could not be loaded. XLSX processing stopped because the local vendor payload failed to load.'), 'warning');
      return;
    }
    if (code === 'xlsx_version_mismatch') {
      setNotice(message('XLSXライブラリの版が固定仕様と一致しません。処理を停止しました。', 'The XLSX library version does not match the pinned contract. Processing stopped.'), 'error');
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

function currentOptions() {
  return {
    dateToleranceDays: Number($('dateTolerance').value),
    amountTolerance: state.proEnabled ? Number($('amountTolerance').value || 0) : 0,
    dateMode: $('dateMode').value,
    signMode: state.proEnabled ? $('signMode').value : 'normal',
    groupMatching: state.proEnabled ? $('groupMatching').checked : false,
    maxGroupSize: state.proEnabled ? Number($('maxGroupSize').value || 5) : 5
  };
}

function currentProfileConfig() {
  const delimiter = $('delimiter').value === 'tab' ? '\t' : $('delimiter').value;
  return {
    parser: {
      encoding: $('encoding').value,
      delimiter,
      headerRow: Number($('headerRow').value || 1)
    },
    mappingA: mapping('a'),
    mappingB: mapping('b'),
    options: currentOptions()
  };
}

function setMapping(side, savedMapping) {
  const table = state[side];
  if (!table) return [];
  const suffix = side.toUpperCase();
  const missing = [];
  for (const field of ['amount', 'date', 'reference', 'description']) {
    const value = savedMapping?.[field] || '';
    const exists = !value || table.headers.includes(value);
    $(`${field}${suffix}`).value = exists ? value : '';
    if (value && !exists) missing.push(`${side.toUpperCase()}:${value}`);
  }
  return missing;
}

function applyProfile(profile) {
  const config = profile?.config;
  if (!config) return;
  $('encoding').value = config.parser.encoding;
  $('delimiter').value = config.parser.delimiter === '\t' ? 'tab' : config.parser.delimiter;
  $('headerRow').value = String(config.parser.headerRow);
  $('dateTolerance').value = String(config.options.dateToleranceDays);
  $('dateMode').value = config.options.dateMode;
  $('amountTolerance').value = String(config.options.amountTolerance);
  $('signMode').value = config.options.signMode;
  $('groupMatching').checked = Boolean(config.options.groupMatching);
  $('maxGroupSize').value = String(config.options.maxGroupSize);
  if (state.a) rebuildSide('a');
  if (state.b) rebuildSide('b');
  const missing = [...setMapping('a', config.mappingA), ...setMapping('b', config.mappingB)];
  state.selectedProfileId = profile.id;
  $('profileName').value = profile.name;
  $('profileSelect').value = profile.id;
  if (missing.length) {
    setNotice(message(`ルール「${profile.name}」を適用しましたが、現在のファイルに存在しない列があります: ${missing.join(', ')}`, `Applied profile “${profile.name}”, but some saved columns are missing from the current files: ${missing.join(', ')}`), 'warning');
    return;
  }
  setNotice(message(`ルール「${profile.name}」を適用しました。`, `Applied profile “${profile.name}”.`), 'success');
}

function renderProfileList() {
  const select = $('profileSelect');
  if (!select) return;
  const profiles = profileStore.list();
  const selected = state.selectedProfileId;
  select.innerHTML = `<option value="">${escapeHtml(message('保存済みルールを選択', 'Choose saved profile'))}</option>`;
  for (const profile of profiles) {
    const option = document.createElement('option');
    option.value = profile.id;
    option.textContent = profile.name;
    select.appendChild(option);
  }
  if (selected && profiles.some((profile) => profile.id === selected)) select.value = selected;
  $('profileCount').textContent = message(`${profiles.length} / 20 保存`, `${profiles.length} / 20 saved`);
}

function saveProfile() {
  if (!requirePro()) return;
  const name = $('profileName').value.trim();
  if (!name) return setNotice(message('ルール名を入力してください。', 'Enter a profile name.'), 'error');
  const saved = profileStore.save({
    id: state.selectedProfileId || undefined,
    name,
    config: currentProfileConfig()
  });
  state.selectedProfileId = saved.id;
  renderProfileList();
  $('profileSelect').value = saved.id;
  setNotice(message(`ルール「${saved.name}」をブラウザに保存しました。`, `Saved profile “${saved.name}” in this browser.`), 'success');
}

function selectProfile() {
  if (!requirePro()) return;
  const id = $('profileSelect').value;
  const profile = profileStore.list().find((item) => item.id === id);
  if (!profile) return;
  applyProfile(profile);
}

function deleteProfile() {
  if (!requirePro()) return;
  const id = $('profileSelect').value || state.selectedProfileId;
  if (!id) return setNotice(message('削除するルールを選択してください。', 'Choose a profile to delete.'), 'error');
  profileStore.remove(id);
  state.selectedProfileId = '';
  $('profileName').value = '';
  renderProfileList();
  setNotice(message('保存済みルールを削除しました。', 'Deleted the saved profile.'), 'success');
}

function exportProfiles() {
  if (!requirePro()) return;
  const text = profileStore.exportBundle();
  downloadText(`nicheworks-reconcile-profiles-${new Date().toISOString().slice(0, 10)}.json`, text, 'application/json;charset=utf-8');
}

async function importProfiles(file) {
  if (!requirePro() || !file) return;
  try {
    const text = await file.text();
    const result = profileStore.importBundle(text);
    renderProfileList();
    setNotice(message(`${result.imported}件のルールを読み込みました。`, `Imported ${result.imported} profile(s).`), 'success');
  } catch (error) {
    setNotice(message(`ルールを読み込めませんでした: ${error.message}`, `Could not import profiles: ${error.message}`), 'error');
  } finally {
    $('profileImport').value = '';
  }
}

function run() {
  if (!state.a || !state.b) return setNotice(message('ファイルAとBを読み込んでください。', 'Load both file A and file B.'), 'error');
  const mappingA = mapping('a');
  const mappingB = mapping('b');
  if (!mappingA.amount || !mappingB.amount) return setNotice(message('両方の金額列を指定してください。', 'Select an amount column for both files.'), 'error');
  const options = currentOptions();
  try {
    state.results = reconcile({
      rowsA: state.a.rows,
      rowsB: state.b.rows,
      mappingA,
      mappingB,
      options
    });
    state.runContext = {
      rowsA: state.a.rows,
      rowsB: state.b.rows,
      mappingA: { ...mappingA },
      mappingB: { ...mappingB },
      fileA: state.a.name || '',
      fileB: state.b.name || '',
      fileAType: state.a.type || '',
      fileBType: state.b.type || '',
      headerRow: Number($('headerRow').value || 1),
      options: { ...options },
      generatedAt: new Date().toISOString()
    };
    renderSummary();
    applyFilter();
    setNotice(message('照合が完了しました。', 'Reconciliation complete.'), 'success');
  } catch (error) {
    state.runContext = null;
    if (error?.code === 'candidate_graph_too_large' || error?.message === 'candidate_graph_too_large') {
      setNotice(message('候補が多すぎるため安全上照合を停止しました。日付または取引ID/参照列を追加して候補を絞ってください。', 'Reconciliation stopped because there are too many possible matches. Map Date and/or Transaction ID / Reference to narrow the candidates.'), 'warning');
      return;
    }
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
  if (!state.results.length || !state.runContext) return setNotice(message('先に照合してください。', 'Run reconciliation first.'), 'error');
  downloadText(`nicheworks-reconcile-${new Date().toISOString().slice(0, 10)}.csv`, resultsToCsv(state.results, state.runContext));
}

async function exportXlsx() {
  if (!requirePro()) return;
  if (!state.results.length || !state.runContext) return setNotice(message('先に照合してください。', 'Run reconciliation first.'), 'error');
  try {
    await ensureXlsxAvailable();
    const bytes = resultsWorkbookBytes(state.results, state.runContext);
    downloadBytes(`nicheworks-reconcile-${new Date().toISOString().slice(0, 10)}.xlsx`, bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  } catch (error) {
    setNotice(message(`XLSXを出力できませんでした: ${error.message}`, `Could not export XLSX: ${error.message}`), 'error');
  }
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
  $('exportXlsxBtn').addEventListener('click', exportXlsx);
  $('profileSaveBtn').addEventListener('click', saveProfile);
  $('profileSelect').addEventListener('change', selectProfile);
  $('profileDeleteBtn').addEventListener('click', deleteProfile);
  $('profileExportBtn').addEventListener('click', exportProfiles);
  $('profileImport').addEventListener('change', (event) => importProfiles(event.target.files[0]));
  if ($('proCheckoutBtn')) $('proCheckoutBtn').addEventListener('click', startProCheckout);
  setLang(state.lang);
  setProState(false, 'checking');
  refreshProEntitlement();
}

wire();
