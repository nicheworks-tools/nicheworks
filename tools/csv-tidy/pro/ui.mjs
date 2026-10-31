// Verified-only CSV Tidy Pro interface. Never an alternative checkout or entitlement source.
import {
  capturePreset, validatePreset, serializePreset, deserializePreset
} from './preset-core.mjs';
import { buildBatchArchive } from './batch-archive.mjs';

const PRODUCT_ID = 'csv_tidy.pro_v1';
const FEATURES = ['csvTidy.savedPresets', 'csvTidy.batchApply', 'csvTidy.batchReport'];
const STORAGE_KEY = 'nicheworks:csv-tidy:pro-presets:v1';
const MAX_PRESETS = 12;
const MAX_STORAGE_BYTES = 512 * 1024;
const words = {
  ja: {
    title: 'CSV Tidy Pro', intro: '設定を保存し、同じ形式のCSVを一括整形できます。ファイル内容はブラウザ内で処理されます。',
    label: '設定名', labelHint: '例：毎月のEC出力', saved: '保存済み設定',
    save: '現在の列設定を保存', import: '設定JSONを読み込む', export: '設定JSONを書き出す',
    remove: '設定を削除', files: '一括処理するCSV（最大32件）', batch: 'CSVを一括変換してZIPを保存',
    choose: '設定を選択してください', required: '先にCSVを読み込み、設定名を入力してください。',
    savedOk: '設定をブラウザに保存しました。', imported: '設定を読み込みました。',
    deleted: '設定を削除しました。', noPreset: '保存済みの設定がありません。',
    noFiles: 'CSVファイルを選択してください。', busy: 'ブラウザ内で処理中です…',
    failed: '処理に失敗しました', access: 'Proの購入権利を再確認できませんでした。',
    replace: '同名の設定を上書きしますか？',
    deletedConfirm: '選択した設定を削除しますか？',
    done: 'ZIPを保存しました。成功 {ok}件／拒否 {bad}件／中断 {cancelled}件。拒否理由はZIP内のレポートで確認できます。',
    none: '（未選択）',
    error: '設定を確認してください'
  },
  en: {
    title: 'CSV Tidy Pro', intro: 'Save mapping settings and apply them across matching CSV files locally in your browser.',
    label: 'Preset name', labelHint: 'E.g. Monthly store export', saved: 'Saved presets',
    save: 'Save current column mapping', import: 'Import preset JSON', export: 'Export preset JSON',
    remove: 'Delete preset', files: 'Select CSV files (up to 32)', batch: 'Process CSV files and download ZIP',
    choose: 'Choose a preset', required: 'Load a CSV and enter a preset name first.',
    savedOk: 'Preset saved locally.', imported: 'Preset imported.',
    deleted: 'Preset deleted.', noPreset: 'No saved presets.',
    noFiles: 'Select CSV files.', busy: 'Processing locally in your browser…',
    failed: 'Processing failed', access: 'Your server-verified Pro entitlement could not be confirmed.',
    replace: 'Replace the preset with this name?',
    deletedConfirm: 'Delete the selected preset?',
    done: 'ZIP saved. {ok} accepted / {bad} rejected / {cancelled} cancelled. See the report inside the ZIP.',
    none: '(none)', error: 'Check your preset and try again'
  }
};
const bridge = window.NicheWorksCsvTidyProBridge;
const provider = window.NicheWorksProEntitlement;

