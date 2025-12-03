const ingredientList = document.getElementById('ingredientList');
const ingredientEmpty = document.getElementById('ingredientEmpty');
const ocrInput = document.getElementById('ocrInput');
const ocrDropzone = document.getElementById('ocrDropzone');
const ocrStatus = document.getElementById('ocrStatus');
const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');
const bulkInput = document.getElementById('bulkInput');
const bulkAddButton = document.getElementById('bulkAddButton');
const bulkClearButton = document.getElementById('bulkClearButton');
const analyzeButton = document.getElementById('analyzeButton');
const resultContainer = document.getElementById('resultContainer');
const resultEmpty = document.getElementById('resultEmpty');
const copyButton = document.getElementById('copyButton');
const copyStatus = document.getElementById('copyStatus');

let ingredientData = {};

async function loadIngredients() {
  try {
    const res = await fetch('./data/ingredients.json');
    ingredientData = await res.json();
  } catch (e) {
    ingredientData = {};
  }
}

function normalize(text = '') {
  const lowered = text.normalize('NFKC').toLowerCase();
  const trimmed = lowered.replace(/[\u3000]/g, ' ').trim();
  return trimmed;
}

function sanitizeTerm(term) {
  let value = normalize(term);
  value = value.replace(/[\(\)\[\]{}【】]/g, '');
  value = value.replace(/[\,\/・\.]/g, ' ');
  value = value.split(' ')[0] || '';
  value = value.replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]/gi, '');
  if (value.length < 2) return '';
  if (/^\d+$/.test(value)) return '';
  return value;
}

function isNoisyLine(line) {
  if (!line || line.length < 2) return true;
  if (/^\d+$/.test(line)) return true;
  if (/^[\p{P}\p{S}]+$/u.test(line)) return true;
  if (/^[\u4e00-\u9faf]{3,}[a-z0-9]+/i.test(line)) return true;
  if (/[§※★◆]/.test(line)) return true;
  return false;
}

function splitLines(text) {
  return text.split(/\r?\n/).map((l) => normalize(l)).filter((l) => l);
}

function collectItems(text) {
  const lines = splitLines(text);
  const collected = new Set();
  lines.forEach((line) => {
    if (isNoisyLine(line)) return;
    const fragments = line.split(/[\,\/・]/);
    fragments.forEach((raw) => {
      const sanitized = sanitizeTerm(raw);
      if (sanitized) collected.add(sanitized);
    });
  });
  return Array.from(collected);
}

function updateAnalyzeState() {
  const hasItems = ingredientList.children.length > 0;
  analyzeButton.disabled = !hasItems;
  ingredientEmpty.classList.toggle('hidden', hasItems);
}

function createTag(name) {
  const chip = document.createElement('span');
  chip.className = 'cic-chip';
  chip.title = name;

  const text = document.createElement('span');
  text.textContent = name;

  const del = document.createElement('button');
  del.type = 'button';
  del.textContent = '✕';
  del.addEventListener('click', () => {
    chip.remove();
    updateAnalyzeState();
  });

  chip.appendChild(text);
  chip.appendChild(del);
  return chip;
}

function existsTag(name) {
  const target = normalize(name);
  return Array.from(ingredientList.children).some((pill) => normalize(pill.firstChild.textContent) === target);
}

function addTag(name) {
  const sanitized = sanitizeTerm(name);
  if (!sanitized || existsTag(sanitized)) return;
  const tag = createTag(sanitized);
  ingredientList.appendChild(tag);
  updateAnalyzeState();
}

function renderSuggestions(items) {
  searchSuggestions.innerHTML = '';
  items.slice(0, 8).forEach((item) => {
    const label = item.name_jp || item.name_en;
    const div = document.createElement('div');
    div.className = 'cic-suggestion';
    div.textContent = label;
    div.title = `${item.name_jp} / ${item.name_en}`;
    div.addEventListener('click', () => {
      addTag(label);
      searchSuggestions.innerHTML = '';
      searchInput.value = '';
    });
    searchSuggestions.appendChild(div);
  });
}

function handleSearchInput() {
  const query = normalize(searchInput.value);
  if (!query || query.length < 2) {
    searchSuggestions.innerHTML = '';
    return;
  }
  const entries = Object.values(ingredientData);
  const filtered = entries.filter((item) => {
    const targets = [item.name_jp, item.name_en, ...(item.aliases || [])].map((v) => normalize(v));
    return targets.some((t) => t.includes(query));
  });
  renderSuggestions(filtered);
}

function toggleDrag(state) {
  if (!ocrDropzone) return;
  ocrDropzone.classList.toggle('dragover', state);
}

async function handleOcrFile(file) {
  if (!file) return;
  ocrStatus.textContent = 'OCR中…';
  try {
    const data = await file.arrayBuffer();
    const result = await Tesseract.recognize(new Blob([data]), 'jpn+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && m.progress) {
          ocrStatus.textContent = `OCR中… ${Math.round(m.progress * 100)}%`;
        }
      },
    });
    ocrStatus.textContent = 'OCR完了';
    const items = collectItems(result.data.text);
    items.forEach(addTag);
  } catch (e) {
    ocrStatus.textContent = 'OCRに失敗しました';
  } finally {
    if (ocrInput) ocrInput.value = '';
  }
}

function handleOcrChange(event) {
  const file = event.target.files?.[0];
  handleOcrFile(file);
}

function handleDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files?.[0];
  toggleDrag(false);
  handleOcrFile(file);
}

