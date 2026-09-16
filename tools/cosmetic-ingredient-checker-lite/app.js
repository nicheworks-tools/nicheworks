const inciInput = document.getElementById('inciInput');
const checkBtn = document.getElementById('checkBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const parsedCount = document.getElementById('parsedCount');
const matchedCount = document.getElementById('matchedCount');
const reviewCount = document.getElementById('reviewCount');
const unknownCount = document.getElementById('unknownCount');
const dictionaryStatus = document.getElementById('dictionaryStatus');
const categoryGrid = document.getElementById('categoryGrid');
const itemsTableBody = document.getElementById('itemsTableBody');
const itemsEmpty = document.getElementById('itemsEmpty');
const summaryBox = document.getElementById('summaryBox');
const copyStatus = document.getElementById('copyStatus');

const sharedParser = window.NWCosmeticIngredientParser;
let currentLang = 'ja';

const DICTIONARY_FILES = [
  '/tools/inci-fastscan/data/ingredients.json',
  '/tools/inci-fastscan/data/ingredients-extra-1.json',
  '/tools/inci-fastscan/data/ingredients-extra-2.json',
  '/tools/inci-fastscan/data/ingredients-extra-3.json',
  '/tools/inci-fastscan/data/ingredients-extra-4.json',
  '/tools/inci-fastscan/data/ingredients-extra-5.json',
  '/tools/inci-fastscan/data/ingredients-extra-6.json',
  '/tools/inci-fastscan/data/ingredients-extra-7.json',
  '/tools/inci-fastscan/data/ingredients-extra-8.json'
];

const CATEGORY_LABELS = {
  humectant: { ja: '保湿', en: 'Humectant' },
  moisturizer: { ja: '保湿', en: 'Moisturizer' },
  soothing: { ja: '整肌', en: 'Soothing' },
  active: { ja: '機能性成分', en: 'Active' },
  'amino acid': { ja: 'アミノ酸', en: 'Amino acid' },
  silicone: { ja: 'シリコーン', en: 'Silicone' },
  'film former': { ja: '皮膜形成', en: 'Film former' },
  emollient: { ja: 'エモリエント', en: 'Emollient' },
  oil: { ja: '油性成分', en: 'Oil' },
  solvent: { ja: '溶剤', en: 'Solvent' },
  preservative: { ja: '保存', en: 'Preservative' },
  fragrance: { ja: '香料', en: 'Fragrance' },
  surfactant: { ja: '界面活性剤', en: 'Surfactant' },
  cleanser: { ja: '洗浄', en: 'Cleanser' },
  'uv filter': { ja: 'UVフィルター', en: 'UV filter' },
  sunscreen: { ja: 'UVフィルター', en: 'UV filter' },
  colorant: { ja: '着色', en: 'Colorant' },
  pigment: { ja: '着色', en: 'Pigment' },
  antioxidant: { ja: '酸化防止', en: 'Antioxidant' },
  botanical: { ja: '植物由来', en: 'Botanical' },
  extract: { ja: '植物エキス', en: 'Extract' },
  peptide: { ja: 'ペプチド', en: 'Peptide' },
  ferment: { ja: '発酵由来', en: 'Ferment' },
  thickener: { ja: '増粘', en: 'Thickener' },
  emulsifier: { ja: '乳化', en: 'Emulsifier' },
  chelator: { ja: 'キレート', en: 'Chelating agent' },
  'chelating agent': { ja: 'キレート', en: 'Chelating agent' },
  ph: { ja: 'pH調整', en: 'pH adjuster' },
  'ph adjuster': { ja: 'pH調整', en: 'pH adjuster' },
  'viscosity adjuster': { ja: '粘度調整', en: 'Viscosity adjuster' },
  general: { ja: '役割情報整理中', en: 'Role pending' }
};

const ROLE_DESCRIPTIONS = {
  humectant: { ja: '水分を保持し、乾燥を防ぐ目的で使われる成分です。', en: 'Helps attract and retain moisture.' },
  moisturizer: { ja: '肌のうるおいを保つ目的で使われる成分です。', en: 'Used to help maintain skin moisture.' },
  soothing: { ja: '肌を整える目的で使われる成分です。', en: 'Used for skin-conditioning and soothing.' },
  active: { ja: '製品の機能性を担う目的で配合される成分です。', en: 'Used as a functional ingredient in the formula.' },
  'amino acid': { ja: '保湿やコンディショニングなどに使われるアミノ酸系成分です。', en: 'An amino-acid ingredient used for conditioning or moisture support.' },
  silicone: { ja: '感触をなめらかにしたり、表面を整える目的で使われるシリコーン系成分です。', en: 'A silicone used to improve feel and surface smoothness.' },
  'film former': { ja: '肌や毛髪の表面に膜を作る目的で使われる成分です。', en: 'Used to form a film on skin or hair.' },
  emollient: { ja: '肌をなめらかにし、うるおいを保つ目的で使われる油性成分です。', en: 'An emollient used to soften skin and reduce moisture loss.' },
  oil: { ja: '肌をなめらかにし、うるおいを保つ目的で使われる油性成分です。', en: 'An oil used for emollience and moisture retention.' },
  solvent: { ja: '他の成分を溶かしたり、処方のベースとして使われる成分です。', en: 'Used as a solvent or formula base.' },
  preservative: { ja: '製品の品質を保つために使われる保存成分です。', en: 'Used to help preserve product quality.' },
  fragrance: { ja: '製品に香りをつける目的で使われる成分です。', en: 'Used to add fragrance to the product.' },
  surfactant: { ja: '水と油をなじませたり、洗浄などに使われる界面活性剤です。', en: 'A surfactant used for cleansing, emulsifying, or dispersing.' },
  cleanser: { ja: '汚れを落とす目的で使われる洗浄成分です。', en: 'Used as a cleansing ingredient.' },
  'uv filter': { ja: '紫外線から肌を保護する目的で使われるUVフィルターです。', en: 'A UV filter used to help protect skin from ultraviolet radiation.' },
  sunscreen: { ja: '紫外線から肌を保護する目的で使われるUVフィルターです。', en: 'A UV filter used to help protect skin from ultraviolet radiation.' },
  colorant: { ja: '製品や肌に色をつける目的で使われる成分です。', en: 'Used to provide color.' },
  pigment: { ja: '製品や肌に色をつける目的で使われる顔料です。', en: 'A pigment used to provide color.' },
  antioxidant: { ja: '成分や処方の酸化を抑える目的で使われる成分です。', en: 'Used to help limit oxidation in the formula or on skin.' },
  botanical: { ja: '植物由来の成分として配合されています。', en: 'A botanical-derived ingredient.' },
  extract: { ja: '植物などから得られたエキス成分です。', en: 'An extract-derived ingredient.' },
  peptide: { ja: 'ペプチド系のコンディショニング成分です。', en: 'A peptide used for conditioning functions.' },
  ferment: { ja: '発酵由来の成分として配合されています。', en: 'A ferment-derived ingredient.' },
  thickener: { ja: '製品の粘度やテクスチャーを調整する目的で使われる成分です。', en: 'Used to adjust viscosity and texture.' },
  emulsifier: { ja: '水と油を均一に混ぜやすくする目的で使われる乳化成分です。', en: 'Used to help oil and water remain mixed.' },
  chelator: { ja: '金属イオンを捕捉し、処方を安定させる目的で使われる成分です。', en: 'Used to bind metal ions and support formula stability.' },
  'chelating agent': { ja: '金属イオンを捕捉し、処方を安定させる目的で使われる成分です。', en: 'Used to bind metal ions and support formula stability.' },
  ph: { ja: '製品のpHを調整する目的で使われる成分です。', en: 'Used to adjust product pH.' },
  'ph adjuster': { ja: '製品のpHを調整する目的で使われる成分です。', en: 'Used to adjust product pH.' },
  'viscosity adjuster': { ja: '製品の粘度を調整する目的で使われる成分です。', en: 'Used to adjust product viscosity.' },
  general: { ja: 'この成分の主な役割情報は現在整理中です。', en: 'The primary role for this ingredient is still being organized.' }
};

const FLAG_RULES = [
  { key: 'fragrance', label: { ja: '香料', en: 'Fragrance' }, note: ROLE_DESCRIPTIONS.fragrance, keywords: ['Fragrance','Parfum','Aroma','Perfume','Limonene','Linalool','Citronellol','Geraniol','Citral','Eugenol','香料','リモネン','リナロール','シトロネロール','ゲラニオール','シトラール','オイゲノール'] },
  { key: 'preservative', label: { ja: '保存', en: 'Preservative' }, note: ROLE_DESCRIPTIONS.preservative, keywords: ['Phenoxyethanol','Methylparaben','Ethylparaben','Propylparaben','Butylparaben','Benzoic Acid','Sorbic Acid','Sodium Benzoate','Potassium Sorbate','Chlorphenesin','Dehydroacetic Acid','フェノキシエタノール','メチルパラベン','エチルパラベン','プロピルパラベン','ブチルパラベン','安息香酸','ソルビン酸','安息香酸Na','ソルビン酸K','クロルフェネシン','デヒドロ酢酸'] },
  { key: 'alcohol', label: { ja: '溶剤', en: 'Solvent' }, note: ROLE_DESCRIPTIONS.solvent, keywords: ['Alcohol','Alcohol Denat','Alcohol Denat.','Ethanol','Isopropyl Alcohol','SD Alcohol','SD Alcohol 40','SD Alcohol 40-B','エタノール','変性アルコール','イソプロパノール','イソプロピルアルコール'] },
  { key: 'acid', label: { ja: '酸系成分', en: 'Acid-related' }, note: { ja: '角質ケアなどの目的で使われる酸系成分です。', en: 'An acid-related ingredient used for purposes such as exfoliation.' }, keywords: ['Salicylic Acid','Glycolic Acid','Lactic Acid','Azelaic Acid','Mandelic Acid','サリチル酸','グリコール酸','乳酸','アゼライン酸','マンデル酸'] },
  { key: 'emollient', label: { ja: 'エモリエント', en: 'Emollient' }, note: ROLE_DESCRIPTIONS.emollient, keywords: ['Coconut Oil','Cocos Nucifera Oil','Isopropyl Myristate','Isopropyl Palmitate','Myristyl Myristate','Octyl Stearate','ヤシ油','ココナッツ油','ミリスチン酸イソプロピル','パルミチン酸イソプロピル'] }
];

const UI = {
  loading: { ja: '成分情報を準備しています…', en: 'Loading ingredient information…' },
  ready: { ja: n => `成分情報を利用できます（${n.toLocaleString()}表記）`, en: n => `Ingredient information ready (${n.toLocaleString()} names)` },
  partial: { ja: n => `一部の補助データを読み込めませんでした。${n.toLocaleString()}表記で確認します。`, en: n => `Some supplemental data could not be loaded. ${n.toLocaleString()} names remain available.` },
  unavailable: { ja: '成分情報を読み込めないため、基本ルールだけで確認します。', en: 'Ingredient information is unavailable, so only basic rules will be used.' },
  preparing: { ja: '成分情報を準備しています。', en: 'Preparing ingredient information.' },
  emptyCategory: { ja: '確認できた主な役割がここに表示されます。', en: 'Identified ingredient roles will appear here.' },
  needInput: { ja: '成分リストを貼り付けてください。', en: 'Paste an ingredient list.' },
  checking: { ja: '確認中…', en: 'Checking…' },
  noCopy: { ja: 'コピーできる結果がありません。', en: 'There are no results to copy.' },
  copied: { ja: '解析結果をコピーしました。', en: 'Results copied.' },
  copyFailed: { ja: 'コピーに失敗しました。', en: 'Copy failed.' }
};

function localized(value) {
  if (!value) return '';
  const item = value[currentLang] ?? value.ja ?? value.en ?? value;
  return typeof item === 'function' ? item : item;
}

function uiText(key, ...args) {
  const value = UI[key];
  if (!value) return '';
  const item = value[currentLang] ?? value.ja ?? value.en;
  return typeof item === 'function' ? item(...args) : item;
}

function safeStorageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function safeStorageSet(key, value) { try { localStorage.setItem(key, value); } catch { /* ignore restricted storage */ } }

function applyLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'ja';
  document.documentElement.lang = currentLang;
  safeStorageSet('cosmetic-lite-lang', currentLang);
  document.querySelectorAll('[data-lang-text]').forEach((el) => {
    const value = currentLang === 'ja' ? el.dataset.ja : el.dataset.en;
    if (value !== undefined) el.innerHTML = value;
  });
  document.querySelectorAll('[data-placeholder-ja][data-placeholder-en]').forEach((el) => {
    el.placeholder = currentLang === 'ja' ? el.dataset.placeholderJa : el.dataset.placeholderEn;
  });
  document.querySelectorAll('.nw-lang-switch button[data-lang]').forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === currentLang);
  });
  refreshDictionaryStatus();
  if (lastItems.length) { renderSummary(lastItems); renderTable(lastItems); }
  document.dispatchEvent(new CustomEvent('nw-lite-languagechange', { detail: { lang: currentLang } }));
}

