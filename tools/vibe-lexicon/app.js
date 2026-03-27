(function () {
  const root = document.body;
  if (!root) return;

  const tool = root.dataset.tool || 'vibe-lexicon';
  const page = root.dataset.page || 'index';
  const lang = root.dataset.lang || 'en';

  document.documentElement.dataset.tool = tool;
  document.documentElement.dataset.page = page;
  document.documentElement.dataset.lang = lang;

  if (page !== 'index') return;

  const terms = Array.isArray(window.VIBE_LEXICON_TERMS) ? window.VIBE_LEXICON_TERMS : [];
  const maxCompare = 2;
  const state = {
    query: '',
    category: null,
    useCase: null,
    termType: null,
    selectedId: terms[0]?.id || null,
    compare: [],
    favorites: readArray('nw-vl-favorites'),
    recent: readArray('nw-vl-recent'),
    promptMode: 'ui',
    filterExpanded: { category: false, useCase: false, termType: false }
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    searchInput: $('searchInput'), suggestions: $('suggestions'), categoryChips: $('categoryChips'), useChips: $('useChips'), typeChips: $('typeChips'),
    statTotal: $('statTotal'), statCompare: $('statCompare'), statFav: $('statFav'), resetFiltersBtn: $('resetFiltersBtn'), resultCount: $('resultCount'),
    topicScroller: $('topicScroller'), grid: $('grid'), detailTypeTag: $('detailTypeTag'), detailCategoryTag: $('detailCategoryTag'), detailUseTag: $('detailUseTag'),
    detailTitle: $('detailTitle'), detailSub: $('detailSub'), favoriteBtn: $('favoriteBtn'), addCompareBtn: $('addCompareBtn'), detailPlain: $('detailPlain'),
    detailFacts: $('detailFacts'), detailBreakdown: $('detailBreakdown'), detailBad: $('detailBad'), detailGood: $('detailGood'), detailWhyBetter: $('detailWhyBetter'), promptModes: $('promptModes'),
    promptBox: $('promptBox'), copyPromptBtn: $('copyPromptBtn'), detailRelated: $('detailRelated'), clearCompareBtn: $('clearCompareBtn'),
    compareList: $('compareList'), compareEmpty: $('compareEmpty'), compareInsight: $('compareInsight'), favoritesList: $('favoritesList'), recentList: $('recentList'), toast: $('toast'),
    openFiltersBtn: $('openFiltersBtn'), closeFiltersBtn: $('closeFiltersBtn'), openDetailBtn: $('openDetailBtn'), closeDetailBtn: $('closeDetailBtn'),
    categoryToggleBtn: $('categoryToggleBtn'), useToggleBtn: $('useToggleBtn'), typeToggleBtn: $('typeToggleBtn'),
    mobileCompareBar: $('mobileCompareBar'), mobileCompareText: $('mobileCompareText'), mobileCompareJumpBtn: $('mobileCompareJumpBtn'),
    compareTray: $('compareTray')
  };

  if (!els.grid) return;
  const mobileQuery = window.matchMedia('(max-width: 720px)');

  const uiText = lang === 'ja'
    ? {
      results: '件表示', noResults: '条件に一致する語がありません。', addCompare: '比較に追加', compared: '比較中', favorite: 'お気に入り', favorited: 'お気に入り済み',
      favorites: 'お気に入り', recent: '最近見た語', clear: 'クリア', copied: 'コピーしました', compareLimit: '無料版は2語まで比較できます。',
      details: '詳細', open: '開く', compareHint: '2語を選ぶと、違い・使い分け・実務性の比較が表示されます。',
      showMore: 'もっと見る', showLess: '閉じる', compareStatus: '比較中'
    }
    : {
      results: 'results', noResults: 'No terms match current filters.', addCompare: 'Add compare', compared: 'In compare', favorite: 'Favorite', favorited: 'Favorited',
      favorites: 'Favorites', recent: 'Recent', clear: 'Clear', copied: 'Copied to clipboard', compareLimit: 'Free version supports up to 2 compare terms.',
      details: 'Details', open: 'Open', compareHint: 'Select 2 terms to see difference, when-to-use guidance, and practicality comparison.',
      showMore: 'Show more', showLess: 'Show less', compareStatus: 'In compare'
    };

  function readArray(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }
  function writeArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }
  function localized(value) {
    return value?.[lang] ?? value?.en ?? '';
  }
  function localizedArray(value) {
    const v = localized(value);
    return Array.isArray(v) ? v : [];
  }
  function byId(id) {
    return terms.find((t) => t.id === id);
  }
  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 1400);
  }
  function isMobileViewport() {
    return mobileQuery.matches;
  }
  function openFilters() {
    if (!isMobileViewport()) return;
    root.classList.add('filters-open');
    root.classList.remove('detail-open');
  }
  function closeFilters() {
    root.classList.remove('filters-open');
  }
  function openDetail() {
    if (!isMobileViewport()) return;
    root.classList.add('detail-open');
    root.classList.remove('filters-open');
  }
  function closeDetail() {
    root.classList.remove('detail-open');
  }
  function syncDesktopState() {
    if (!isMobileViewport()) {
      root.classList.remove('filters-open');
      root.classList.remove('detail-open');
    }
  }

  function setRecent(id) {
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 6);
    writeArray('nw-vl-recent', state.recent);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  }

  function termSearchCorpus(term) {
    const parts = [
      localized(term.term),
      ...localizedArray(term.aliases),
      ...localizedArray(term.searchPhrases),
      localized(term.category),
      localized(term.termType),
      localized(term.useCase),
      localized(term.beginner),
      localized(term.practicalIntent),
      localized(term.practicalUseCase),
      localized(term.plainExplanation),
      localized(term.commonMisuse),
      ...localizedArray(term.vagueToPractical),
      localized(term.badRequest),
      localized(term.betterRequest),
      localized(term.badBetterWhy)
    ];
    return normalize(parts.join(' | '));
  }

  function filteredTerms() {
    const q = normalize(state.query);
    const qTokens = q.split(' ').filter(Boolean);
    return terms
      .map((t) => {
        const corpus = termSearchCorpus(t);
        return { term: t, score: searchScore(t, q, qTokens, corpus) };
      })
      .filter(({ term, score }) => {
        const matchQ = !q || score > 0;
        const matchCategory = !state.category || localized(term.category) === state.category;
        const matchUse = !state.useCase || localized(term.useCase) === state.useCase;
        const matchType = !state.termType || localized(term.termType) === state.termType;
        return matchQ && matchCategory && matchUse && matchType;
      })
      .sort((a, b) => b.score - a.score)
      .map(({ term }) => term);
  }

  function searchScore(term, q, qTokens, corpus) {
    if (!q) return 1;

    const name = normalize(localized(term.term));
    const aliases = localizedArray(term.aliases).map(normalize);
    const searchPhrases = localizedArray(term.searchPhrases).map(normalize);
    const practicalBits = [
      normalize(localized(term.practicalIntent)),
      normalize(localized(term.practicalUseCase)),
      normalize(localized(term.badRequest)),
      normalize(localized(term.betterRequest))
    ];

    const tokenHits = qTokens.filter((token) => corpus.includes(token)).length;
    const tokenRatio = qTokens.length ? tokenHits / qTokens.length : 0;

    let score = tokenHits;
    if (name.includes(q)) score += 12;
    if (aliases.some((x) => x.includes(q))) score += 9;
    if (searchPhrases.some((x) => x.includes(q))) score += 8;
    if (practicalBits.some((x) => x.includes(q))) score += 6;
    if (corpus.includes(q)) score += 4;

    const goodPartialMatch = tokenHits >= 2 || tokenRatio >= 0.6;
    const hasPhraseSignal = searchPhrases.some((x) => q.includes(x) || x.includes(q));
    if (!goodPartialMatch && !hasPhraseSignal && score < 8) return 0;

    return score;
  }

  function renderChips(target, values, key) {
    target.innerHTML = '';
    values.forEach((value) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip${state[key] === value ? ' active' : ''}`;
      btn.textContent = value;
      btn.addEventListener('click', () => {
        state[key] = state[key] === value ? null : value;
        render();
      });
      target.appendChild(btn);
    });
  }
  function renderFilterToggle(groupKey, chipsEl, toggleEl, limit) {
    if (!chipsEl || !toggleEl) return;
    const chipCount = chipsEl.children.length;
    const expanded = Boolean(state.filterExpanded[groupKey]);
    const shouldClamp = isMobileViewport() && chipCount > limit;
    chipsEl.classList.toggle('chips-clamped', shouldClamp && !expanded);
    toggleEl.hidden = !shouldClamp;
    toggleEl.textContent = expanded ? uiText.showLess : uiText.showMore;
  }

  function renderGrid(list) {
    els.grid.innerHTML = '';
    if (!list.length) {
      els.grid.innerHTML = `<div class="card"><p class="card-copy">${uiText.noResults}</p></div>`;
      return;
    }
    list.forEach((term) => {
      const card = document.createElement('article');
      card.className = 'card';
      const compareActive = state.compare.includes(term.id);
      card.innerHTML = `
        <div class="card-head">
          <div><h3 class="card-title">${localized(term.term)}</h3><p class="card-sub">${localizedArray(term.aliases).slice(0, 3).join(' / ')}</p></div>
        </div>
        <div class="card-tags"><span class="tag accent">${localized(term.termType)}</span><span class="tag">${localized(term.category)}</span><span class="tag success">${localized(term.useCase)}</span></div>
        <p class="card-copy">${localized(term.beginner)}</p>
        <div class="decompose-list">${localizedArray(term.vagueToPractical).slice(0, 2).map((x) => `<div class="decompose-item">${x}</div>`).join('')}</div>
        <div class="card-actions"><button class="btn" data-select="${term.id}">${uiText.details}</button><button class="btn" data-compare="${term.id}">${compareActive ? uiText.compared : uiText.addCompare}</button></div>
      `;
      els.grid.appendChild(card);
    });
  }

  function renderDetail(term) {
    if (!term) return;
    state.selectedId = term.id;
    setRecent(term.id);

    els.detailTypeTag.textContent = localized(term.termType);
    els.detailCategoryTag.textContent = localized(term.category);
    els.detailUseTag.textContent = localized(term.useCase);
    els.detailTitle.textContent = localized(term.term);
    els.detailSub.textContent = `${localizedArray(term.aliases).join(' / ')} · ${localized(term.termType)}`;
    els.detailPlain.textContent = localized(term.plainExplanation);
    els.detailBad.textContent = localized(term.badRequest);
    els.detailGood.textContent = localized(term.betterRequest);
    if (els.detailWhyBetter) els.detailWhyBetter.textContent = localized(term.badBetterWhy);
    els.favoriteBtn.textContent = state.favorites.includes(term.id) ? uiText.favorited : uiText.favorite;
    els.addCompareBtn.textContent = state.compare.includes(term.id) ? uiText.compared : uiText.addCompare;

    els.detailFacts.innerHTML = [
      [lang === 'ja' ? '初心者向け' : 'Beginner wording', localized(term.beginner)],
      [lang === 'ja' ? '実務意図' : 'Practical intent', localized(term.practicalIntent)],
      [lang === 'ja' ? '使いどころ' : 'Use case wording', localized(term.practicalUseCase)],
      [lang === 'ja' ? 'よくある誤用' : 'Common misuse', localized(term.commonMisuse)]
    ].map(([k, v]) => `<div class="fact-row">${k}<strong>${v}</strong></div>`).join('');

    els.detailBreakdown.innerHTML = localizedArray(term.vagueToPractical).map((x) => `<div class="decompose-item">${x}</div>`).join('');

    const modes = Object.keys(term.shortPrompt[lang] || {});
    if (!modes.includes(state.promptMode)) state.promptMode = modes[0] || 'ui';
    els.promptModes.innerHTML = modes.map((mode) => `<button class="prompt-tab ${mode === state.promptMode ? 'active' : ''}" data-mode="${mode}" type="button">${mode.toUpperCase()}</button>`).join('');
    els.promptBox.textContent = term.shortPrompt[lang]?.[state.promptMode] || '';

    els.detailRelated.innerHTML = (term.compareRelationships || []).map((id) => {
      const rel = byId(id);
      if (!rel) return '';
      return `<button class="chip" type="button" data-related="${rel.id}">${localized(rel.term)}</button>`;
    }).join('');
  }

  function pairInsight(a, b) {
    const guide = a.compareGuides?.[b.id]?.[lang] || b.compareGuides?.[a.id]?.[lang];
    if (guide) return guide;
    return {
      difference: lang === 'ja' ? `${localized(a.term)}は${localized(a.category)}寄り、${localized(b.term)}は${localized(b.category)}寄りです。` : `${localized(a.term)} leans toward ${localized(a.category)} while ${localized(b.term)} leans toward ${localized(b.category)}.`,
      whenToUse: lang === 'ja' ? `${localized(a.term)}は「${localized(a.useCase)}」の改善時、${localized(b.term)}は「${localized(b.useCase)}」の改善時に使い分けます。` : `Use ${localized(a.term)} when improving ${localized(a.useCase)}, and ${localized(b.term)} when improving ${localized(b.useCase)}.`,
      practicality: lang === 'ja' ? `${localized(a.termType)} / ${localized(b.termType)} の組み合わせです。実務語の方が実装指示として具体的です。` : `This pair is ${localized(a.termType)} vs ${localized(b.termType)}. Practical terms are usually easier to execute.`
    };
  }

  function renderCompare() {
    els.compareList.innerHTML = '';
    els.compareEmpty.style.display = state.compare.length ? 'none' : 'grid';
    state.compare.forEach((id) => {
      const term = byId(id);
      if (!term) return;
      const item = document.createElement('article');
      item.className = 'compare-item';
      item.innerHTML = `
        <strong>${localized(term.term)}</strong>
        <div class="compare-grid">
          <div class="compare-cell"><strong>${lang === 'ja' ? '実務意図' : 'Practical intent'}</strong>${localized(term.practicalIntent)}</div>
          <div class="compare-cell"><strong>${lang === 'ja' ? '使い分けの目安' : 'Use when'}</strong>${localized(term.practicalUseCase)}</div>
          <div class="compare-cell"><strong>${lang === 'ja' ? '悪い依頼' : 'Bad request'}</strong>${localized(term.badRequest)}</div>
          <div class="compare-cell"><strong>${lang === 'ja' ? '良い依頼' : 'Better request'}</strong>${localized(term.betterRequest)}</div>
        </div>
      `;
      els.compareList.appendChild(item);
    });

    if (els.compareInsight) {
      if (state.compare.length === 2) {
        const a = byId(state.compare[0]);
        const b = byId(state.compare[1]);
        if (a && b) {
          const insight = pairInsight(a, b);
          els.compareInsight.innerHTML = `
            <h4>${localized(a.term)} ↔ ${localized(b.term)}</h4>
            <div class="compare-insight-grid">
              <div class="compare-cell"><strong>${lang === 'ja' ? '違い' : 'Difference'}</strong>${insight.difference}</div>
              <div class="compare-cell"><strong>${lang === 'ja' ? '使い分け' : 'When to use which'}</strong>${insight.whenToUse}</div>
              <div class="compare-cell"><strong>${lang === 'ja' ? '実務性の比較' : 'Practical vs vague'}</strong>${insight.practicality}</div>
            </div>
          `;
          els.compareInsight.style.display = 'block';
          return;
        }
      }
      els.compareInsight.style.display = 'block';
      els.compareInsight.innerHTML = `<p class="card-copy">${uiText.compareHint}</p>`;
    }
  }

  function renderSaved() {
    const f = state.favorites.map(byId).filter(Boolean);
    const r = state.recent.map(byId).filter(Boolean);
    els.favoritesList.innerHTML = `<div class="favorite-row favorite-row-head"><strong>${uiText.favorites}</strong><button class="btn btn-compact" type="button" data-clear="fav">${uiText.clear}</button></div>` +
      (f.length
        ? f.map((t) => `<div class="favorite-row"><div class="favorite-main"><span class="favorite-term">${localized(t.term)}</span><small>${localized(t.category)} · ${localized(t.termType)}</small></div><button class="btn btn-compact" type="button" data-open="${t.id}">${uiText.open}</button></div>`).join('')
        : `<div class="favorite-row favorite-empty">${lang === 'ja' ? 'お気に入りはまだありません。' : 'No favorites yet.'}</div>`);
    els.recentList.innerHTML = `<div class="favorite-row favorite-row-head"><strong>${uiText.recent}</strong><button class="btn btn-compact" type="button" data-clear="recent">${uiText.clear}</button></div>` +
      (r.length
        ? r.map((t) => `<div class="favorite-row"><div class="favorite-main"><span class="favorite-term">${localized(t.term)}</span><small>${localized(t.useCase)} · ${localized(t.termType)}</small></div><button class="btn btn-compact" type="button" data-open="${t.id}">${uiText.open}</button></div>`).join('')
        : `<div class="favorite-row favorite-empty">${lang === 'ja' ? '最近見た語はまだありません。' : 'No recent terms yet.'}</div>`);
  }
  function renderMobileCompareBar() {
    if (!els.mobileCompareBar || !els.mobileCompareText) return;
    const compareCount = state.compare.length;
    const active = isMobileViewport() && compareCount > 0;
    els.mobileCompareBar.classList.toggle('show', active);
    if (!active) return;
    els.mobileCompareText.textContent = `${uiText.compareStatus}: ${compareCount}/${maxCompare}`;
  }

  function renderSuggestions(list) {
    const q = normalize(state.query);
    if (!q) { els.suggestions.classList.remove('open'); els.suggestions.innerHTML = ''; return; }
    const top = list.slice(0, 6);
    els.suggestions.innerHTML = top.map((t) => `<div class="suggestion-item" data-select="${t.id}"><span>${localized(t.term)}</span><span class="suggestion-sub">${localized(t.category)}</span></div>`).join('');
    els.suggestions.classList.toggle('open', top.length > 0);
  }

  function render() {
    const list = filteredTerms();
    const selected = byId(state.selectedId) || list[0] || terms[0];
    renderChips(els.categoryChips, [...new Set(terms.map((t) => localized(t.category)))], 'category');
    renderChips(els.useChips, [...new Set(terms.map((t) => localized(t.useCase)))], 'useCase');
    renderChips(els.typeChips, [...new Set(terms.map((t) => localized(t.termType)))], 'termType');
    renderFilterToggle('category', els.categoryChips, els.categoryToggleBtn, 6);
    renderFilterToggle('useCase', els.useChips, els.useToggleBtn, 4);
    renderFilterToggle('termType', els.typeChips, els.typeToggleBtn, 4);

    els.statTotal.textContent = String(terms.length);
    els.statCompare.textContent = String(state.compare.length);
    els.statFav.textContent = String(state.favorites.length);
    els.resultCount.textContent = `${list.length} ${uiText.results}`;

    els.topicScroller.innerHTML = [...new Set(list.map((t) => localized(t.term)))].map((name) => `<button class="topic-chip" type="button">${name}</button>`).join('');

    renderGrid(list);
    renderDetail(selected);
    renderCompare();
    renderMobileCompareBar();
    renderSaved();
    renderSuggestions(list);
  }

  document.addEventListener('click', (event) => {
    const selectId = event.target.closest('[data-select]')?.dataset.select;
    const compareId = event.target.closest('[data-compare]')?.dataset.compare;
    const relatedId = event.target.closest('[data-related]')?.dataset.related;
    const openId = event.target.closest('[data-open]')?.dataset.open;
    const clearType = event.target.closest('[data-clear]')?.dataset.clear;
    const mode = event.target.closest('[data-mode]')?.dataset.mode;

    if (selectId || relatedId || openId) {
      state.selectedId = selectId || relatedId || openId;
      render();
      openDetail();
      return;
    }
    if (compareId) {
      const has = state.compare.includes(compareId);
      if (has) state.compare = state.compare.filter((x) => x !== compareId);
      else if (state.compare.length >= maxCompare) showToast(uiText.compareLimit);
      else state.compare.push(compareId);
      render();
      return;
    }
    if (clearType === 'fav') { state.favorites = []; writeArray('nw-vl-favorites', []); render(); return; }
    if (clearType === 'recent') { state.recent = []; writeArray('nw-vl-recent', []); render(); return; }
    if (mode) { state.promptMode = mode; renderDetail(byId(state.selectedId)); return; }
  });

  els.searchInput?.addEventListener('input', (event) => { state.query = event.target.value; render(); });
  els.resetFiltersBtn?.addEventListener('click', () => {
    state.query = ''; state.category = null; state.useCase = null; state.termType = null;
    if (els.searchInput) els.searchInput.value = '';
    render();
  });
  els.favoriteBtn?.addEventListener('click', () => {
    const id = state.selectedId;
    if (!id) return;
    state.favorites = state.favorites.includes(id) ? state.favorites.filter((x) => x !== id) : [id, ...state.favorites].slice(0, 10);
    writeArray('nw-vl-favorites', state.favorites);
    render();
  });
  els.addCompareBtn?.addEventListener('click', () => {
    const id = state.selectedId;
    if (!id) return;
    if (state.compare.includes(id)) state.compare = state.compare.filter((x) => x !== id);
    else if (state.compare.length >= maxCompare) showToast(uiText.compareLimit);
    else state.compare.push(id);
    render();
  });
  els.clearCompareBtn?.addEventListener('click', () => { state.compare = []; render(); });
  els.copyPromptBtn?.addEventListener('click', async () => {
    const term = byId(state.selectedId);
    const text = term?.shortPrompt?.[lang]?.[state.promptMode] || '';
    if (!text) return;
    try { await navigator.clipboard.writeText(text); showToast(uiText.copied); } catch { showToast(text); }
  });
  els.openFiltersBtn?.addEventListener('click', openFilters);
  els.closeFiltersBtn?.addEventListener('click', closeFilters);
  els.openDetailBtn?.addEventListener('click', openDetail);
  els.closeDetailBtn?.addEventListener('click', closeDetail);
  mobileQuery.addEventListener('change', syncDesktopState);
  els.categoryToggleBtn?.addEventListener('click', () => { state.filterExpanded.category = !state.filterExpanded.category; render(); });
  els.useToggleBtn?.addEventListener('click', () => { state.filterExpanded.useCase = !state.filterExpanded.useCase; render(); });
  els.typeToggleBtn?.addEventListener('click', () => { state.filterExpanded.termType = !state.filterExpanded.termType; render(); });
  els.mobileCompareJumpBtn?.addEventListener('click', () => {
    if (!els.compareTray) return;
    els.compareTray.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  syncDesktopState();
  render();
})();
