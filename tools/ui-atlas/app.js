(function () {
  const root = document.body;
  if (!root) return;

  const tool = root.dataset.tool || 'ui-atlas';
  const page = root.dataset.page || 'index';
  const lang = root.dataset.lang || 'en';
  document.documentElement.dataset.tool = tool;
  document.documentElement.dataset.page = page;
  document.documentElement.dataset.lang = lang;

  const app = root.querySelector('[data-ui-atlas-root]');
  if (!app) return;

  const search = app.querySelector('[data-search]');
  const chips = Array.from(app.querySelectorAll('[data-filter]'));
  const cards = Array.from(app.querySelectorAll('[data-card]'));
  const countEl = app.querySelector('[data-count]');
  const detailTitle = app.querySelector('[data-detail-title]');
  const detailText = app.querySelector('[data-detail-text]');
  const detailBest = app.querySelector('[data-detail-best]');
  const detailAvoid = app.querySelector('[data-detail-avoid]');
  const compareList = app.querySelector('[data-compare-list]');
  const compareEmpty = app.querySelector('[data-compare-empty]');

  let activeFilter = 'all';
  let selectedCards = [];

  function updateCount(visible) {
    if (!countEl) return;
    const format = lang === 'ja' ? `${visible} 件表示` : `${visible} patterns shown`;
    countEl.textContent = format;
  }

  function renderCompare() {
    if (!compareList || !compareEmpty) return;
    compareList.innerHTML = '';
    if (selectedCards.length === 0) {
      compareEmpty.hidden = false;
      return;
    }
    compareEmpty.hidden = true;
    selectedCards.forEach((card) => {
      const item = document.createElement('div');
      item.className = 'compare-item';
      const name = document.createElement('strong');
      name.textContent = card.dataset.name;
      const remove = document.createElement('button');
      remove.className = 'btn';
      remove.type = 'button';
      remove.textContent = lang === 'ja' ? '削除' : 'Remove';
      remove.addEventListener('click', function () {
        selectedCards = selectedCards.filter((it) => it !== card);
        card.querySelector('[data-add-compare]')?.classList.remove('active');
        renderCompare();
      });
      item.appendChild(name);
      item.appendChild(remove);
      compareList.appendChild(item);
    });
  }

  function updateDetail(card) {
    if (!card || !detailTitle || !detailText || !detailBest || !detailAvoid) return;
    detailTitle.textContent = card.dataset.name;
    detailText.textContent = card.dataset.summary;
    detailBest.textContent = card.dataset.best;
    detailAvoid.textContent = card.dataset.avoid;
  }

  function applyFilters() {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const category = card.dataset.category;
      const haystack = `${card.dataset.name} ${card.dataset.summary}`.toLowerCase();
      const okFilter = activeFilter === 'all' || category === activeFilter;
      const okQuery = !query || haystack.includes(query);
      const show = okFilter && okQuery;
      card.hidden = !show;
      if (show) visible += 1;
    });
    updateCount(visible);
    if (visible > 0) {
      const first = cards.find((card) => !card.hidden);
      updateDetail(first);
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', function () {
      activeFilter = chip.dataset.filter || 'all';
      chips.forEach((c) => c.classList.toggle('active', c === chip));
      applyFilters();
    });
  });

  search?.addEventListener('input', applyFilters);

  cards.forEach((card) => {
    card.querySelector('[data-open-detail]')?.addEventListener('click', function () {
      updateDetail(card);
    });
    card.querySelector('[data-add-compare]')?.addEventListener('click', function (event) {
      const btn = event.currentTarget;
      if (selectedCards.includes(card)) {
        selectedCards = selectedCards.filter((it) => it !== card);
        btn.classList.remove('active');
      } else if (selectedCards.length < 2) {
        selectedCards.push(card);
        btn.classList.add('active');
      }
      renderCompare();
    });
  });

  applyFilters();
  renderCompare();
})();
