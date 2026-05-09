(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const els = {
    html: document.documentElement,
    overlay: $("#overlay"),
    themeBtn: $("#themeBtn"),
    langBtn: $("#langBtn"),
    menuBtn: $("#menuBtn"),
    supportBtn: $("#supportBtn"),
    searchInput: $("#searchInput"),
    clearBtn: $("#clearBtn"),
    actionChips: $("#actionChips"),
    filterOpenBtn: $("#filterOpenBtn"),
    categoryBtn: $("#categoryBtn"),
    taskBtn: $("#taskBtn"),
    resultCount: $("#resultCount"),
    hintText: $("#hintText"),
    resultList: $("#resultList"),
    loadMoreWrap: $("#loadMoreWrap"),
    loadMoreBtn: $("#loadMoreBtn"),
    loadMoreHint: $("#loadMoreHint"),
    statusArea: $("#statusArea"),
    detailSheet: $("#detailSheet"),
    detailClose: $("#detailClose"),
    detailTitle: $("#detailTitle"),
    detailStar: $("#detailStar"),
    detailChips: $("#detailChips"),
    detailTerms: $("#detailTerms"),
    detailDesc: $("#detailDesc"),
    detailBullets: $("#detailBullets"),
    detailTabs: $("#detailTabs"),
    tabMeaning: $("#tabMeaning"),
    tabExamples: $("#tabExamples"),
    tabAliases: $("#tabAliases"),
    tabMeta: $("#tabMeta"),
    supportInlineBtn: $("#supportInlineBtn"),
    supportSheet: $("#supportSheet"),
    supportClose: $("#supportClose"),
    ofuseLink: $("#ofuseLink"),
    kofiLink: $("#kofiLink"),
    supportNote: $("#supportNote"),
    menuSheet: $("#menuSheet"),
    menuClose: $("#menuClose"),
    howtoOpen: $("#howtoOpen"),
    howtoSheet: $("#howtoSheet"),
    howtoClose: $("#howtoClose"),
    howtoList: $("#howtoList"),
    favsOnly: $("#favsOnly"),
    importFavsBtn: $("#importFavsBtn"),
    exportFavsBtn: $("#exportFavsBtn"),
    filterSheet: $("#filterSheet"),
    filterTitle: $("#filterTitle"),
    filterDesc: $("#filterDesc"),
    filterClose: $("#filterClose"),
    filterActionItems: $("#filterActionItems"),
    filterCategoryItems: $("#filterCategoryItems"),
    filterTaskItems: $("#filterTaskItems"),
    filterApplyBtn: $("#filterApplyBtn"),
    filterResetBtn: $("#filterResetBtn"),
    donationData: $(".donation-data"),
  };

  const LS = {
    theme: "cta_theme",
    lang: "cta_uilang",
    favs: "cta_favs",
    action: "cta_action",
    category: "cta_category",
    task: "cta_task",
  };

  const ACTIONS = [
    { id: "all", label: "All", tokens: [] },
    { id: "cut", label: "Cut", tokens: ["cut", "cutting", "saw", "切断", "切る"] },
    { id: "fasten", label: "Fasten", tokens: ["fasten", "fastening", "bolt", "screw", "締付", "固定"] },
    { id: "measure", label: "Measure", tokens: ["measure", "measurement", "level", "計測", "測定"] },
    { id: "drill", label: "Drill", tokens: ["drill", "hole", "穴あけ", "穿孔"] },
  ];

  const state = {
    theme: localStorage.getItem(LS.theme) || "light",
    lang: localStorage.getItem(LS.lang) || "ja",
    q: "",
    action: localStorage.getItem(LS.action) || "all",
    category: localStorage.getItem(LS.category) || "all",
    task: localStorage.getItem(LS.task) || "all",
    favs: new Set(safeJson(localStorage.getItem(LS.favs), [])),
    entries: [],
    filtered: [],
    visibleCount: 50,
    pageSize: 50,
    current: null,
  };

  let filterDraft = { action: state.action, category: state.category, task: state.task };

  function safeJson(text, fallback) {
    try { return text ? JSON.parse(text) : fallback; } catch (_) { return fallback; }
  }

  function asArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }

  function text(value) {
    return typeof value === "string" ? value : "";
  }

  function localized(obj, flatJa, flatEn) {
    return {
      ja: text(obj?.ja) || text(flatJa),
      en: text(obj?.en) || text(flatEn),
    };
  }

  function normalizeEntry(raw, index) {
    const summary = localized(raw?.summary, raw?.summary_ja, raw?.summary_en);
    const description = localized(raw?.description, raw?.description_ja, raw?.description_en);
    const detail = localized(raw?.detail, raw?.detail_ja, raw?.detail_en);
    return {
      id: text(raw?.id || raw?.slug) || `entry_${index}`,
      type: text(raw?.type),
      term: localized(raw?.term, raw?.ja || raw?.jp, raw?.en),
      aliases: {
        ja: asArray(raw?.aliases?.ja || raw?.alias?.ja || raw?.aliases_ja),
        en: asArray(raw?.aliases?.en || raw?.alias?.en || raw?.aliases_en),
      },
      description,
      summary: {
        ja: summary.ja || description.ja,
        en: summary.en || description.en,
      },
      detail: {
        ja: detail.ja || description.ja || summary.ja,
        en: detail.en || description.en || summary.en,
      },
      bullets: {
        ja: asArray(raw?.bullets?.ja || raw?.bullets_ja),
        en: asArray(raw?.bullets?.en || raw?.bullets_en),
      },
      examples: {
        ja: asArray(raw?.examples?.ja || raw?.example?.ja || raw?.examples_ja || raw?.usage?.ja),
        en: asArray(raw?.examples?.en || raw?.example?.en || raw?.examples_en || raw?.usage?.en),
      },
      categories: asArray(raw?.categories || raw?.category),
      tasks: asArray(raw?.tasks || raw?.task),
      fuzzy: asArray(raw?.fuzzy),
      region: asArray(raw?.region),
      meta: raw?.meta && typeof raw.meta === "object" ? raw.meta : {},
    };
  }

  function entryHaystack(entry) {
    return [
      entry.id, entry.type,
      entry.term.ja, entry.term.en,
      entry.summary.ja, entry.summary.en,
      entry.detail.ja, entry.detail.en,
      ...entry.aliases.ja, ...entry.aliases.en,
      ...entry.categories, ...entry.tasks, ...entry.fuzzy, ...entry.region,
    ].join("\n").toLowerCase();
  }

  function hasAny(entry, tokens) {
    if (!tokens.length) return true;
    const hay = entryHaystack(entry);
    return tokens.some((token) => hay.includes(String(token).toLowerCase()));
  }

  function matchQuery(entry) {
    const q = state.q.trim().toLowerCase();
    if (!q) return true;
    const hay = entryHaystack(entry);
    return q.split(/\s+/).every((part) => hay.includes(part));
  }

  function currentText(pair) {
    if (state.lang === "ja") return pair?.ja || pair?.en || "";
    return pair?.en || pair?.ja || "";
  }

  function clearNode(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function addText(node, value, className) {
    const el = document.createElement("div");
    if (className) el.className = className;
    el.textContent = value || "";
    node.appendChild(el);
    return el;
  }

  function addChip(node, value) {
    const v = String(value || "").trim();
    if (!v) return;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = v;
    node.appendChild(chip);
  }

  function openSheet(sheet) {
    if (!sheet) return;
    [els.detailSheet, els.supportSheet, els.menuSheet, els.howtoSheet, els.filterSheet].forEach((item) => {
      if (item) item.hidden = true;
    });
    if (els.overlay) els.overlay.hidden = false;
    sheet.hidden = false;
  }

  function closeAllSheets() {
    [els.detailSheet, els.supportSheet, els.menuSheet, els.howtoSheet, els.filterSheet].forEach((item) => {
      if (item) item.hidden = true;
    });
    if (els.overlay) els.overlay.hidden = true;
  }

  function setTheme(theme) {
    state.theme = theme;
    els.html.setAttribute("data-theme", theme);
    localStorage.setItem(LS.theme, theme);
    if (els.themeBtn) els.themeBtn.textContent = theme === "light" ? "☼" : "☾";
  }

  function setLang(lang) {
    state.lang = lang;
    localStorage.setItem(LS.lang, lang);
    els.html.lang = lang;
    render();
    if (state.current) renderDetail(state.current);
  }

  function saveFavs() {
    localStorage.setItem(LS.favs, JSON.stringify([...state.favs]));
  }

  function filterEntries() {
    const action = ACTIONS.find((item) => item.id === state.action) || ACTIONS[0];
    state.filtered = state.entries.filter((entry) => {
      if (els.favsOnly?.checked && !state.favs.has(entry.id)) return false;
      if (!matchQuery(entry)) return false;
      if (state.action !== "all" && !hasAny(entry, action.tokens)) return false;
      if (state.category !== "all" && !entry.categories.includes(state.category)) return false;
      if (state.task !== "all" && !entry.tasks.includes(state.task)) return false;
      return true;
    });
  }

  function renderActions() {
    clearNode(els.actionChips);
    ACTIONS.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pillbtn" + (state.action === action.id ? " pillbtn--accent" : "");
      button.textContent = action.label;
      button.addEventListener("click", () => {
        state.action = action.id;
        localStorage.setItem(LS.action, state.action);
        state.visibleCount = state.pageSize;
        render();
      });
      els.actionChips?.appendChild(button);
    });
  }

  function rowTitle(entry) {
    const en = entry.term.en || "—";
    const ja = entry.term.ja || "—";
    return `${en} / ${ja}`;
  }

  function renderList() {
    clearNode(els.resultList);
    const visible = state.filtered.slice(0, state.visibleCount);
    const frag = document.createDocumentFragment();

    visible.forEach((entry) => {
      const row = document.createElement("div");
      row.className = "row";
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.dataset.id = entry.id;

      const main = document.createElement("div");
      main.className = "row__main";
      addText(main, rowTitle(entry), "row__title");
      addText(main, currentText(entry.summary) || (state.lang === "ja" ? "説明なし" : "No description"), "row__desc");

      const meta = document.createElement("div");
      meta.className = "row__meta";
      [entry.type, ...entry.categories.slice(0, 2), ...entry.tasks.slice(0, 1)].filter(Boolean).slice(0, 4).forEach((item) => addChip(meta, item));
      main.appendChild(meta);

      const star = document.createElement("button");
      star.type = "button";
      star.className = "starbtn";
      star.textContent = state.favs.has(entry.id) ? "★" : "☆";
      star.setAttribute("aria-label", state.favs.has(entry.id) ? "Unfavorite" : "Favorite");
      star.addEventListener("click", (event) => {
        event.stopPropagation();
        if (state.favs.has(entry.id)) state.favs.delete(entry.id);
        else state.favs.add(entry.id);
        saveFavs();
        renderList();
      });

      const open = () => openDetail(entry.id);
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
      row.appendChild(main);
      row.appendChild(star);
      frag.appendChild(row);
    });

    els.resultList?.appendChild(frag);
    if (els.resultCount) els.resultCount.textContent = `Results: ${state.filtered.length}`;
    if (els.hintText) els.hintText.textContent = state.filtered.length ? "" : (state.lang === "ja" ? "一致する用語がありません" : "No matches");

    const hasMore = state.filtered.length > state.visibleCount;
    if (els.loadMoreWrap) els.loadMoreWrap.hidden = !hasMore;
    if (els.loadMoreHint) {
      const shown = Math.min(state.visibleCount, state.filtered.length);
      els.loadMoreHint.textContent = state.lang === "ja" ? `表示中: ${shown} / ${state.filtered.length}` : `Showing ${shown} / ${state.filtered.length}`;
    }
  }

  function renderStatus(type, message) {
    if (!els.statusArea) return;
    clearNode(els.statusArea);
    if (!type) {
      els.statusArea.hidden = true;
      return;
    }
    els.statusArea.hidden = false;
    const title = document.createElement("div");
    title.className = "status__title";
    title.textContent = message;
    els.statusArea.appendChild(title);
  }

  function renderDetailList(node, items, emptyText) {
    clearNode(node);
    if (!node) return;
    const values = items.filter(Boolean);
    if (!values.length) {
      addText(node, emptyText, "muted");
      return;
    }
    const ul = document.createElement("ul");
    values.forEach((value) => {
      const li = document.createElement("li");
      li.textContent = value;
      ul.appendChild(li);
    });
    node.appendChild(ul);
  }

  function setActiveTab(name) {
    $$(".tab", els.detailTabs || document).forEach((tab) => {
      tab.classList.toggle("tab--active", tab.dataset.tab === name);
    });
    if (els.tabMeaning) els.tabMeaning.hidden = name !== "meaning";
    if (els.tabExamples) els.tabExamples.hidden = name !== "examples";
    if (els.tabAliases) els.tabAliases.hidden = name !== "aliases";
    if (els.tabMeta) els.tabMeta.hidden = name !== "meta";
  }

  function renderDetail(entry) {
    if (!entry) return;
    if (els.detailTitle) els.detailTitle.textContent = state.lang === "ja" ? "詳細" : "Detail";
    if (els.detailStar) els.detailStar.textContent = state.favs.has(entry.id) ? "★" : "☆";

    clearNode(els.detailChips);
    [entry.type, ...entry.categories, ...entry.tasks].forEach((item) => addChip(els.detailChips, item));

    clearNode(els.detailTerms);
    addText(els.detailTerms, rowTitle(entry), "termblock__title");
    const aliases = [...entry.aliases.ja, ...entry.aliases.en].filter(Boolean);
    if (aliases.length) addText(els.detailTerms, aliases.join(" / "), "termblock__sub");

    if (els.detailDesc) els.detailDesc.textContent = currentText(entry.detail) || currentText(entry.description) || currentText(entry.summary) || "";
    renderDetailList(els.detailBullets, currentText({ ja: entry.bullets.ja, en: entry.bullets.en }) || [], "");

    clearNode(els.tabMeaning);
    addText(els.tabMeaning, currentText(entry.detail) || currentText(entry.description) || currentText(entry.summary), "tabpanel__text");

    renderDetailList(els.tabExamples, state.lang === "ja" ? entry.examples.ja : entry.examples.en, state.lang === "ja" ? "例はまだありません。" : "No examples yet.");
    renderDetailList(els.tabAliases, aliases, state.lang === "ja" ? "別名はまだありません。" : "No aliases yet.");

    clearNode(els.tabMeta);
    const metaItems = [
      `id: ${entry.id}`,
      `type: ${entry.type || ""}`,
      `categories: ${entry.categories.join(", ")}`,
      `tasks: ${entry.tasks.join(", ")}`,
      `region: ${entry.region.join(", ")}`,
      `quality_batch: ${entry.meta?.quality_batch || ""}`,
    ];
    renderDetailList(els.tabMeta, metaItems, "");
  }

  function openDetail(id) {
    const entry = state.entries.find((item) => item.id === id);
    if (!entry) return;
    state.current = entry;
    renderDetail(entry);
    setActiveTab("meaning");
    openSheet(els.detailSheet);
  }

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function makeFilterButton(value, active, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pillbtn" + (active ? " pillbtn--accent" : "");
    button.textContent = value;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderFilterSheet() {
    filterDraft = { action: state.action, category: state.category, task: state.task };
    const categories = uniqueSorted(state.entries.flatMap((entry) => entry.categories));
    const tasks = uniqueSorted(state.entries.flatMap((entry) => entry.tasks));

    const renderGroup = (node, values, key) => {
      clearNode(node);
      values.forEach((value) => {
        node?.appendChild(makeFilterButton(value, filterDraft[key] === value, () => {
          filterDraft[key] = value;
          renderGroup(node, values, key);
        }));
      });
    };

    renderGroup(els.filterActionItems, ACTIONS.map((item) => item.id), "action");
    renderGroup(els.filterCategoryItems, ["all", ...categories], "category");
    renderGroup(els.filterTaskItems, ["all", ...tasks], "task");
  }

  function render() {
    filterEntries();
    renderActions();
    renderList();
    renderStatus(null, "");
  }

  async function loadData() {
    renderStatus("loading", state.lang === "ja" ? "読み込み中" : "Loading");
    try {
      const loaderEntries = await window.CTA_DATA_LOADER?.loadEntries?.();
      const rawEntries = Array.isArray(loaderEntries) ? loaderEntries : [];
      const seen = new Set();
      state.entries = rawEntries.map(normalizeEntry).filter((entry) => {
        if (!entry.id || seen.has(entry.id)) return false;
        seen.add(entry.id);
        return true;
      });
      state.visibleCount = state.pageSize;
      render();
    } catch (error) {
      renderStatus("error", state.lang === "ja" ? "読み込みに失敗しました" : "Failed to load data");
      console.error("CTA data load failed", error);
    }
  }

  function wire() {
    setTheme(state.theme);
    els.searchInput?.removeAttribute("stable");
    els.searchInput?.removeAttribute("content");
    if (els.searchInput) els.searchInput.placeholder = "例：インパクト / 石膏ボード / 床レベラー / torque wrench";

    els.themeBtn?.addEventListener("click", () => setTheme(state.theme === "light" ? "dark" : "light"));
    els.langBtn?.addEventListener("click", () => setLang(state.lang === "ja" ? "en" : "ja"));
    els.searchInput?.addEventListener("input", () => {
      state.q = els.searchInput.value || "";
      state.visibleCount = state.pageSize;
      render();
    });
    els.clearBtn?.addEventListener("click", () => {
      if (els.searchInput) els.searchInput.value = "";
      state.q = "";
      state.visibleCount = state.pageSize;
      render();
    });
    els.loadMoreBtn?.addEventListener("click", () => {
      state.visibleCount += state.pageSize;
      renderList();
    });

    els.detailClose?.addEventListener("click", closeAllSheets);
    els.supportClose?.addEventListener("click", closeAllSheets);
    els.menuClose?.addEventListener("click", closeAllSheets);
    els.howtoClose?.addEventListener("click", closeAllSheets);
    els.filterClose?.addEventListener("click", closeAllSheets);
    els.overlay?.addEventListener("click", closeAllSheets);

    els.menuBtn?.addEventListener("click", () => openSheet(els.menuSheet));
    els.supportBtn?.addEventListener("click", () => openSheet(els.supportSheet));
    els.supportInlineBtn?.addEventListener("click", () => openSheet(els.supportSheet));
    els.howtoOpen?.addEventListener("click", () => openSheet(els.howtoSheet));
    els.filterOpenBtn?.addEventListener("click", () => { renderFilterSheet(); openSheet(els.filterSheet); });
    els.categoryBtn?.addEventListener("click", () => { renderFilterSheet(); openSheet(els.filterSheet); });
    els.taskBtn?.addEventListener("click", () => { renderFilterSheet(); openSheet(els.filterSheet); });

    els.filterApplyBtn?.addEventListener("click", () => {
      state.action = filterDraft.action;
      state.category = filterDraft.category;
      state.task = filterDraft.task;
      localStorage.setItem(LS.action, state.action);
      localStorage.setItem(LS.category, state.category);
      localStorage.setItem(LS.task, state.task);
      state.visibleCount = state.pageSize;
      closeAllSheets();
      render();
    });
    els.filterResetBtn?.addEventListener("click", () => {
      state.action = "all";
      state.category = "all";
      state.task = "all";
      localStorage.setItem(LS.action, state.action);
      localStorage.setItem(LS.category, state.category);
      localStorage.setItem(LS.task, state.task);
      state.visibleCount = state.pageSize;
      closeAllSheets();
      render();
    });

    els.detailTabs?.addEventListener("click", (event) => {
      const button = event.target.closest(".tab");
      if (!button) return;
      setActiveTab(button.dataset.tab || "meaning");
    });

    els.detailStar?.addEventListener("click", () => {
      if (!state.current) return;
      if (state.favs.has(state.current.id)) state.favs.delete(state.current.id);
      else state.favs.add(state.current.id);
      saveFavs();
      renderDetail(state.current);
      renderList();
    });
    els.favsOnly?.addEventListener("change", () => { state.visibleCount = state.pageSize; render(); });
    els.exportFavsBtn?.addEventListener("click", () => {
      const payload = JSON.stringify({ v: 1, tool: "construction-tools-atlas", type: "favorites", ids: [...state.favs] }, null, 2);
      navigator.clipboard?.writeText(payload).catch(() => {});
    });
    els.importFavsBtn?.addEventListener("click", () => {
      const payload = prompt("Paste favorites JSON:");
      const data = safeJson(payload, null);
      if (!data || !Array.isArray(data.ids)) return;
      const ids = new Set(state.entries.map((entry) => entry.id));
      state.favs = new Set(data.ids.filter((id) => ids.has(id)));
      saveFavs();
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wire();
    loadData();
  });
})();
