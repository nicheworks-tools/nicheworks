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
  humectant: '保湿',
  moisturizer: '保湿',
  soothing: '整肌',
  active: '機能性成分',
  'amino acid': 'アミノ酸',
  silicone: 'シリコーン',
  'film former': '皮膜形成',
  emollient: 'エモリエント',
  oil: '油性成分',
  solvent: '溶剤',
  preservative: '保存系',
  fragrance: '香料',
  surfactant: '界面活性剤',
  cleanser: '洗浄',
  'uv filter': 'UV関連',
  sunscreen: 'UV関連',
  colorant: '着色',
  pigment: '着色',
  antioxidant: '酸化防止',
  botanical: '植物由来',
  extract: '植物由来',
  peptide: 'ペプチド',
  ferment: '発酵',
  thickener: '増粘',
  emulsifier: '乳化',
  chelator: 'キレート',
  ph: 'pH調整',
  general: 'その他'
};

const FLAG_RULES = [
  {
    key: 'fragrance',
    label: '香料関連',
    note: '香りづけ目的などで使われる成分です。',
    keywords: [
      'Fragrance', 'Parfum', 'Aroma', 'Perfume', 'Limonene', 'Linalool',
      'Citronellol', 'Geraniol', 'Citral', 'Eugenol',
      '香料', 'リモネン', 'リナロール', 'シトロネロール', 'ゲラニオール', 'シトラール', 'オイゲノール'
    ]
  },
  {
    key: 'preservative',
    label: '保存系',
    note: '品質保持目的で使われる成分です。',
    keywords: [
      'Phenoxyethanol', 'Methylparaben', 'Ethylparaben', 'Propylparaben', 'Butylparaben',
      'Benzoic Acid', 'Sorbic Acid', 'Sodium Benzoate', 'Potassium Sorbate',
      'Chlorphenesin', 'Dehydroacetic Acid',
      'フェノキシエタノール', 'メチルパラベン', 'エチルパラベン', 'プロピルパラベン', 'ブチルパラベン',
      '安息香酸', 'ソルビン酸', '安息香酸Na', 'ソルビン酸K', 'クロルフェネシン', 'デヒドロ酢酸'
    ]
  },
  {
    key: 'alcohol',
    label: 'エタノール系',
    note: '溶剤・清涼感などの目的で使われる成分です。',
    keywords: [
      'Alcohol', 'Alcohol Denat', 'Alcohol Denat.', 'Ethanol', 'Isopropyl Alcohol',
      'SD Alcohol', 'SD Alcohol 40', 'SD Alcohol 40-B',
      'エタノール', '変性アルコール', 'イソプロパノール', 'イソプロピルアルコール'
    ]
  },
  {
    key: 'acid',
    label: '酸・アクティブ',
    note: '角質ケアなどに使われる酸系成分です。',
    keywords: [
      'Salicylic Acid', 'Glycolic Acid', 'Lactic Acid', 'Azelaic Acid', 'Mandelic Acid',
      'サリチル酸', 'グリコール酸', '乳酸', 'アゼライン酸', 'マンデル酸'
    ]
  },
  {
    key: 'emollient',
    label: '油性エモリエント',
    note: '油性のエモリエントとして使われる成分です。',
    keywords: [
      'Coconut Oil', 'Cocos Nucifera Oil', 'Isopropyl Myristate', 'Isopropyl Palmitate',
      'Myristyl Myristate', 'Octyl Stearate',
      'ヤシ油', 'ココナッツ油', 'ミリスチン酸イソプロピル', 'パルミチン酸イソプロピル'
    ]
  }
];

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
  if (sharedParser?.splitIngredients) {
    return sharedParser.splitIngredients(value);
  }

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
    const loaded = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value);

    if (!loaded.length) {
      dictionaryLoadState = 'unavailable';
      dictionaryEntries = 0;
      dictionaryIndex = new Map();
      refreshDictionaryStatus();
      return dictionaryIndex;
    }

    dictionaryEntries = loaded.length;
    dictionaryIndex = buildDictionaryIndex(loaded);
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
    dictionaryStatus.textContent = '成分辞書を読み込み中です…';
    dictionaryStatus.className = 'dictionary-status';
    return;
  }

  if (dictionaryLoadState === 'ready') {
    dictionaryStatus.textContent = `ローカル成分辞書を利用中（${dictionaryIndex.size.toLocaleString()}表記）`;
    dictionaryStatus.className = 'dictionary-status status-ok';
    return;
  }

  if (dictionaryLoadState === 'partial') {
    dictionaryStatus.textContent = `一部の補助辞書を読み込めませんでした。${dictionaryIndex.size.toLocaleString()}表記で確認します。`;
    dictionaryStatus.className = 'dictionary-status status-warn';
    return;
  }

  if (dictionaryLoadState === 'unavailable') {
    dictionaryStatus.textContent = '成分辞書を読み込めないため、基本ルールだけで確認します。';
    dictionaryStatus.className = 'dictionary-status status-warn';
    return;
  }

  dictionaryStatus.textContent = '成分辞書を準備しています。';
  dictionaryStatus.className = 'dictionary-status';
}

