(function enhanceCosmeticLite(root) {
  'use strict';

  function extendRoleTaxonomy() {
    if (typeof CATEGORY_LABELS === 'undefined' || typeof ROLE_DESCRIPTIONS === 'undefined') return;
    Object.assign(CATEGORY_LABELS, {
      'plant extract': { ja: '植物エキス', en: 'Plant extract' },
      buffer: { ja: 'pH安定化', en: 'Buffer' },
      conditioning: { ja: 'コンディショニング', en: 'Conditioning' },
      'skin conditioning': { ja: '整肌', en: 'Skin conditioning' },
      'hair conditioning': { ja: '毛髪コンディショニング', en: 'Hair conditioning' }
    });
    Object.assign(ROLE_DESCRIPTIONS, {
      'plant extract': { ja: '植物から得られたエキス成分です。', en: 'A plant-derived extract ingredient.' },
      buffer: { ja: '製品のpHを安定させる目的で使われる成分です。', en: 'Used to help stabilize product pH.' },
      conditioning: { ja: '肌や毛髪の感触を整える目的で使われる成分です。', en: 'Used for skin or hair conditioning.' },
      'skin conditioning': { ja: '肌の状態や感触を整える目的で使われる成分です。', en: 'Used for skin conditioning.' },
      'hair conditioning': { ja: '毛髪の感触やまとまりを整える目的で使われる成分です。', en: 'Used for hair conditioning.' }
    });
  }

  function init() {
    extendRoleTaxonomy();
    const summaryBox = document.getElementById('summaryBox');
    const categoryBlock = summaryBox?.querySelector('.category-block');
    const categoryGrid = document.getElementById('categoryGrid');
    const parsedCount = document.getElementById('parsedCount');
    const matchedCount = document.getElementById('matchedCount');
    const reviewCount = document.getElementById('reviewCount');
    const unknownCount = document.getElementById('unknownCount');
    const dictionaryStatus = document.getElementById('dictionaryStatus');
    const tableBody = document.getElementById('itemsTableBody');
    const table = document.getElementById('itemsTable');
    const tableWrapper = table?.closest('.table-wrapper');
    const itemsEmpty = document.getElementById('itemsEmpty');
    const affiliateSlot = document.getElementById('amazonAffiliateSlot');
    if (!summaryBox || !categoryGrid || !parsedCount || !matchedCount || !unknownCount || !tableBody || !table || !tableWrapper) return;

    let activeFilter = 'all';
    let activeCategory = 'all';
    const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ja';
    const t = (ja, en) => lang() === 'en' ? en : ja;

    function setBilingualText(el, ja, en) {
      if (!el) return;
      el.dataset.ja = ja;
      el.dataset.en = en;
      el.setAttribute('data-lang-text', '');
      el.textContent = t(ja, en);
    }

    function syncRoleFirstCopy() {
      if (dictionaryStatus) dictionaryStatus.hidden = true;
      const reviewMetric = reviewCount?.closest('.metric-card');
      if (reviewMetric) reviewMetric.hidden = true;

      setBilingualText(document.getElementById('tool-title'), '化粧品の全成分表示を、役割ごとに整理。', 'Understand what each cosmetic ingredient does.');
      setBilingualText(
        document.querySelector('.tool-hero-lead'),
        '全成分表示を貼り付けると、それぞれの成分が何のために使われるのかを整理し、主な役割と説明を表示します。',
        'Paste a full ingredient list to see the main role and explanation for each ingredient.'
      );
      setBilingualText(
        document.querySelector('.tool-hero-sub'),
        '成分の役割を把握するための参考ツールです。濃度や製品全体の安全性を判定するものではありません。',
        'This is a reference tool for understanding ingredient roles; it does not determine concentration or overall product safety.'
      );

      const purposeItems = [...document.querySelectorAll('.purpose-item')];
      if (purposeItems[1]) {
        setBilingualText(purposeItems[1].querySelector('strong'), '確認', 'Check');
        setBilingualText(purposeItems[1].querySelector('span'), '各成分の主な役割と説明', 'See each ingredient’s role and explanation');
      }

      const disclaimer = document.getElementById('disclaimerBox');
      if (disclaimer) {
        disclaimer.dataset.ja = '<strong>情報提供のみ：</strong>成分の主な役割を整理する参考ツールです。濃度・処方全体・個人差は判定できず、医学的・薬機法上の診断や安全性保証は行いません。';
        disclaimer.dataset.en = '<strong>For reference only:</strong> This tool organizes the main roles of cosmetic ingredients. It cannot determine concentration, the full formulation, individual suitability, medical diagnosis, or guarantee safety.';
        disclaimer.innerHTML = lang() === 'en' ? disclaimer.dataset.en : disclaimer.dataset.ja;
      }

      setBilingualText(document.getElementById('results-title'), '成分ごとの役割と説明', 'Ingredient roles and explanations');
      setBilingualText(
        document.querySelector('#results .section-desc'),
        '結果は成分ごとに表示します。複数成分を調べた場合だけ、絞り込みと全体の役割構成も使えます。',
        'Results are shown ingredient by ingredient. Filters and the overall role summary appear only when they are useful for multiple ingredients.'
      );

      const matchedLabel = matchedCount?.closest('.metric-card')?.querySelector('.metric-label');
      if (matchedLabel) setBilingualText(matchedLabel, '役割情報あり', 'Role identified');
      const unknownLabel = unknownCount?.closest('.metric-card')?.querySelector('.metric-label');
      if (unknownLabel) setBilingualText(unknownLabel, '情報未登録', 'Information unavailable');
      const categoryTitle = categoryBlock?.querySelector('.summary-title');
      if (categoryTitle) setBilingualText(categoryTitle, '全体の主な役割', 'Overall main roles');

      const headers = table.querySelectorAll('thead th');
      setBilingualText(headers[0], '成分', 'Ingredient');
      setBilingualText(headers[1], '主な役割', 'Main role');
      setBilingualText(headers[2], '役割の説明', 'Role explanation');

      setBilingualText(document.getElementById('about-title'), 'このLite版で分かること', 'What the Lite tool shows');
      const about = document.querySelector('.about-card');
      const aboutParagraphs = about ? [...about.querySelectorAll('p')] : [];
      if (aboutParagraphs[0]) setBilingualText(
        aboutParagraphs[0],
        '全成分表示から、それぞれの成分の主な役割と簡単な説明を確認できます。複数成分では、保湿・洗浄・乳化など、成分表全体の役割構成もまとめます。',
        'See the main role and a short explanation for each ingredient. For multi-ingredient lists, the tool also summarizes roles such as hydration, cleansing, and emulsifying.'
      );
      if (aboutParagraphs[1]) setBilingualText(
        aboutParagraphs[1],
        '画像から読み取りたい場合や、OCR結果を確認しながら詳しく見たい場合はINCI FastScanを利用してください。',
        'Use INCI FastScan when you want to read a label from an image and review OCR output in more detail.'
      );
    }

    if (dictionaryStatus) dictionaryStatus.hidden = true;
    const reviewMetric = reviewCount?.closest('.metric-card');
    if (reviewMetric) reviewMetric.hidden = true;

    let unknownPanel = document.getElementById('liteUnknownPanel');
    if (!unknownPanel) {
      unknownPanel = document.createElement('div');
      unknownPanel.id = 'liteUnknownPanel';
      unknownPanel.className = 'lite-unknown-panel';
      unknownPanel.hidden = true;
      unknownPanel.innerHTML = '<p id="liteUnknownTitle" class="summary-title"></p><div id="liteUnknownList" class="lite-unknown-list"></div><p id="liteUnknownNote" class="coverage-note"></p>';
      summaryBox.insertAdjacentElement('afterend', unknownPanel);
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
            <button type="button" class="lite-filter-btn" data-lite-filter="matched"></button>
            <button type="button" class="lite-filter-btn" data-lite-filter="unknown"></button>
            <button type="button" class="lite-filter-btn" data-lite-filter="review" hidden></button>
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
      tableWrapper.insertAdjacentElement('beforebegin', filterBar);
    }

    const filterStatus = document.getElementById('liteFilterStatus');
    const copyVisibleBtn = document.getElementById('liteCopyVisibleBtn');
    const copyUnknownBtn = document.getElementById('liteCopyUnknownBtn');
    const liteCategoryFilter = document.getElementById('liteCategoryFilter');
    const categoryFilterRow = document.getElementById('liteCategoryFilterRow');

    function rowKind(row) {
      return row.dataset.resultKind === 'unknown' ? 'unknown' : 'matched';
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
      syncRoleFirstCopy();
      const unknownTitle = document.getElementById('liteUnknownTitle');
      const unknownNote = document.getElementById('liteUnknownNote');
      const stateLabel = document.getElementById('liteStateFilterLabel');
      const categoryLabel = document.getElementById('liteCategoryFilterLabel');
      if (unknownTitle) unknownTitle.textContent = t('役割・説明情報が不足している成分', 'Ingredients with incomplete role or explanation data');
      if (unknownNote) unknownNote.textContent = t('表記ゆれや未登録の可能性があります。商品ラベルやメーカー公式情報も確認してください。', 'The spelling may vary or the ingredient may not yet be fully covered. Check the product label or manufacturer information as well.');
      if (stateLabel) stateLabel.textContent = t('表示', 'Show');
      if (categoryLabel) categoryLabel.textContent = t('役割', 'Role');
      const labels = {
        all: t('すべて', 'All'),
        matched: t('役割・説明あり', 'Role and explanation available'),
        unknown: t('情報不足', 'Information incomplete'),
        review: t('補足確認', 'Additional review')
      };
      filterBar.querySelectorAll('[data-lite-filter]').forEach((button) => {
        button.textContent = labels[button.dataset.liteFilter] || button.dataset.liteFilter;
      });
      if (copyVisibleBtn) copyVisibleBtn.textContent = t('表示中をコピー', 'Copy visible');
      if (copyUnknownBtn) copyUnknownBtn.textContent = t('情報不足をコピー', 'Copy incomplete');
    }

    function syncCategoryFilters(rowCount) {
      if (!liteCategoryFilter || !categoryFilterRow) return;
      const categories = currentCategories();
      if (activeCategory !== 'all' && !categories.includes(activeCategory)) activeCategory = 'all';
      categoryFilterRow.hidden = rowCount < 2 || categories.length < 2;
      liteCategoryFilter.innerHTML = '';
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
          syncCategoryFilters(tableBody.querySelectorAll('tr').length);
          applyFilter();
        });
        liteCategoryFilter.appendChild(button);
      }
    }

    function applyFilter() {
      const rows = [...tableBody.querySelectorAll('tr')];
      if (rows.length < 2) {
        activeFilter = 'all';
        activeCategory = 'all';
      }
      let visible = 0;
      for (const row of rows) {
        const stateMatches = activeFilter === 'all' || rowKind(row) === activeFilter;
        const show = stateMatches && rowCategoryMatches(row);
        row.hidden = !show;
        if (show) visible += 1;
      }
      filterBar.hidden = rows.length < 2;
      if (filterStatus) filterStatus.textContent = rows.length >= 2 ? t(`${visible} / ${rows.length} 件を表示`, `Showing ${visible} / ${rows.length}`) : '';
      filterBar.querySelectorAll('[data-lite-filter]').forEach((button) => {
        const active = button.dataset.liteFilter === activeFilter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function arrangeAnswerFirstLayout(rowCount) {
      const answerAnchor = itemsEmpty || tableWrapper;
      answerAnchor.insertAdjacentElement('afterend', summaryBox);
      summaryBox.hidden = rowCount < 2;
      summaryBox.insertAdjacentElement('afterend', unknownPanel);
      if (affiliateSlot) unknownPanel.insertAdjacentElement('afterend', affiliateSlot);
    }

    filterBar.querySelectorAll('[data-lite-filter]').forEach((button) => {
      if (button.hidden) return;
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
      return copyNames(rows, '情報不足の成分はありません。', 'No incomplete ingredients.', '情報不足', 'Incomplete');
    });

    function update() {
      syncStaticLabels();
      const rows = [...tableBody.querySelectorAll('tr')];
      if (unknownList) {
        unknownList.innerHTML = '';
        const names = [];
        for (const row of rows) {
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
      syncCategoryFilters(rows.length);
      applyFilter();
      arrangeAnswerFirstLayout(rows.length);
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