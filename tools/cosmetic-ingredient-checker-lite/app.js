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
  preservative: { ja: '保存系', en: 'Preservative' },
  fragrance: { ja: '香料', en: 'Fragrance' },
  surfactant: { ja: '界面活性剤', en: 'Surfactant' },
  cleanser: { ja: '洗浄', en: 'Cleanser' },
  'uv filter': { ja: 'UV関連', en: 'UV filter' },
  sunscreen: { ja: 'UV関連', en: 'UV filter' },
  colorant: { ja: '着色', en: 'Colorant' },
  pigment: { ja: '着色', en: 'Pigment' },
  antioxidant: { ja: '酸化防止', en: 'Antioxidant' },
  botanical: { ja: '植物由来', en: 'Botanical' },
  extract: { ja: '植物由来', en: 'Extract' },
  peptide: { ja: 'ペプチド', en: 'Peptide' },
  ferment: { ja: '発酵', en: 'Ferment' },
  thickener: { ja: '増粘', en: 'Thickener' },
  emulsifier: { ja: '乳化', en: 'Emulsifier' },
  chelator: { ja: 'キレート', en: 'Chelating agent' },
  'chelating agent': { ja: 'キレート', en: 'Chelating agent' },
  ph: { ja: 'pH調整', en: 'pH adjuster' },
  'ph adjuster': { ja: 'pH調整', en: 'pH adjuster' },
  'viscosity adjuster': { ja: '粘度調整', en: 'Viscosity adjuster' },
  general: { ja: 'その他', en: 'Other' }
};

const FLAG_RULES = [
  {
    key: 'fragrance',
    label: { ja: '香料関連', en: 'Fragrance-related' },
    note: { ja: '香りづけ目的などで使われる成分です。', en: 'An ingredient used for fragrance-related purposes.' },
    keywords: ['Fragrance','Parfum','Aroma','Perfume','Limonene','Linalool','Citronellol','Geraniol','Citral','Eugenol','香料','リモネン','リナロール','シトロネロール','ゲラニオール','シトラール','オイゲノール']
  },
  {
    key: 'preservative',
    label: { ja: '保存系', en: 'Preservative-related' },
    note: { ja: '品質保持目的で使われる成分です。', en: 'An ingredient used for product preservation.' },
    keywords: ['Phenoxyethanol','Methylparaben','Ethylparaben','Propylparaben','Butylparaben','Benzoic Acid','Sorbic Acid','Sodium Benzoate','Potassium Sorbate','Chlorphenesin','Dehydroacetic Acid','フェノキシエタノール','メチルパラベン','エチルパラベン','プロピルパラベン','ブチルパラベン','安息香酸','ソルビン酸','安息香酸Na','ソルビン酸K','クロルフェネシン','デヒドロ酢酸']
  },
  {
    key: 'alcohol',
    label: { ja: 'エタノール系', en: 'Alcohol-related' },
    note: { ja: '溶剤・清涼感などの目的で使われる成分です。', en: 'An alcohol-related ingredient used for purposes such as solvent or sensory feel.' },
    keywords: ['Alcohol','Alcohol Denat','Alcohol Denat.','Ethanol','Isopropyl Alcohol','SD Alcohol','SD Alcohol 40','SD Alcohol 40-B','エタノール','変性アルコール','イソプロパノール','イソプロピルアルコール']
  },
  {
    key: 'acid',
    label: { ja: '酸・アクティブ', en: 'Acid / active' },
    note: { ja: '角質ケアなどに使われる酸系成分です。', en: 'An acid-related ingredient used for purposes such as exfoliation.' },
    keywords: ['Salicylic Acid','Glycolic Acid','Lactic Acid','Azelaic Acid','Mandelic Acid','サリチル酸','グリコール酸','乳酸','アゼライン酸','マンデル酸']
  },
  {
    key: 'emollient',
    label: { ja: '油性エモリエント', en: 'Oil / emollient' },
    note: { ja: '油性のエモリエントとして使われる成分です。', en: 'An ingredient used as an oily emollient.' },
    keywords: ['Coconut Oil','Cocos Nucifera Oil','Isopropyl Myristate','Isopropyl Palmitate','Myristyl Myristate','Octyl Stearate','ヤシ油','ココナッツ油','ミリスチン酸イソプロピル','パルミチン酸イソプロピル']
  }
];

