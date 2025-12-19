(function () {
  'use strict';

  /**
   * --- Data loading (fetch-based, DOM-free) ---
   */
  function normalizeWhitespace(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function normalizeString(value) {
    if (typeof value !== 'string') return '';
    return normalizeWhitespace(value);
  }

  function normalizeStringArray(values) {
    if (!Array.isArray(values)) return [];
    return values
      .filter((v) => typeof v === 'string')
      .map((v) => normalizeWhitespace(v))
      .filter((v) => v.length > 0);
  }

  function normalizeEntry(raw, source) {
    const data = raw && typeof raw === 'object' ? raw : {};
    const term = data.term && typeof data.term === 'object' ? data.term : {};
    const aliases = data.aliases && typeof data.aliases === 'object' ? data.aliases : {};
    const description = data.description && typeof data.description === 'object' ? data.description : {};

    const normalized = {
      id: normalizeString(data.id),
      term: {
        ja: normalizeString(term.ja),
        en: normalizeString(term.en),
      },
      category: normalizeString(data.category),
      categories: [],
      tags: normalizeStringArray(data.tags),
      aliases: {
        ja: normalizeStringArray(aliases.ja),
        en: normalizeStringArray(aliases.en),
      },
      description: undefined,
    };

    if (description.ja || description.en) {
      normalized.description = {
        ja: description.ja ? normalizeString(description.ja) : undefined,
        en: description.en !== undefined ? normalizeString(description.en) : undefined,
      };
    }

    if (normalized.category) {
      normalized.categories = [normalized.category];
    }

    if (!normalized.id || !normalized.term.ja || !normalized.category) {
      console.warn('Entry skipped due to missing required fields', source || raw);
      return null;
    }

    return normalized;
  }

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
          const normalized = normalizeEntry(entry, `${pack.file}#${i}`);
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
    const engine = window.AtlasEngine;
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

  function renderResults() {
    elements.results.innerHTML = '';
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

      const title = document.createElement('p');
      title.className = 'result-title';
      title.textContent = entry.term.ja || entry.term.en;

      const subtitle = document.createElement('p');
      subtitle.className = 'result-subtitle';
      subtitle.textContent = entry.term.en && entry.term.ja ? entry.term.en : entry.term.en || entry.term.ja;

      const meta = document.createElement('p');
      meta.className = 'result-meta';
      meta.textContent = entry.description?.en || entry.description?.ja || '';

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
    elements.detailTitle.textContent = entry.term.ja || entry.term.en;
    elements.detailSubtitle.textContent = entry.term.en && entry.term.ja ? entry.term.en : '';

    const descJa = entry.description?.ja ? `JA: ${entry.description.ja}` : '';
    const descEn = entry.description?.en ? `EN: ${entry.description.en}` : '';
    elements.detailDescription.innerHTML = [descJa, descEn].filter(Boolean).map((d) => `<p>${d}</p>`).join('');

    elements.detailAliases.textContent = formatArray([...(entry.aliases?.ja || []), ...(entry.aliases?.en || [])]);
    elements.detailTags.textContent = formatArray(entry.tags);
    elements.detailId.textContent = entry.id;

    elements.detailPlaceholder.hidden = true;
    elements.detail.hidden = false;
  }

  function restoreStateFromURL() {
    const params = new URLSearchParams(location.search);
    state.query = params.get('q') ? normalizeWhitespace(params.get('q')) : '';
    state.category = params.get('cat') ? normalizeWhitespace(params.get('cat')) : '';
    state.selectedId = params.get('id') || null;

    elements.searchInput.value = state.query;
    elements.categorySelect.value = state.category;
  }

  function attachEventListeners() {
    elements.searchInput.addEventListener('input', (e) => {
      state.query = normalizeWhitespace(e.target.value || '');
      clearSelection();
      updateURL();
      applyFilters();
    });

    elements.categorySelect.addEventListener('change', (e) => {
      state.category = normalizeString(e.target.value || '');
      clearSelection();
      updateURL();
      applyFilters();
    });
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
      elements.results.innerHTML = '<p class="empty-state">Failed to load data.</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
