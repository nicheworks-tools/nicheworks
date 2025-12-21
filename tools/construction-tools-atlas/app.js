(function () {
  'use strict';

  const engine = window.AtlasEngine;

  const placeholders = {
    missingEnTerm: 'No English name available',
    missingEnDescription: 'No English description available.',
  };

  const i18n = {
    en: {
      eyebrow: 'Construction Tools & Slang Atlas',
      title: 'Browse, search, and learn core field terms.',
      lede: 'Quickly find terminology, tools, and work processes across categories.',
      searchLabel: 'Search',
      searchPlaceholder: 'Search tools, slang, descriptions',
      categoryLabel: 'Category',
      categoryAll: 'All categories',
      resultsTitle: 'Results',
      resultCount: (count) => `${count} item${count === 1 ? '' : 's'}`,
      emptyState: 'No results found. Try a different keyword or filter.',
      detailPlaceholder: 'Select an entry to view details.',
      aliasesLabel: 'Aliases',
      tagsLabel: 'Tags',
      idLabel: 'ID',
      detailCategoryFallback: 'Uncategorized',
      dataError: 'Failed to load data.',
      navAbout: 'About',
      navMethod: 'Method',
      navDisclaimer: 'Disclaimer',
      navCredits: 'Credits',
    },
    ja: {
      eyebrow: 'Construction Tools & スラング図鑑',
      title: '建設現場の基本用語を検索・閲覧',
      lede: 'カテゴリ横断で工具や作業プロセスの用語を素早く確認できます。',
      searchLabel: '検索',
      searchPlaceholder: '用語・スラング・説明で検索',
      categoryLabel: 'カテゴリ',
      categoryAll: 'すべてのカテゴリ',
      resultsTitle: '検索結果',
      resultCount: (count) => `${count}件`,
      emptyState: '該当する結果がありません。キーワードやフィルターを変えてみてください。',
      detailPlaceholder: '詳細を表示する項目を選択してください。',
      aliasesLabel: '別名',
      tagsLabel: 'タグ',
      idLabel: 'ID',
      detailCategoryFallback: 'カテゴリ未設定',
      dataError: 'データの読み込みに失敗しました。',
      navAbout: 'このサイトについて',
      navMethod: 'データ方針',
      navDisclaimer: '免責事項',
      navCredits: 'クレジット',
    },
  };

  /**
   * --- Data loading ---
   */
  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }

  // index.json を返す（カテゴリ順・ラベル取得に使う）
  async function loadIndex() {
    const index = await fetchJson('./data/index.json');
    if (!index || !Array.isArray(index.packs)) {
      throw new Error('index.json missing packs array');
    }
    return index;
  }

  async function loadEntriesFromIndex(index) {
    const entries = [];
    await Promise.all(
      index.packs.map(async (pack) => {
        const packEntries = await fetchJson(`./data/${pack.file}`);
        if (!Array.isArray(packEntries)) return;
        packEntries.forEach((entry, i) => {
          const normalized = engine.normalizeEntry(entry, `${pack.file}#${i}`);
          if (normalized) entries.push(normalized);
        });
      })
    );
    return entries;
  }

  /**
   * --- State ---
   */
  const state = {
    index: null,
    categoryOrder: [],           // index.json の順序（id配列）
    categoryLabelMap: new Map(), // id -> {en, ja}
    allEntries: [],
    searchIndex: [],
    filtered: [],
    selectedId: null,
    lang: 'en',
    query: '',
    category: '',
  };

  const elements = {};

  function cacheElements() {
    elements.eyebrow = document.getElementById('eyebrow');
    elements.heroTitle = document.getElementById('heroTitle');
    elements.heroLede = document.getElementById('heroLede');
    elements.langToggle = document.getElementById('langToggle');
    elements.searchInput = document.getElementById('searchInput');
    elements.searchLabel = document.getElementById('searchLabel');
    elements.categorySelect = document.getElementById('categorySelect');
    elements.categoryLabel = document.getElementById('categoryLabel');
    elements.categoryDefaultOption = document.getElementById('categoryDefaultOption');
    elements.results = document.getElementById('results');
    elements.resultCount = document.getElementById('resultCount');
    elements.resultsTitle = document.getElementById('resultsTitle');
    elements.emptyState = document.getElementById('emptyState');
    elements.detail = document.getElementById('detail');
    elements.detailPlaceholder = document.getElementById('detailPlaceholder');
    elements.detailCategory = document.getElementById('detailCategory');
    elements.detailTitle = document.getElementById('detailTitle');
    elements.detailSubtitle = document.getElementById('detailSubtitle');
    elements.detailDescription = document.getElementById('detailDescription');
    elements.detailAliasesLabel = document.getElementById('detailAliasesLabel');
    elements.detailAliases = document.getElementById('detailAliases');
    elements.detailTagsLabel = document.getElementById('detailTagsLabel');
    elements.detailTags = document.getElementById('detailTags');
    elements.detailIdLabel = document.getElementById('detailIdLabel');
    elements.detailId = document.getElementById('detailId');
    elements.navAbout = document.getElementById('aboutLink');
    elements.navMethod = document.getElementById('methodLink');
    elements.navDisclaimer = document.getElementById('disclaimerLink');
    elements.navCredits = document.getElementById('creditsLink');
  }

  function otherLang(lang) {
    return lang === 'ja' ? 'en' : 'ja';
  }

  function getText(key) {
    const pack = i18n[state.lang] || i18n.en;
    const fallback = i18n.en || {};
    if (typeof pack[key] !== 'undefined') return pack[key];
    return fallback[key];
  }

  function getCountText(count) {
    const formatter = getText('resultCount');
    if (typeof formatter === 'function') return formatter(count);
    return String(count);
  }

  function renderUILabels() {
    if (elements.eyebrow) elements.eyebrow.textContent = getText('eyebrow') || '';
    if (elements.heroTitle) elements.heroTitle.textContent = getText('title') || '';
    if (elements.heroLede) elements.heroLede.textContent = getText('lede') || '';
    if (elements.searchLabel) elements.searchLabel.textContent = getText('searchLabel') || '';
    if (elements.searchInput) elements.searchInput.placeholder = getText('searchPlaceholder') || '';
    if (elements.categoryLabel) elements.categoryLabel.textContent = getText('categoryLabel') || '';
    if (elements.categoryDefaultOption) elements.categoryDefaultOption.textContent = getText('categoryAll') || '';
    if (elements.resultsTitle) elements.resultsTitle.textContent = getText('resultsTitle') || '';
    if (elements.emptyState) elements.emptyState.textContent = getText('emptyState') || '';
    if (elements.detailPlaceholder) elements.detailPlaceholder.textContent = getText('detailPlaceholder') || '';
    if (elements.detailAliasesLabel) elements.detailAliasesLabel.textContent = getText('aliasesLabel') || '';
    if (elements.detailTagsLabel) elements.detailTagsLabel.textContent = getText('tagsLabel') || '';
    if (elements.detailIdLabel) elements.detailIdLabel.textContent = getText('idLabel') || '';
    if (elements.navAbout) elements.navAbout.textContent = getText('navAbout') || '';
    if (elements.navMethod) elements.navMethod.textContent = getText('navMethod') || '';
    if (elements.navDisclaimer) elements.navDisclaimer.textContent = getText('navDisclaimer') || '';
    if (elements.navCredits) elements.navCredits.textContent = getText('navCredits') || '';
  }

  function formatArray(arr) {
    if (!arr || arr.length === 0) return '—';
    return arr.join(', ');
  }

  function getTermTexts(entry, lang) {
    const direct = engine.getLangValue(entry.term, lang);
    const alt = engine.getLangValue(entry.term, otherLang(lang));
    let primary = direct;
    let secondary = '';

    if (!direct) {
      if (lang === 'en') {
        primary = placeholders.missingEnTerm;
        secondary = alt;
      } else {
        primary = alt;
      }
    } else if (alt && alt !== direct) {
      secondary = alt;
    }

    return { primary, secondary };
  }

  function getDescriptionTexts(entry, lang) {
    const values = [];
    const primary = engine.getLangValue(entry.description, lang);
    const fallback = engine.getLangValue(entry.description, otherLang(lang));

    if (primary) {
      values.push({ lang, text: primary, placeholder: false });
    } else if (lang === 'en') {
      values.push({ lang: 'en', text: placeholders.missingEnDescription, placeholder: true });
    }

    if (fallback) {
      values.push({ lang: otherLang(lang), text: fallback, placeholder: false });
    }
    return values;
  }

  function getDescriptionPreview(entry, lang) {
    const values = getDescriptionTexts(entry, lang);
    const primary = values.find((item) => item.lang === lang);
    if (primary) return primary.text;
    const other = values.find((item) => item.lang !== lang);
    return other ? other.text : '';
  }

  function getAliasList(entry, lang) {
    const aliases = entry.aliases || {};
    const primary = Array.isArray(aliases[lang]) ? aliases[lang] : [];
    const fallback = Array.isArray(aliases[otherLang(lang)]) ? aliases[otherLang(lang)] : [];
    return [...primary, ...fallback];
  }

  /**
   * --- Category helpers (index.json driven) ---
   */
  function buildCategoryMapsFromIndex(index) {
    state.categoryOrder = [];
    state.categoryLabelMap = new Map();

    const cats = Array.isArray(index.categories) ? index.categories : [];
    cats.forEach((c) => {
      const id = String(c?.id || '').trim();
      if (!id) return;
      state.categoryOrder.push(id);
      const label = c?.label || {};
      state.categoryLabelMap.set(id, {
        en: String(label.en || id),
        ja: String(label.ja || id),
      });
    });
  }

  function getCategoryLabel(categoryId) {
    const id = String(categoryId || '').trim();
    if (!id) return getText('detailCategoryFallback') || '—';
    const map = state.categoryLabelMap.get(id);
    if (!map) return id; // 未定義カテゴリはIDを出す
    return state.lang === 'ja' ? map.ja : map.en;
  }

  function clearCategoryOptions() {
    if (!elements.categorySelect) return;
    // 最初の "All categories" 以外を削除
    while (elements.categorySelect.options.length > 1) {
      elements.categorySelect.remove(1);
    }
  }

  function buildCategoryOptionsFromIndex() {
    if (!elements.categorySelect) return;
    clearCategoryOptions();

    state.categoryOrder.forEach((id) => {
      const opt = document.createElement('option');
      opt.value = id; // フィルタはid
      opt.textContent = getCategoryLabel(id); // 表示はlabel
      elements.categorySelect.appendChild(opt);
    });
  }

  function refreshCategoryOptionLabels() {
    // 言語切替時に label を更新
    if (!elements.categorySelect) return;
    // default option
    if (elements.categoryDefaultOption) {
      elements.categoryDefaultOption.textContent = getText('categoryAll') || '';
    }
    // options[1..] を index順に上書き
    for (let i = 1; i < elements.categorySelect.options.length; i++) {
      const opt = elements.categorySelect.options[i];
      opt.textContent = getCategoryLabel(opt.value);
    }
  }

  /**
   * --- Language toggle ---
   */
  function renderLanguageToggle() {
    if (!elements.langToggle) return;
    elements.langToggle.textContent = state.lang === 'ja' ? '日本語 / EN' : 'JA / English';
    elements.langToggle.setAttribute('aria-pressed', state.lang === 'ja');
    elements.langToggle.setAttribute('aria-label', `Language: ${state.lang.toUpperCase()}`);
  }

  function updateLanguage(lang) {
    const next = lang === 'ja' ? 'ja' : 'en';
    if (state.lang === next) {
      renderLanguageToggle();
      return;
    }
    state.lang = next;
    document.documentElement.lang = next;

    renderLanguageToggle();
    renderUILabels();
    refreshCategoryOptionLabels();

    applyFilters();
    if (state.selectedId) {
      const selected = state.allEntries.find((e) => e.id === state.selectedId);
      renderDetail(selected || null);
    }
  }

  function toggleLanguage() {
    updateLanguage(otherLang(state.lang));
  }

  function clearSelection() {
    state.selectedId = null;
    renderDetail(null);
  }

  function updateURL() {
    const params = new URLSearchParams();
    if (state.query) params.set('q', state.query);
    if (state.category) params.set('cat', state.category);
    if (state.selectedId) params.set('id', state.selectedId);
    const search = params.toString();
    const url = search ? `${location.pathname}?${search}` : location.pathname;
    history.replaceState(null, '', url);
  }

  function applyFilters() {
    const base = engine.searchByTextWithIndex(state.query, state.lang, state.searchIndex);
    const filtered = engine.filterByCategory(state.category, state.lang, base);
    state.filtered = filtered;
    renderResults();
  }

  function clearResults() {
    while (elements.results.firstChild) {
      elements.results.removeChild(elements.results.firstChild);
    }
  }

  function renderResults() {
    clearResults();
    elements.resultCount.textContent = getCountText(state.filtered.length);
    elements.emptyState.hidden = state.filtered.length > 0;

    state.filtered.forEach((entry) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'result-item';
      item.setAttribute('role', 'listitem');
      item.dataset.id = entry.id;

      if (entry.id === state.selectedId) {
        item.classList.add('active');
      }

      const textBlock = document.createElement('div');
      textBlock.className = 'result-text';

      const terms = getTermTexts(entry, state.lang);

      const title = document.createElement('p');
      title.className = 'result-title';
      title.textContent = terms.primary || entry.term.ja || entry.term.en;

      const subtitle = document.createElement('p');
      subtitle.className = 'result-subtitle';
      subtitle.textContent = terms.secondary;

      const meta = document.createElement('p');
      meta.className = 'result-meta';
      meta.textContent = getDescriptionPreview(entry, state.lang);

      textBlock.appendChild(title);
      if (subtitle.textContent) textBlock.appendChild(subtitle);
      if (meta.textContent) textBlock.appendChild(meta);

      const badge = document.createElement('span');
      badge.className = 'result-badge';
      badge.textContent = getCategoryLabel(entry.category);

      item.appendChild(textBlock);
      item.appendChild(badge);

      item.addEventListener('click', () => {
        state.selectedId = entry.id;
        updateURL();
        renderResults();
        renderDetail(entry);
      });

      elements.results.appendChild(item);
    });

    if (state.filtered.length === 0) {
      renderDetail(null);
    }
  }

  function renderDetail(entry) {
    if (!entry) {
      elements.detail.hidden = true;
      elements.detailPlaceholder.hidden = false;
      return;
    }

    elements.detailCategory.textContent = getCategoryLabel(entry.category);

    const terms = getTermTexts(entry, state.lang);
    elements.detailTitle.textContent = terms.primary || getText('detailCategoryFallback') || '—';
    elements.detailSubtitle.textContent = terms.secondary;

    elements.detailDescription.replaceChildren();
    getDescriptionTexts(entry, state.lang).forEach((item) => {
      const p = document.createElement('p');
      p.textContent = `${item.lang.toUpperCase()}: ${item.text}`;
      elements.detailDescription.appendChild(p);
    });

    elements.detailAliases.textContent = formatArray(getAliasList(entry, state.lang));
    elements.detailTags.textContent = formatArray(entry.tags);
    elements.detailId.textContent = entry.id;

    elements.detailPlaceholder.hidden = true;
    elements.detail.hidden = false;
  }

  function restoreStateFromURL() {
    const params = new URLSearchParams(location.search);
    state.query = params.get('q') ? engine.normalizeWhitespace(params.get('q')) : '';
    state.category = params.get('cat') ? engine.normalizeWhitespace(params.get('cat')) : '';
    state.selectedId = params.get('id') || null;

    elements.searchInput.value = state.query;
    elements.categorySelect.value = state.category;
  }

  function attachEventListeners() {
    elements.searchInput.addEventListener('input', (e) => {
      state.query = engine.normalizeWhitespace(e.target.value || '');
      clearSelection();
      updateURL();
      applyFilters();
    });

    elements.categorySelect.addEventListener('change', (e) => {
      state.category = engine.normalizeString(e.target.value || '');
      clearSelection();
      updateURL();
      applyFilters();
    });

    if (elements.langToggle) {
      elements.langToggle.addEventListener('click', () => {
        toggleLanguage();
      });
    }
  }

  function openEntryFromState() {
    if (!state.selectedId) return;
    const match = state.allEntries.find((e) => e.id === state.selectedId);
    if (match) {
      renderDetail(match);
      if (!state.filtered.some((e) => e.id === match.id)) {
        state.filtered.unshift(match);
      }
      renderResults();
    }
  }

  async function init() {
    cacheElements();
    renderLanguageToggle();
    renderUILabels();
    attachEventListeners();

    try {
      const index = await loadIndex();
      state.index = index;
      buildCategoryMapsFromIndex(index);

      // entries load
      const entries = await loadEntriesFromIndex(index);
      state.allEntries = entries;
      state.searchIndex = engine.buildSearchIndex(entries);

      // category dropdown: index.json order + labels
      buildCategoryOptionsFromIndex();

      // URL restore + render
      restoreStateFromURL();
      applyFilters();
      openEntryFromState();
    } catch (err) {
      console.error(err);
      clearResults();
      const error = document.createElement('p');
      error.className = 'empty-state';
      error.textContent = getText('dataError') || 'Failed to load data.';
      elements.results.appendChild(error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
