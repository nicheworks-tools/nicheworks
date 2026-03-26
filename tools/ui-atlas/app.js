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

  const labels = {
    en: {
      shown: (count) => `${count} patterns shown`,
      remove: 'Remove',
      compareFull: 'Compare tray is full (max 2). Remove one item first.',
      copied: 'Prompt copied.',
      copyFailed: 'Copy failed. Please copy manually.',
      favoriteOn: '★ Favorited',
      favoriteOff: '☆ Favorite',
      noFavorites: 'No favorites yet.',
      noRecent: 'No recent views yet.',
      compareDiff: 'Key differences',
      open: 'Open',
      purpose: 'Purpose',
      mobile: 'Mobile fit',
      difficulty: 'Difficulty'
    },
    ja: {
      shown: (count) => `${count} 件表示`,
      remove: '削除',
      compareFull: '比較トレイは2件までです。1件削除してから追加してください。',
      copied: 'プロンプトをコピーしました。',
      copyFailed: 'コピーに失敗しました。手動でコピーしてください。',
      favoriteOn: '★ お気に入り済み',
      favoriteOff: '☆ お気に入り',
      noFavorites: 'お気に入りはまだありません。',
      noRecent: '最近見た項目はまだありません。',
      compareDiff: '主要差分',
      open: '開く',
      purpose: '用途',
      mobile: 'モバイル適性',
      difficulty: '実装難易度'
    }
  };
  const t = labels[lang] || labels.en;

  const search = app.querySelector('[data-search]');
  const categoryChips = Array.from(app.querySelectorAll('[data-filter-group="category"]'));
  const selectFilters = Array.from(app.querySelectorAll('[data-select-filter]'));
  const cards = Array.from(app.querySelectorAll('[data-card]'));
  const countEl = app.querySelector('[data-count]');
  const compareList = app.querySelector('[data-compare-list]');
  const compareEmpty = app.querySelector('[data-compare-empty]');
  const compareDiff = app.querySelector('[data-compare-diff]');
  const favoritesList = app.querySelector('[data-favorites-list]');
  const recentList = app.querySelector('[data-recent-list]');
  const copyState = app.querySelector('[data-copy-state]');
  const detailPanel = app.querySelector('[data-detail-panel]');

  const detailEls = {
    title: app.querySelector('[data-detail-title]'),
    summary: app.querySelector('[data-detail-summary]'),
    best: app.querySelector('[data-detail-best]'),
    notFor: app.querySelector('[data-detail-not-for]'),
    similar: app.querySelector('[data-detail-similar]'),
    prompt: app.querySelector('[data-detail-prompt]'),
    notes: app.querySelector('[data-detail-notes]'),
    favBtn: app.querySelector('[data-toggle-favorite]')
  };

  const storage = {
    favorites: `ui-atlas:${lang}:favorites`,
    recent: `ui-atlas:${lang}:recent`
  };

  const safeJsonParse = (value, fallback) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (_error) {
      return fallback;
    }
  };

  let activeCategory = 'all';
  let activeFilters = { purpose: 'all', mobileFit: 'all', difficulty: 'all' };
  let compareIds = [];
  let currentId = null;
  let favorites = safeJsonParse(localStorage.getItem(storage.favorites), []);
  let recent = safeJsonParse(localStorage.getItem(storage.recent), []);

  const byId = new Map(cards.map((card) => [card.dataset.id, card]));

  function cardData(card) {
    return {
      id: card.dataset.id || '',
      name: card.dataset.name || '',
      nameJa: card.dataset.nameJa || '',
      aliases: card.dataset.aliases || '',
      novice: card.dataset.novice || '',
      usecase: card.dataset.usecase || '',
      summary: card.dataset.summary || '',
      best: card.dataset.best || '',
      notFor: card.dataset.notFor || '',
      similar: card.dataset.similar || '',
      prompt: card.dataset.prompt || '',
      notes: card.dataset.notes || '',
      category: card.dataset.category || '',
      purpose: card.dataset.purpose || '',
      mobileFit: card.dataset.mobileFit || '',
      difficulty: card.dataset.difficulty || ''
    };
  }

  function saveLocal() {
    localStorage.setItem(storage.favorites, JSON.stringify(favorites.slice(0, 5)));
    localStorage.setItem(storage.recent, JSON.stringify(recent.slice(0, 8)));
  }

  function updateCount(visible) {
    if (countEl) countEl.textContent = t.shown(visible);
  }

  function setFavoriteButtonState(id) {
    if (!detailEls.favBtn) return;
    const on = favorites.includes(id);
    detailEls.favBtn.textContent = on ? t.favoriteOn : t.favoriteOff;
  }

  function addRecent(id) {
    recent = [id, ...recent.filter((item) => item !== id)].slice(0, 8);
    saveLocal();
    renderRecents();
  }

  function renderMiniList(target, ids, emptyText) {
    if (!target) return;
    target.innerHTML = '';
    if (!ids.length) {
      const p = document.createElement('p');
      p.className = 'muted-small';
      p.textContent = emptyText;
      target.appendChild(p);
      return;
    }
    ids.forEach((id) => {
      const card = byId.get(id);
      if (!card) return;
      const data = cardData(card);
      const button = document.createElement('button');
      button.className = 'mini-item';
      button.type = 'button';
      button.textContent = data.name;
      button.addEventListener('click', function () {
        openDetail(card);
      });
      target.appendChild(button);
    });
  }

  function renderFavorites() {
    renderMiniList(favoritesList, favorites, t.noFavorites);
  }

  function renderRecents() {
    renderMiniList(recentList, recent, t.noRecent);
  }

  function renderCompare() {
    if (!compareList || !compareEmpty || !compareDiff) return;
    compareList.innerHTML = '';
    if (!compareIds.length) {
      compareEmpty.hidden = false;
      compareDiff.hidden = true;
      compareDiff.innerHTML = '';
      return;
    }

    compareEmpty.hidden = true;
    compareIds.forEach((id) => {
      const card = byId.get(id);
      if (!card) return;
      const data = cardData(card);
      const item = document.createElement('div');
      item.className = 'compare-item';
      const name = document.createElement('strong');
      name.textContent = data.name;
      const remove = document.createElement('button');
      remove.className = 'btn';
      remove.type = 'button';
      remove.textContent = t.remove;
      remove.addEventListener('click', function () {
        toggleCompare(card);
      });
      item.appendChild(name);
      item.appendChild(remove);
      compareList.appendChild(item);
    });

    if (compareIds.length === 2) {
      const left = cardData(byId.get(compareIds[0]));
      const right = cardData(byId.get(compareIds[1]));
      compareDiff.hidden = false;
      compareDiff.innerHTML = `
        <h4>${t.compareDiff}</h4>
        <ul>
          <li>${left.name} vs ${right.name}</li>
          <li>${t.purpose}: ${left.purpose} / ${right.purpose}</li>
          <li>${t.mobile}: ${left.mobileFit} / ${right.mobileFit}</li>
          <li>${t.difficulty}: ${left.difficulty} / ${right.difficulty}</li>
        </ul>
      `;
    } else {
      compareDiff.hidden = true;
      compareDiff.innerHTML = '';
    }
  }

  function refreshCompareButtons() {
    cards.forEach((card) => {
      const btn = card.querySelector('[data-add-compare]');
      if (!btn) return;
      btn.classList.toggle('active', compareIds.includes(card.dataset.id || ''));
    });
  }

  function openDetail(card) {
    const data = cardData(card);
    currentId = data.id;
    detailEls.title.textContent = data.name;
    detailEls.summary.textContent = data.summary;
    detailEls.best.textContent = data.best;
    detailEls.notFor.textContent = data.notFor;
    detailEls.similar.textContent = data.similar;
    detailEls.prompt.textContent = data.prompt;
    detailEls.notes.textContent = data.notes;
    setFavoriteButtonState(currentId);
    addRecent(currentId);
    app.classList.add('detail-open');
  }

  async function copyPrompt() {
    if (!currentId) return;
    const card = byId.get(currentId);
    if (!card) return;
    const prompt = card.dataset.prompt || '';
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      if (copyState) copyState.textContent = t.copied;
    } catch (_error) {
      if (copyState) copyState.textContent = t.copyFailed;
    }
  }

  function toggleCompare(card) {
    const id = card.dataset.id || '';
    if (!id) return;
    if (compareIds.includes(id)) {
      compareIds = compareIds.filter((item) => item !== id);
    } else if (compareIds.length < 2) {
      compareIds.push(id);
    } else {
      if (copyState) copyState.textContent = t.compareFull;
      return;
    }
    refreshCompareButtons();
    renderCompare();
  }

  function toggleFavorite() {
    if (!currentId) return;
    if (favorites.includes(currentId)) {
      favorites = favorites.filter((id) => id !== currentId);
    } else if (favorites.length < 5) {
      favorites.push(currentId);
    } else {
      favorites = [currentId, ...favorites.slice(0, 4)];
    }
    saveLocal();
    setFavoriteButtonState(currentId);
    renderFavorites();
  }

  function applyFilters() {
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const data = cardData(card);
      const haystack = [data.name, data.nameJa, data.aliases, data.novice, data.usecase, data.summary]
        .join(' ')
        .toLowerCase();
      const categoryOk = activeCategory === 'all' || data.category === activeCategory;
      const purposeOk = activeFilters.purpose === 'all' || data.purpose === activeFilters.purpose;
      const mobileOk = activeFilters.mobileFit === 'all' || data.mobileFit === activeFilters.mobileFit;
      const diffOk = activeFilters.difficulty === 'all' || data.difficulty === activeFilters.difficulty;
      const queryOk = !query || haystack.includes(query);
      const show = categoryOk && purposeOk && mobileOk && diffOk && queryOk;
      card.hidden = !show;
      if (show) visible += 1;
    });
    updateCount(visible);
  }

  categoryChips.forEach((chip) => {
    chip.addEventListener('click', function () {
      activeCategory = chip.dataset.filter || 'all';
      categoryChips.forEach((c) => c.classList.toggle('active', c === chip));
      applyFilters();
    });
  });

  selectFilters.forEach((select) => {
    select.addEventListener('change', function () {
      const name = select.dataset.selectFilter;
      if (!name) return;
      activeFilters[name] = select.value || 'all';
      applyFilters();
    });
  });

  search?.addEventListener('input', applyFilters);

  cards.forEach((card) => {
    card.querySelector('[data-open-detail]')?.addEventListener('click', function () {
      openDetail(card);
    });
    card.querySelector('[data-add-compare]')?.addEventListener('click', function () {
      toggleCompare(card);
    });
  });

  detailEls.favBtn?.addEventListener('click', toggleFavorite);
  app.querySelector('[data-copy-prompt]')?.addEventListener('click', copyPrompt);
  app.querySelector('[data-close-detail]')?.addEventListener('click', function () {
    app.classList.remove('detail-open');
  });
  app.querySelector('[data-toggle-filters]')?.addEventListener('click', function () {
    app.classList.toggle('filters-open');
  });

  applyFilters();
  renderCompare();
  renderFavorites();
  renderRecents();
})();
