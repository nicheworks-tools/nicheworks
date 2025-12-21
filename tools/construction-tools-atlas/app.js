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
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }

  async function loadAtlasData() {
    const index = await fetchJson('./data/index.json');
    if (!index || !Array.isArray(index.packs)) {
      throw new Error('index.json missing packs array');
    }

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

    return { index, entries };
  }

  /**
   * --- State / elements ---
   */
  const state = {
    allEntries: [],
    searchIndex: [],
    filtered: [],
    selectedId: null,
    lang: 'en',
    query: '',
    category: '',

    // category registry from index.json
    categories: [], // array
    categoryMap: new Map(), // id -> category object
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

  function otherLang(lang) {
    return lang === 'ja' ? 'en' : 'ja';
  }

  function normalizeLangValue(v) {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') {
      if (typeof v[state.lang] === 'string') return v[state.lang];
      const ol = otherLang(state.lang);
      if (typeof v[ol] === 'string') return v[ol];
    }
    return '';
  }

  // index.json categories label resolver
  function categoryLabel(id) {
    if (!id) return getText('detailCategoryFallback') || '—';
    const c = state.categoryMap.get(id);
    if (!c) return id; // fallback: show id if not registered
    // support both {label:{ja/en}} and {label_ja,label_en} (just in case)
    const label =
      normalizeLangValue(c.label) ||
      (state.lang === 'ja' ? (c.label_ja || '') : (c.label_en || '')) ||
      c.id;
    return label || c.id || id;
  }

  function renderUILabels() {
    if (elements.eyebrow) elements.eyebrow.textContent = getText('eyebrow') || '';
    if (elements.heroTitle) elements.heroTitle.textContent = getText('title') || '';
    if (elements.heroLede) elements.heroLede.textContent = getText('lede') || '';
    if (elements.searchLabel) elements.searchLabel.textContent = getText('searchLabel') || '';
    if (elements.searchInput) elements.searchInput.placeholder = getText('searchPlaceholder') || '';
    if (elements.categoryLabel) elements.categoryLabel.textContent = getText('categoryLabel') || '';
    if (elements.categoryDefaultOption)
      elements.categoryDefaultOption.textContent = getText('categoryAll') || '';
    if (elements.resultsTitle) elements.resultsTitle.textContent = getText('resultsTitle') || '';
    if (elements.emptyState) elements.emptyState.textContent = getText('emptyState') || '';
    if (elements.detailPlaceholder)
      elements.detailPlaceholder.textContent = getText('detailPlaceholder') || '';
    if (elements.detailAliasesLabel)
      elements.detailAliasesLabel.textContent = getText('aliasesLabel') || '';
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

    // カテゴリselectの表示名も言語切替に追従
    rebuildCategoryOptions();

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

  /**
   * --- Category options (index.json categories + fallback from entries) ---
   */
  function clearSelectOptions(selectEl) {
    while (selectEl.options.length > 1) selectEl.remove(1); // keep default option at index 0
  }

  function gatherCategoryIdsFromEntries(entries) {
    const ids = new Set();
    entries.forEach((e) => {
      if (Array.isArray(e.categories)) {
        e.categories.forEach((c) => ids.add(String(c || '').trim()));
      } else if (e.category) {
        ids.add(String(e.category || '').trim());
      }
    });
    return Array.from(ids).filter(Boolean);
  }

  function rebuildCategoryOptions() {
    if (!elements.categorySelect) return;
    const current = state.category || '';
    clearSelectOptions(elements.categorySelect);

    // 1) index.json categories を優先（label付き）
    const seen = new Set();
    const catList = Array.isArray(state.categories) ? state.categories : [];

    // sort by label for current lang (stable)
    const sorted = [...catList].sort((a, b) => {
      const la = (normalizeLangValue(a.label) || a.id || '').toLowerCase();
      const lb = (normalizeLangValue(b.label) || b.id || '').toLowerCase();
      return la.localeCompare(lb);
    });

    sorted.forEach((c) => {
      const id = String(c.id || '').trim();
      if (!id) return;
      seen.add(id);

      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = categoryLabel(id);
      elements.categorySelect.appendChild(opt);
    });

    // 2) pack側に存在するが index に未登録のカテゴリIDがあれば末尾に追加
    const extra = gatherCategoryIdsFromEntries(state.allEntries)
      .filter((id) => !seen.has(id))
      .sort((a, b) => a.localeCompare(b));

    extra.forEach((id) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id; // label不明なのでID表示
      elements.categorySelect.appendChild(opt);
    });

    elements.categorySelect.value = current;
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
      title.textContent = terms.primary || (entry.term && (entry.term.ja || entry.term.en)) || '—';

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
      badge.textContent = categoryLabel(entry.category);

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

    elements.detailCategory.textContent = categoryLabel(entry.category);

    const terms = getTermTexts(entry, state.lang);
    elements.detailTitle.textContent = terms.primary || '—';
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
      // ensure selection highlight within current filtered list
      if (!state.filtered.some((e) => e.id === match.id)) {
        state.filtered.unshift(match);
      }
      renderResults();
    }
  }

  function indexToCategoryRegistry(index) {
    const cats = Array.isArray(index.categories) ? index.categories : [];
    state.categories = cats;
    state.categoryMap = new Map(
      cats
        .map((c) => {
          const id = String(c.id || '').trim();
          return id ? [id, c] : null;
        })
        .filter(Boolean)
    );
  }

  async function init() {
    cacheElements();
    renderLanguageToggle();
    renderUILabels();
    attachEventListeners();

    try {
      const { index, entries } = await loadAtlasData();
      indexToCategoryRegistry(index);

      state.allEntries = entries;
      state.searchIndex = engine.buildSearchIndex(entries);

      // categories from index.json (label support) + fallback
      rebuildCategoryOptions();

      restoreStateFromURL();

      // URLでカテゴリ指定されててselectに無い場合もあるので、再度 value を反映
      elements.categorySelect.value = state.category || '';

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
