(function enhanceCosmeticLite(root) {
  'use strict';

  const ROLE_COPY = {
    '保湿': { ja: '水分を抱え込み、うるおいを保つ目的で使われる成分です。', en: 'Helps attract or retain moisture in the formula and on the skin.' },
    '整肌': { ja: '肌をすこやかに整える目的で使われる成分です。', en: 'Used to help condition and maintain the skin.' },
    '機能性成分': { ja: '製品に特定の機能を持たせる目的で配合される成分です。', en: 'Used to provide a specific functional role in the product.' },
    'アミノ酸': { ja: '保湿やコンディショニングなどに使われるアミノ酸系成分です。', en: 'An amino-acid ingredient used for moisturizing or conditioning roles.' },
    'シリコーン': { ja: '感触調整や皮膜形成などに使われるシリコーン系成分です。', en: 'A silicone ingredient used for feel, slip, or film-forming roles.' },
    '皮膜形成': { ja: '肌や毛髪の表面に薄い膜を作る目的で使われる成分です。', en: 'Used to form a thin film on skin or hair.' },
    'エモリエント': { ja: '肌をなめらかにし、水分の蒸散を抑える目的で使われる油性成分です。', en: 'An emollient used to soften skin and reduce moisture loss.' },
    '油性成分': { ja: '感触調整やエモリエント目的で使われる油性成分です。', en: 'An oil-based ingredient used for emollience or product feel.' },
    '溶剤': { ja: '他の成分を溶かしたり、処方のベースを作るために使われる成分です。', en: 'Used as a solvent or as part of the formulation base.' },
    '保存系': { ja: '製品の品質を保つために使われる保存系の成分です。', en: 'Used to help preserve product quality.' },
    '香料': { ja: '製品に香りを付けるために使われる成分です。', en: 'Used to add fragrance to the product.' },
    '界面活性剤': { ja: '水と油をなじませたり、洗浄・乳化などに使われる成分です。', en: 'A surfactant used for cleansing, emulsifying, or combining oil and water.' },
    '洗浄': { ja: '皮脂や汚れを落とす目的で使われる洗浄成分です。', en: 'A cleansing ingredient used to remove oil or dirt.' },
    'UV関連': { ja: '紫外線を防ぐ目的で使われるUVフィルター系の成分です。', en: 'A UV-filter ingredient used for sun-protection functions.' },
    '着色': { ja: '製品に色を付ける目的で使われる成分です。', en: 'Used to add color to the product.' },
    '酸化防止': { ja: '処方中の成分の酸化を抑える目的で使われる成分です。', en: 'Used to help limit oxidation in the formulation.' },
    '植物由来': { ja: '植物由来の原料として配合される成分です。', en: 'A plant-derived ingredient used in the formulation.' },
    'ペプチド': { ja: 'ペプチド系のコンディショニング成分です。', en: 'A peptide ingredient used for conditioning roles.' },
    '発酵': { ja: '発酵由来の原料として使われる成分です。', en: 'A fermentation-derived ingredient used in the formulation.' },
    '増粘': { ja: '製品のとろみや粘度を調整するために使われる成分です。', en: 'Used to adjust thickness or viscosity.' },
    '乳化': { ja: '水と油を均一になじませるために使われる乳化成分です。', en: 'An emulsifier used to keep oil and water mixed.' },
    'キレート': { ja: '金属イオンを捕捉し、処方の安定性を保つために使われる成分です。', en: 'A chelating ingredient used to bind metal ions and support formulation stability.' },
    'pH調整': { ja: '製品のpHを調整するために使われる成分です。', en: 'Used to adjust product pH.' },
    '粘度調整': { ja: '製品の粘度や使用感を調整するために使われる成分です。', en: 'Used to adjust viscosity or product texture.' },
    'その他': { ja: '処方を構成する成分の一つです。詳しい用途はメーカー等の公式情報も確認してください。', en: 'One of the ingredients that makes up the formula. Check official manufacturer information for its specific use.' }
  };

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

    function setBilingual(el, ja, en) {
      if (!el) return;
      el.dataset.ja = ja;
      el.dataset.en = en;
      el.textContent = t(ja, en);
    }

    function rewriteStaticProductCopy() {
      setBilingual(document.querySelector('.tool-hero-lead'),
        'パッケージや公式サイトの全成分表示を貼り付けると、それぞれの成分が何のために使われるのかを整理し、処方全体の主な役割をまとめます。',
        'Paste the full ingredient list from a package or official product page to see what each ingredient is generally used for and how the formula is structured.');
      const purpose = document.querySelectorAll('.purpose-strip .purpose-item span')[1];
      setBilingual(purpose,
        '成分の主な役割と処方全体の構成を整理',
        'See ingredient roles and the overall formula structure');
      setBilingual(document.querySelector('#results .section-desc'),
        'まず処方全体で多い役割を確認し、その後に各成分の主な用途を見られます。追加確認が必要な項目だけ個別に目印を付けます。',
        'Start with the main roles across the formula, then review what each ingredient is generally used for. Only items needing extra review are flagged.');

      const disclaimer = document.getElementById('disclaimerBox');
      if (disclaimer) {
        disclaimer.dataset.ja = '<strong>情報提供のみ：</strong>各成分の一般的な配合目的や役割を整理する参考ツールです。濃度・処方全体・個人差は判定できず、医学的・薬機法上の診断や安全性保証は行いません。';
        disclaimer.dataset.en = '<strong>For reference only:</strong> This tool organizes the general roles and formulation purposes of ingredients. It cannot determine concentration, the full formulation, individual suitability, medical diagnosis, or guarantee safety.';
        disclaimer.innerHTML = lang() === 'en' ? disclaimer.dataset.en : disclaimer.dataset.ja;
      }

      const dictionaryStatus = document.getElementById('dictionaryStatus');
      if (dictionaryStatus && !/読み込め|unavailable|failed|一部/.test(dictionaryStatus.textContent)) {
        dictionaryStatus.textContent = t('成分情報を準備済み', 'Ingredient information ready');
      }

      const metricLabels = metricGrid.querySelectorAll('.metric-label');
      setBilingual(metricLabels[0], '役割を確認できた成分', 'Ingredients with role information');
      setBilingual(metricLabels[1], '追加確認', 'Additional review');
      setBilingual(metricLabels[2], '情報不足', 'Needs more information');
      const summaryTitle = categoryBlock?.querySelector('.summary-title');
      setBilingual(summaryTitle, 'この成分表の主な役割', 'Main roles in this formula');

      const headers = table.querySelectorAll('thead th');
      setBilingual(headers[0], '成分', 'Ingredient');
      setBilingual(headers[1], '主な役割', 'Main role');
      setBilingual(headers[2], 'この成分について', 'What this ingredient does');
    }

    const oldCoverage = document.getElementById('dictionaryCoveragePercent')?.closest('.metric-card');
    oldCoverage?.remove();
    document.getElementById('dictionaryCoverageNote')?.remove();

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
      rewriteStaticProductCopy();
      const unknownTitle = document.getElementById('liteUnknownTitle');
      const unknownNote = document.getElementById('liteUnknownNote');
      const stateLabel = document.getElementById('liteStateFilterLabel');
      const categoryLabel = document.getElementById('liteCategoryFilterLabel');
      if (unknownTitle) unknownTitle.textContent = t('情報を確認できなかった成分', 'Ingredients needing more information');
      if (unknownNote) unknownNote.textContent = t('表記ゆれ・OCR誤認識・未登録などが考えられます。製品ラベルやメーカー公式情報も確認してください。', 'This may be due to spelling variation, OCR error, or missing data. Check the product label or official manufacturer information.');
      if (stateLabel) stateLabel.textContent = t('表示', 'Show');
      if (categoryLabel) categoryLabel.textContent = t('役割', 'Role');
      const labels = {
        all: t('すべて', 'All'),
        unknown: t('情報不足', 'Needs info'),
        review: t('追加確認', 'Review'),
        matched: t('役割あり', 'Role available')
      };
      filterBar.querySelectorAll('[data-lite-filter]').forEach((button) => {
        button.textContent = labels[button.dataset.liteFilter] || button.dataset.liteFilter;
      });
      if (copyVisibleBtn) copyVisibleBtn.textContent = t('表示中をコピー', 'Copy visible');
      if (copyUnknownBtn) copyUnknownBtn.textContent = t('情報不足をコピー', 'Copy needs-info');
    }

    function rewriteRows() {
      for (const row of tableBody.querySelectorAll('tr')) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) continue;
        const kind = rowKind(row);
        const category = (row.dataset.category || '').trim();
        const statusChip = cells[1].querySelector('.status-chip');
        if (statusChip) {
          if (kind === 'unknown') statusChip.textContent = t('情報不足', 'Needs more information');
          else if (category) statusChip.textContent = category;
          else statusChip.textContent = t('成分情報あり', 'Ingredient information');
        }
        if (kind === 'unknown') {
          cells[2].textContent = t('この表記から十分な成分情報を確認できませんでした。表記やメーカー公式の全成分表示を確認してください。', 'There is not enough information for this spelling. Check the label or the manufacturer’s official ingredient list.');
        } else if (category && ROLE_COPY[category]) {
          cells[2].textContent = t(ROLE_COPY[category].ja, ROLE_COPY[category].en);
        } else if (/辞書一致|Dictionary match|ローカル辞書|local dictionary/i.test(cells[2].textContent)) {
          cells[2].textContent = t('この成分の主な役割を確認できました。詳しい使用目的は製品全体の処方やメーカー公式情報も確認してください。', 'The main role of this ingredient is available. Check the complete formulation or official manufacturer information for product-specific use.');
        }
      }
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
      return copyNames(rows, '情報不足の成分はありません。', 'No ingredients need more information.', '情報不足', 'Needs info');
    });

    function update() {
      syncStaticLabels();
      rewriteRows();

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