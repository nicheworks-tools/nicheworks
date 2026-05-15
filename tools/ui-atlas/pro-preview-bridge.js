(function () {
  const root = document.body;
  if (!root || root.dataset.page !== 'index') return;

  const mount = document.querySelector('[data-pro-preview-catalog]');
  if (!mount) return;

  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const PAYMENT_LINK = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const CATEGORY_ORDER = [
    'Complex Admin UI',
    'AI / Agent UI',
    'Billing / Account UI',
    'Search / Data / Dashboard UI',
    'Compliance / Risk / Review UI'
  ];
  const SEARCH_KEYS = [
    'name_en',
    'name_ja',
    'category',
    'summary_en',
    'summary_ja',
    'best_for_en',
    'best_for_ja',
    'not_for_en',
    'not_for_ja',
    'codex_prompt_en',
    'codex_prompt_ja',
    'acceptance_criteria_en',
    'acceptance_criteria_ja',
    'a11y_checklist_en',
    'a11y_checklist_ja',
    'mobile_checklist_en',
    'mobile_checklist_ja'
  ];

  const labels = lang === 'ja'
    ? {
        title: 'Pro専用Preview',
        intro: 'NicheWorks Proでは高度なUIサンプル50件を利用できます。',
        separate: '無料版の検索は公開100件を対象にしています。このセクションでは、Proで解放される高度なUIサンプル50件を別バンクとしてPreview表示しています。',
        searchLabel: 'Pro専用Previewを検索',
        searchPlaceholder: '例: AI承認、請求、権限、ダッシュボード',
        filterLabel: 'Pro専用Previewカテゴリ',
        allCategories: 'すべて',
        count: (shown, total) => `Pro専用Preview ${total}件中 ${shown}件を表示中`,
        empty: '一致するPro専用Previewがありません。別のキーワードを試すか、検索をクリアしてください。',
        lockedBadge: 'Locked preview',
        unlockedBadge: 'Unlocked preview',
        lockedText: 'ロック付きPreviewです。Proを解放すると詳細、サンプルガイド、引き継ぎ出力を利用できます。',
        unlockedText: 'Pro専用サンプル解放済み。',
        unlockPro: 'NicheWorks Proを購入 — $2.99',
        previewGenerator: 'Pro GeneratorでPreview',
        useGenerator: 'Pro Generatorで使う',
        openProPage: 'Proサンプルバンクを開く',
        bestFor: '向いている場面',
        notFor: '向いていない場面',
        riskLevel: 'リスク',
        implementationCost: '実装コスト',
        maintenanceCost: '保守コスト',
        category: 'カテゴリ',
        unavailable: 'Pro専用サンプルを読み込めませんでした。'
      }
    : {
        title: 'Pro-only previews',
        intro: '50 advanced UI samples are available with NicheWorks Pro.',
        separate: 'Free catalog search covers the public 100 examples. Pro-only previews are shown here as a separate bank so you can see the 50 advanced samples unlocked by Pro.',
        searchLabel: 'Search Pro-only previews',
        searchPlaceholder: 'e.g. AI approval, billing, permission, dashboard',
        filterLabel: 'Pro-only preview category',
        allCategories: 'All',
        count: (shown, total) => `Showing ${shown} of ${total} Pro-only previews`,
        empty: 'No Pro-only previews matched. Try another keyword or clear the search.',
        lockedBadge: 'Locked preview',
        unlockedBadge: 'Unlocked preview',
        lockedText: 'Locked preview. Unlock Pro to view full detail, sample guidance, and handoff output.',
        unlockedText: 'Pro-only sample unlocked.',
        unlockPro: 'Unlock NicheWorks Pro — $2.99',
        previewGenerator: 'Preview in Pro Generator',
        useGenerator: 'Use in Pro Generator',
        openProPage: 'Open Pro sample bank',
        bestFor: 'Best for',
        notFor: 'Not for',
        riskLevel: 'Risk level',
        implementationCost: 'Implementation cost',
        maintenanceCost: 'Maintenance cost',
        category: 'Category',
        unavailable: 'Pro-only samples could not be loaded.'
      };

  const state = {
    query: '',
    category: 'all'
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function normalize(value) {
    return clean(value).toLocaleLowerCase();
  }

  function field(sample, key) {
    return clean(sample[`${key}_${lang}`] || sample[`${key}_en`] || sample[key] || '');
  }

  function firstListItem(sample, key) {
    const list = sample[`${key}_${lang}`] || sample[`${key}_en`] || sample[key];
    return Array.isArray(list) ? clean(list[0]) : clean(list);
  }

  function getProStatus() {
    try {
      if (window.NWPro && typeof window.NWPro.getLocalStatus === 'function') {
        const status = window.NWPro.getLocalStatus();
        if (status && typeof status.active !== 'undefined') return Boolean(status.active);
      }
      if (window.UIAtlasProBridge && typeof window.UIAtlasProBridge.getStatus === 'function') {
        return Boolean(window.UIAtlasProBridge.getStatus().active);
      }
      return document.documentElement.dataset.proActive === 'true';
    } catch (_error) {
      return false;
    }
  }

  function addParam(params, key, value, maxLength) {
    const cleaned = clean(value);
    if (!cleaned) return;
    params.set(key, cleaned.slice(0, maxLength || 260));
  }

  function generatorUrl(sample) {
    const params = new URLSearchParams();
    const summary = field(sample, 'summary');
    const memo = field(sample, 'pro_memo_template');
    addParam(params, 'pattern', field(sample, 'name'), 180);
    addParam(params, 'slug', sample.slug || sample.id, 120);
    addParam(params, 'goal', field(sample, 'best_for'), 260);
    addParam(params, 'context', [summary, memo].filter(Boolean).join(' '), 520);
    addParam(params, 'risk', field(sample, 'not_for'), 260);
    addParam(params, 'best_for', field(sample, 'best_for'), 260);
    addParam(params, 'not_for', field(sample, 'not_for'), 260);
    addParam(params, 'category', sample.category, 120);
    addParam(params, 'mobile', firstListItem(sample, 'mobile_checklist'), 180);
    addParam(params, 'difficulty', sample.implementation_cost, 80);
    const query = params.toString();
    return `pro/${query ? `?${query}` : ''}`;
  }

  function searchableText(sample) {
    return normalize(SEARCH_KEYS.map((key) => {
      const value = sample[key];
      return Array.isArray(value) ? value.join(' ') : value;
    }).join(' '));
  }

  function matchesFilters(sample) {
    const categoryMatches = state.category === 'all' || sample.category === state.category;
    const queryMatches = !state.query || searchableText(sample).includes(normalize(state.query));
    return categoryMatches && queryMatches;
  }

  function groupedSamples(samples) {
    const groups = new Map(CATEGORY_ORDER.map((category) => [category, []]));
    samples.forEach((sample) => {
      const category = sample.category || 'Other';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(sample);
    });
    return Array.from(groups.entries()).filter(([, items]) => items.length);
  }

  function categoryId(category) {
    return `pro-preview-${category.replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '')}`;
  }

  function categoryButtons() {
    const buttons = [{ label: labels.allCategories, value: 'all' }].concat(
      CATEGORY_ORDER.map((category) => ({ label: category, value: category }))
    );
    return buttons.map((button) => {
      const selected = state.category === button.value;
      return `<button type="button" class="pro-preview-filter${selected ? ' is-active' : ''}" data-pro-preview-category="${esc(button.value)}" aria-pressed="${selected ? 'true' : 'false'}">${esc(button.label)}</button>`;
    }).join('');
  }

  function sampleCard(sample, active) {
    const name = field(sample, 'name');
    const summary = field(sample, 'summary');
    const genUrl = generatorUrl(sample);
    const proPageUrl = 'pro/#sample-bank-heading';
    const badge = active ? labels.unlockedBadge : labels.lockedBadge;
    const stateText = active ? labels.unlockedText : labels.lockedText;
    const details = active ? `
      <dl class="pro-preview-meta">
        <div><dt>${esc(labels.bestFor)}</dt><dd>${esc(field(sample, 'best_for'))}</dd></div>
        <div><dt>${esc(labels.notFor)}</dt><dd>${esc(field(sample, 'not_for'))}</dd></div>
        <div><dt>${esc(labels.riskLevel)}</dt><dd>${esc(sample.risk_level)}</dd></div>
        <div><dt>${esc(labels.implementationCost)}</dt><dd>${esc(sample.implementation_cost)}</dd></div>
        <div><dt>${esc(labels.maintenanceCost)}</dt><dd>${esc(sample.maintenance_cost)}</dd></div>
      </dl>` : '';
    const inactiveActions = `
      <a class="btn primary" href="${PAYMENT_LINK}" target="_blank" rel="noopener noreferrer">${esc(labels.unlockPro)}</a>
      <a class="btn" href="${esc(genUrl)}">${esc(labels.previewGenerator)}</a>`;
    const activeActions = `
      <a class="btn primary" href="${esc(genUrl)}">${esc(labels.useGenerator)}</a>
      <a class="btn" href="${esc(proPageUrl)}">${esc(labels.openProPage)}</a>`;

    return `
      <article class="pro-preview-card ${active ? 'is-unlocked' : 'is-locked'}" data-pro-preview-card data-sample-slug="${esc(sample.slug || sample.id || '')}">
        <div class="pro-preview-card-head">
          <div>
            <h4>${esc(name)}</h4>
            <p class="pro-preview-category"><strong>${esc(labels.category)}:</strong> ${esc(sample.category || '')}</p>
          </div>
          <span class="pro-preview-badge" data-unlocked="${active ? 'true' : 'false'}">${esc(badge)}</span>
        </div>
        <p class="pro-preview-summary">${esc(summary)}</p>
        <p class="pro-preview-state">${esc(stateText)}</p>
        ${details}
        <div class="pro-preview-actions">${active ? activeActions : inactiveActions}</div>
      </article>`;
  }

  function render() {
    const samples = Array.isArray(window.UI_ATLAS_PRO_SAMPLES) ? window.UI_ATLAS_PRO_SAMPLES : [];
    const active = getProStatus();
    if (!samples.length) {
      mount.innerHTML = `<section class="pro-preview-bank"><h2>${esc(labels.title)}</h2><p>${esc(labels.unavailable)}</p></section>`;
      return;
    }

    const filtered = samples.filter(matchesFilters);
    const groups = groupedSamples(filtered);
    mount.innerHTML = `
      <section class="pro-preview-bank" aria-labelledby="pro-preview-heading">
        <div class="pro-preview-header">
          <div>
            <h2 id="pro-preview-heading">${esc(labels.title)}</h2>
            <p>${esc(labels.intro)}</p>
            <p class="pro-preview-search-note">${esc(labels.separate)}</p>
          </div>
          <span class="pro-preview-count" data-pro-preview-count>${esc(labels.count(filtered.length, samples.length))}</span>
        </div>
        <div class="pro-preview-controls" aria-label="${esc(labels.filterLabel)}">
          <label class="pro-preview-search-label" for="pro-preview-search">${esc(labels.searchLabel)}</label>
          <input id="pro-preview-search" class="pro-preview-search" type="search" value="${esc(state.query)}" placeholder="${esc(labels.searchPlaceholder)}" autocomplete="off" data-pro-preview-search>
          <div class="pro-preview-filter-row" role="group" aria-label="${esc(labels.filterLabel)}">${categoryButtons()}</div>
          <p class="pro-preview-result-count" aria-live="polite">${esc(labels.count(filtered.length, samples.length))}</p>
        </div>
        ${filtered.length ? groups.map(([category, group]) => `
          <section class="pro-preview-group" aria-labelledby="${esc(categoryId(category))}">
            <h3 id="${esc(categoryId(category))}">${esc(category)} (${group.length})</h3>
            <div class="pro-preview-grid">${group.map((sample) => sampleCard(sample, active)).join('')}</div>
          </section>`).join('') : `<p class="pro-preview-empty" role="status">${esc(labels.empty)}</p>`}
      </section>`;
  }

  mount.addEventListener('input', function (event) {
    if (!event.target || !event.target.matches('[data-pro-preview-search]')) return;
    state.query = event.target.value;
    render();
    const search = mount.querySelector('[data-pro-preview-search]');
    if (search) {
      search.focus();
      const length = search.value.length;
      search.setSelectionRange(length, length);
    }
  });

  mount.addEventListener('click', function (event) {
    const button = event.target && event.target.closest('[data-pro-preview-category]');
    if (!button || !mount.contains(button)) return;
    state.category = button.dataset.proPreviewCategory || 'all';
    render();
  });

  render();
  window.addEventListener('ui-atlas:pro-status', render);
  window.addEventListener('storage', function (event) {
    if (!event.key || event.key.indexOf('pro') !== -1 || event.key.indexOf('nw') !== -1) render();
  });
})();
