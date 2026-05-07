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
  const confirmTimers = new Map();
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
    mobileVisibleCount: 10,
    filterExpanded: { category: false, useCase: false, termType: false }
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    searchInput: $('searchInput'), suggestions: $('suggestions'), categoryChips: $('categoryChips'), useChips: $('useChips'), typeChips: $('typeChips'),
    statTotal: $('statTotal'), statCompare: $('statCompare'), statFav: $('statFav'), resetFiltersBtn: $('resetFiltersBtn'), resultCount: $('resultCount'),
    grid: $('grid'), detailTypeTag: $('detailTypeTag'), detailCategoryTag: $('detailCategoryTag'), detailUseTag: $('detailUseTag'),
    detailTitle: $('detailTitle'), detailSub: $('detailSub'), favoriteBtn: $('favoriteBtn'), addCompareBtn: $('addCompareBtn'), detailPlain: $('detailPlain'),
    detailFacts: $('detailFacts'), detailBreakdown: $('detailBreakdown'), detailBad: $('detailBad'), detailGood: $('detailGood'), detailWhyBetter: $('detailWhyBetter'), promptModes: $('promptModes'),
    promptBox: $('promptBox'), copyPromptBtn: $('copyPromptBtn'), detailRelated: $('detailRelated'), clearCompareBtn: $('clearCompareBtn'),
    compareList: $('compareList'), compareEmpty: $('compareEmpty'), compareInsight: $('compareInsight'), favoritesList: $('favoritesList'), recentList: $('recentList'), toast: $('toast'),
    openFiltersBtn: $('openFiltersBtn'), closeFiltersBtn: $('closeFiltersBtn'), openDetailBtn: $('openDetailBtn'), closeDetailBtn: $('closeDetailBtn'),
    categoryToggleBtn: $('categoryToggleBtn'), useToggleBtn: $('useToggleBtn'), typeToggleBtn: $('typeToggleBtn'),
    mobileCompareBar: $('mobileCompareBar'), mobileCompareText: $('mobileCompareText'), mobileCompareJumpBtn: $('mobileCompareJumpBtn'), mobileCompareClearBtn: $('mobileCompareClearBtn'),
    compareTray: $('compareTray'), mobileResultsActions: $('mobileResultsActions')
  };

  if (!els.grid) return;
  const mobileQuery = window.matchMedia('(max-width: 720px)');

  const uiText = lang === 'ja'
    ? {
      results: '件表示', noResults: '条件に一致する語がありません。', addCompare: '比較に追加', compared: '比較中', favorite: 'お気に入り', favorited: 'お気に入り済み',
      favorites: 'お気に入り', recent: '最近見た語', clear: 'クリア', copied: 'コピーしました', copyFailed: 'コピーに失敗しました。手動でコピーしてください。', compareLimit: '無料版は2語まで比較できます。',
      details: '詳細', open: '開く', compareHint: '2語を選ぶと、違い・使い分け・実務性の比較が表示されます。',
      showMore: 'もっと見る', showLess: '閉じる', compareStatus: '比較中', confirmClear: 'もう一度押すと削除します', cleared: '削除しました',
      noFavorites: 'お気に入りはまだありません。', noRecent: '最近見た語はまだありません。', showMoreResults: (n) => `さらに${n}件表示`,
      beginner: '初心者向け', practicalIntent: '実務意図', useCaseWording: '使いどころ', commonMisuse: 'よくある誤用',
      difference: '違い', whenToUseWhich: '使い分け', practicalVsVague: '実務性の比較', useWhen: '使い分けの目安', badRequest: '悪い依頼', betterRequest: '良い依頼'
    }
    : {
      results: 'results', noResults: 'No terms match current filters.', addCompare: 'Add compare', compared: 'In compare', favorite: 'Favorite', favorited: 'Favorited',
      favorites: 'Favorites', recent: 'Recent', clear: 'Clear', copied: 'Copied to clipboard', copyFailed: 'Copy failed. Please copy manually.', compareLimit: 'Free version supports up to 2 compare terms.',
      details: 'Details', open: 'Open', compareHint: 'Select 2 terms to see difference, when-to-use guidance, and practicality comparison.',
      showMore: 'Show more', showLess: 'Show less', compareStatus: 'In compare', confirmClear: 'Press again to clear', cleared: 'Cleared',
      noFavorites: 'No favorites yet.', noRecent: 'No recent terms yet.', showMoreResults: (n) => `Show ${n} more`,
      beginner: 'Beginner wording', practicalIntent: 'Practical intent', useCaseWording: 'Use case wording', commonMisuse: 'Common misuse',
      difference: 'Difference', whenToUseWhich: 'When to use which', practicalVsVague: 'Practical vs vague', useWhen: 'Use when', badRequest: 'Bad request', betterRequest: 'Better request'
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
  function clearNode(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  function createEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function createButton(className, text, dataset, type = 'button') {
    const btn = createEl('button', className, text);
    btn.type = type;
    Object.entries(dataset || {}).forEach(([key, value]) => { btn.dataset[key] = value; });
    return btn;
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

  function resetMobileVisibleCount() {
    state.mobileVisibleCount = 10;
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
    clearNode(target);
    values.forEach((value) => {
      const btn = createButton(`chip${state[key] === value ? ' active' : ''}`, value);
      btn.addEventListener('click', () => {
        state[key] = state[key] === value ? null : value;
        resetMobileVisibleCount();
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
    clearNode(els.grid);
    const mobileLimit = state.mobileVisibleCount || 10;
    const visibleList = isMobileViewport() ? list.slice(0, mobileLimit) : list;

    if (!visibleList.length) {
      const emptyCard = createEl('div', 'card');
      emptyCard.appendChild(createEl('p', 'card-copy', uiText.noResults));
      els.grid.appendChild(emptyCard);
      clearNode(els.mobileResultsActions);
      return;
    }

    visibleList.forEach((term) => {
      const card = createEl('article', 'card');
      const compareActive = state.compare.includes(term.id);
      const cardHead = createEl('div', 'card-head');
      const titleWrap = createEl('div');
      titleWrap.appendChild(createEl('h3', 'card-title', localized(term.term)));
      titleWrap.appendChild(createEl('p', 'card-sub', localizedArray(term.aliases).slice(0, 3).join(' / ')));
      cardHead.appendChild(titleWrap);
      card.appendChild(cardHead);

      const tags = createEl('div', 'card-tags');
      tags.appendChild(createEl('span', 'tag accent', localized(term.termType)));
      tags.appendChild(createEl('span', 'tag', localized(term.category)));
      tags.appendChild(createEl('span', 'tag success', localized(term.useCase)));
      card.appendChild(tags);
      card.appendChild(createEl('p', 'card-copy', localized(term.beginner)));

      const actions = createEl('div', 'card-actions');
      actions.appendChild(createButton('btn', uiText.details, { select: term.id }));
      actions.appendChild(createButton('btn', compareActive ? uiText.compared : uiText.addCompare, { compare: term.id }));
      card.appendChild(actions);
      els.grid.appendChild(card);
    });

    if (els.mobileResultsActions) {
      clearNode(els.mobileResultsActions);
      if (isMobileViewport() && list.length > visibleList.length) {
        const remaining = list.length - visibleList.length;
        const step = Math.min(10, remaining);
        els.mobileResultsActions.appendChild(createButton('btn', uiText.showMoreResults(step), { showMoreResults: '1' }));
      }
    }
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

    clearNode(els.detailFacts);
    [
      [uiText.beginner, localized(term.beginner)],
      [uiText.practicalIntent, localized(term.practicalIntent)],
      [uiText.useCaseWording, localized(term.practicalUseCase)],
      [uiText.commonMisuse, localized(term.commonMisuse)]
    ].forEach(([key, value]) => {
      const row = createEl('div', 'fact-row', key);
      row.appendChild(createEl('strong', null, value));
      els.detailFacts.appendChild(row);
    });

    clearNode(els.detailBreakdown);
    localizedArray(term.vagueToPractical).forEach((item) => {
      els.detailBreakdown.appendChild(createEl('div', 'decompose-item', item));
    });

    const modes = Object.keys(term.shortPrompt[lang] || {});
    if (!modes.includes(state.promptMode)) state.promptMode = modes[0] || 'ui';
    clearNode(els.promptModes);
    modes.forEach((mode) => {
      els.promptModes.appendChild(createButton(`prompt-tab ${mode === state.promptMode ? 'active' : ''}`, mode.toUpperCase(), { mode }));
    });
    els.promptBox.textContent = term.shortPrompt[lang]?.[state.promptMode] || '';

    clearNode(els.detailRelated);
    (term.compareRelationships || []).forEach((id) => {
      const rel = byId(id);
      if (!rel) return;
      els.detailRelated.appendChild(createButton('chip', localized(rel.term), { related: rel.id }));
    });
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

  function createCompareCell(label, value) {
    const cell = createEl('div', 'compare-cell');
    cell.appendChild(createEl('strong', null, label));
    cell.appendChild(document.createTextNode(value || ''));
    return cell;
  }

  function renderCompare() {
    clearNode(els.compareList);
    els.compareEmpty.style.display = state.compare.length ? 'none' : 'grid';
    state.compare.forEach((id) => {
      const term = byId(id);
      if (!term) return;
      const item = createEl('article', 'compare-item');
      item.appendChild(createEl('strong', null, localized(term.term)));
      const grid = createEl('div', 'compare-grid');
      grid.appendChild(createCompareCell(uiText.practicalIntent, localized(term.practicalIntent)));
      grid.appendChild(createCompareCell(uiText.useWhen, localized(term.practicalUseCase)));
      grid.appendChild(createCompareCell(uiText.badRequest, localized(term.badRequest)));
      grid.appendChild(createCompareCell(uiText.betterRequest, localized(term.betterRequest)));
      item.appendChild(grid);
      els.compareList.appendChild(item);
    });

    if (els.compareInsight) {
      clearNode(els.compareInsight);
      els.compareInsight.style.display = 'block';
      if (state.compare.length === 2) {
        const a = byId(state.compare[0]);
        const b = byId(state.compare[1]);
        if (a && b) {
          const insight = pairInsight(a, b);
          els.compareInsight.appendChild(createEl('h4', null, `${localized(a.term)} ↔ ${localized(b.term)}`));
          const grid = createEl('div', 'compare-insight-grid');
          grid.appendChild(createCompareCell(uiText.difference, insight.difference));
          grid.appendChild(createCompareCell(uiText.whenToUseWhich, insight.whenToUse));
          grid.appendChild(createCompareCell(uiText.practicalVsVague, insight.practicality));
          els.compareInsight.appendChild(grid);
          return;
        }
      }
      els.compareInsight.appendChild(createEl('p', 'card-copy', uiText.compareHint));
    }
  }

  function createSavedRow(term, subText) {
    const row = createEl('div', 'favorite-row');
    const main = createEl('div', 'favorite-main');
    main.appendChild(createEl('span', 'favorite-term', localized(term.term)));
    main.appendChild(createEl('small', null, subText));
    row.appendChild(main);
    row.appendChild(createButton('btn btn-compact', uiText.open, { open: term.id }));
    return row;
  }

  function renderSavedGroup(target, title, clearType, items, emptyText, subTextFor) {
    clearNode(target);
    const head = createEl('div', 'favorite-row favorite-row-head');
    head.appendChild(createEl('strong', null, title));
    head.appendChild(createButton('btn btn-compact', uiText.clear, { clear: clearType }));
    target.appendChild(head);
    if (items.length) {
      items.forEach((term) => target.appendChild(createSavedRow(term, subTextFor(term))));
    } else {
      target.appendChild(createEl('div', 'favorite-row favorite-empty', emptyText));
    }
  }

  function renderSaved() {
    const f = state.favorites.map(byId).filter(Boolean);
    const r = state.recent.map(byId).filter(Boolean);
    renderSavedGroup(els.favoritesList, uiText.favorites, 'fav', f, uiText.noFavorites, (t) => `${localized(t.category)} · ${localized(t.termType)}`);
    renderSavedGroup(els.recentList, uiText.recent, 'recent', r, uiText.noRecent, (t) => `${localized(t.useCase)} · ${localized(t.termType)}`);
  }
  function renderMobileCompareBar() {
    if (!els.mobileCompareBar || !els.mobileCompareText) return;
    const compareCount = state.compare.length;
    const active = isMobileViewport() && compareCount > 0;
    root.classList.toggle('mobile-no-compare', isMobileViewport() && compareCount === 0);
    els.mobileCompareBar.classList.toggle('show', active);
    if (!active) return;
    els.mobileCompareText.textContent = `${uiText.compareStatus}: ${compareCount}/${maxCompare}`;
  }

  function renderSuggestions(list) {
    const q = normalize(state.query);
    clearNode(els.suggestions);
    if (!q) { els.suggestions.classList.remove('open'); return; }
    const top = list.slice(0, 6);
    top.forEach((term) => {
      const item = createEl('div', 'suggestion-item');
      item.dataset.select = term.id;
      item.appendChild(createEl('span', null, localized(term.term)));
      item.appendChild(createEl('span', 'suggestion-sub', localized(term.category)));
      els.suggestions.appendChild(item);
    });
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

    renderGrid(list);
    renderDetail(selected);
    renderCompare();
    renderMobileCompareBar();
    renderSaved();
    renderSuggestions(list);
  }

  function requestClear(type) {
    const timerKey = `clear:${type}`;
    const targetButton = document.querySelector(`[data-clear="${type}"]`);
    if (!confirmTimers.has(timerKey)) {
      if (targetButton) targetButton.textContent = uiText.confirmClear;
      showToast(uiText.confirmClear);
      const timer = setTimeout(() => {
        confirmTimers.delete(timerKey);
        renderSaved();
      }, 3500);
      confirmTimers.set(timerKey, timer);
      return;
    }

    clearTimeout(confirmTimers.get(timerKey));
    confirmTimers.delete(timerKey);
    if (type === 'fav') {
      state.favorites = [];
      writeArray('nw-vl-favorites', []);
    }
    if (type === 'recent') {
      state.recent = [];
      writeArray('nw-vl-recent', []);
    }
    showToast(uiText.cleared);
    render();
  }

  async function copyText(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to textarea fallback.
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    document.body.removeChild(textarea);
    return ok;
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
    if (clearType === 'fav' || clearType === 'recent') { requestClear(clearType); return; }
    if (mode) { state.promptMode = mode; renderDetail(byId(state.selectedId)); return; }
    if (event.target.closest('[data-show-more-results]')) {
      state.mobileVisibleCount += 10;
      render();
      return;
    }
  });

  els.searchInput?.addEventListener('input', (event) => { state.query = event.target.value; resetMobileVisibleCount(); render(); });
  els.resetFiltersBtn?.addEventListener('click', () => {
    state.query = ''; state.category = null; state.useCase = null; state.termType = null;
    resetMobileVisibleCount();
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
    const ok = await copyText(text);
    if (ok) showToast(uiText.copied);
    else showToast(uiText.copyFailed);
  });
  els.openFiltersBtn?.addEventListener('click', openFilters);
  els.closeFiltersBtn?.addEventListener('click', closeFilters);
  els.closeDetailBtn?.addEventListener('click', closeDetail);
  mobileQuery.addEventListener('change', syncDesktopState);
  els.categoryToggleBtn?.addEventListener('click', () => { state.filterExpanded.category = !state.filterExpanded.category; render(); });
  els.useToggleBtn?.addEventListener('click', () => { state.filterExpanded.useCase = !state.filterExpanded.useCase; render(); });
  els.typeToggleBtn?.addEventListener('click', () => { state.filterExpanded.termType = !state.filterExpanded.termType; render(); });
  els.mobileCompareJumpBtn?.addEventListener('click', () => {
    if (!els.compareTray) return;
    els.compareTray.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  els.mobileCompareClearBtn?.addEventListener('click', () => {
    state.compare = [];
    render();
  });

  syncDesktopState();
  render();
})();
