(function () {
  const root = document.body;
  const app = document.querySelector('[data-ui-atlas-root]');
  if (!root || !app) return;

  const lang = root.dataset.lang === 'ja' ? 'ja' : 'en';
  const grid = app.querySelector('.result-grid');
  const search = app.querySelector('[data-search]');
  const toolbar = app.querySelector('.results-toolbar');
  const countEl = app.querySelector('[data-count]');
  if (!grid) return;

  const t = lang === 'ja'
    ? {
        showing: '表示中', of: '/', load: 'さらに表示', reset: '初期表示に戻す', all: 'すべて', searchMode: '検索中', shownLabel: (count) => `${count} 件表示`,
        navTitle: 'カテゴリで絞る', popular: '基本', forms: 'Forms', nav: 'Navigation', ai: 'AI', dashboard: 'Dashboard', mobile: 'Mobile', admin: 'Admin', account: 'Account', system: 'System'
      }
    : {
        showing: 'Showing', of: 'of', load: 'Load more', reset: 'Reset view', all: 'All', searchMode: 'Search mode', shownLabel: (count) => `${count} patterns shown`,
        navTitle: 'Browse by category', popular: 'Core', forms: 'Forms', nav: 'Navigation', ai: 'AI', dashboard: 'Dashboard', mobile: 'Mobile', admin: 'Admin', account: 'Account', system: 'System'
      };

  let limit = 24;
  const step = 24;
  let activeCategory = 'all';
  let applying = false;

  const style = document.createElement('style');
  style.textContent = `
    .ui-atlas-hidden-by-guard{display:none!important}
    .catalog-category-nav{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0;padding:10px;border:1px solid #dbe3ef;border-radius:14px;background:#f8fafc}
    .catalog-category-nav strong{font-size:13px;color:#334155;margin-right:4px}
    .catalog-category-nav button{border:1px solid #d1d9e6;background:#fff;color:#0f172a;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:700;cursor:pointer}
    .catalog-category-nav button.is-active{background:#2563eb;color:#fff;border-color:#2563eb}
    .catalog-display-guard{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:12px 0 16px;padding:10px 12px;border:1px solid #dbe3ef;border-radius:14px;background:#f8fafc}
    .catalog-display-guard p{margin:0;color:#475569;font-size:13px}.catalog-display-guard .btn{white-space:nowrap}
    @media(max-width:720px){.catalog-category-nav{position:sticky;top:0;z-index:10;overflow-x:auto;flex-wrap:nowrap}.catalog-category-nav strong{flex:0 0 auto}.catalog-category-nav button{flex:0 0 auto}.catalog-display-guard{position:sticky;bottom:8px;z-index:12;box-shadow:0 10px 28px rgba(15,23,42,.12)}}
  `;
  document.head.appendChild(style);

  const nav = document.createElement('section');
  nav.className = 'catalog-category-nav';
  nav.setAttribute('aria-label', t.navTitle);
  const categories = [
    ['all', t.all, ''],
    ['core', t.popular, 'modal dialog tab toast card grid drawer faq form input hero pricing table navigation breadcrumb accordion skeleton spinner progress'],
    ['forms', t.forms, 'form input validation autosave wizard upload permission'],
    ['navigation', t.nav, 'navigation drawer menu breadcrumb tab command palette search suggestions'],
    ['ai', t.ai, 'ai agent prompt generated confidence approval automation suggestion'],
    ['dashboard', t.dashboard, 'dashboard kpi chart data metric export alert segment'],
    ['mobile', t.mobile, 'mobile bottom swipe sheet responsive'],
    ['admin', t.admin, 'admin audit role permission bulk table security compliance evidence policy'],
    ['account', t.account, 'account checkout billing payment plan upgrade usage cancel team'],
    ['system', t.system, 'system status offline sync banner error loading']
  ];
  nav.innerHTML = `<strong>${t.navTitle}</strong>` + categories.map(([id, label]) => `<button type="button" data-cat="${id}">${label}</button>`).join('');

  const guard = document.createElement('section');
  guard.className = 'catalog-display-guard';
  guard.setAttribute('aria-label', 'Catalog display controls');
  guard.innerHTML = '<p data-guard-status></p><div><button type="button" class="btn" data-guard-more></button> <button type="button" class="btn" data-guard-reset></button></div>';

  if (toolbar) {
    toolbar.insertAdjacentElement('afterend', guard);
    guard.insertAdjacentElement('beforebegin', nav);
  } else {
    grid.insertAdjacentElement('beforebegin', guard);
    guard.insertAdjacentElement('beforebegin', nav);
  }

  const status = guard.querySelector('[data-guard-status]');
  const more = guard.querySelector('[data-guard-more]');
  const reset = guard.querySelector('[data-guard-reset]');
  more.textContent = t.load;
  reset.textContent = t.reset;

  function allCards() {
    return Array.from(grid.querySelectorAll('.pattern-card'));
  }

  function cardText(card) {
    return [card.textContent || '', card.dataset.extendedText || '', card.dataset.extendedSlug || ''].join(' ').toLowerCase();
  }

  function matchesSearch(card, q) {
    if (!q) return true;
    return cardText(card).includes(q);
  }

  function matchesCategory(card) {
    if (activeCategory === 'all') return true;
    const cat = categories.find(([id]) => id === activeCategory);
    if (!cat) return true;
    const keywords = cat[2].split(/\s+/).filter(Boolean);
    const text = cardText(card);
    return keywords.some((word) => text.includes(word));
  }

  function setActiveButtons() {
    nav.querySelectorAll('[data-cat]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.cat === activeCategory));
  }

  function applyGuard() {
    if (applying) return;
    applying = true;
    const q = (search && search.value ? search.value : '').trim().toLowerCase();
    const cards = allCards();
    const filtered = cards.filter((card) => matchesCategory(card) && matchesSearch(card, q));
    const effectiveLimit = q ? Math.max(limit, 48) : limit;

    cards.forEach((card) => card.classList.add('ui-atlas-hidden-by-guard'));
    filtered.slice(0, effectiveLimit).forEach((card) => card.classList.remove('ui-atlas-hidden-by-guard'));

    if (status) {
      const label = q ? `${t.searchMode}: ` : '';
      status.textContent = `${label}${t.showing} ${Math.min(filtered.length, effectiveLimit)} ${t.of} ${filtered.length}`;
    }
    if (countEl && typeof t.shownLabel === 'function') {
      countEl.textContent = t.shownLabel(filtered.length);
    }
    if (more) more.hidden = filtered.length <= effectiveLimit;
    if (reset) reset.hidden = limit === 24 && activeCategory === 'all' && !q;
    setActiveButtons();
    applying = false;
  }

  nav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cat]');
    if (!button) return;
    activeCategory = button.dataset.cat || 'all';
    limit = 24;
    applyGuard();
  });

  more.addEventListener('click', () => {
    limit += step;
    applyGuard();
  });

  reset.addEventListener('click', () => {
    activeCategory = 'all';
    limit = 24;
    if (search) search.value = '';
    if (search) search.dispatchEvent(new Event('input', { bubbles: true }));
    window.setTimeout(applyGuard, 100);
  });

  if (search) {
    search.addEventListener('input', () => {
      limit = 24;
      window.setTimeout(applyGuard, 140);
    });
  }

  let timer = null;
  const observer = new MutationObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(applyGuard, 160);
  });
  observer.observe(grid, { childList: true, subtree: false });

  window.setTimeout(applyGuard, 400);
  window.setTimeout(applyGuard, 1000);
  window.setTimeout(applyGuard, 2000);
})();