function setupLanguageSwitch() {
  const saved = safeStorageGet('cosmetic-lite-lang');
  const browserLang = (navigator.language || '').toLowerCase();
  applyLanguage(saved || (browserLang.startsWith('ja') ? 'ja' : 'en'));
  document.querySelectorAll('.nw-lang-switch button[data-lang]').forEach((button) => {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang));
  });
}

function normalizeText(value = '') {
  if (sharedParser?.normalizeText) return sharedParser.normalizeText(value);
  return String(value).normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function normalizeForMatch(value = '') {
  if (sharedParser?.normalizeKey) return sharedParser.normalizeKey(value);
  return normalizeText(value).toLowerCase().replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-').replace(/[()（）［］\[\]{}【】]/g, '').replace(/\s+/g, ' ').trim();
}

const NORMALIZED_FLAG_RULES = FLAG_RULES.map((rule) => ({ ...rule, keywordKeys: new Set(rule.keywords.map((keyword) => normalizeForMatch(keyword))) }));
let dictionaryIndex = new Map();
let dictionaryLoadState = 'idle';
let dictionaryPromise = null;
let lastItems = [];

function splitIngredients(value = '') {
  if (sharedParser?.splitIngredients) return sharedParser.splitIngredients(value);
  return String(value).replace(/\r/g, '\n').split(/[\n,、，;；]+/).map((item) => normalizeText(item)).filter(Boolean);
}

function addDictionaryKey(index, key, item) {
  const normalized = normalizeForMatch(key);
  if (!normalized || index.has(normalized)) return;
  index.set(normalized, item);
}

function buildDictionaryIndex(entries) {
  const index = new Map();
  entries.forEach((item) => {
    if (!item || !item.en) return;
    addDictionaryKey(index, item.en, item);
    (Array.isArray(item.jp) ? item.jp : []).forEach((name) => addDictionaryKey(index, name, item));
    (Array.isArray(item.alias) ? item.alias : []).forEach((name) => addDictionaryKey(index, name, item));
  });
  return index;
}

async function loadDictionary() {
  if (dictionaryPromise) return dictionaryPromise;
  dictionaryLoadState = 'loading';
  refreshDictionaryStatus();
  dictionaryPromise = Promise.allSettled(DICTIONARY_FILES.map(async (file) => {
    const response = await fetch(file, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error(`${file}: invalid dictionary payload`);
    return data;
  })).then((results) => {
    const loaded = results.filter((result) => result.status === 'fulfilled').flatMap((result) => result.value);
    if (!loaded.length) {
      dictionaryLoadState = 'unavailable';
      dictionaryIndex = new Map();
      refreshDictionaryStatus();
      return dictionaryIndex;
    }
    const merged = sharedParser?.mergeDictionaryRecords ? sharedParser.mergeDictionaryRecords(loaded) : loaded;
    dictionaryIndex = buildDictionaryIndex(merged);
    dictionaryLoadState = results.some((result) => result.status === 'rejected') ? 'partial' : 'ready';
    refreshDictionaryStatus();
    return dictionaryIndex;
  }).catch((error) => {
    console.error(error);
    dictionaryLoadState = 'unavailable';
    dictionaryIndex = new Map();
    refreshDictionaryStatus();
    return dictionaryIndex;
  });
  return dictionaryPromise;
}

function refreshDictionaryStatus() {
  if (!dictionaryStatus) return;
  if (dictionaryLoadState === 'loading') { dictionaryStatus.textContent = uiText('loading'); dictionaryStatus.className = 'dictionary-status'; }
  else if (dictionaryLoadState === 'ready') { dictionaryStatus.textContent = uiText('ready', dictionaryIndex.size); dictionaryStatus.className = 'dictionary-status status-ok'; }
  else if (dictionaryLoadState === 'partial') { dictionaryStatus.textContent = uiText('partial', dictionaryIndex.size); dictionaryStatus.className = 'dictionary-status status-warn'; }
  else if (dictionaryLoadState === 'unavailable') { dictionaryStatus.textContent = uiText('unavailable'); dictionaryStatus.className = 'dictionary-status status-warn'; }
  else { dictionaryStatus.textContent = uiText('preparing'); dictionaryStatus.className = 'dictionary-status'; }
}

function findFlags(ingredientKey) { return NORMALIZED_FLAG_RULES.filter((rule) => rule.keywordKeys.has(ingredientKey)); }
function findDictionaryMatch(ingredientKey) { return dictionaryIndex.get(ingredientKey) || null; }

function categoryKey(category) { return String(category || 'general').trim().toLowerCase() || 'general'; }
function categoryLabel(category) { const key = categoryKey(category); return localized(CATEGORY_LABELS[key]) || category || localized(CATEGORY_LABELS.general); }
function roleDescription(category) { const key = categoryKey(category); return localized(ROLE_DESCRIPTIONS[key] || ROLE_DESCRIPTIONS.general); }

function buildDescription(match, flags) {
  if (match) {
    const description = roleDescription(match.category);
    if (currentLang === 'en' && match.note_short) return match.note_short;
    return description;
  }
  const fallback = flags[0];
  if (fallback) return localized(fallback.note);
  return currentLang === 'en'
    ? 'Role information is not available for this spelling yet. Check the label spelling or official manufacturer information.'
    : 'この表記の役割情報はまだ登録されていません。表記やメーカー公式の成分表示を確認してください。';
}

function roleLabel(item) {
  if (item.match) return categoryLabel(item.match.category);
  if (item.flags.length) return localized(item.flags[0].label);
  return currentLang === 'en' ? 'Information unavailable' : '情報未登録';
}

function renderRoleCell(item) {
  const fragment = document.createDocumentFragment();
  const chip = document.createElement('span');
  chip.className = `status-chip status-${item.statusKey}`;
  chip.textContent = roleLabel(item);
  fragment.appendChild(chip);
  return fragment;
}

function summarize(items) {
  const summary = { total: items.length, matched: 0, review: 0, unknown: 0, categories: new Map() };
  items.forEach((item) => {
    if (item.match || item.flags.length) summary.matched += 1;
    if (!item.match && !item.flags.length) summary.unknown += 1;
    const label = item.match ? categoryLabel(item.match.category) : (item.flags[0] ? localized(item.flags[0].label) : '');
    if (label) summary.categories.set(label, (summary.categories.get(label) || 0) + 1);
  });
  return summary;
}

function renderSummary(items) {
  const summary = summarize(items);
  parsedCount.textContent = String(summary.total);
  matchedCount.textContent = String(summary.matched);
  reviewCount.textContent = '0';
  unknownCount.textContent = String(summary.unknown);
  categoryGrid.innerHTML = '';
  const categories = [...summary.categories.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], currentLang === 'ja' ? 'ja' : 'en')).slice(0, 8);
  if (!categories.length) {
    const empty = document.createElement('span'); empty.className = 'category-empty'; empty.textContent = uiText('emptyCategory'); categoryGrid.appendChild(empty);
  } else {
    categories.forEach(([label, count]) => { const chip = document.createElement('span'); chip.className = 'category-chip'; chip.textContent = `${label} ${count}`; categoryGrid.appendChild(chip); });
  }
  summaryBox.hidden = false;
}

