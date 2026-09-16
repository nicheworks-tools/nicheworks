(function enhanceCosmeticLite(root) {
  'use strict';

  function init() {
    const summaryBox = document.getElementById('summaryBox');
    const metricGrid = summaryBox?.querySelector('.metric-grid');
    const categoryBlock = summaryBox?.querySelector('.category-block');
    const categoryGrid = document.getElementById('categoryGrid');
    const parsedCount = document.getElementById('parsedCount');
    const matchedCount = document.getElementById('matchedCount');
    const unknownCount = document.getElementById('unknownCount');
    const tableBody = document.getElementById('itemsTableBody');
    const table = document.getElementById('itemsTable');
    if (!summaryBox || !metricGrid || !categoryGrid || !parsedCount || !matchedCount || !unknownCount || !tableBody || !table) return;

    let activeFilter = 'all';
    let activeCategory = 'all';
    const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ja';
    const t = (ja, en) => lang() === 'en' ? en : ja;

    let coverageValue = document.getElementById('dictionaryCoveragePercent');
    if (!coverageValue) {
      const card = document.createElement('div');
      card.className = 'metric-card metric-coverage';
      card.innerHTML = '<span id="dictionaryCoverageLabel" class="metric-label"></span><strong id="dictionaryCoveragePercent" class="metric-value">0%</strong>';
      metricGrid.appendChild(card);
      coverageValue = card.querySelector('#dictionaryCoveragePercent');
    }

    let coverageNote = document.getElementById('dictionaryCoverageNote');
    if (!coverageNote) {
      coverageNote = document.createElement('p');
      coverageNote.id = 'dictionaryCoverageNote';
      coverageNote.className = 'coverage-note';
      coverageNote.setAttribute('aria-live', 'polite');
      metricGrid.insertAdjacentElement('afterend', coverageNote);
    }

    let unknownPanel = document.getElementById('liteUnknownPanel');
    if (!unknownPanel) {
      unknownPanel = document.createElement('div');
      unknownPanel.id = 'liteUnknownPanel';
      unknownPanel.className = 'lite-unknown-panel';
      unknownPanel.hidden = true;
      unknownPanel.innerHTML = '<p id="liteUnknownTitle" class="summary-title"></p><div id="liteUnknownList" class="lite-unknown-list"></div><p id="liteUnknownNote" class="coverage-note"></p>';
      (categoryBlock || summaryBox).insertAdjacentElement('afterend', unknownPanel);
    }

    const unknownList = document.getElementById('liteUnknownList');

    let filterBar = document.getElementById('liteResultFilterBar');
    if (!filterBar) {
      filterBar = document.createElement('div');
      filterBar.id = 'liteResultFilterBar';
      filterBar.className = 'lite-result-filter-bar';
      filterBar.hidden = true;
      filterBar.innerHTML = `
        <div class="lite-filter-row">
          <span id="liteStateFilterLabel" class="lite-filter-label"></span>
          <div class="lite-filter-scroll" role="group" aria-label="Result status filter">
            <button type="button" class="lite-filter-btn is-active" data-lite-filter="all"></button>
            <button type="button" class="lite-filter-btn" data-lite-filter="unknown"></button>
            <button type="button" class="lite-filter-btn" data-lite-filter="review"></button>
            <button type="button" class="lite-filter-btn" data-lite-filter="matched"></button>
          </div>
        </div>
        <div class="lite-filter-row" id="liteCategoryFilterRow" hidden>
          <span id="liteCategoryFilterLabel" class="lite-filter-label"></span>
          <div id="liteCategoryFilter" class="lite-filter-scroll" role="group" aria-label="Category filter"></div>
        </div>
        <div class="lite-copy-actions">
          <button type="button" id="liteCopyVisibleBtn" class="lite-copy-unknown-btn"></button>
          <button type="button" id="liteCopyUnknownBtn" class="lite-copy-unknown-btn"></button>
        </div>
        <span id="liteFilterStatus" class="lite-filter-status" aria-live="polite"></span>
      `;
      table.parentElement?.insertAdjacentElement('beforebegin', filterBar);
    }

    const filterStatus = document.getElementById('liteFilterStatus');
    const copyVisibleBtn = document.getElementById('liteCopyVisibleBtn');
    const copyUnknownBtn = document.getElementById('liteCopyUnknownBtn');
    const categoryFilter = document.getElementById('liteCategoryFilter');
    const categoryFilterRow = document.getElementById('liteCategoryFilterRow');

    function rowKind(row) {
      const kind = row.dataset.resultKind || '';
      if (kind === 'unknown') return 'unknown';
      if (kind === 'review') return 'review';
      return 'matched';
    }

    function rowCategoryMatches(row) {
      if (activeCategory === 'all') return true;
      return (row.dataset.category || '') === activeCategory;
    }

    function currentCategories() {
      return [...categoryGrid.querySelectorAll('.category-chip')]
        .map((chip) => chip.textContent.replace(/\s+\d+\s*$/, '').trim())
        .filter(Boolean);
    }

    function syncStaticLabels() {
      const coverageLabel = document.getElementById('dictionaryCoverageLabel');
      const unknownTitle = document.getElementById('liteUnknownTitle');
      const unknownNote = document.getElementById('liteUnknownNote');
      const stateLabel = document.getElementById('liteStateFilterLabel');
      const categoryLabel = document.getElementById('liteCategoryFilterLabel');
      if (coverageLabel) coverageLabel.textContent = t('辞書認識率', 'Dictionary coverage');
      if (unknownTitle) unknownTitle.textContent = t('未分類の成分', 'Unclassified ingredients');
      if (unknownNote) unknownNote.textContent = t('未分類は危険判定ではありません。辞書未登録や表記揺れの可能性があります。', 'Unclassified does not mean dangerous. The term may be absent from the dictionary or use a spelling variation.');
      if (stateLabel) stateLabel.textContent = t('状態', 'Status');
      if (categoryLabel) categoryLabel.textContent = t('分類', 'Category');
      const labels = {
        all: t('すべて', 'All'),
        unknown: t('未分類', 'Unclassified'),
        review: t('確認候補', 'Review'),
        matched: t('辞書一致', 'Matched')
      };
      filterBar.querySelectorAll('[data-lite-filter]').forEach((button) => {
        button.textContent = labels[button.dataset.liteFilter] || button.dataset.liteFilter;
      });
      if (copyVisibleBtn) copyVisibleBtn.textContent = t('表示中をコピー', 'Copy visible');
      if (copyUnknownBtn) copyUnknownBtn.textContent = t('未分類をコピー', 'Copy unclassified');
    }

    function syncCategoryFilters() {
      if (!categoryFilter || !categoryFilterRow) return;
      const categories = currentCategories();
      if (activeCategory !== 'all' && !categories.includes(activeCategory)) activeCategory = 'all';
      categoryFilterRow.hidden = categories.length === 0;
      categoryFilter.innerHTML = '';
      for (const value of ['all', ...categories]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lite-filter-btn';
        button.dataset.liteCategory = value;
        button.textContent = value === 'all' ? t('すべて', 'All') : value;
        const active = value === activeCategory;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.addEventListener('click', () => {
          activeCategory = value;
          syncCategoryFilters();
          applyFilter();
        });
        categoryFilter.appendChild(button);
      }
    }

    function applyFilter() {
      const rows = [...tableBody.querySelectorAll('tr')];
      let visible = 0;
      for (const row of rows) {
        const stateMatches = activeFilter === 'all' || rowKind(row) === activeFilter;
        const show = stateMatches && rowCategoryMatches(row);
        row.hidden = !show;
        if (show) visible += 1;
      }
      filterBar.hidden = rows.length === 0;
      if (filterStatus) filterStatus.textContent = rows.length
        ? t(`${visible} / ${rows.length} 件を表示`, `Showing ${visible} / ${rows.length}`)
        : '';
      filterBar.querySelectorAll('[data-lite-filter]').forEach((button) => {
        const active = button.dataset.liteFilter === activeFilter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    filterBar.querySelectorAll('[data-lite-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.liteFilter || 'all';
        applyFilter();
      });
    });

    async function copyNames(rows, emptyJa, emptyEn, successJa, successEn) {
      const names = rows.map((row) => row.querySelector('td')?.textContent?.trim()).filter(Boolean);
      if (!names.length) {
        if (filterStatus) filterStatus.textContent = t(emptyJa, emptyEn);
        return;
      }
      try {
        await navigator.clipboard.writeText(names.join('\n'));
        if (filterStatus) filterStatus.textContent = t(`${successJa} ${names.length} 件をコピーしました。`, `${successEn}: ${names.length} copied.`);
      } catch {
        if (filterStatus) filterStatus.textContent = t('コピーに失敗しました。', 'Copy failed.');
      }
    }

    copyVisibleBtn?.addEventListener('click', () => {
      const rows = [...tableBody.querySelectorAll('tr')].filter((row) => !row.hidden);
      return copyNames(rows, '表示中の成分はありません。', 'No visible ingredients.', '表示中', 'Visible');
    });

    copyUnknownBtn?.addEventListener('click', () => {
      const rows = [...tableBody.querySelectorAll('tr')].filter((row) => rowKind(row) === 'unknown');
      return copyNames(rows, '未分類の成分はありません。', 'No unclassified ingredients.', '未分類', 'Unclassified');
    });

    function update() {
      syncStaticLabels();
      const total = Number(parsedCount.textContent || 0);
      const matched = Number(matchedCount.textContent || 0);
      const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
      coverageValue.textContent = `${pct}%`;
      coverageNote.textContent = total > 0
        ? t(`入力 ${total} 成分のうち ${matched} 成分がローカル辞書に一致しました。`, `${matched} of ${total} input ingredients matched the local dictionary.`)
        : t('成分を確認すると辞書認識率が表示されます。', 'Dictionary coverage appears after you check ingredients.');

      if (unknownList) {
        unknownList.innerHTML = '';
        const names = [];
        for (const row of tableBody.querySelectorAll('tr')) {
          if (rowKind(row) !== 'unknown') continue;
          const name = row.querySelector('td')?.textContent?.trim();
          if (name) names.push(name);
        }
        unknownPanel.hidden = !names.length;
        for (const name of names.slice(0, 12)) {
          const chip = document.createElement('span');
          chip.className = 'lite-unknown-chip';
          chip.textContent = name;
          unknownList.appendChild(chip);
        }
        if (names.length > 12) {
          const more = document.createElement('span');
          more.className = 'lite-unknown-more';
          more.textContent = t(`ほか ${names.length - 12} 件`, `${names.length - 12} more`);
          unknownList.appendChild(more);
        }
      }

      syncCategoryFilters();
      applyFilter();
    }

    const observer = new MutationObserver(update);
    observer.observe(parsedCount, { childList: true, characterData: true, subtree: true });
    observer.observe(matchedCount, { childList: true, characterData: true, subtree: true });
    observer.observe(unknownCount, { childList: true, characterData: true, subtree: true });
    observer.observe(tableBody, { childList: true, subtree: true });
    document.addEventListener('nw-lite-languagechange', update);
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof globalThis !== 'undefined' ? globalThis : this);
