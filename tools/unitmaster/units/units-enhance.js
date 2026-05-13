(() => {
  const page = document.querySelector('.unit-page');
  const firstSection = document.querySelector('.unit-page .secondary-box');
  const nav = document.querySelector('.unit-anchor-nav');
  const cards = Array.from(document.querySelectorAll('.unit-card'));
  const sections = Array.from(document.querySelectorAll('.unit-section'));
  if (!page || !firstSection || !cards.length) return;

  const categoryMap = new Map(sections.map((section) => {
    const title = section.querySelector('h2')?.textContent?.trim() || '';
    return [section.id, title.replace('の単位', '') || section.id];
  }));

  cards.forEach((card) => {
    const section = card.closest('.unit-section');
    const category = section?.id || '';
    const categoryName = categoryMap.get(category) || category;
    card.dataset.category = category;
    card.dataset.categoryName = categoryName;
    card.dataset.searchText = `${card.textContent || ''} ${categoryName}`.toLowerCase();
  });

  const panel = document.createElement('section');
  panel.className = 'unit-finder-panel';
  panel.innerHTML = `
    <div class="unit-finder-head">
      <div>
        <h2>単位を探す</h2>
        <p>単位名・記号・用途で絞り込めます。例：坪、psi、タイヤ、米、真珠</p>
      </div>
      <a class="unit-priority-link" href="/tools/unitmaster/units/priority/">重点単位ノートを見る</a>
    </div>
    <label class="unit-search-label" for="unitSearchInput">検索</label>
    <input id="unitSearchInput" class="unit-search-input" type="search" placeholder="単位名・記号・用途で検索" autocomplete="off">
    <div class="unit-filter-chips" aria-label="カテゴリ絞り込み">
      <button type="button" class="unit-filter-chip active" data-filter="all">すべて</button>
      <button type="button" class="unit-filter-chip" data-filter="length">長さ</button>
      <button type="button" class="unit-filter-chip" data-filter="weight">重さ</button>
      <button type="button" class="unit-filter-chip" data-filter="temp">温度</button>
      <button type="button" class="unit-filter-chip" data-filter="volume">体積</button>
      <button type="button" class="unit-filter-chip" data-filter="area">面積</button>
      <button type="button" class="unit-filter-chip" data-filter="speed">速度</button>
      <button type="button" class="unit-filter-chip" data-filter="pressure">圧力</button>
      <button type="button" class="unit-filter-chip" data-filter="traditional">伝統単位</button>
    </div>
    <p class="unit-search-status" aria-live="polite"></p>
  `;
  firstSection.insertAdjacentElement('afterend', panel);

  const input = panel.querySelector('#unitSearchInput');
  const chips = Array.from(panel.querySelectorAll('.unit-filter-chip'));
  const status = panel.querySelector('.unit-search-status');
  let activeFilter = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    const query = normalize(input.value);
    let visibleCards = 0;
    sections.forEach((section) => {
      let sectionVisible = false;
      const sectionCards = Array.from(section.querySelectorAll('.unit-card'));
      sectionCards.forEach((card) => {
        const matchesText = !query || card.dataset.searchText.includes(query);
        const matchesFilter = activeFilter === 'all'
          || card.dataset.category === activeFilter
          || (activeFilter === 'traditional' && card.classList.contains('traditional'));
        const visible = matchesText && matchesFilter;
        card.hidden = !visible;
        if (visible) {
          visibleCards += 1;
          sectionVisible = true;
        }
      });
      section.hidden = !sectionVisible;
    });
    status.textContent = visibleCards ? `${visibleCards}件の単位を表示中` : '該当する単位がありません。検索語を短くするか、カテゴリを「すべて」に戻してください。';
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter || 'all';
      chips.forEach((item) => item.classList.toggle('active', item === chip));
      applyFilters();
    });
  });

  input.addEventListener('input', applyFilters);
  applyFilters();

  if (nav) {
    const priority = document.createElement('a');
    priority.href = '/tools/unitmaster/units/priority/';
    priority.textContent = '重点ノート';
    nav.appendChild(priority);
  }
})();