function renderTable(items) {
  itemsTableBody.innerHTML = '';
  if (!items.length) { itemsEmpty.hidden = false; return; }
  itemsEmpty.hidden = true;
  items.forEach((item) => {
    const row = document.createElement('tr');
    row.dataset.resultKind = item.statusKey;
    row.dataset.category = item.match ? categoryLabel(item.match.category) : (item.flags[0] ? localized(item.flags[0].label) : '');
    const nameCell = document.createElement('td'); nameCell.textContent = item.name;
    const roleCell = document.createElement('td'); roleCell.appendChild(renderRoleCell(item));
    const noteCell = document.createElement('td'); noteCell.textContent = buildDescription(item.match, item.flags);
    row.appendChild(nameCell); row.appendChild(roleCell); row.appendChild(noteCell); itemsTableBody.appendChild(row);
  });
}

function parseIngredients() {
  return splitIngredients(inciInput.value || '').map((name) => {
    const key = normalizeForMatch(name);
    const flags = findFlags(key);
    const match = findDictionaryMatch(key);
    return { name, key, flags, match, review: false, statusKey: !match && !flags.length ? 'unknown' : 'matched' };
  });
}

async function handleCheck() {
  copyStatus.textContent = '';
  if (!normalizeText(inciInput.value)) { lastItems = []; renderSummary([]); renderTable([]); copyStatus.textContent = uiText('needInput'); return; }
  checkBtn.disabled = true; checkBtn.textContent = uiText('checking');
  try {
    await loadDictionary();
    lastItems = parseIngredients();
    renderSummary(lastItems);
    renderTable(lastItems);
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } finally {
    checkBtn.disabled = false; checkBtn.textContent = currentLang === 'en' ? 'Check ingredients' : '成分を確認';
  }
}