function findFlags(ingredientKey) {
  return NORMALIZED_FLAG_RULES.filter((rule) => rule.keywordKeys.has(ingredientKey));
}

function findDictionaryMatch(ingredientKey) {
  return dictionaryIndex.get(ingredientKey) || null;
}

function isReviewCandidate(match, flags) {
  const safety = String(match?.safety || '').toLowerCase();
  return safety === 'caution' || safety === 'risk' || flags.some((flag) => flag.key === 'acid');
}

function categoryLabel(category) {
  const key = String(category || '').trim().toLowerCase();
  if (!key) return '';
  return CATEGORY_LABELS[key] || category;
}

function buildDescription(match, flags) {
  if (match) {
    const category = categoryLabel(match.category);
    const parts = [`辞書一致: ${match.en}`];
    if (category) parts.push(`分類: ${category}`);
    if (isReviewCandidate(match, flags)) {
      parts.push('使用条件や製品全体の処方も確認してください。');
    }
    return `${parts.join('。')}。`;
  }

  if (flags.some((flag) => flag.key === 'fragrance')) {
    return '香りづけ目的で使用される成分の一種です。';
  }
  if (flags.some((flag) => flag.key === 'preservative')) {
    return '品質保持のための保存成分です。';
  }
  if (flags.some((flag) => flag.key === 'alcohol')) {
    return 'エタノール系の溶剤・清涼成分として配合されることがあります。';
  }
  if (flags.some((flag) => flag.key === 'acid')) {
    return '角質ケアなどに使われる酸系成分です。';
  }
  if (flags.some((flag) => flag.key === 'emollient')) {
    return '油性のエモリエント成分です。製品全体の処方や使用感も合わせて確認してください。';
  }
  return 'この簡易辞書では分類できません。用途・安全性・配合目的は製品表示やメーカー等の公式情報を確認してください。';
}

function statusLabel(item) {
  if (!item.match && !item.flags.length) return '未分類';
  if (item.review) return '確認候補';
  if (item.match) return '辞書一致';
  return '基本ルール一致';
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
    chip.textContent = flag.label;
    chip.title = flag.note;
    fragment.appendChild(chip);
  });

  return fragment;
}

function summarize(items) {
  const summary = {
    total: items.length,
    matched: 0,
    review: 0,
    unknown: 0,
    categories: new Map()
  };

  items.forEach((item) => {
    if (item.match) summary.matched += 1;
    if (item.review) summary.review += 1;
    if (!item.match && !item.flags.length) summary.unknown += 1;

    const category = categoryLabel(item.match?.category);
    if (category) {
      summary.categories.set(category, (summary.categories.get(category) || 0) + 1);
    }
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
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
    .slice(0, 8);

  if (!categories.length) {
    const empty = document.createElement('span');
    empty.className = 'category-empty';
    empty.textContent = '辞書一致した成分の分類がここに表示されます。';
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

    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;

    const statusCell = document.createElement('td');
    statusCell.appendChild(renderStatusCell(item));

    const noteCell = document.createElement('td');
    noteCell.textContent = item.description;

    row.appendChild(nameCell);
    row.appendChild(statusCell);
    row.appendChild(noteCell);
    itemsTableBody.appendChild(row);
  });
}

function parseIngredients() {
  const names = splitIngredients(inciInput.value || '');
  return names.map((name) => {
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
      statusKey: !match && !flags.length ? 'unknown' : review ? 'review' : match ? 'matched' : 'rule',
      description: buildDescription(match, flags)
    };
  });
}

async function handleCheck() {
  copyStatus.textContent = '';
  if (!normalizeText(inciInput.value)) {
    lastItems = [];
    renderSummary([]);
    renderTable([]);
    copyStatus.textContent = '成分リストを貼り付けてください。';
    return;
  }

  const previousLabel = checkBtn.textContent;
  checkBtn.disabled = true;
  checkBtn.textContent = '確認中…';

  try {
    await loadDictionary();
    lastItems = parseIngredients();
    renderSummary(lastItems);
    renderTable(lastItems);
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = previousLabel;
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
    copyStatus.textContent = 'コピーできる結果がありません。';
    return;
  }

  const lines = lastItems.map((item) => {
    const canonical = item.match?.en && normalizeForMatch(item.match.en) !== item.key
      ? ` / ${item.match.en}`
      : '';
    return `${item.name}${canonical} / ${statusLabel(item)} / ${item.description}`;
  });

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    copyStatus.textContent = '解析結果をコピーしました。';
  } catch (error) {
    copyStatus.textContent = 'コピーに失敗しました。';
  }
}

function init() {
  summaryBox.hidden = true;
  itemsEmpty.hidden = false;
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

  // Start same-origin dictionary loading without blocking first paint.
  setTimeout(() => loadDictionary(), 0);
}

document.addEventListener('DOMContentLoaded', init);
