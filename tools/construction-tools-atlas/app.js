(function () {
  'use strict';

  const engine = window.AtlasEngine;

  /**
   * --- Data loading (fetch-based, DOM-free) ---
   */

  async function fetchJson(path) {
    const res = await fetch(path);
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

    return entries;
  }

  /**
   * --- UI helpers ---
   */
  const state = {
    allEntries: [],
    filtered: [],
    selectedId: null,
    lang: 'en',
    query: '',
    category: '',
  };

  const elements = {};

  function cacheElements() {
    elements.langToggle = document.getElementById('langToggle');
    elements.searchInput = document.getElementById('searchInput');
    elements.categorySelect = document.getElementById('categorySelect');
    elements.results = document.getElementById('results');
    elements.resultCount = document.getElementById('resultCount');
    elements.emptyState = document.getElementById('emptyState');
    elements.detail = document.getElementById('detail');
    elements.detailPlaceholder = document.getElementById('detailPlaceholder');
    elements.detailCategory = document.getElementById('detailCategory');
    elements.detailTitle = document.getElementById('detailTitle');
    elements.detailSubtitle = document.getElementById('detailSubtitle');
    elements.detailDescription = document.getElementById('detailDescription');
    elements.detailAliases = document.getElementById('detailAliases');
    elements.detailTags = document.getElementById('detailTags');
    elements.detailId = document.getElementById('detailId');
  }

  function formatArray(arr) {
    if (!arr || arr.length === 0) return '—';
    return arr.join(', ');
  }

  function otherLang(lang) {
    return lang === 'ja' ? 'en' : 'ja';
  }

  function getTermTexts(entry, lang) {
    const primary = engine.getLangValue(entry.term, lang) || engine.getLangValue(entry.term, otherLang(lang));
    const secondary = engine.getLangValue(entry.term, otherLang(lang));
    return {
      primary,
      secondary: primary === secondary ? '' : secondary,
    };
  }

  function getDescriptionTexts(entry, lang) {
    const values = [];
    const primary = engine.getLangValue(entry.description, lang);
    const fallback = engine.getLangValue(entry.description, otherLang(lang));
    if (primary) values.push({ lang, text: primary });
    if (fallback && fallback !== primary) {
      values.push({ lang: otherLang(lang), text: fallback });
    }
    return values;
  }

  function getAliasList(entry, lang) {
    const aliases = entry.aliases || {};
    const primary = Array.isArray(aliases[lang]) ? aliases[lang] : [];
    const fallback = Array.isArray(aliases[otherLang(lang)]) ? aliases[otherLang(lang)] : [];
    return [...primary, ...fallback];
  }

  function renderLanguageToggle() {
    if (!elements.langToggle) return;
    elements.langToggle.textContent = state.lang === 'ja' ? 'JA' : 'EN';
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
    const base = engine.searchByText(state.query, state.lang, state.allEntries);
    const filtered = engine.filterByCategory(state.category, state.lang, base);
    state.filtered = filtered;
    renderResults();
  }

  function buildCategoryOptions(entries) {
    const ids = new Set();
    entries.forEach((e) => {
      if (Array.isArray(e.categories)) {
        e.categories.forEach((c) => ids.add(c));
      } else if (e.category) {
        ids.add(e.category);
      }
    });
    const sorted = Array.from(ids).sort();
    sorted.forEach((id) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      elements.categorySelect.appendChild(opt);
    });
  }

  function clearResults() {
    while (elements.results.firstChild) {
      elements.results.removeChild(elements.results.firstChild);
    }
  }

  function renderResults() {
    clearResults();
    elements.resultCount.textContent = `${state.filtered.length} item${state.filtered.length === 1 ? '' : 's'}`;
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
      meta.textContent =
        engine.getLangValue(entry.description, state.lang) ||
        engine.getLangValue(entry.description, otherLang(state.lang)) ||
        '';

      textBlock.appendChild(title);
      if (subtitle.textContent) textBlock.appendChild(subtitle);
      if (meta.textContent) textBlock.appendChild(meta);

      const badge = document.createElement('span');
      badge.className = 'result-badge';
      badge.textContent = entry.category || '—';

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

    elements.detailCategory.textContent = entry.category || '—';
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

  async function init() {
    cacheElements();
    renderLanguageToggle();
    attachEventListeners();

    try {
      const entries = await loadAtlasData();
      state.allEntries = entries;
      buildCategoryOptions(entries);
      restoreStateFromURL();
      applyFilters();
      openEntryFromState();
    } catch (err) {
      console.error(err);
      clearResults();
      const error = document.createElement('p');
      error.className = 'empty-state';
      error.textContent = 'Failed to load data.';
      elements.results.appendChild(error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
