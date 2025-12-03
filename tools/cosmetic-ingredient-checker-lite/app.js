const tagList = document.getElementById('tagList');
const ocrInput = document.getElementById('ocrInput');
const ocrStatus = document.getElementById('ocrStatus');
const searchInput = document.getElementById('searchInput');
const suggestList = document.getElementById('suggestList');
const bulkSection = document.getElementById('bulkSection');
const bulkBody = document.getElementById('bulkBody');
const bulkInput = document.getElementById('bulkInput');
const bulkAdd = document.getElementById('bulkAdd');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultCards = document.getElementById('resultCards');

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
  analyzeBtn.disabled = tagList.children.length === 0;
}

function createTag(name) {
  const pill = document.createElement('span');
  pill.className = 'tag-pill';
  pill.title = name;

  const text = document.createElement('span');
  text.textContent = name;

  const del = document.createElement('button');
  del.type = 'button';
  del.textContent = '✕';
  del.addEventListener('click', () => {
    pill.remove();
    updateAnalyzeState();
  });

  pill.appendChild(text);
  pill.appendChild(del);
  return pill;
}

function existsTag(name) {
  const target = normalize(name);
  return Array.from(tagList.children).some((pill) => normalize(pill.firstChild.textContent) === target);
}

function addTag(name) {
  const sanitized = sanitizeTerm(name);
  if (!sanitized || existsTag(sanitized)) return;
  const tag = createTag(sanitized);
  tagList.appendChild(tag);
  updateAnalyzeState();
}

function renderSuggests(items) {
  suggestList.innerHTML = '';
  items.slice(0, 8).forEach((item) => {
    const label = item.name_jp || item.name_en;
    const span = document.createElement('div');
    span.className = 'suggest-item';
    span.textContent = label;
    span.title = `${item.name_jp} / ${item.name_en}`;
    span.addEventListener('click', () => {
      addTag(label);
      suggestList.innerHTML = '';
      searchInput.value = '';
    });
    suggestList.appendChild(span);
  });
}

function handleSearchInput() {
  const query = sanitizeTerm(searchInput.value);
  suggestList.innerHTML = '';
  if (!query) return;
  const results = Object.values(ingredientData).filter((item) => {
    const candidates = [item.name_jp, item.name_en, ...(item.aliases || [])].map((c) => normalize(c));
    return candidates.some((c) => c.startsWith(query) || c.endsWith(query));
  });
  renderSuggests(results);
}

function toggleBulk() {
  bulkSection.classList.toggle('open');
}

async function handleOcrUpload(event) {
  const file = event.target.files?.[0];
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
    ocrInput.value = '';
  }
}

function handleBulkAdd() {
  const items = collectItems(bulkInput.value);
  items.forEach(addTag);
  bulkInput.value = '';
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
  const wrapper = document.createElement('div');
  wrapper.className = 'result-item';

  const band = document.createElement('div');
  band.className = 'band';

  const content = document.createElement('div');
  content.className = 'content';

  const title = document.createElement('h3');
  title.textContent = data ? `${data.name_jp} / ${data.name_en}` : `${name} （未収載）`;

  const usage = document.createElement('p');
  usage.innerHTML = `<span class="result-label">【用途】</span>${data?.usage?.join('、 ') || '（未収載）'}`;

  const feature = document.createElement('p');
  feature.innerHTML = `<span class="result-label">【特徴】</span>${data?.feature || 'このツールの成分データに掲載がありません。'}`;

  const attention = document.createElement('p');
  attention.innerHTML = `<span class="result-label">【注意点】</span>${data?.attention || 'このツールの成分データに掲載がありません。'}`;

  const safetyClass = data?.safety || 'unknown';
  band.classList.add(safetyClass);

  content.appendChild(title);
  content.appendChild(usage);
  content.appendChild(feature);
  content.appendChild(attention);

  wrapper.appendChild(band);
  wrapper.appendChild(content);
  return wrapper;
}

function renderResults(names) {
  resultCards.innerHTML = '';
  names.forEach((raw) => {
    const match = findMatch(raw);
    const card = createResultCard(raw, match);
    resultCards.appendChild(card);
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
  resultCards.innerHTML = '';
  sample.forEach((item) => {
    const card = createResultCard(item.name_jp, item);
    resultCards.appendChild(card);
  });
}

function handleAnalyze() {
  const names = Array.from(tagList.children).map((pill) => pill.firstChild.textContent);
  renderResults(names);
  document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' });
}

function init() {
  loadIngredients().then(renderSample);
  ocrInput.addEventListener('change', handleOcrUpload);
  searchInput.addEventListener('input', handleSearchInput);
  bulkSection.querySelector('.collapse-toggle').addEventListener('click', toggleBulk);
  bulkAdd.addEventListener('click', handleBulkAdd);
  analyzeBtn.addEventListener('click', handleAnalyze);
}

document.addEventListener('DOMContentLoaded', init);
