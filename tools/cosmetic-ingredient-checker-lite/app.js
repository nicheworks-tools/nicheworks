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

const FLAG_RULES = [
  {
    key: 'fragrance',
    label: '香料・アレルゲン指標',
    note: '香りづけ成分。敏感な方は注意。',
    keywords: ['FRAGRANCE', 'PARFUM', 'AROMA', 'PERFUME', 'LIMONENE', 'LINALOOL', 'CITRONELLOL', 'GERANIOL', 'CITRAL', 'EUGENOL']
  },
  {
    key: 'preservative',
    label: '防腐剤・保存成分',
    note: '品質保持目的の保存成分。',
    keywords: ['PHENOXYETHANOL', 'PARABEN', 'BENZOIC ACID', 'SORBIC ACID', 'SODIUM BENZOATE', 'POTASSIUM SORBATE', 'CHLORPHENESIN', 'DEHYDROACETIC ACID']
  },
  {
    key: 'alcohol',
    label: 'アルコール',
    note: '溶剤・清涼感などに使用。乾燥しやすい肌は注意。',
    keywords: ['ALCOHOL', 'ALCOHOL DENAT', 'SD ALCOHOL', 'ETHANOL', 'ISOPROPYL ALCOHOL']
  },
  {
    key: 'acid',
    label: '酸・アクティブ',
    note: '角質ケアなどに使われる酸系成分。敏感肌は様子を見て使用。',
    keywords: ['SALICYLIC ACID', 'GLYCOLIC ACID', 'LACTIC ACID', 'AZELAIC ACID', 'MANDELIC ACID']
  },
  {
    key: 'comedogenic',
    label: 'コメド注意ヒント',
    note: '毛穴が詰まりやすいと感じる人も。使用感を確認。',
    keywords: ['COCONUT OIL', 'COCOS NUCIFERA OIL', 'ISOPROPYL MYRISTATE', 'ISOPROPYL PALMITATE', 'MYRISTYL MYRISTATE', 'OCTYL STEARATE']
  }
];

const SPECIFIC_NOTES = {
  WATER: '溶媒として広く使われる成分です。',
  AQUA: '溶媒として広く使われる成分です。',
  GLYCERIN: '保湿剤としてよく使われます。',
  GLYCEROL: '保湿剤としてよく使われます。'
};

const summaryState = {
  total: 0,
  counts: {}
};

function normalizeText(value = '') {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeForMatch(value = '') {
  return normalizeText(value)
    .replace(/[\(\)\[\]{}【】]/g, ' ')
    .replace(/[\.·・]/g, ' ')
    .toUpperCase();
}

function splitIngredients(value = '') {
  const raw = value.replace(/\r/g, '\n');
  return raw
    .split(/[\n,、，;；\/・]+/)
    .map((item) => normalizeText(item))
    .filter((item) => item.length > 0);
}

function findFlags(ingredientUpper) {
  return FLAG_RULES.filter((rule) =>
    rule.keywords.some((keyword) => ingredientUpper.includes(keyword))
  );
}

function buildDescription(ingredientUpper, flags) {
  if (SPECIFIC_NOTES[ingredientUpper]) {
    return SPECIFIC_NOTES[ingredientUpper];
  }
  if (flags.some((flag) => flag.key === 'fragrance')) {
    return '香りづけ目的で使用される成分の一種です。';
  }
  if (flags.some((flag) => flag.key === 'preservative')) {
    return '品質保持のための保存成分です。';
  }
  if (flags.some((flag) => flag.key === 'alcohol')) {
    return '溶剤・清涼感などの目的で配合されることがあります。';
  }
  if (flags.some((flag) => flag.key === 'acid')) {
    return '角質ケアなどに使われる酸系成分です。';
  }
  if (flags.some((flag) => flag.key === 'comedogenic')) {
    return '油性のエモリエント成分で、毛穴が詰まりやすいと感じる人もいます。';
  }
  return '一般的な化粧品成分です。用途は製品によって異なります。';
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
    const upper = item.upper;
    if (seen.has(upper)) return;
    seen.add(upper);
    item.flags.forEach((flag) => {
      summaryState.counts[flag.key] = (summaryState.counts[flag.key] || 0) + 1;
    });
  });

  summaryGrid.innerHTML = '';
  FLAG_RULES.forEach((rule) => {
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
  const items = names.map((name) => {
    const upper = normalizeForMatch(name);
    const flags = findFlags(upper);
    return {
      name,
      upper,
      flags,
      description: buildDescription(upper, flags)
    };
  });
  return items;
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
