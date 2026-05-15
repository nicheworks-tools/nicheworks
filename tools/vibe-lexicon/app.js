(function () {
  'use strict';

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
  const commonProBuyUrl = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
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
    openFiltersBtn: $('openFiltersBtn'), closeFiltersBtn: $('closeFiltersBtn'), closeDetailBtn: $('closeDetailBtn'),
    categoryToggleBtn: $('categoryToggleBtn'), useToggleBtn: $('useToggleBtn'), typeToggleBtn: $('typeToggleBtn'),
    mobileCompareBar: $('mobileCompareBar'), mobileCompareText: $('mobileCompareText'), mobileCompareJumpBtn: $('mobileCompareJumpBtn'), mobileCompareClearBtn: $('mobileCompareClearBtn'),
    compareTray: $('compareTray'), mobileResultsActions: $('mobileResultsActions')
  };
  if (!els.grid) return;

  const mobileQuery = window.matchMedia('(max-width: 720px)');
  const txt = lang === 'ja' ? jaText() : enText();

  cleanBrokenSearchAttributes();
  injectProStyles();
  injectProPanel();

  function enText() {
    return {
      results: 'results', noResults: 'No terms match current filters.', addCompare: 'Add compare', compared: 'In compare', favorite: 'Favorite', favorited: 'Favorited',
      favorites: 'Favorites', recent: 'Recent', clear: 'Clear', copied: 'Copied to clipboard', copyFailed: 'Copy failed. Please copy manually.', compareLimit: 'Free version supports up to 2 compare terms.',
      details: 'Details', open: 'Open', compareHint: 'Select 2 terms to see difference, when-to-use guidance, and practicality comparison.', showMore: 'Show more', showLess: 'Show less', compareStatus: 'In compare', confirmClear: 'Press again to clear', cleared: 'Cleared',
      noFavorites: 'No favorites yet.', noRecent: 'No recent terms yet.', showMoreResults: (n) => `Show ${n} more`, beginner: 'Beginner wording', practicalIntent: 'Practical intent', useCaseWording: 'Use case wording', commonMisuse: 'Common misuse',
      difference: 'Difference', whenToUseWhich: 'When to use which', practicalVsVague: 'Practical vs vague', useWhen: 'Use when', badRequest: 'Bad request', betterRequest: 'Better request',
      proTitle: 'NicheWorks Pro outputs', proLead: 'Free lookup, compare, favorites, recent history, and basic AI copy stay free. Pro unlocks copy/export work packs for real handoff tasks.',
      proPreview: 'Preview mode', proUnlocked: 'Pro unlocked', buyPro: 'Buy Pro',
      purchaseNote: 'After purchase, NicheWorks Pro is enabled in this browser. It usually remains active after closing the tab or browser. You may need to unlock again on another device, another browser, private mode, or after clearing site data.',
      fullPrompt: 'Copy full style prompt', memo: 'Copy brand tone memo', avoid: 'Copy avoid list', handoff: 'Copy compare handoff', markdown: 'Export Markdown', json: 'Export JSON',
      promptPack: 'AI style prompt pack', memoTitle: 'Brand tone decision memo', avoidTitle: 'NG / avoid list', usePrompts: 'Use-case prompts', handoffTitle: 'Compare handoff', exportTitle: 'Markdown / JSON export',
      lockedToast: 'NicheWorks Pro is required for this copy/export action. Preview is visible below.', selectTwo: 'Add two terms to the compare tray first.'
    };
  }
  function jaText() {
    return {
      results: '件表示', noResults: '条件に一致する語がありません。', addCompare: '比較に追加', compared: '比較中', favorite: 'お気に入り', favorited: 'お気に入り済み',
      favorites: 'お気に入り', recent: '最近見た語', clear: 'クリア', copied: 'コピーしました', copyFailed: 'コピーに失敗しました。手動でコピーしてください。', compareLimit: '無料版は2語まで比較できます。',
      details: '詳細', open: '開く', compareHint: '2語を選ぶと、違い・使い分け・実務性の比較が表示されます。', showMore: 'もっと見る', showLess: '閉じる', compareStatus: '比較中', confirmClear: 'もう一度押すと削除します', cleared: '削除しました',
      noFavorites: 'お気に入りはまだありません。', noRecent: '最近見た語はまだありません。', showMoreResults: (n) => `さらに${n}件表示`, beginner: '初心者向け', practicalIntent: '実務意図', useCaseWording: '使いどころ', commonMisuse: 'よくある誤用',
      difference: '違い', whenToUseWhich: '使い分け', practicalVsVague: '実務性の比較', useWhen: '使い分けの目安', badRequest: '悪い依頼', betterRequest: '良い依頼',
      proTitle: 'NicheWorks Pro出力', proLead: '無料の検索・比較・お気に入り・履歴・基本AI短文コピーは維持し、Proでは実務用のcopy/exportパックを解放します。',
      proPreview: 'Previewモード', proUnlocked: 'Pro解放済み', buyPro: 'Buy Pro',
      purchaseNote: '購入後、このブラウザではNicheWorks Proが有効になります。タブやブラウザを閉じても通常は維持されます。ただし、別端末・別ブラウザ・シークレットモード・サイトデータ削除後は再度有効化が必要です。',
      fullPrompt: 'Full style promptをコピー', memo: 'Brand tone memoをコピー', avoid: 'Avoid listをコピー', handoff: 'Compare handoffをコピー', markdown: 'Markdown export', json: 'JSON export',
      promptPack: 'AI生成用style prompt pack', memoTitle: 'Brand tone decision memo', avoidTitle: 'NG表現 / avoid list', usePrompts: '用途別プロンプト', handoffTitle: '類似vibe比較handoff', exportTitle: 'Markdown / JSON export',
      lockedToast: 'このcopy/export操作にはNicheWorks Proが必要です。Previewは下に表示しています。', selectTwo: '先に比較トレイへ2語追加してください。'
    };
  }

  function readArray(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
  function writeArray(key, arr) { try { localStorage.setItem(key, JSON.stringify(arr)); } catch {} }
  function isPro() {
    if (document.documentElement.dataset.proActive === 'true') return true;
    try {
      const status = window.NWPro && typeof window.NWPro.getLocalStatus === 'function' ? window.NWPro.getLocalStatus() : null;
      if (status && status.active) return true;
    } catch {}
    return false;
  }
  function localized(value) { return value?.[lang] ?? value?.en ?? ''; }
  function localizedArray(value) { const v = localized(value); return Array.isArray(v) ? v : []; }
  function byId(id) { return terms.find((t) => t.id === id); }
  function currentTerm() { return byId(state.selectedId) || terms[0] || null; }
  function clearNode(node) { if (!node) return; while (node.firstChild) node.removeChild(node.firstChild); }
  function createEl(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined && text !== null) node.textContent = String(text); return node; }
  function createButton(className, text, dataset) { const btn = createEl('button', className, text); btn.type = 'button'; Object.entries(dataset || {}).forEach(([k, v]) => { btn.dataset[k] = v; }); return btn; }
  function showToast(message) { if (!els.toast) return; els.toast.textContent = message; els.toast.classList.add('show'); setTimeout(() => els.toast.classList.remove('show'), 1600); }
  function isMobileViewport() { return mobileQuery.matches; }
  function normalize(text) { return String(text || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim(); }

  function cleanBrokenSearchAttributes() {
    if (!els.searchInput) return;
    els.searchInput.removeAttribute('stable');
    els.searchInput.removeAttribute('content');
    els.searchInput.placeholder = lang === 'ja' ? '今っぽい / 洗練 / 読みやすい / 高級感' : 'modern / cluttered / readable / premium';
    els.searchInput.autocomplete = 'off';
  }

  function injectProStyles() {
    if (document.getElementById('vl-pro-live-style')) return;
    const style = document.createElement('style');
    style.id = 'vl-pro-live-style';
    style.textContent = `
      .vl-pro-live-panel{margin:14px 0 18px;padding:16px 18px;border-color:#bfdbfe;background:linear-gradient(135deg,#ffffff 0%,#eff6ff 100%)}
      .vl-pro-live-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:12px}.vl-pro-live-head h2{margin:0 0 4px;font-size:22px}.vl-pro-live-head p{margin:0;color:#374151;font-size:14px;max-width:840px}.vl-pro-badge{display:inline-flex;align-items:center;border:1px solid #93c5fd;background:#dbeafe;color:#1d4ed8;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700}.vl-pro-badge.active{background:#dcfce7;border-color:#86efac;color:#166534}.vl-pro-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:10px 0}.vl-pro-card{border:1px solid #dbeafe;background:#fff;border-radius:14px;padding:11px}.vl-pro-card strong{display:block;margin-bottom:4px}.vl-pro-card span{font-size:12px;color:#4b5563}.vl-pro-actions,.vl-pro-output-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.vl-pro-status{margin:10px 0 0;color:#374151;font-size:13px}.vl-pro-note{font-size:12px;color:#4b5563;margin:8px 0 0}.vl-pro-preview-box,.vl-pro-only-box{border:1px dashed #93c5fd;background:#f8fbff;border-radius:14px;padding:12px;margin-top:12px}.vl-pro-output{white-space:pre-wrap;font-size:12px;line-height:1.5;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px;max-height:220px;overflow:auto}.vl-pro-output-actions .btn[aria-disabled="true"]{opacity:.72;background:#f9fafb;color:#6b7280}.vl-pro-output-actions .btn[aria-disabled="true"]::after{content:' 🔒'}html[data-pro-active="true"] [data-pro-preview]{display:none!important}html:not([data-pro-active="true"]) [data-pro-only]{display:none!important}@media(max-width:720px){.vl-pro-grid{grid-template-columns:1fr}.vl-pro-live-panel{padding:12px}.vl-pro-live-head h2{font-size:18px}.vl-pro-actions .btn,.vl-pro-output-actions .btn{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function injectProPanel() {
    if (document.getElementById('vlProLivePanel')) return;
    const anchor = document.querySelector('.dashboard') || els.mobileCompareBar;
    if (!anchor?.parentNode) return;
    const panel = document.createElement('section');
    panel.id = 'vlProLivePanel';
    panel.className = 'panel vl-pro-live-panel';
    panel.innerHTML = `
      <div class="vl-pro-live-head">
        <div><h2>${txt.proTitle}</h2><p>${txt.proLead}</p></div>
        <span id="vlProBadge" class="vl-pro-badge"></span>
      </div>
      <p id="vlProStatus" class="vl-pro-status" data-pro-status></p>
      <p class="vl-pro-note">${txt.purchaseNote}</p>
      <div class="vl-pro-grid">
        <div class="vl-pro-card"><strong>${txt.memoTitle}</strong><span>${lang === 'ja' ? '選択語からブランド判断メモを生成します。' : 'Generate a brand decision memo from the selected term.'}</span></div>
        <div class="vl-pro-card"><strong>${txt.promptPack}</strong><span>${lang === 'ja' ? 'LP / UI / SNS / Product Hunt / App copy向けに展開します。' : 'Expand into LP / UI / SNS / Product Hunt / App copy prompts.'}</span></div>
        <div class="vl-pro-card"><strong>${txt.exportTitle}</strong><span>${lang === 'ja' ? 'handoffしやすいMarkdownとJSONを書き出します。' : 'Export handoff-ready Markdown and JSON.'}</span></div>
      </div>
      <div class="vl-pro-actions" data-pro-preview><a class="btn primary" href="${commonProBuyUrl}" target="_blank" rel="noopener noreferrer" data-pro-buy>${txt.buyPro}</a></div>
      <div class="vl-pro-output-actions"><button class="btn" type="button" data-pro-action="fullPrompt">${txt.fullPrompt}</button><button class="btn" type="button" data-pro-action="memo">${txt.memo}</button><button class="btn" type="button" data-pro-action="avoid">${txt.avoid}</button><button class="btn" type="button" data-pro-action="handoff">${txt.handoff}</button><button class="btn" type="button" data-pro-action="markdown">${txt.markdown}</button><button class="btn" type="button" data-pro-action="json">${txt.json}</button></div>
      <div class="vl-pro-preview-box" data-pro-preview><strong>${txt.proPreview}</strong><div id="vlProPreview" class="vl-pro-output"></div></div>
      <div class="vl-pro-only-box" data-pro-only hidden><strong>${txt.proUnlocked}</strong><div id="vlProUnlockedOutput" class="vl-pro-output"></div></div>
    `;
    anchor.parentNode.insertBefore(panel, anchor);
    updateProPanel();
  }

  function updateProPanel() {
    const active = isPro();
    const badge = $('vlProBadge');
    if (badge) { badge.textContent = active ? txt.proUnlocked : txt.proPreview; badge.classList.toggle('active', active); }
    document.querySelectorAll('[data-pro-action]').forEach((btn) => { btn.setAttribute('aria-disabled', active ? 'false' : 'true'); });
    const preview = $('vlProPreview');
    if (preview) preview.textContent = buildProPreview();
    const unlocked = $('vlProUnlockedOutput');
    if (unlocked) unlocked.textContent = active ? buildMarkdownExport() : '';
  }

  function termSearchCorpus(term) {
    const parts = [localized(term.term), ...localizedArray(term.aliases), ...localizedArray(term.searchPhrases), localized(term.category), localized(term.termType), localized(term.useCase), localized(term.beginner), localized(term.practicalIntent), localized(term.practicalUseCase), localized(term.plainExplanation), localized(term.commonMisuse), ...localizedArray(term.vagueToPractical), localized(term.badRequest), localized(term.betterRequest), localized(term.badBetterWhy)];
    return normalize(parts.join(' | '));
  }
  function searchScore(term, q, qTokens, corpus) {
    if (!q) return 1;
    const name = normalize(localized(term.term));
    const aliases = localizedArray(term.aliases).map(normalize);
    const searchPhrases = localizedArray(term.searchPhrases).map(normalize);
    const tokenHits = qTokens.filter((token) => corpus.includes(token)).length;
    const tokenRatio = qTokens.length ? tokenHits / qTokens.length : 0;
    let score = tokenHits;
    if (name.includes(q)) score += 12;
    if (aliases.some((x) => x.includes(q))) score += 9;
    if (searchPhrases.some((x) => x.includes(q))) score += 8;
    if (corpus.includes(q)) score += 4;
    if (tokenHits >= 2 || tokenRatio >= 0.6 || searchPhrases.some((x) => q.includes(x) || x.includes(q)) || score >= 8) return score;
    return 0;
  }
  function filteredTerms() {
    const q = normalize(state.query);
    const qTokens = q.split(' ').filter(Boolean);
    return terms.map((t) => ({ term: t, score: searchScore(t, q, qTokens, termSearchCorpus(t)) })).filter(({ term, score }) => (!q || score > 0) && (!state.category || localized(term.category) === state.category) && (!state.useCase || localized(term.useCase) === state.useCase) && (!state.termType || localized(term.termType) === state.termType)).sort((a, b) => b.score - a.score).map(({ term }) => term);
  }

  function renderChips(target, values, key) {
    clearNode(target);
    values.forEach((value) => {
      const btn = createButton(`chip${state[key] === value ? ' active' : ''}`, value);
      btn.addEventListener('click', () => { state[key] = state[key] === value ? null : value; state.mobileVisibleCount = 10; render(); });
      target.appendChild(btn);
    });
  }
  function renderFilterToggle(groupKey, chipsEl, toggleEl, limit) {
    if (!chipsEl || !toggleEl) return;
    const expanded = Boolean(state.filterExpanded[groupKey]);
    const shouldClamp = isMobileViewport() && chipsEl.children.length > limit;
    chipsEl.classList.toggle('chips-clamped', shouldClamp && !expanded);
    toggleEl.hidden = !shouldClamp;
    toggleEl.textContent = expanded ? txt.showLess : txt.showMore;
  }

  function renderGrid(list) {
    clearNode(els.grid);
    const visibleList = isMobileViewport() ? list.slice(0, state.mobileVisibleCount || 10) : list;
    if (!visibleList.length) {
      const emptyCard = createEl('div', 'card'); emptyCard.appendChild(createEl('p', 'card-copy', txt.noResults)); els.grid.appendChild(emptyCard); clearNode(els.mobileResultsActions); return;
    }
    visibleList.forEach((term) => {
      const card = createEl('article', 'card');
      const head = createEl('div', 'card-head');
      const titleWrap = createEl('div');
      titleWrap.appendChild(createEl('h3', 'card-title', localized(term.term)));
      titleWrap.appendChild(createEl('p', 'card-sub', localizedArray(term.aliases).slice(0, 3).join(' / ')));
      head.appendChild(titleWrap); card.appendChild(head);
      const tags = createEl('div', 'card-tags'); tags.appendChild(createEl('span', 'tag accent', localized(term.termType))); tags.appendChild(createEl('span', 'tag', localized(term.category))); tags.appendChild(createEl('span', 'tag success', localized(term.useCase))); card.appendChild(tags);
      card.appendChild(createEl('p', 'card-copy', localized(term.beginner)));
      const actions = createEl('div', 'card-actions'); actions.appendChild(createButton('btn', txt.details, { select: term.id })); actions.appendChild(createButton('btn', state.compare.includes(term.id) ? txt.compared : txt.addCompare, { compare: term.id })); card.appendChild(actions);
      els.grid.appendChild(card);
    });
    if (els.mobileResultsActions) { clearNode(els.mobileResultsActions); if (isMobileViewport() && list.length > visibleList.length) { const step = Math.min(10, list.length - visibleList.length); els.mobileResultsActions.appendChild(createButton('btn', txt.showMoreResults(step), { showMoreResults: '1' })); } }
  }

  function renderDetail(term) {
    if (!term) return;
    state.selectedId = term.id;
    state.recent = [term.id, ...state.recent.filter((x) => x !== term.id)].slice(0, 6);
    writeArray('nw-vl-recent', state.recent);
    els.detailTypeTag.textContent = localized(term.termType); els.detailCategoryTag.textContent = localized(term.category); els.detailUseTag.textContent = localized(term.useCase);
    els.detailTitle.textContent = localized(term.term); els.detailSub.textContent = `${localizedArray(term.aliases).join(' / ')} · ${localized(term.termType)}`;
    els.detailPlain.textContent = localized(term.plainExplanation); els.detailBad.textContent = localized(term.badRequest); els.detailGood.textContent = localized(term.betterRequest); els.detailWhyBetter.textContent = localized(term.badBetterWhy);
    els.favoriteBtn.textContent = state.favorites.includes(term.id) ? txt.favorited : txt.favorite; els.addCompareBtn.textContent = state.compare.includes(term.id) ? txt.compared : txt.addCompare;
    clearNode(els.detailFacts); [[txt.beginner, localized(term.beginner)], [txt.practicalIntent, localized(term.practicalIntent)], [txt.useCaseWording, localized(term.practicalUseCase)], [txt.commonMisuse, localized(term.commonMisuse)]].forEach(([k, v]) => { const row = createEl('div', 'fact-row', k); row.appendChild(createEl('strong', null, v)); els.detailFacts.appendChild(row); });
    clearNode(els.detailBreakdown); localizedArray(term.vagueToPractical).forEach((item) => els.detailBreakdown.appendChild(createEl('div', 'decompose-item', item)));
    const prompts = term.shortPrompt?.[lang] || term.shortPrompt?.en || {}; const modes = Object.keys(prompts); if (!modes.includes(state.promptMode)) state.promptMode = modes[0] || 'ui';
    clearNode(els.promptModes); modes.forEach((mode) => els.promptModes.appendChild(createButton(`prompt-tab ${mode === state.promptMode ? 'active' : ''}`, mode.toUpperCase(), { mode })));
    els.promptBox.textContent = prompts[state.promptMode] || '';
    clearNode(els.detailRelated); (term.compareRelationships || []).forEach((id) => { const rel = byId(id); if (rel) els.detailRelated.appendChild(createButton('chip', localized(rel.term), { related: rel.id })); });
  }

  function pairInsight(a, b) {
    const guide = a.compareGuides?.[b.id]?.[lang] || b.compareGuides?.[a.id]?.[lang];
    if (guide) return guide;
    return { difference: lang === 'ja' ? `${localized(a.term)}は${localized(a.category)}寄り、${localized(b.term)}は${localized(b.category)}寄りです。` : `${localized(a.term)} leans toward ${localized(a.category)} while ${localized(b.term)} leans toward ${localized(b.category)}.`, whenToUse: lang === 'ja' ? `${localized(a.term)}は「${localized(a.useCase)}」、${localized(b.term)}は「${localized(b.useCase)}」で使います。` : `Use ${localized(a.term)} for ${localized(a.useCase)}, and ${localized(b.term)} for ${localized(b.useCase)}.`, practicality: lang === 'ja' ? `${localized(a.termType)} / ${localized(b.termType)} の比較です。` : `This pair is ${localized(a.termType)} vs ${localized(b.termType)}.` };
  }
  function createCompareCell(label, value) { const cell = createEl('div', 'compare-cell'); cell.appendChild(createEl('strong', null, label)); cell.appendChild(document.createTextNode(value || '')); return cell; }
  function renderCompare() {
    clearNode(els.compareList); els.compareEmpty.style.display = state.compare.length ? 'none' : 'grid';
    state.compare.forEach((id) => { const term = byId(id); if (!term) return; const item = createEl('article', 'compare-item'); item.appendChild(createEl('strong', null, localized(term.term))); const grid = createEl('div', 'compare-grid'); grid.appendChild(createCompareCell(txt.practicalIntent, localized(term.practicalIntent))); grid.appendChild(createCompareCell(txt.useWhen, localized(term.practicalUseCase))); grid.appendChild(createCompareCell(txt.badRequest, localized(term.badRequest))); grid.appendChild(createCompareCell(txt.betterRequest, localized(term.betterRequest))); item.appendChild(grid); els.compareList.appendChild(item); });
    clearNode(els.compareInsight); els.compareInsight.style.display = 'block';
    if (state.compare.length === 2) { const a = byId(state.compare[0]); const b = byId(state.compare[1]); if (a && b) { const insight = pairInsight(a, b); els.compareInsight.appendChild(createEl('h4', null, `${localized(a.term)} ↔ ${localized(b.term)}`)); const grid = createEl('div', 'compare-insight-grid'); grid.appendChild(createCompareCell(txt.difference, insight.difference)); grid.appendChild(createCompareCell(txt.whenToUseWhich, insight.whenToUse)); grid.appendChild(createCompareCell(txt.practicalVsVague, insight.practicality)); els.compareInsight.appendChild(grid); return; } }
    els.compareInsight.appendChild(createEl('p', 'card-copy', txt.compareHint));
  }

  function renderSavedGroup(target, title, clearType, items, emptyText, subTextFor) { clearNode(target); const head = createEl('div', 'favorite-row favorite-row-head'); head.appendChild(createEl('strong', null, title)); head.appendChild(createButton('btn btn-compact', txt.clear, { clear: clearType })); target.appendChild(head); if (items.length) { items.forEach((term) => { const row = createEl('div', 'favorite-row'); const main = createEl('div', 'favorite-main'); main.appendChild(createEl('span', 'favorite-term', localized(term.term))); main.appendChild(createEl('small', null, subTextFor(term))); row.appendChild(main); row.appendChild(createButton('btn btn-compact', txt.open, { open: term.id })); target.appendChild(row); }); } else target.appendChild(createEl('div', 'favorite-row favorite-empty', emptyText)); }
  function renderSaved() { renderSavedGroup(els.favoritesList, txt.favorites, 'fav', state.favorites.map(byId).filter(Boolean), txt.noFavorites, (t) => `${localized(t.category)} · ${localized(t.termType)}`); renderSavedGroup(els.recentList, txt.recent, 'recent', state.recent.map(byId).filter(Boolean), txt.noRecent, (t) => `${localized(t.useCase)} · ${localized(t.termType)}`); }
  function renderMobileCompareBar() { if (!els.mobileCompareBar || !els.mobileCompareText) return; const count = state.compare.length; const active = isMobileViewport() && count > 0; root.classList.toggle('mobile-no-compare', isMobileViewport() && count === 0); els.mobileCompareBar.classList.toggle('show', active); if (active) els.mobileCompareText.textContent = `${txt.compareStatus}: ${count}/${maxCompare}`; }
  function renderSuggestions(list) { const q = normalize(state.query); clearNode(els.suggestions); if (!q) { els.suggestions.classList.remove('open'); return; } list.slice(0, 6).forEach((term) => { const item = createEl('div', 'suggestion-item'); item.dataset.select = term.id; item.appendChild(createEl('span', null, localized(term.term))); item.appendChild(createEl('span', 'suggestion-sub', localized(term.category))); els.suggestions.appendChild(item); }); els.suggestions.classList.toggle('open', list.length > 0); }

  function render() {
    const list = filteredTerms(); const selected = byId(state.selectedId) || list[0] || terms[0];
    renderChips(els.categoryChips, [...new Set(terms.map((t) => localized(t.category)))], 'category'); renderChips(els.useChips, [...new Set(terms.map((t) => localized(t.useCase)))], 'useCase'); renderChips(els.typeChips, [...new Set(terms.map((t) => localized(t.termType)))], 'termType');
    renderFilterToggle('category', els.categoryChips, els.categoryToggleBtn, 6); renderFilterToggle('useCase', els.useChips, els.useToggleBtn, 4); renderFilterToggle('termType', els.typeChips, els.typeToggleBtn, 4);
    els.statTotal.textContent = String(terms.length); els.statCompare.textContent = String(state.compare.length); els.statFav.textContent = String(state.favorites.length); els.resultCount.textContent = `${list.length} ${txt.results}`;
    renderGrid(list); renderDetail(selected); renderCompare(); renderMobileCompareBar(); renderSaved(); renderSuggestions(list); updateProPanel();
  }

  function useCasePromptPack(term) {
    const base = localized(term.practicalIntent);
    const use = localized(term.useCase);
    const avoid = localized(term.commonMisuse);
    const termName = localized(term.term);
    if (lang === 'ja') {
      return {
        LP: `${use}のLPを「${termName}」に寄せて改善してください。実務基準: ${base}。避けること: ${avoid}。`,
        UI: `このUIを「${termName}」にしてください。情報階層、余白、CTA、マイクロコピーを ${base} に沿って調整してください。`,
        SNS: `SNS投稿案を「${termName}」なトーンで3案作ってください。誇張せず、${avoid} を避けてください。`,
        'Product Hunt': `Product Hunt向け紹介文を「${termName}」に調整してください。価値、対象者、差分、初回行動を明確にしてください。`,
        'App copy': `アプリ内コピーを「${termName}」に整えてください。ボタン、空状態、エラー、完了文を具体化してください。`
      };
    }
    return {
      LP: `Improve this landing page toward “${termName}”. Practical criteria: ${base}. Avoid: ${avoid}.`,
      UI: `Make this UI feel “${termName}”. Adjust hierarchy, spacing, CTAs, and microcopy around: ${base}.`,
      SNS: `Write 3 social post options with a “${termName}” tone. Avoid overclaiming and avoid: ${avoid}.`,
      'Product Hunt': `Rewrite the Product Hunt launch copy toward “${termName}”. Clarify value, audience, differentiation, and first action.`,
      'App copy': `Revise app copy toward “${termName}”. Include button labels, empty states, errors, and success messages.`
    };
  }
  function buildBrandToneMemo() { const term = currentTerm(); if (!term) return ''; return [`# ${txt.memoTitle}`, `Term: ${localized(term.term)}`, `Use case: ${localized(term.useCase)}`, '', `Decision: Use this vibe when the work needs: ${localized(term.practicalIntent)}`, `Rationale: ${localized(term.plainExplanation)}`, `Do: ${localizedArray(term.vagueToPractical).join('; ')}`, `Do not: ${localized(term.commonMisuse)}`, `Better request: ${localized(term.betterRequest)}`, `Review check: Confirm the final output serves the audience, context, and compliance constraints.`].join('\n'); }
  function buildStylePromptPack() { const term = currentTerm(); if (!term) return ''; const prompts = useCasePromptPack(term); return [`# ${txt.promptPack}`, `Term: ${localized(term.term)}`, `Intent: ${localized(term.practicalIntent)}`, ''].concat(Object.entries(prompts).map(([mode, prompt]) => `## ${mode}\n${prompt}`)).join('\n\n'); }
  function buildAvoidList() { const term = currentTerm(); if (!term) return ''; return [`# ${txt.avoidTitle}`, `Term: ${localized(term.term)}`, '', `- ${localized(term.commonMisuse)}`, `- ${localized(term.badRequest)}`, `- Vague adjectives without a target surface, audience, constraint, or acceptance check.`, `- Decoration-only changes that do not improve readability, hierarchy, trust, or task success.`].join('\n'); }
  function buildCompareHandoff(sampleIfMissing) { const pair = state.compare.length >= 2 ? state.compare : (sampleIfMissing ? terms.slice(0, 2).map((term) => term.id) : []); if (pair.length < 2) return txt.selectTwo; const a = byId(pair[0]); const b = byId(pair[1]); if (!a || !b) return txt.selectTwo; const insight = pairInsight(a, b); return [`# ${txt.handoffTitle}`, `${localized(a.term)} vs ${localized(b.term)}`, '', `${txt.difference}: ${insight.difference}`, `${txt.whenToUseWhich}: ${insight.whenToUse}`, `${txt.practicalVsVague}: ${insight.practicality}`, '', `Option A better request: ${localized(a.betterRequest)}`, `Option B better request: ${localized(b.betterRequest)}`, '', `Handoff note: choose one vibe before production, then review against audience, context, and conversion or usability goal.`].join('\n'); }
  function buildMarkdownExport() { return [buildBrandToneMemo(), buildStylePromptPack(), buildAvoidList(), buildCompareHandoff()].join('\n\n---\n\n'); }
  function buildJsonExport() { const term = currentTerm(); const prompts = term ? useCasePromptPack(term) : {}; return JSON.stringify({ tool: 'vibe-lexicon', entitlement: 'nicheworks_pro', language: lang, term: term ? { id: term.id, label: localized(term.term), useCase: localized(term.useCase), practicalIntent: localized(term.practicalIntent), avoid: localized(term.commonMisuse), betterRequest: localized(term.betterRequest) } : null, promptPack: prompts, brandToneMemo: buildBrandToneMemo(), avoidList: buildAvoidList().split('\n').filter((line) => line.startsWith('- ')).map((line) => line.slice(2)), compareHandoff: buildCompareHandoff() }, null, 2); }
  function buildProPreview() { return [buildBrandToneMemo(), buildStylePromptPack(), buildAvoidList(), buildCompareHandoff(true), '# Markdown export sample', buildMarkdownExport().slice(0, 700) + '...', '# JSON export sample', buildJsonExport().slice(0, 700) + '...'].join('\n\n'); }
  function downloadText(filename, mime, text) { const blob = new Blob([text], { type: mime }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }

  async function copyText(text) { if (!text) return false; try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch {} const textarea = document.createElement('textarea'); textarea.value = text; textarea.setAttribute('readonly', ''); textarea.style.position = 'fixed'; textarea.style.left = '-9999px'; document.body.appendChild(textarea); textarea.focus(); textarea.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; } document.body.removeChild(textarea); return ok; }
  async function handleProAction(action) {
    if (!isPro()) { showToast(txt.lockedToast); document.getElementById('vlProLivePanel')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (action === 'markdown') { downloadText('vibe-lexicon-pro.md', 'text/markdown;charset=utf-8', buildMarkdownExport()); showToast(txt.copied); return; }
    if (action === 'json') { downloadText('vibe-lexicon-pro.json', 'application/json;charset=utf-8', buildJsonExport()); showToast(txt.copied); return; }
    const payload = action === 'memo' ? buildBrandToneMemo() : action === 'avoid' ? buildAvoidList() : action === 'handoff' ? buildCompareHandoff() : buildStylePromptPack();
    const ok = await copyText(payload); showToast(ok ? txt.copied : txt.copyFailed);
    const output = $('vlProUnlockedOutput'); if (output) output.textContent = payload;
  }
  function requestClear(type) { const key = `clear:${type}`; const btn = document.querySelector(`[data-clear="${type}"]`); if (!confirmTimers.has(key)) { if (btn) btn.textContent = txt.confirmClear; showToast(txt.confirmClear); confirmTimers.set(key, setTimeout(() => { confirmTimers.delete(key); renderSaved(); }, 3500)); return; } clearTimeout(confirmTimers.get(key)); confirmTimers.delete(key); if (type === 'fav') { state.favorites = []; writeArray('nw-vl-favorites', []); } if (type === 'recent') { state.recent = []; writeArray('nw-vl-recent', []); } showToast(txt.cleared); render(); }
  function openFilters() { if (isMobileViewport()) { root.classList.add('filters-open'); root.classList.remove('detail-open'); } }
  function closeFilters() { root.classList.remove('filters-open'); }
  function openDetail() { if (isMobileViewport()) { root.classList.add('detail-open'); root.classList.remove('filters-open'); } }
  function closeDetail() { root.classList.remove('detail-open'); }
  function syncDesktopState() { if (!isMobileViewport()) { root.classList.remove('filters-open'); root.classList.remove('detail-open'); } }

  document.addEventListener('click', (event) => {
    const proAction = event.target.closest('[data-pro-action]')?.dataset.proAction; if (proAction) { handleProAction(proAction); return; }
    const selectId = event.target.closest('[data-select]')?.dataset.select; const relatedId = event.target.closest('[data-related]')?.dataset.related; const openId = event.target.closest('[data-open]')?.dataset.open;
    if (selectId || relatedId || openId) { state.selectedId = selectId || relatedId || openId; render(); openDetail(); return; }
    const compareId = event.target.closest('[data-compare]')?.dataset.compare; if (compareId) { if (state.compare.includes(compareId)) state.compare = state.compare.filter((x) => x !== compareId); else if (state.compare.length >= maxCompare) showToast(txt.compareLimit); else state.compare.push(compareId); render(); return; }
    const clearType = event.target.closest('[data-clear]')?.dataset.clear; if (clearType === 'fav' || clearType === 'recent') { requestClear(clearType); return; }
    const mode = event.target.closest('[data-mode]')?.dataset.mode; if (mode) { state.promptMode = mode; renderDetail(currentTerm()); return; }
    if (event.target.closest('[data-show-more-results]')) { state.mobileVisibleCount += 10; render(); }
  });

  els.searchInput?.addEventListener('input', (event) => { state.query = event.target.value; state.mobileVisibleCount = 10; render(); });
  els.resetFiltersBtn?.addEventListener('click', () => { state.query = ''; state.category = null; state.useCase = null; state.termType = null; state.mobileVisibleCount = 10; if (els.searchInput) els.searchInput.value = ''; render(); });
  els.favoriteBtn?.addEventListener('click', () => { const id = state.selectedId; if (!id) return; state.favorites = state.favorites.includes(id) ? state.favorites.filter((x) => x !== id) : [id, ...state.favorites].slice(0, 10); writeArray('nw-vl-favorites', state.favorites); render(); });
  els.addCompareBtn?.addEventListener('click', () => { const id = state.selectedId; if (!id) return; if (state.compare.includes(id)) state.compare = state.compare.filter((x) => x !== id); else if (state.compare.length >= maxCompare) showToast(txt.compareLimit); else state.compare.push(id); render(); });
  els.clearCompareBtn?.addEventListener('click', () => { state.compare = []; render(); });
  els.copyPromptBtn?.addEventListener('click', async () => { const text = els.promptBox?.textContent || ''; if (!text) return; const ok = await copyText(text); showToast(ok ? txt.copied : txt.copyFailed); });
  els.openFiltersBtn?.addEventListener('click', openFilters); els.closeFiltersBtn?.addEventListener('click', closeFilters); els.closeDetailBtn?.addEventListener('click', closeDetail);
  els.categoryToggleBtn?.addEventListener('click', () => { state.filterExpanded.category = !state.filterExpanded.category; render(); }); els.useToggleBtn?.addEventListener('click', () => { state.filterExpanded.useCase = !state.filterExpanded.useCase; render(); }); els.typeToggleBtn?.addEventListener('click', () => { state.filterExpanded.termType = !state.filterExpanded.termType; render(); });
  els.mobileCompareJumpBtn?.addEventListener('click', () => els.compareTray?.scrollIntoView({ behavior: 'smooth', block: 'start' })); els.mobileCompareClearBtn?.addEventListener('click', () => { state.compare = []; render(); });
  mobileQuery.addEventListener('change', syncDesktopState);
  window.addEventListener('storage', updateProPanel);
  window.addEventListener('nw-pro-status-change', updateProPanel);
  syncDesktopState();
  render();
})();
