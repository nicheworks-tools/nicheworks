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
      purpose: 'Purpose',
      mobile: 'Mobile fit',
      difficulty: 'Difficulty',
      openDetail: 'Open detail',
      addCompare: 'Add compare',
      categoryNames: {
        disclosure: 'Disclosure',
        navigation: 'Navigation',
        selection: 'Selection'
      },
      mobileNames: { high: 'High', medium: 'Medium', low: 'Low' },
      difficultyNames: { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
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
      purpose: '用途',
      mobile: 'モバイル適性',
      difficulty: '実装難易度',
      openDetail: '詳細',
      addCompare: '比較に追加',
      categoryNames: {
        disclosure: '展開/開示',
        navigation: 'ナビゲーション',
        selection: '選択'
      },
      mobileNames: { high: '高い', medium: '中', low: '低い' },
      difficultyNames: { easy: '易しい', medium: '中', hard: '難しい' }
    }
  };
  const t = labels[lang] || labels.en;

  const search = app.querySelector('[data-search]');
  const categoryChips = Array.from(app.querySelectorAll('[data-filter-group="category"]'));
  const selectFilters = Array.from(app.querySelectorAll('[data-select-filter]'));
  const gridEl = app.querySelector('.result-grid');
  const countEl = app.querySelector('[data-count]');
  const compareList = app.querySelector('[data-compare-list]');
  const compareEmpty = app.querySelector('[data-compare-empty]');
  const compareDiff = app.querySelector('[data-compare-diff]');
  const favoritesList = app.querySelector('[data-favorites-list]');
  const recentList = app.querySelector('[data-recent-list]');
  const copyState = app.querySelector('[data-copy-state]');

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

  let cards = [];
  let records = [];
  let byId = new Map();
  let slugToName = new Map();

  function normalizeRecord(pattern) {
    const useJa = lang === 'ja';
    return {
      id: pattern.id,
      slug: pattern.slug,
      name: useJa ? pattern.name_ja : pattern.name_en,
      nameJa: pattern.name_ja,
      aliases: [...(pattern.aliases_en || []), ...(pattern.aliases_ja || [])].join(', '),
      novice: '',
      usecase: '',
      summary: useJa ? pattern.summary_short_ja : pattern.summary_short_en,
      best: useJa ? pattern.best_for_ja : pattern.best_for_en,
      notFor: useJa ? pattern.not_for_ja : pattern.not_for_en,
      similar: (pattern.similar_patterns || []).join(', '),
      prompt: useJa ? pattern.short_prompt_ja : pattern.short_prompt_en,
      notes: useJa ? pattern.short_impl_note_ja : pattern.short_impl_note_en,
      category: pattern.category,
      purpose: pattern.purpose,
      mobileFit: pattern.mobile_fit,
      difficulty: pattern.difficulty,
      displayCategory: t.categoryNames[pattern.category] || pattern.category,
      displayMobile: t.mobileNames[pattern.mobile_fit] || pattern.mobile_fit,
      displayDifficulty: t.difficultyNames[pattern.difficulty] || pattern.difficulty,
      similarSlugs: pattern.similar_patterns || []
    };
  }

  function createCard(record) {
    const article = document.createElement('article');
    article.className = 'pattern-card';
    article.dataset.card = '';
    article.dataset.id = record.id;
    article.dataset.name = record.name;
    article.dataset.nameJa = record.nameJa;
    article.dataset.aliases = record.aliases;
    article.dataset.novice = record.novice;
    article.dataset.usecase = record.usecase;
    article.dataset.category = record.category;
    article.dataset.purpose = record.purpose;
    article.dataset.mobileFit = record.mobileFit;
    article.dataset.difficulty = record.difficulty;
    article.dataset.summary = record.summary;
    article.dataset.best = record.best;
    article.dataset.notFor = record.notFor;
    article.dataset.similar = record.similar;
    article.dataset.prompt = record.prompt;
    article.dataset.notes = record.notes;

    article.innerHTML = `
      <h3>${record.name}</h3>
      <p>${record.summary}</p>
      <div class="card-meta">
        <span class="meta-tag">${record.displayCategory}</span>
        <span class="meta-tag">${t.mobile}: ${record.displayMobile}</span>
        <span class="meta-tag">${t.difficulty}: ${record.displayDifficulty}</span>
      </div>
      <div class="card-actions">
        <button class="btn" data-open-detail type="button">${t.openDetail}</button>
        <button class="btn primary" data-add-compare type="button">${t.addCompare}</button>
      </div>
    `;
    return article;
  }

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

    const matched = records.find((item) => item.id === data.id);
    if (matched && matched.similarSlugs.length) {
      const similarNames = matched.similarSlugs.map((slug) => slugToName.get(slug) || slug).join(', ');
      detailEls.similar.textContent = similarNames;
    } else {
      detailEls.similar.textContent = data.similar;
    }

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
      const haystack = [data.name, data.nameJa, data.aliases, data.summary]
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

  function attachCardEvents() {
    cards.forEach((card) => {
      card.querySelector('[data-open-detail]')?.addEventListener('click', function () {
        openDetail(card);
      });
      card.querySelector('[data-add-compare]')?.addEventListener('click', function () {
        toggleCompare(card);
      });
    });
  }

  async function loadDataset() {
    const dataUrl = lang === 'ja' ? '../data/patterns.free.v1.json' : 'data/patterns.free.v1.json';
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`Dataset load failed: ${response.status}`);
    const payload = await response.json();
    const source = Array.isArray(payload.patterns) ? payload.patterns : [];
    records = source.map(normalizeRecord);
    slugToName = new Map(records.map((record) => [record.slug, record.name]));
    if (!gridEl) return;

    gridEl.innerHTML = '';
    records.forEach((record) => {
      const card = createCard(record);
      gridEl.appendChild(card);
    });

    cards = Array.from(app.querySelectorAll('[data-card]'));
    byId = new Map(cards.map((card) => [card.dataset.id, card]));
    attachCardEvents();
    applyFilters();
    renderCompare();
    renderFavorites();
    renderRecents();
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
  detailEls.favBtn?.addEventListener('click', toggleFavorite);
  app.querySelector('[data-copy-prompt]')?.addEventListener('click', copyPrompt);
  app.querySelector('[data-close-detail]')?.addEventListener('click', function () {
    app.classList.remove('detail-open');
  });
  app.querySelector('[data-toggle-filters]')?.addEventListener('click', function () {
    app.classList.toggle('filters-open');
  });

  loadDataset().catch(() => {
    updateCount(0);
    renderCompare();
    renderFavorites();
    renderRecents();
  });
})();