const UI = {
  loading: { ja: '成分辞書を読み込み中です…', en: 'Loading ingredient dictionary…' },
  ready: { ja: n => `ローカル成分辞書を利用中（${n.toLocaleString()}表記）`, en: n => `Local ingredient dictionary ready (${n.toLocaleString()} names)` },
  partial: { ja: n => `一部の補助辞書を読み込めませんでした。${n.toLocaleString()}表記で確認します。`, en: n => `Some supplemental dictionaries could not be loaded. Checking against ${n.toLocaleString()} names.` },
  unavailable: { ja: '成分辞書を読み込めないため、基本ルールだけで確認します。', en: 'The ingredient dictionary is unavailable, so only basic rules will be used.' },
  preparing: { ja: '成分辞書を準備しています。', en: 'Preparing ingredient dictionary.' },
  emptyCategory: { ja: '辞書一致した成分の分類がここに表示されます。', en: 'Categories for matched ingredients will appear here.' },
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

function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore restricted storage */ }
}

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
  if (lastItems.length) {
    renderSummary(lastItems);
    renderTable(lastItems);
  }
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
  return normalizeText(value)
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[()（）［］\[\]{}【】]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const NORMALIZED_FLAG_RULES = FLAG_RULES.map((rule) => ({
  ...rule,
  keywordKeys: new Set(rule.keywords.map((keyword) => normalizeForMatch(keyword)))
}));

let dictionaryIndex = new Map();
let dictionaryEntries = 0;
let dictionaryLoadState = 'idle';
let dictionaryPromise = null;
let lastItems = [];