function language() {
  return document.querySelector('.nw-lang-switch button.active')?.dataset.lang === 'en' ? 'en' : 'ja';
}
function t(key) { return words[language()][key]; }
function codeOf(error) {
  const code = String(error?.code || '');
  return /^[a-z][a-z0-9_]{1,63}$/.test(code) ? code : 'operation_failed';
}
async function checkEntitlement(feature) {
  if (!provider || typeof provider.refreshProState !== 'function') return false;
  let state;
  try { state = await provider.refreshProState({ productId: PRODUCT_ID }); }
  catch { return false; }
  if (!state || state.active !== true || state.source !== 'server' ||
      !Array.isArray(state.features)) return false;
  const granted = new Set(state.features);
  return feature ? granted.has(feature) : FEATURES.every(id => granted.has(id));
}
function readPresets() {
  let parsed;
  try { parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
  if (!Array.isArray(parsed) || parsed.length > MAX_PRESETS) return [];
  const seen = new Set();
  const found = [];
  for (const entry of parsed) {
    try {
      const preset = validatePreset(entry);
      if (seen.has(preset.label)) return [];
      seen.add(preset.label);
      found.push(preset);
    } catch { return []; }
  }
  return found;
}
function storePresets(entries) {
  if (!Array.isArray(entries) || entries.length > MAX_PRESETS) {
    const error = new Error('preset_storage_limit');
    error.code = 'preset_storage_limit';
    throw error;
  }
  const serialized = JSON.stringify(entries.map(validatePreset));
  if (new TextEncoder().encode(serialized).byteLength > MAX_STORAGE_BYTES) {
    const error = new Error('preset_storage_limit');
    error.code = 'preset_storage_limit';
    throw error;
  }
  localStorage.setItem(STORAGE_KEY, serialized);
}
function download(name, bytes, contentType) {
  const blob = new Blob([bytes], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function action(text) {
  const button = node('button', 'csvt-pro-button', text);
  button.type = 'button';
  return button;
}
function applyLocalized(nodes) {
  for (const [key, element] of Object.entries(nodes)) {
    if (element && Object.prototype.hasOwnProperty.call(words[language()], key)) {
      if (element instanceof HTMLInputElement && key === 'labelHint') element.placeholder = t(key);
      else element.textContent = t(key);
    }
  }
}
function setup() {
  const existing = document.querySelector('.csvtidy-export');
  if (!existing || !bridge || typeof bridge.snapshot !== 'function' || !bridge.codec) return;

  const panel = node('section', 'csvt-pro');
  panel.id = 'csvTidyProPanel';
  const heading = node('h2');
  const description = node('p', 'csvt-pro-description');
  const labelCaption = node('label');
  labelCaption.htmlFor = 'csvt-pro-name';
  const name = node('input');
  name.id = 'csvt-pro-name';
  name.type = 'text';
  name.maxLength = 120;
  const save = action('');
  const presetCaption = node('label');
  presetCaption.htmlFor = 'csvt-pro-presets';
  const select = node('select');
  select.id = 'csvt-pro-presets';
  const buttons = node('div', 'csvt-pro-buttons');
  const exportButton = action('');
  const importButton = action('');
  const importFile = node('input');
  importFile.type = 'file';
  importFile.accept = '.json,application/json';
  importFile.hidden = true;
  importButton.addEventListener('click', () => importFile.click());
  const deleteButton = action('');
  const csvCaption = node('label');
  csvCaption.htmlFor = 'csvt-pro-files';
  const csvFiles = node('input');
  csvFiles.id = 'csvt-pro-files';
  csvFiles.type = 'file';
  csvFiles.accept = '.csv,text/csv';
  csvFiles.multiple = true;
  const run = action('');
  const status = node('p', 'csvt-pro-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const labels = {
    title: heading, intro: description, label: labelCaption, labelHint: name,
    save, saved: presetCaption, export: exportButton, import: importButton,
    remove: deleteButton, files: csvCaption, batch: run
  };
  buttons.append(exportButton, importButton, importFile, deleteButton);
  panel.append(
    heading, description, labelCaption, name, save, presetCaption,
    select, buttons, csvCaption, csvFiles, run, status
  );
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './pro/ui.css';
  document.head.appendChild(stylesheet);
  existing.insertAdjacentElement('afterend', panel);

  const setStatus = text => { status.textContent = text; };
  const selectedPreset = () => readPresets().find(p => p.label === select.value) || null;
  function refreshSelect(selected) {
    select.replaceChildren();
    const none = node('option', '', t('none'));
    none.value = '';
    select.append(none);
    for (const preset of readPresets()) {
      const option = node('option', '', preset.label);
      option.value = preset.label;
      select.append(option);
    }
    select.value = selected || '';
    if (!select.value) select.value = '';
  }
  function renderLanguage() {
    applyLocalized(labels);
    refreshSelect(select.value);
  }
  const operate = async (feature, work) => {
    if (!(await checkEntitlement(feature))) {
      setStatus(t('access'));
      panel.remove();
      return;
    }
    try { await work(); }
    catch (error) { setStatus(t('error') + ': ' + codeOf(error)); }
  };

  save.addEventListener('click', () => operate('csvTidy.savedPresets', () => {
    const label = name.value.replace(/\s+/g, ' ').trim();
    const snapshot = bridge.snapshot();
    if (!label || !snapshot) { setStatus(t('required')); return; }
    const preset = capturePreset({ ...snapshot, label });
    const entries = readPresets();
    const found = entries.findIndex(p => p.label === label);
    if (found >= 0 && !window.confirm(t('replace'))) return;
    if (found >= 0) entries[found] = preset;
    else entries.push(preset);
    storePresets(entries);
    refreshSelect(label);
    setStatus(t('savedOk'));
  }));

  exportButton.addEventListener('click', () => operate('csvTidy.savedPresets', () => {
    const preset = selectedPreset();
    if (!preset) { setStatus(t('choose')); return; }
    const bytes = new TextEncoder().encode(serializePreset(preset));
    download('csv-tidy-preset.json', bytes, 'application/json;charset=utf-8');
  }));

  importFile.addEventListener('change', () => operate('csvTidy.savedPresets', async () => {
    const file = importFile.files?.[0];
    if (!file) return;
    try {
      if (file.size > 256 * 1024) {
        const error = new Error('preset_too_large');
        error.code = 'preset_too_large';
        throw error;
      }
      const preset = deserializePreset(await file.text());
      const entries = readPresets();
      const found = entries.findIndex(p => p.label === preset.label);
      if (found >= 0 && !window.confirm(t('replace'))) return;
      if (found >= 0) entries[found] = preset;
      else entries.push(preset);
      storePresets(entries);
      refreshSelect(preset.label);
      setStatus(t('imported'));
    } finally { importFile.value = ''; }
  }));

  deleteButton.addEventListener('click', () => operate('csvTidy.savedPresets', () => {
    const preset = selectedPreset();
    if (!preset) { setStatus(t('choose')); return; }
    if (!window.confirm(t('deletedConfirm'))) return;
    storePresets(readPresets().filter(p => p.label !== preset.label));
    refreshSelect('');
    setStatus(t('deleted'));
  }));

  run.addEventListener('click', () => operate('csvTidy.batchApply', async () => {
    if (!(await checkEntitlement('csvTidy.batchReport'))) {
      setStatus(t('access'));
      return;
    }
    const preset = selectedPreset();
    if (!preset) { setStatus(t('choose')); return; }
    const files = Array.from(csvFiles.files || []);
    if (!files.length) { setStatus(t('noFiles')); return; }
    if (files.length > 32) { setStatus(t('error') + ': invalid_batch_size'); return; }
    run.disabled = true;
    save.disabled = true;
    setStatus(t('busy'));
    // Give the live region a rendering opportunity before parsing.
    await new Promise(resolve => setTimeout(resolve, 0));
    try {
      const archive = await buildBatchArchive(files, preset, bridge.codec);
      download(archive.name, archive.bytes, archive.mimeType);
      setStatus(t('done')
        .replace('{ok}', String(archive.report.accepted))
        .replace('{bad}', String(archive.report.rejected))
        .replace('{cancelled}', String(archive.report.cancelled)));
    } finally {
      run.disabled = false;
      save.disabled = false;
    }
  }));

  document.querySelectorAll('.nw-lang-switch button').forEach(button => {
    button.addEventListener('click', () => queueMicrotask(renderLanguage));
  });
  renderLanguage();
}
async function init() {
  // An ordinary Free visitor gets no Pro controls, price/CTA or additional UI.
  if (!(await checkEntitlement(null))) return;
  setup();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
