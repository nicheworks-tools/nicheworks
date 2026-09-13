(function enhanceCosmeticLite(root) {
  'use strict';

  function init() {
    const summaryBox = document.getElementById('summaryBox');
    const metricGrid = summaryBox?.querySelector('.metric-grid');
    const categoryBlock = summaryBox?.querySelector('.category-block');
    const parsedCount = document.getElementById('parsedCount');
    const matchedCount = document.getElementById('matchedCount');
    const unknownCount = document.getElementById('unknownCount');
    const tableBody = document.getElementById('itemsTableBody');
    const table = document.getElementById('itemsTable');
    if (!summaryBox || !metricGrid || !parsedCount || !matchedCount || !unknownCount || !tableBody || !table) return;

    let activeFilter = 'all';

    let coverageValue = document.getElementById('dictionaryCoveragePercent');
    if (!coverageValue) {
      const card = document.createElement('div');
      card.className = 'metric-card metric-coverage';
      card.innerHTML = '<span class="metric-label">辞書認識率</span><strong id="dictionaryCoveragePercent" class="metric-value">0%</strong>';
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
      unknownPanel.innerHTML = '<p class="summary-title">未分類の成分</p><div id="liteUnknownList" class="lite-unknown-list"></div><p class="coverage-note">未分類は危険判定ではありません。辞書未登録や表記揺れの可能性があります。</p>';
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
        <div class="lite-filter-scroll" role="group" aria-label="結果を絞り込む">
          <button type="button" class="lite-filter-btn is-active" data-lite-filter="all">すべて</button>
          <button type="button" class="lite-filter-btn" data-lite-filter="unknown">未分類</button>
          <button type="button" class="lite-filter-btn" data-lite-filter="review">確認候補</button>
          <button type="button" class="lite-filter-btn" data-lite-filter="matched">辞書一致</button>
        </div>
        <button type="button" id="liteCopyUnknownBtn" class="lite-copy-unknown-btn">未分類をコピー</button>
        <span id="liteFilterStatus" class="lite-filter-status" aria-live="polite"></span>
      `;
      table.parentElement?.insertAdjacentElement('beforebegin', filterBar);
    }

    const filterStatus = document.getElementById('liteFilterStatus');
    const copyUnknownBtn = document.getElementById('liteCopyUnknownBtn');

    function rowKind(row) {
      const cells = row.querySelectorAll('td');
      const statusText = cells[1]?.textContent || '';
      if (statusText.includes('未分類')) return 'unknown';
      if (statusText.includes('確認候補')) return 'review';
      return 'matched';
    }

    function applyFilter() {
      const rows = [...tableBody.querySelectorAll('tr')];
      let visible = 0;
      for (const row of rows) {
        const show = activeFilter === 'all' || rowKind(row) === activeFilter;
        row.hidden = !show;
        if (show) visible += 1;
      }
      filterBar.hidden = rows.length === 0;
      if (filterStatus) filterStatus.textContent = rows.length ? `${visible} / ${rows.length} 件を表示` : '';
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

    copyUnknownBtn?.addEventListener('click', async () => {
      const names = [...tableBody.querySelectorAll('tr')]
        .filter((row) => rowKind(row) === 'unknown')
        .map((row) => row.querySelector('td')?.textContent?.trim())
        .filter(Boolean);
      if (!names.length) {
        if (filterStatus) filterStatus.textContent = '未分類の成分はありません。';
        return;
      }
      try {
        await navigator.clipboard.writeText(names.join('\n'));
        if (filterStatus) filterStatus.textContent = `未分類 ${names.length} 件をコピーしました。`;
      } catch (error) {
        if (filterStatus) filterStatus.textContent = 'コピーに失敗しました。';
      }
    });

    function update() {
      const total = Number(parsedCount.textContent || 0);
      const matched = Number(matchedCount.textContent || 0);
      const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
      coverageValue.textContent = `${pct}%`;
      coverageNote.textContent = total > 0
        ? `入力 ${total} 成分のうち ${matched} 成分がローカル辞書に一致しました。`
        : '成分を確認すると辞書認識率が表示されます。';

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
          more.textContent = `ほか ${names.length - 12} 件`;
          unknownList.appendChild(more);
        }
      }

      applyFilter();
    }

    const observer = new MutationObserver(update);
    observer.observe(parsedCount, { childList: true, characterData: true, subtree: true });
    observer.observe(matchedCount, { childList: true, characterData: true, subtree: true });
    observer.observe(unknownCount, { childList: true, characterData: true, subtree: true });
    observer.observe(tableBody, { childList: true, subtree: true });
    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(typeof globalThis !== 'undefined' ? globalThis : this);