function splitIngredients(value = '') {
  if (sharedParser?.splitIngredients) return sharedParser.splitIngredients(value);
  return String(value)
    .replace(/\r/g, '\n')
    .split(/[\n,、，;；]+/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
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

  dictionaryPromise = Promise.allSettled(
    DICTIONARY_FILES.map(async (file) => {
      const response = await fetch(file, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error(`${file}: invalid dictionary payload`);
      return data;
    })
  ).then((results) => {
    const loaded = results.filter((result) => result.status === 'fulfilled').flatMap((result) => result.value);
    if (!loaded.length) {
      dictionaryLoadState = 'unavailable';
      dictionaryEntries = 0;
      dictionaryIndex = new Map();
      refreshDictionaryStatus();
      return dictionaryIndex;
    }
    const merged = sharedParser?.mergeDictionaryRecords ? sharedParser.mergeDictionaryRecords(loaded) : loaded;
    dictionaryEntries = merged.length;
    dictionaryIndex = buildDictionaryIndex(merged);
    dictionaryLoadState = results.some((result) => result.status === 'rejected') ? 'partial' : 'ready';
    refreshDictionaryStatus();
    return dictionaryIndex;
  }).catch((error) => {
    console.error(error);
    dictionaryLoadState = 'unavailable';
    dictionaryEntries = 0;
    dictionaryIndex = new Map();
    refreshDictionaryStatus();
    return dictionaryIndex;
  });

  return dictionaryPromise;
}

function refreshDictionaryStatus() {
  if (!dictionaryStatus) return;
  if (dictionaryLoadState === 'loading') {
    dictionaryStatus.textContent = uiText('loading');
    dictionaryStatus.className = 'dictionary-status';
  } else if (dictionaryLoadState === 'ready') {
    dictionaryStatus.textContent = uiText('ready', dictionaryIndex.size);
    dictionaryStatus.className = 'dictionary-status status-ok';
  } else if (dictionaryLoadState === 'partial') {
    dictionaryStatus.textContent = uiText('partial', dictionaryIndex.size);
    dictionaryStatus.className = 'dictionary-status status-warn';
  } else if (dictionaryLoadState === 'unavailable') {
    dictionaryStatus.textContent = uiText('unavailable');
    dictionaryStatus.className = 'dictionary-status status-warn';
  } else {
    dictionaryStatus.textContent = uiText('preparing');
    dictionaryStatus.className = 'dictionary-status';
  }
}

function findFlags(ingredientKey) {
  return NORMALIZED_FLAG_RULES.filter((rule) => rule.keywordKeys.has(ingredientKey));
}

function findDictionaryMatch(ingredientKey) {
  return dictionaryIndex.get(ingredientKey) || null;
}

function isReviewCandidate(match, flags) {
  return Boolean(match) && flags.some((flag) => flag.key === 'acid');
}

function categoryLabel(category) {
  const key = String(category || '').trim().toLowerCase();
  if (!key) return '';
  return localized(CATEGORY_LABELS[key]) || category;
}

function buildDescription(match, flags) {
  if (match) {
    const category = categoryLabel(match.category);
    if (currentLang === 'en') {
      const parts = [`Dictionary match: ${match.en}`];
      if (category) parts.push(`Category: ${category}`);
      if (isReviewCandidate(match, flags)) parts.push('Check usage conditions and the full formulation as well');
      return `${parts.join('. ')}.`;
    }
    const parts = [`辞書一致: ${match.en}`];
    if (category) parts.push(`分類: ${category}`);
    if (isReviewCandidate(match, flags)) parts.push('使用条件や製品全体の処方も確認してください。');
    return `${parts.join('。')}。`;
  }

  const key = flags[0]?.key;
  const descriptions = {
    fragrance: { ja: '香りづけ目的で使用される成分の一種です。', en: 'A fragrance-related ingredient.' },
    preservative: { ja: '品質保持のための保存成分です。', en: 'A preservative-related ingredient used for product quality.' },
    alcohol: { ja: 'エタノール系の溶剤・清涼成分として配合されることがあります。', en: 'An alcohol-related ingredient that may be used as a solvent or for sensory feel.' },
    acid: { ja: '角質ケアなどに使われる酸系成分です。', en: 'An acid-related ingredient used for purposes such as exfoliation.' },
    emollient: { ja: '油性のエモリエント成分です。製品全体の処方や使用感も合わせて確認してください。', en: 'An oily emollient. Consider the full formulation and product feel as well.' }
  };
  if (descriptions[key]) return localized(descriptions[key]);
  return currentLang === 'en'
    ? 'This simplified dictionary could not classify the ingredient. Check the product label or official manufacturer information for purpose, safety, and formulation details.'
    : 'この簡易辞書では分類できません。用途・安全性・配合目的は製品表示やメーカー等の公式情報を確認してください。';
}

function statusLabel(item) {
  if (!item.match && !item.flags.length) return currentLang === 'en' ? 'Unclassified' : '未分類';
  if (item.review) return currentLang === 'en' ? 'Review' : '確認候補';
  if (item.match) return currentLang === 'en' ? 'Matched' : '辞書一致';
  return currentLang === 'en' ? 'Basic-rule match' : '基本ルール一致';
}

function renderStatusCell(item) {
  const fragment = document.createDocumentFragment();
  const status = document.createElement('span');
  status.className = `status-chip status-${item.statusKey}`;
  status.textContent = statusLabel(item);
  fragment.appendChild(status);

  item.flags.forEach((flag) => {
    const chip = document.createElement('span');
    chip.className = `flag-chip ${flag.key}`;
    chip.textContent = localized(flag.label);
    chip.title = localized(flag.note);
    fragment.appendChild(chip);
  });
  return fragment;
}

function summarize(items) {
  const summary = { total: items.length, matched: 0, review: 0, unknown: 0, categories: new Map() };
  items.forEach((item) => {
    if (item.match) summary.matched += 1;
    if (item.review) summary.review += 1;
    if (!item.match && !item.flags.length) summary.unknown += 1;
    const category = categoryLabel(item.match?.category);
    if (category) summary.categories.set(category, (summary.categories.get(category) || 0) + 1);
  });
  return summary;
}

function renderSummary(items) {
  const summary = summarize(items);
  parsedCount.textContent = String(summary.total);
  matchedCount.textContent = String(summary.matched);
  reviewCount.textContent = String(summary.review);
  unknownCount.textContent = String(summary.unknown);

  categoryGrid.innerHTML = '';
  const categories = [...summary.categories.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], currentLang === 'ja' ? 'ja' : 'en'))
    .slice(0, 8);

  if (!categories.length) {
    const empty = document.createElement('span');
    empty.className = 'category-empty';
    empty.textContent = uiText('emptyCategory');
    categoryGrid.appendChild(empty);
  } else {
    categories.forEach(([label, count]) => {
      const chip = document.createElement('span');
      chip.className = 'category-chip';
      chip.textContent = `${label} ${count}`;
      categoryGrid.appendChild(chip);
    });
  }
  summaryBox.hidden = false;
}

