const DATA_URL = '../../data/units.json';
const CATEGORY_ORDER = ['length', 'weight', 'temp', 'volume', 'area', 'speed', 'pressure'];
const STATIC_FILTERS = [{ id: 'all', label: 'すべて' }, { id: 'traditional', label: '伝統単位' }];

const grid = document.getElementById('grid');
const chips = document.getElementById('chips');
const queryInput = document.getElementById('q');
const statusText = document.getElementById('status');
const emptyState = document.getElementById('empty');
let activeFilter = 'all';
let units = [];
let categories = [];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function normalize(value) {
  return String(value ?? '').toLowerCase().trim();
}

function formatFactor(unit) {
  if (unit.category === 'temp') return '-';
  if (typeof unit.factor !== 'number') return '-';
  const base = unit.baseUnit || '';
  return `${unit.factor}${base}`;
}

function buildSearchText(unit) {
  return [
    unit.category,
    unit.key,
    unit.labelJa,
    unit.labelEn,
    unit.meaningJa,
    unit.cautionJa,
    ...(Array.isArray(unit.usageJa) ? unit.usageJa : [])
  ].join(' ');
}

function renderChips() {
  const categoryButtons = CATEGORY_ORDER
    .map((id) => categories.find((category) => category.id === id))
    .filter(Boolean)
    .map((category) => ({ id: category.id, label: category.nameJa }));

  const filters = [STATIC_FILTERS[0], ...categoryButtons, STATIC_FILTERS[1]];
  chips.innerHTML = filters
    .map((filter) => `<button class="chip${filter.id === activeFilter ? ' on' : ''}" data-f="${escapeHtml(filter.id)}">${escapeHtml(filter.label)}</button>`)
    .join('');
}

function renderUnits() {
  grid.innerHTML = units
    .map((unit, index) => `<article class="u" data-i="${index}">
      <p class="meta"><span class="pill">${escapeHtml(categoryLabel(unit.category))}</span>${unit.traditional ? '<span class="pill trad">伝統単位</span>' : ''}${unit.priority ? '<span class="pill">重点</span>' : ''}</p>
      <h3>${escapeHtml(unit.labelJa || unit.key)}</h3>
      <p><strong>換算値：</strong>${escapeHtml(formatFactor(unit))}</p>
      <p>${escapeHtml(unit.meaningJa)}</p>
    </article>`)
    .join('');
}

function categoryLabel(id) {
  const category = categories.find((item) => item.id === id);
  return category ? category.nameJa : id;
}

function applyFilters() {
  const keyword = normalize(queryInput.value);
  let count = 0;

  Array.from(grid.children).forEach((card) => {
    const unit = units[Number(card.dataset.i)];
    const matchesKeyword = !keyword || normalize(buildSearchText(unit)).includes(keyword);
    const matchesFilter = activeFilter === 'all'
      || unit.category === activeFilter
      || (activeFilter === 'traditional' && unit.traditional);
    const visible = matchesKeyword && matchesFilter;
    card.hidden = !visible;
    if (visible) count += 1;
  });

  statusText.textContent = count ? `${count}件の単位を表示中` : '該当する単位がありません。';
  emptyState.classList.toggle('show', count === 0);
}

async function loadData() {
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    categories = Array.isArray(data.categories) ? data.categories : [];
    units = Array.isArray(data.units) ? data.units : [];
    renderChips();
    renderUnits();
    applyFilters();
  } catch (error) {
    statusText.textContent = '単位データを読み込めませんでした。時間をおいて再読み込みしてください。';
    emptyState.classList.add('show');
    emptyState.textContent = '単位データの読み込みに失敗しました。';
    console.error('Failed to load UnitMaster unit data:', error);
  }
}

chips.addEventListener('click', (event) => {
  const button = event.target.closest('.chip');
  if (!button) return;
  activeFilter = button.dataset.f || 'all';
  chips.querySelectorAll('.chip').forEach((item) => item.classList.toggle('on', item === button));
  applyFilters();
});

queryInput.addEventListener('input', applyFilters);
statusText.textContent = '単位データを読み込み中です。';
loadData();
