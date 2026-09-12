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
    if (!summaryBox || !metricGrid || !parsedCount || !matchedCount || !unknownCount || !tableBody) return;

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

    function update() {
      const total = Number(parsedCount.textContent || 0);
      const matched = Number(matchedCount.textContent || 0);
      const unknown = Number(unknownCount.textContent || 0);
      const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
      coverageValue.textContent = `${pct}%`;
      coverageNote.textContent = total > 0
        ? `入力 ${total} 成分のうち ${matched} 成分がローカル辞書に一致しました。`
        : '成分を確認すると辞書認識率が表示されます。';

      if (!unknownList) return;
      unknownList.innerHTML = '';
      const names = [];
      for (const row of tableBody.querySelectorAll('tr')) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) continue;
        if (!cells[1].textContent.includes('未分類')) continue;
        const name = cells[0].textContent.trim();
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
