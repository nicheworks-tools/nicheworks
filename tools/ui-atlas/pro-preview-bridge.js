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

  const labels = lang === 'ja'
    ? {
        title: 'Pro専用Preview',
        intro: 'NicheWorks Proでは高度なUIサンプル50件を利用できます。',
        separate: '無料版の検索は公開100件を対象にしています。このリリースではPro専用Previewを別セクションとして下に表示しています。',
        lockedBadge: 'Locked preview',
        unlockedBadge: 'Unlocked',
        lockedText: 'ロック付きPreviewです。Proを解放すると詳細、サンプル、引き継ぎ出力を利用できます。',
        unlockedText: 'Pro専用サンプル解放済み。',
        unlockPro: 'Unlock Pro',
        previewGenerator: 'Pro GeneratorでPreview',
        useGenerator: 'Use in Pro Generator',
        openProPage: 'Pro sample / Proページを開く',
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
        separate: 'Free catalog search covers the public 100 examples. Pro-only previews are shown below as a separate bank in this release.',
        lockedBadge: 'Locked preview',
        unlockedBadge: 'Unlocked',
        lockedText: 'Locked preview. Unlock Pro to view the full sample, details, and handoff output.',
        unlockedText: 'Pro-only sample unlocked.',
        unlockPro: 'Unlock Pro',
        previewGenerator: 'Preview in Pro Generator',
        useGenerator: 'Use in Pro Generator',
        openProPage: 'Open Pro sample / Pro page',
        bestFor: 'Best for',
        notFor: 'Not for',
        riskLevel: 'Risk level',
        implementationCost: 'Implementation cost',
        maintenanceCost: 'Maintenance cost',
        category: 'Category',
        unavailable: 'Pro-only samples could not be loaded.'
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

  function field(sample, key) {
    return clean(sample[`${key}_${lang}`] || sample[`${key}_en`] || sample[key] || '');
  }

  function firstListItem(sample, key) {
    const list = sample[`${key}_${lang}`] || sample[`${key}_en`] || sample[key];
    return Array.isArray(list) ? clean(list[0]) : clean(list);
  }

  function getProStatus() {
    try {
      if (window.UIAtlasProBridge && typeof window.UIAtlasProBridge.getStatus === 'function') {
        return Boolean(window.UIAtlasProBridge.getStatus().active);
      }
      if (window.NWPro && typeof window.NWPro.getLocalStatus === 'function') {
        const status = window.NWPro.getLocalStatus();
        return Boolean(status && status.active);
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
          <h4>${esc(name)}</h4>
          <span class="pro-preview-badge" data-unlocked="${active ? 'true' : 'false'}">${esc(badge)}</span>
        </div>
        <p class="pro-preview-category"><strong>${esc(labels.category)}:</strong> ${esc(sample.category || '')}</p>
        <p class="pro-preview-summary">${esc(summary)}</p>
        <p class="pro-preview-state">${esc(stateText)}</p>
        ${details}
        <div class="pro-preview-actions">${active ? activeActions : inactiveActions}</div>
      </article>`;
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

  function render() {
    const samples = Array.isArray(window.UI_ATLAS_PRO_SAMPLES) ? window.UI_ATLAS_PRO_SAMPLES : [];
    const active = getProStatus();
    if (!samples.length) {
      mount.innerHTML = `<section class="pro-preview-bank"><h2>${esc(labels.title)}</h2><p>${esc(labels.unavailable)}</p></section>`;
      return;
    }

    mount.innerHTML = `
      <section class="pro-preview-bank" aria-labelledby="pro-preview-heading">
        <div class="pro-preview-header">
          <div>
            <h2 id="pro-preview-heading">${esc(labels.title)}</h2>
            <p>${esc(labels.intro)}</p>
            <p class="pro-preview-search-note">${esc(labels.separate)}</p>
          </div>
          <span class="pro-preview-count">${samples.length}</span>
        </div>
        ${groupedSamples(samples).map(([category, group]) => `
          <section class="pro-preview-group" aria-labelledby="pro-preview-${esc(category).replace(/[^a-z0-9]+/gi, '-').toLowerCase()}">
            <h3 id="pro-preview-${esc(category).replace(/[^a-z0-9]+/gi, '-').toLowerCase()}">${esc(category)} (${group.length})</h3>
            <div class="pro-preview-grid">${group.map((sample) => sampleCard(sample, active)).join('')}</div>
          </section>`).join('')}
      </section>`;
  }

  render();
  window.addEventListener('ui-atlas:pro-status', render);
  window.addEventListener('storage', function (event) {
    if (!event.key || event.key.indexOf('pro') !== -1 || event.key.indexOf('nw') !== -1) render();
  });
})();
