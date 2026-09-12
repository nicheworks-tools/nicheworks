const inciInput = document.getElementById('inciInput');
const checkBtn = document.getElementById('checkBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const parsedCount = document.getElementById('parsedCount');
const itemsTableBody = document.getElementById('itemsTableBody');
const itemsEmpty = document.getElementById('itemsEmpty');
const summaryGrid = document.getElementById('summaryGrid');
const summaryBox = document.getElementById('summaryBox');
const copyStatus = document.getElementById('copyStatus');

const sharedParser = window.NWCosmeticIngredientParser;

const FLAG_RULES = [
  {
    key: 'fragrance',
    label: '香料・アレルゲン指標',
    note: '香りづけ成分。敏感な方は注意。',
    keywords: [
      'Fragrance', 'Parfum', 'Aroma', 'Perfume', 'Limonene', 'Linalool',
      'Citronellol', 'Geraniol', 'Citral', 'Eugenol',
      '香料', 'リモネン', 'リナロール', 'シトロネロール', 'ゲラニオール', 'シトラール', 'オイゲノール'
    ]
  },
  {
    key: 'preservative',
    label: '防腐剤・保存成分',
    note: '品質保持目的の保存成分。',
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
    label: 'エタノール系アルコール',
    note: '溶剤・清涼感などに使用。乾燥しやすい肌は使用感を確認。',
    keywords: [
      'Alcohol', 'Alcohol Denat', 'Alcohol Denat.', 'Ethanol', 'Isopropyl Alcohol',
      'SD Alcohol', 'SD Alcohol 40', 'SD Alcohol 40-B',
      'エタノール', '変性アルコール', 'イソプロパノール', 'イソプロピルアルコール'
    ]
  },
  {
    key: 'acid',
    label: '酸・アクティブ',
    note: '角質ケアなどに使われる酸系成分。刺激を感じる場合は使用条件を確認。',
    keywords: [
      'Salicylic Acid', 'Glycolic Acid', 'Lactic Acid', 'Azelaic Acid', 'Mandelic Acid',
      'サリチル酸', 'グリコール酸', '乳酸', 'アゼライン酸', 'マンデル酸'
    ]
  },
  {
    key: 'comedogenic',
    label: '油性エモリエント確認',
    note: '油性のエモリエント成分。使用感や製品全体の処方を確認。',
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

const SPECIFIC_NOTES = new Map([
  ['Water', '溶媒として広く使われる成分です。'],
  ['Aqua', '溶媒として広く使われる成分です。'],
  ['水', '溶媒として広く使われる成分です。'],
  ['Glycerin', '保湿剤としてよく使われます。'],
  ['Glycerol', '保湿剤としてよく使われます。'],
  ['グリセリン', '保湿剤としてよく使われます。'],
  ['グリセロール', '保湿剤としてよく使われます。']
].map(([name, note]) => [normalizeForMatch(name), note]));

const summaryState = {
  total: 0,
  counts: {}
};

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

function findFlags(ingredientKey) {
  return NORMALIZED_FLAG_RULES.filter((rule) => rule.keywordKeys.has(ingredientKey));
}

function buildDescription(ingredientKey, flags) {
  if (SPECIFIC_NOTES.has(ingredientKey)) {
    return SPECIFIC_NOTES.get(ingredientKey);
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
  if (flags.some((flag) => flag.key === 'comedogenic')) {
    return '油性のエモリエント成分です。製品全体の処方や使用感も合わせて確認してください。';
  }
  return 'この簡易辞書では分類できません。用途・安全性・配合目的は製品表示やメーカー等の公式情報を確認してください。';
}

function renderFlagsCell(flags) {
  if (!flags.length) {
    return document.createTextNode('—');
  }
  const fragment = document.createDocumentFragment();
  flags.forEach((flag) => {
    const chip = document.createElement('span');
    chip.className = `flag-chip ${flag.key}`;
    chip.textContent = flag.label;
    chip.title = flag.note;
    fragment.appendChild(chip);
  });
  return fragment;
}

function updateSummary(items) {
  summaryState.total = items.length;
  summaryState.counts = {};
  const seen = new Set();

  items.forEach((item) => {
    const key = item.key;
    if (seen.has(key)) return;
    seen.add(key);
    item.flags.forEach((flag) => {
      summaryState.counts[flag.key] = (summaryState.counts[flag.key] || 0) + 1;
    });
  });

  summaryGrid.innerHTML = '';
  NORMALIZED_FLAG_RULES.forEach((rule) => {
    const card = document.createElement('div');
    card.className = 'summary-item';
    const label = document.createElement('div');
    label.className = 'summary-label';
    label.textContent = rule.label;
    const count = document.createElement('div');
    count.className = 'summary-count';
    count.textContent = String(summaryState.counts[rule.key] || 0);
    const note = document.createElement('div');
    note.className = 'summary-note';
    note.textContent = rule.note;
    card.appendChild(label);
    card.appendChild(count);
    card.appendChild(note);
    summaryGrid.appendChild(card);
  });

  summaryBox.classList.remove('hidden');
}

function renderTable(items) {
  itemsTableBody.innerHTML = '';
  if (!items.length) {
    itemsEmpty.classList.remove('hidden');
    return;
  }
  itemsEmpty.classList.add('hidden');
  items.forEach((item) => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;

    const flagCell = document.createElement('td');
    flagCell.appendChild(renderFlagsCell(item.flags));

    const noteCell = document.createElement('td');
    noteCell.textContent = item.description;

    row.appendChild(nameCell);
    row.appendChild(flagCell);
    row.appendChild(noteCell);
    itemsTableBody.appendChild(row);
  });
}

function parseIngredients() {
  const raw = inciInput.value || '';
  const names = splitIngredients(raw);
  return names.map((name) => {
    const key = normalizeForMatch(name);
    const flags = findFlags(key);
    return {
      name,
      key,
      flags,
      description: buildDescription(key, flags)
    };
  });
}

function handleCheck() {
  const items = parseIngredients();
  parsedCount.textContent = String(items.length);
  renderTable(items);
  updateSummary(items);
  copyStatus.textContent = '';
}

function handleClear() {
  inciInput.value = '';
  parsedCount.textContent = '0';
  itemsTableBody.innerHTML = '';
  itemsEmpty.classList.remove('hidden');
  summaryGrid.innerHTML = '';
  copyStatus.textContent = '';
  updateSummary([]);
}

async function handleCopy() {
  const rows = Array.from(itemsTableBody.querySelectorAll('tr'));
  if (!rows.length) {
    copyStatus.textContent = 'コピーできる結果がありません。';
    return;
  }
  const lines = rows.map((row) => {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent.trim());
    return cells.join(' / ');
  });
  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    copyStatus.textContent = '解析結果をコピーしました。';
  } catch (error) {
    copyStatus.textContent = 'コピーに失敗しました。';
  }
}

function init() {
  updateSummary([]);
  checkBtn.addEventListener('click', handleCheck);
  clearBtn.addEventListener('click', handleClear);
  copyBtn.addEventListener('click', handleCopy);
}

document.addEventListener('DOMContentLoaded', init);
