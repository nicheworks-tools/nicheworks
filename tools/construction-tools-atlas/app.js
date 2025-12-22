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
      taskLabel: 'Task',
      taskAll: 'All tasks',
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
      taskLabel: '作業',
      taskAll: 'すべての作業',
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

  async function fetchJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }

  function normalizeId(x) {
    return String(x || '').trim();
  }

  function buildLabelMap(list, keyName) {
    const map = new Map();
    const items = Array.isArray(list) ? list : [];
    items.forEach((it) => {
      const id = normalizeId(it?.id);
      if (!id) return;
      map.set(id, {
        en: (it?.label && it.label.en) ? String(it.label.en) : id,
        ja: (it?.label && it.label.ja) ? String(it.label.ja) : id,
      });
    });
    return map;
  }

  function buildOrder(list) {
    const items = Array.isArray(list) ? list : [];
    return items.map((it) => normalizeId(it?.id)).filter(Boolean);
  }

  function getLabel(id, lang, map) {
    const key = normalizeId(id);
    if (!key) return '';
    const v = map.get(key);
    if (!v) return key;
    return lang === 'ja' ? (v.ja || key) : (v.en || key);
  }

  async function loadAtlasData() {
    const index = await fetchJson('./data/index.json');
    if (!index || !Array.isArray(index.packs)) {
      throw new Error('index.json missing packs array');
    }

    const categoryMap = buildLabelMap(index.categories, 'categories');
    const categoryOrder = buildOrder(index.categories);

    const taskMap = buildLabelMap(index.tasks, 'tasks');
    const taskOrder = buildOrder(index.tasks);

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

    return { entries, categoryMap, categoryOrder, taskMap, taskOrder };
  }

  const state = {
    allEntries: [],
    searchIndex: [],
    filtered: [],
    selectedId: null,
    lang: 'en',
    query: '',
    category: '',
    task: '',
    categoryMap: new Map(),
    categoryOrder: [],
    taskMap: new Map(),
    taskOrder: [],
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
    elements.taskSelect = document.getElementById('taskSelect');
    elements.taskLabel = document.getElementById('taskLabel');
    elements.taskDefaultOption = document.getElementById('taskDefaultOption');
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

  function renderUILabels() {
    if (elements.eyebrow) elements.eyebrow.textContent = getText('eyebrow') || '';
    if (elements.heroTitle) elements.heroTitle.textContent = getText('title') || '';
    if (elements.heroLede) elements.heroLede.textContent = getText('lede') || '';
    if (elements.searchLabel) elements.searchLabel.textContent = getText('searchLabel') || '';
    if (elements.searchInput) elements.searchInput.placeholder = getText('searchPlaceholder') || '';
    if (elements.categoryLabel) elements.categoryLabel.textContent = getText('categoryLabel') || '';
    if (elements.categoryDefaultOption) elements.categoryDefaultOption.textContent = getText('categoryAll') || '';
    if (elements.taskLabel) elements.taskLabel.textContent = getText('taskLabel') || '';
    if (elements.taskDefaultOption) elements.taskDefaultOption.textContent = getText('taskAll') || '';
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

  function otherLang(lang) {
    return lang === 'ja' ? 'en' : 'ja';
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

    if (primary) values.push({ lang, text: primary, placeholder: false });
    else if (lang === 'en') values.push({ lang: 'en', text: placeholders.missingEnDescription, placeholder: true });

    if (fallback) values.push({ lang: otherLang(lang), text: fallback, placeholder: false });
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
    rebuildCategorySelectPreserveValue();
    rebuildTaskSelectPreserveValue();
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
    if (state.task) params.set('task', state.task);
    if (state.selectedId) params.set('id', state.selectedId);
    const search = params.toString();
    const url = search ? `${location.pathname}?${search}` : location.pathname;
    history.replaceState(null, '', url);
  }

  function entryHasTask(entry, taskId) {
    const t = normalizeId(taskId);
    if (!t) return true;

    // Accept common shapes:
    // - entry.tasks: string[]
    // - entry.task: string
    // - entry.tags: string[] (tasksがタグに混ざってる場合)
    const tasksArr = Array.isArray(entry.tasks) ? entry.tasks.map(normalizeId) : [];
    const taskOne = normalizeId(entry.task);
    const tagsArr = Array.isArray(entry.tags) ? entry.tags.map(normalizeId) : [];

    if (tasksArr.includes(t)) return true;
    if (taskOne && taskOne === t) return true;
    if (tagsArr.includes(t)) return true;

    return false;
  }

  function applyFilters() {
    const base = engine.searchByTextWithIndex(state.query, state.lang, state.searchIndex);
    const byCategory = engine.filterByCategory(state.category, state.lang, base);
    const byTask = state.task ? byCategory.filter((e) => entryHasTask(e, state.task)) : byCategory;
    state.filtered = byTask;
    renderResults();
  }

  function clearChildren(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function buildCategoryOptions() {
    state.categoryOrder.forEach((id) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = getLabel(id, state.lang, state.categoryMap);
      elements.categorySelect.appendChild(opt);
    });
  }

  function buildTaskOptions() {
    state.taskOrder.forEach((id) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = getLabel(id, state.lang, state.taskMap);
      elements.taskSelect.appendChild(opt);
    });
  }

  function rebuildCategorySelectPreserveValue() {
    const current = elements.categorySelect.value;
    clearChildren(elements.categorySelect);

    const baseOpt = document.createElement('option');
    baseOpt.id = 'categoryDefaultOption';
    baseOpt.value = '';
    baseOpt.textContent = getText('categoryAll') || '';
    elements.categorySelect.appendChild(baseOpt);

    buildCategoryOptions();
    elements.categorySelect.value = current;
  }

  function rebuildTaskSelectPreserveValue() {
    const current = elements.taskSelect.value;
    clearChildren(elements.taskSelect);

    const baseOpt = document.createElement('option');
    baseOpt.id = 'taskDefaultOption';
    baseOpt.value = '';
    baseOpt.textContent = getText('taskAll') || '';
    elements.taskSelect.appendChild(baseOpt);

    buildTaskOptions();
    elements.taskSelect.value = current;
  }

  function clearResults() {
    clearChildren(elements.results);
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

      if (entry.id === state.selectedId) item.classList.add('active');

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
      const catId = entry.category || '';
      badge.textContent = catId ? getLabel(catId, state.lang, state.categoryMap) : (getText('detailCategoryFallback') || '—');

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

    if (state.filtered.length === 0) renderDetail(null);
  }

  function renderDetail(entry) {
    if (!entry) {
      elements.detail.hidden = true;
      elements.detailPlaceholder.hidden = false;
      return;
    }

    const catId = entry.category || '';
    elements.detailCategory.textContent = catId ? getLabel(catId, state.lang, state.categoryMap) : (getText('detailCategoryFallback') || '—');

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
    state.task = params.get('task') ? engine.normalizeWhitespace(params.get('task')) : '';
    state.selectedId = params.get('id') || null;

    elements.searchInput.value = state.query;
    elements.categorySelect.value = state.category;
    elements.taskSelect.value = state.task;
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

    elements.taskSelect.addEventListener('change', (e) => {
      state.task = engine.normalizeString(e.target.value || '');
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
      if (!state.filtered.some((e) => e.id === match.id)) state.filtered.unshift(match);
      renderResults();
    }
  }

  async function init() {
    cacheElements();
    renderLanguageToggle();
    renderUILabels();
    attachEventListeners();

    try {
      const loaded = await loadAtlasData();
      state.allEntries = loaded.entries;
      state.categoryMap = loaded.categoryMap;
      state.categoryOrder = loaded.categoryOrder;
      state.taskMap = loaded.taskMap;
      state.taskOrder = loaded.taskOrder;

      state.searchIndex = engine.buildSearchIndex(state.allEntries);

      rebuildCategorySelectPreserveValue();
      rebuildTaskSelectPreserveValue();

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