function renderTable(items) {
  itemsTableBody.innerHTML = '';
  if (!items.length) {
    itemsEmpty.hidden = false;
    return;
  }
  itemsEmpty.hidden = true;
  items.forEach((item) => {
    const row = document.createElement('tr');
    row.dataset.resultKind = item.statusKey;
    row.dataset.category = categoryLabel(item.match?.category);

    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;
    const statusCell = document.createElement('td');
    statusCell.appendChild(renderStatusCell(item));
    const noteCell = document.createElement('td');
    noteCell.textContent = buildDescription(item.match, item.flags);

    row.appendChild(nameCell);
    row.appendChild(statusCell);
    row.appendChild(noteCell);
    itemsTableBody.appendChild(row);
  });
}

function parseIngredients() {
  return splitIngredients(inciInput.value || '').map((name) => {
    const key = normalizeForMatch(name);
    const flags = findFlags(key);
    const match = findDictionaryMatch(key);
    const review = isReviewCandidate(match, flags);
    return {
      name,
      key,
      flags,
      match,
      review,
      statusKey: !match && !flags.length ? 'unknown' : review ? 'review' : match ? 'matched' : 'rule'
    };
  });
}

async function handleCheck() {
  copyStatus.textContent = '';
  if (!normalizeText(inciInput.value)) {
    lastItems = [];
    renderSummary([]);
    renderTable([]);
    copyStatus.textContent = uiText('needInput');
    return;
  }

  checkBtn.disabled = true;
  checkBtn.textContent = uiText('checking');
  try {
    await loadDictionary();
    lastItems = parseIngredients();
    renderSummary(lastItems);
    renderTable(lastItems);
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = currentLang === 'en' ? 'Check ingredients' : '成分を確認';
  }
}

function handleClear() {
  inciInput.value = '';
  lastItems = [];
  parsedCount.textContent = '0';
  matchedCount.textContent = '0';
  reviewCount.textContent = '0';
  unknownCount.textContent = '0';
  itemsTableBody.innerHTML = '';
  itemsEmpty.hidden = false;
  categoryGrid.innerHTML = '';
  summaryBox.hidden = true;
  copyStatus.textContent = '';
  inciInput.focus();
}

async function handleCopy() {
  if (!lastItems.length) {
    copyStatus.textContent = uiText('noCopy');
    return;
  }
  const lines = lastItems.map((item) => {
    const canonical = item.match?.en && normalizeForMatch(item.match.en) !== item.key ? ` / ${item.match.en}` : '';
    return `${item.name}${canonical} / ${statusLabel(item)} / ${buildDescription(item.match, item.flags)}`;
  });
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    copyStatus.textContent = uiText('copied');
  } catch {
    copyStatus.textContent = uiText('copyFailed');
  }
}

function init() {
  summaryBox.hidden = true;
  itemsEmpty.hidden = false;
  setupLanguageSwitch();
  refreshDictionaryStatus();

  checkBtn.addEventListener('click', handleCheck);
  clearBtn.addEventListener('click', handleClear);
  copyBtn.addEventListener('click', handleCopy);
  inciInput.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleCheck();
    }
  });
  setTimeout(() => loadDictionary(), 0);
}

document.addEventListener('DOMContentLoaded', init);