function handleClear() {
  inciInput.value = ''; lastItems = []; parsedCount.textContent = '0'; matchedCount.textContent = '0'; reviewCount.textContent = '0'; unknownCount.textContent = '0'; itemsTableBody.innerHTML = ''; itemsEmpty.hidden = false; categoryGrid.innerHTML = ''; summaryBox.hidden = true; copyStatus.textContent = ''; inciInput.focus();
}

async function handleCopy() {
  if (!lastItems.length) { copyStatus.textContent = uiText('noCopy'); return; }
  const lines = lastItems.map((item) => `${item.name} / ${roleLabel(item)} / ${buildDescription(item.match, item.flags)}`);
  try { await navigator.clipboard.writeText(lines.join('\n')); copyStatus.textContent = uiText('copied'); }
  catch { copyStatus.textContent = uiText('copyFailed'); }
}

function init() {
  summaryBox.hidden = true; itemsEmpty.hidden = false; setupLanguageSwitch(); refreshDictionaryStatus();
  checkBtn.addEventListener('click', handleCheck); clearBtn.addEventListener('click', handleClear); copyBtn.addEventListener('click', handleCopy);
  inciInput.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); handleCheck(); } });
  setTimeout(() => loadDictionary(), 0);
}

document.addEventListener('DOMContentLoaded', init);