function handleDragOver(event) {
  event.preventDefault();
  toggleDrag(true);
}

function handleDragLeave(event) {
  event.preventDefault();
  toggleDrag(false);
}

function handleBulkAdd() {
  const items = collectItems(bulkInput.value);
  items.forEach(addTag);
  bulkInput.value = '';
}

function handleBulkClear() {
  ingredientList.innerHTML = '';
  updateAnalyzeState();
}

function findMatch(name) {
  const normalizedName = normalize(name);
  const entries = Object.entries(ingredientData);
  for (const [, value] of entries) {
    const candidates = [value.name_jp, value.name_en, ...(value.aliases || [])].map((c) => normalize(c));
    if (candidates.some((c) => c === normalizedName || c.startsWith(normalizedName) || normalizedName.startsWith(c))) {
      return value;
    }
  }
  return null;
}

function createResultCard(name, data) {
  const article = document.createElement('article');
  const level = data?.safety || 'unknown';
  article.className = `cic-result-card level-${level}`;

  const band = document.createElement('div');
  band.className = 'color-band';

  const body = document.createElement('div');
  body.className = 'cic-result-body';

  const title = document.createElement('h4');
  title.className = 'cic-result-title';
  title.textContent = data ? `${data.name_jp} / ${data.name_en}` : `${name} （未収載）`;

  const usage = document.createElement('p');
  usage.className = 'cic-result-meta';
  usage.innerHTML = `<span class="cic-meta-label">【用途】</span>${data?.usage?.join('、 ') || '（未収載）このツールの成分データに掲載がありません。'}`;

  const feature = document.createElement('p');
  feature.className = 'cic-result-meta';
  feature.innerHTML = `<span class="cic-meta-label">【特徴】</span>${data?.feature || '（未収載）このツールの成分データに掲載がありません。'}`;

  const attention = document.createElement('p');
  attention.className = 'cic-result-meta';
  attention.innerHTML = `<span class="cic-meta-label">【注意点】</span>${data?.attention || '（未収載）このツールの成分データに掲載がありません。'}`;

  body.appendChild(title);
  body.appendChild(usage);
  body.appendChild(feature);
  body.appendChild(attention);

  article.appendChild(band);
  article.appendChild(body);
  return article;
}

function renderResults(names) {
  resultContainer.innerHTML = '';
  copyStatus.textContent = '';
  if (!names.length) {
    resultEmpty.classList.remove('hidden');
    return;
  }
  resultEmpty.classList.add('hidden');
  names.forEach((raw) => {
    const match = findMatch(raw);
    const card = createResultCard(raw, match);
    resultContainer.appendChild(card);
  });
}

function renderSample() {
  const sample = [
    {
      name_jp: 'ヒアルロン酸Na',
      name_en: 'Sodium Hyaluronate',
      safety: 'safe',
      usage: ['保湿'],
      feature: '水分保持力が高く、保湿目的でよく用いられる。',
      attention: '特に報告は少ないが、肌状態に応じて様子を見る。'
    },
    {
      name_jp: '香料',
      name_en: 'Fragrance',
      safety: 'caution',
      usage: ['香り付け'],
      feature: '配合種類が多様で、人によって刺激に感じる場合がある。',
      attention: '敏感肌や香料が苦手な場合は注意。'
    },
    {
      name_jp: 'サリチル酸',
      name_en: 'Salicylic Acid',
      safety: 'warning',
      usage: ['角質ケア'],
      feature: 'ピーリング作用を持ち、角質をやわらかくする。',
      attention: '敏感肌では刺激になることがあるため注意。'
    }
  ];
  resultEmpty.classList.add('hidden');
  resultContainer.innerHTML = '';
  copyStatus.textContent = '';
  sample.forEach((item) => {
    const card = createResultCard(item.name_jp, item);
    resultContainer.appendChild(card);
  });
}

function handleAnalyze() {
  const names = Array.from(ingredientList.children).map((pill) => pill.firstChild.textContent);
  renderResults(names);
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

async function handleCopy() {
  const cards = Array.from(resultContainer.querySelectorAll('.cic-result-card'));
  if (!cards.length) {
    copyStatus.textContent = 'コピーできる解析結果がありません。';
    return;
  }
  const lines = cards.map((card) => {
    const title = card.querySelector('.cic-result-title')?.textContent?.trim() || '';
    const metas = Array.from(card.querySelectorAll('.cic-result-meta')).map((m) => m.textContent.trim());
    return [title, ...metas].join('\n');
  });
  try {
    await navigator.clipboard.writeText(lines.join('\n\n'));
    copyStatus.textContent = 'コピーしました';
  } catch (e) {
    copyStatus.textContent = 'コピーに失敗しました';
  }
}

function init() {
  loadIngredients().then(renderSample);
  ocrInput.addEventListener('change', handleOcrChange);
  searchInput.addEventListener('input', handleSearchInput);
  bulkAddButton.addEventListener('click', handleBulkAdd);
  bulkClearButton.addEventListener('click', handleBulkClear);
  analyzeButton.addEventListener('click', handleAnalyze);
  copyButton.addEventListener('click', handleCopy);

  ocrDropzone.addEventListener('dragover', handleDragOver);
  ocrDropzone.addEventListener('dragleave', handleDragLeave);
  ocrDropzone.addEventListener('drop', handleDrop);
  ocrDropzone.addEventListener('click', () => ocrInput.click());
}

document.addEventListener('DOMContentLoaded', init);
