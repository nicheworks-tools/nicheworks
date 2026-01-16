/* =========================================================
   Construction Tools & Slang Atlas (NicheWorks)
   - Static data: data/index.json + data/packs/*.json
   - Features: q search, category filter, task filter, JA/EN, list->detail,
               URL state (q, cat, task, id, lang)
   - Robust: base-url fix, JSON-vs-HTML detection, pack file path fix
   - UX: active selection, ESC close, detail chips, no global collisions
   ========================================================= */

(() => {
  const THEME_KEY = "nw_theme";
  const state = {
    lang: "en", // HTML default is en; URL overrides
    theme: "light",
    mode: "term",
    q: "",
    cat: "",
    actions: [],
    id: "",
    debug: false,
    dataEmpty: false,
    filtersOpen: true,
  };

  const db = {
    index: null,
    categories: [],
    tasks: [],
    actions: [],
    categoriesMap: new Map(),
    tasksMap: new Map(),
    actionsMap: new Map(),
    entries: [],
    entriesById: new Map(),
  };

  const els = {
    // lang toggle
    langToggle: document.getElementById("langToggle"),
    themeToggle: document.getElementById("themeToggle"),
    btnSupport: document.getElementById("btnSupport"),
    sheetOverlay: document.getElementById("sheetOverlay"),
    supportSheet: document.getElementById("supportSheet"),
    btnCloseSupport: document.getElementById("btnCloseSupport"),
    supportOfuseLink: document.getElementById("supportOfuseLink"),
    supportKofiLink: document.getElementById("supportKofiLink"),
    donationData: document.querySelector(".donation-data"),

    // hero
    eyebrow: document.getElementById("eyebrow"),
    heroTitle: document.getElementById("heroTitle"),
    heroLede: document.getElementById("heroLede"),
    headerTitle: document.getElementById("headerTitle"),

    // controls
    controls: document.querySelector(".controls"),
    controlsTitle: document.getElementById("controlsTitle"),
    controlsHint: document.getElementById("controlsHint"),
    filtersToggle: document.getElementById("filtersToggle"),
    clearFilters: document.getElementById("clearFilters"),
    searchLabel: document.getElementById("searchLabel"),
    searchInput: document.getElementById("searchInput"),
    categoryLabel: document.getElementById("categoryLabel"),
    categorySelect: document.getElementById("categorySelect"),
    actionLabel: document.getElementById("actionLabel"),
    actionChips: document.getElementById("actionChips"),
    modeTerm: document.getElementById("modeTerm"),
    modeCategory: document.getElementById("modeCategory"),
    modeAction: document.getElementById("modeAction"),

    // results
    resultsTitle: document.getElementById("resultsTitle"),
    resultCount: document.getElementById("resultCount"),
    resultsList: document.getElementById("results"),
    emptyState: document.getElementById("emptyState"),
    emptyTitle: document.getElementById("emptyTitle"),
    emptyBody: document.getElementById("emptyBody"),
    emptyExamplesTitle: document.getElementById("emptyExamplesTitle"),
    emptyTermLabel: document.getElementById("emptyTermLabel"),
    emptyActionLabel: document.getElementById("emptyActionLabel"),
    emptyTermExamples: document.getElementById("emptyTermExamples"),
    emptyActionExamples: document.getElementById("emptyActionExamples"),
    quickGuide: document.getElementById("quickGuide"),
    guideTitle: document.getElementById("guideTitle"),
    guideExamples: document.getElementById("guideExamples"),

    // detail
    detailPanel: document.getElementById("detailPanel"),
    detailPlaceholder: document.getElementById("detailPlaceholder"),
    detailSheet: document.getElementById("detailSheet"),
    detail: document.getElementById("detail"),
    detailCategory: document.getElementById("detailCategory"),
    detailTitle: document.getElementById("detailTitle"),
    detailSubtitle: document.getElementById("detailSubtitle"),
    detailDescription: document.getElementById("detailDescription"),
    detailExamplesSection: document.getElementById("detailExamplesSection"),
    detailExamplesLabel: document.getElementById("detailExamplesLabel"),
    detailExamples: document.getElementById("detailExamples"),
    detailBack: document.getElementById("detailBack"),
    detailClose: document.getElementById("detailClose"),
    detailActions: document.getElementById("detailActions"),

    // meta labels
    detailTasksLabel: document.getElementById("detailTasksLabel"),
    detailAliasesLabel: document.getElementById("detailAliasesLabel"),
    detailTagsLabel: document.getElementById("detailTagsLabel"),
    detailIdLabel: document.getElementById("detailIdLabel"),

    // meta values
    detailTasks: document.getElementById("detailTasks"),
    detailAliases: document.getElementById("detailAliases"),
    detailTags: document.getElementById("detailTags"),
    detailId: document.getElementById("detailId"),

    // nav links
    aboutLink: document.getElementById("aboutLink"),
    methodLink: document.getElementById("methodLink"),
    disclaimerLink: document.getElementById("disclaimerLink"),
    creditsLink: document.getElementById("creditsLink"),
    scrollTop: document.getElementById("scrollTop"),

    // debug UI (injected)
    debugWrap: null,
    debugToggle: null,
    debugPanel: null,
    debugTitle: null,
    debugIndexUrlValue: null,
    debugPacksResolvedValue: null,
    debugLoadedEntriesValue: null,
    debugFailedPacksValue: null,
    debugFailuresWrap: null,
    debugFailuresTitle: null,
    debugFailuresList: null,
    debugIndexErrorWrap: null,
    debugIndexErrorTitle: null,
    debugIndexErrorValue: null,
    debugIndexErrorBanner: null,
  };

  const i18n = {
    en: {
      toolName: "Construction Tools & Slang Atlas",
      eyebrow: "NicheWorks",
      heroTitle: "Construction Tools & Slang Atlas",
      heroLede: "Quickly find terminology, tools, and work processes across categories.",
      controlsTitle: "Search",
      controlsHint: "Pick a mode, then refine with a keyword.",
      filtersShow: "Show filters",
      filtersHide: "Hide filters",
      filtersReset: "Reset",
      modeTerm: "Term",
      modeCategory: "Category",
      modeAction: "Action",
      searchLabel: "Search",
      searchPh: "Search terms or aliases",
      categoryLabel: "Category",
      actionLabel: "Action",
      resultsTitle: "Results",
      resultCount: "{n} results",
      emptyState: "No results found. Try a different keyword or filter.",
      emptyTitle: "No results yet.",
      emptyBody: "Try a different keyword, or reset your filters.",
      emptyExamplesTitle: "Example queries",
      emptyTermLabel: "Term presets",
      emptyActionLabel: "Action presets",
      guideTitle: "New here? Try a few example searches:",
      termPresets: ["scaffold", "rebar", "level"],
      actionPresets: ["cut", "fasten", "measure"],
      guideExamples: ["scaffold", "rebar", "level"],
      detailPlaceholder: "Select an entry to view details.",
      detailBack: "Back",
      detailClose: "Close",
      catAll: "All categories",
      taskMeta: "Task",
      aliasesMeta: "Aliases",
      aliasesJaLabel: "JA",
      aliasesEnLabel: "EN",
      examplesLabel: "Examples",
      tagsMeta: "Tags",
      idMeta: "ID",
      aboutLink: "About",
      methodLink: "Method",
      disclaimerLink: "Disclaimer",
      creditsLink: "Credits",
      langToggleLabel: "Switch to Japanese",
      langToggleButton: "日本語",
      themeToggleLabelLight: "Switch to light theme",
      themeToggleLabelDark: "Switch to dark theme",
      themeToggleButtonLight: "Light",
      themeToggleButtonDark: "Dark",
      empty: "No results found. Try a different keyword or filter.",
      dash: "—",
      failed: "Failed to load data. See console.",
      debugToggle: "Debug",
      debugTitle: "Status / Debug",
      debugIndexUrl: "INDEX_URL",
      debugPacksResolved: "packsResolved",
      debugLoadedEntries: "loadedEntries",
      debugFailedPacks: "failedPacks",
      debugFailuresTitle: "Failed packs",
      debugIndexErrorTitle: "index.json error",
      debugIndexErrorBanner: "Failed to load index.json.",
      emptyDataHint: "Data failed to load. Open Debug to see details.",
    },
    ja: {
      toolName: "世界の建設・現場用語辞典",
      eyebrow: "NicheWorks",
      heroTitle: "世界の建設・現場用語辞典",
      heroLede: "工具・スラング・作業プロセスをカテゴリ別に素早く参照できます。",
      controlsTitle: "検索",
      controlsHint: "モードを選んでから、キーワードで絞り込めます。",
      filtersShow: "フィルタを表示",
      filtersHide: "フィルタを閉じる",
      filtersReset: "リセット",
      modeTerm: "用語",
      modeCategory: "カテゴリ",
      modeAction: "アクション",
      searchLabel: "検索",
      searchPh: "用語 / 別名を検索",
      categoryLabel: "カテゴリ",
      actionLabel: "アクション",
      resultsTitle: "結果",
      resultCount: "{n} 件",
      emptyState: "該当する用語がありません。キーワードや絞り込みを変えてください。",
      emptyTitle: "結果が見つかりません。",
      emptyBody: "キーワードを変えるか、絞り込みを解除してください。",
      emptyExamplesTitle: "検索例",
      emptyTermLabel: "用語プリセット",
      emptyActionLabel: "アクションプリセット",
      guideTitle: "初めての方はこちらから検索:",
      termPresets: ["墨出し", "鉄筋", "水平器"],
      actionPresets: ["cut", "fasten", "measure"],
      guideExamples: ["墨出し", "鉄筋", "水平器"],
      detailPlaceholder: "項目を選択すると詳細が表示されます。",
      detailBack: "戻る",
      detailClose: "閉じる",
      catAll: "すべてのカテゴリ",
      taskMeta: "作業",
      aliasesMeta: "別名",
      aliasesJaLabel: "日本語",
      aliasesEnLabel: "英語",
      examplesLabel: "使用例",
      tagsMeta: "タグ",
      idMeta: "ID",
      aboutLink: "概要",
      methodLink: "方針",
      disclaimerLink: "免責",
      creditsLink: "クレジット",
      langToggleLabel: "英語に切り替える",
      langToggleButton: "EN",
      themeToggleLabelLight: "ライトテーマに切り替える",
      themeToggleLabelDark: "ダークテーマに切り替える",
      themeToggleButtonLight: "ライト",
      themeToggleButtonDark: "ダーク",
      empty: "該当する用語がありません。キーワードや絞り込みを変えてください。",
      dash: "—",
      failed: "データの読み込みに失敗しました（コンソール参照）",
      debugToggle: "デバッグ",
      debugTitle: "ステータス / デバッグ",
      debugIndexUrl: "INDEX_URL",
      debugPacksResolved: "packsResolved",
      debugLoadedEntries: "loadedEntries",
      debugFailedPacks: "failedPacks",
      debugFailuresTitle: "失敗したパック",
      debugIndexErrorTitle: "index.json エラー",
      debugIndexErrorBanner: "index.json の読み込みに失敗しました。",
      emptyDataHint: "データ読み込みに失敗しました。デバッグ表示で詳細を確認してください。",
    },
  };

  /* -----------------------------
     URL / Base path safety
  ------------------------------ */

  function getToolBaseUrl() {
    const u = new URL(location.href);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    const looksLikeFile = last.includes(".");
    const endsWithSlash = u.pathname.endsWith("/");
    if (!looksLikeFile && !endsWithSlash) u.pathname += "/";
    return new URL(u.pathname, u.origin);
  }

  const BASE = getToolBaseUrl(); // ensures trailing slash
  const INDEX_URL = new URL("data/index.json", BASE).toString();

  const debugInfo = {
    indexUrl: INDEX_URL,
    packsResolved: 0,
    loadedEntries: 0,
    failedPacks: 0,
    failures: [],
    indexError: null,
  };

  function resolvePackUrl(file) {
    if (!file || typeof file !== "string") return null;

    if (/^https?:\/\//i.test(file)) return file;
    if (file.startsWith("/")) return new URL(file, location.origin).toString();

    let cleaned = file.trim().replace(/^\.?\/*/, ""); // remove ./ or leading /

    // filename only -> packs/
    if (!cleaned.includes("/")) cleaned = `packs/${cleaned}`;

    // ensure data/
    if (!cleaned.startsWith("data/")) cleaned = `data/${cleaned}`;

    return new URL(cleaned, BASE).toString();
  }

  /* -----------------------------
     Init
  ------------------------------ */

  init().catch((e) => {
    console.error(e);
    const dict = i18n[state.lang] || i18n.en;
    if (els.emptyState) {
      els.emptyState.hidden = false;
      if (els.emptyTitle) els.emptyTitle.textContent = dict.failed;
      if (els.emptyBody) els.emptyBody.textContent = "";
      if (els.emptyExamplesTitle) els.emptyExamplesTitle.textContent = "";
      if (els.emptyTermExamples) els.emptyTermExamples.innerHTML = "";
      if (els.emptyActionExamples) els.emptyActionExamples.innerHTML = "";
    }
  });

  async function init() {
    state.theme = getStoredTheme();
    readUrlToState();
    applyTheme();
    setupDebugUi();
    bindEvents();
    applySupportLinks();
    await loadAllData();

    sanitizeStateAgainstDefs();
    applyI18n();
    setFiltersOpen(state.filtersOpen);
    renderFilters();
    renderList();

    if (state.id && db.entriesById.has(state.id)) openDetail(state.id, { pushUrl: false });
    else closeDetail({ pushUrl: false });
  }

  function bindEvents() {
    els.langToggle?.addEventListener("click", () => {
      setLang(state.lang === "ja" ? "en" : "ja");
    });

    els.themeToggle?.addEventListener("click", () => {
      setTheme(state.theme === "light" ? "dark" : "light");
    });

    els.btnSupport?.addEventListener("click", () => {
      openSheet(els.supportSheet);
    });

    els.btnCloseSupport?.addEventListener("click", () => {
      closeSheet(els.supportSheet);
    });

    els.sheetOverlay?.addEventListener("click", () => {
      closeAllSheets();
    });

    els.filtersToggle?.addEventListener("click", () => {
      setFiltersOpen(!state.filtersOpen);
    });

    els.clearFilters?.addEventListener("click", () => {
      resetFilters();
    });

    const modeButtons = [els.modeTerm, els.modeCategory, els.modeAction].filter(Boolean);
    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        if (mode) setMode(mode);
      });
    });

    els.searchInput?.addEventListener("input", (e) => {
      state.q = (e.target.value || "").trim();
      state.id = "";
      pushStateToUrl();
      renderList();
      closeDetail({ pushUrl: false });
    });

    els.categorySelect?.addEventListener("change", (e) => {
      state.cat = e.target.value || "";
      state.id = "";
      pushStateToUrl();
      renderList();
      closeDetail({ pushUrl: false });
    });

    // ESC close
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const closed = closeAllSheets();
        if (!closed) closeDetail({ pushUrl: true });
      }
    });

    els.detailBack?.addEventListener("click", () => closeDetail({ pushUrl: true }));
    els.detailClose?.addEventListener("click", () => closeDetail({ pushUrl: true }));
    els.scrollTop?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("popstate", () => {
      readUrlToState();
      applyTheme();
      sanitizeStateAgainstDefs();
      applyI18n();
      setDebugOpen(state.debug, { updateUrl: false });
      applyStateToControls();
      renderFilters();
      renderList();

      if (state.id && db.entriesById.has(state.id)) openDetail(state.id, { pushUrl: false });
      else closeDetail({ pushUrl: false });
    });
  }

  function applySupportLinks() {
    const data = els.donationData;
    const ofuseUrl = data?.dataset?.ofuse || "";
    const kofiUrl = data?.dataset?.kofi || "";

    if (els.supportOfuseLink && ofuseUrl) {
      els.supportOfuseLink.href = ofuseUrl;
    }

    if (els.supportKofiLink && kofiUrl) {
      els.supportKofiLink.href = kofiUrl;
    }
  }

  function openSheet(sheetEl) {
    if (!sheetEl) return;
    sheetEl.hidden = false;
    sheetEl.setAttribute("aria-hidden", "false");
    if (els.sheetOverlay) els.sheetOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeSheet(sheetEl) {
    if (!sheetEl) return;
    sheetEl.hidden = true;
    sheetEl.setAttribute("aria-hidden", "true");

    const anyOpen = document.querySelector(".sheet:not([hidden])");
    if (!anyOpen && els.sheetOverlay) {
      els.sheetOverlay.hidden = true;
      document.body.style.overflow = "";
    }
  }

  function closeAllSheets() {
    const openSheets = Array.from(document.querySelectorAll(".sheet:not([hidden])"));
    if (!openSheets.length) return false;
    openSheets.forEach((sheet) => closeSheet(sheet));
    return true;
  }

  /* -----------------------------
     Data loading
  ------------------------------ */

  async function loadAllData() {
    resetDebugInfo();

    let index;
    try {
      index = await fetchJson(INDEX_URL);
    } catch (error) {
      handleIndexError(error);
      return;
    }

    db.index = index;

    db.categories = normalizeDefList(index.categories);
    db.tasks = normalizeDefList(index.tasks);
    db.actions = normalizeDefList(index.actions).map((action) => ({
      ...action,
      id: normalizeActionId(action.id),
    }));

    db.categoriesMap = new Map(db.categories.map((c) => [c.id, c]));
    db.tasksMap = new Map(db.tasks.map((t) => [t.id, t]));
    db.actionsMap = new Map(db.actions.map((a) => [a.id, a]));

    const packs = Array.isArray(index.packs) ? index.packs : [];
    const packUrls = packs.map((p) => resolvePackUrl(p?.file)).filter(Boolean);
    debugInfo.packsResolved = packUrls.length;

    if (packUrls.length === 0) {
      debugInfo.failedPacks = 1;
      debugInfo.failures = [
        {
          url: "(packs)",
          err: new Error(
            `No pack URLs resolved. Check index.json packs[].file.\nINDEX_URL=${INDEX_URL}`
          ),
        },
      ];
      updateDebugPanel();
      handleEmptyData();
      return;
    }

    const settled = await Promise.allSettled(packUrls.map((u) => fetchJson(u)));

    const okJsons = [];
    const errors = [];
    settled.forEach((r, i) => {
      if (r.status === "fulfilled") okJsons.push(r.value);
      else errors.push({ url: packUrls[i], err: r.reason });
    });
    if (errors.length) console.error("[packs] some failed:", errors);
    debugInfo.failedPacks = errors.length;
    debugInfo.failures = errors;

    const entries = okJsons.flatMap((pj) => {
      if (Array.isArray(pj)) return pj;
      if (pj && Array.isArray(pj.entries)) return pj.entries;
      return [];
    });

    db.entries = entries.filter((e) => e && typeof e.id === "string" && e.id.trim().length > 0);
    db.entriesById = new Map(db.entries.map((e) => [e.id, e]));
    debugInfo.loadedEntries = db.entries.length;
    updateDebugPanel();

    if (db.entries.length === 0) {
      handleEmptyData();
    }
  }

  /* -----------------------------
     I18n + UI
  ------------------------------ */

  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-lang", state.lang);

    applyI18nText();
    updateThemeToggleLabel();
    applyDebugI18n(i18n[state.lang] || i18n.en);
  }

  function applyI18nText() {
    const dict = i18n[state.lang] || i18n.en;

    if (els.eyebrow) els.eyebrow.textContent = dict.eyebrow;
    if (els.heroTitle) els.heroTitle.textContent = dict.heroTitle;
    if (els.heroLede) els.heroLede.textContent = dict.heroLede;
    if (els.headerTitle) els.headerTitle.textContent = dict.heroTitle;
    if (dict.toolName) document.title = `${dict.toolName} | NicheWorks`;

    if (els.controlsTitle) els.controlsTitle.textContent = dict.controlsTitle;
    if (els.controlsHint) els.controlsHint.textContent = dict.controlsHint;

    if (els.clearFilters) els.clearFilters.textContent = dict.filtersReset;
    if (els.modeTerm) els.modeTerm.textContent = dict.modeTerm;
    if (els.modeCategory) els.modeCategory.textContent = dict.modeCategory;
    if (els.modeAction) els.modeAction.textContent = dict.modeAction;

    if (els.searchLabel) els.searchLabel.textContent = dict.searchLabel;
    if (els.categoryLabel) els.categoryLabel.textContent = dict.categoryLabel;
    if (els.actionLabel) els.actionLabel.textContent = dict.actionLabel;
    if (els.resultsTitle) els.resultsTitle.textContent = dict.resultsTitle;

    if (els.searchInput) els.searchInput.placeholder = dict.searchPh;

    if (els.emptyTitle) els.emptyTitle.textContent = dict.emptyTitle;
    if (els.emptyBody) els.emptyBody.textContent = dict.emptyBody;
    if (els.emptyExamplesTitle) els.emptyExamplesTitle.textContent = dict.emptyExamplesTitle;
    if (els.emptyTermLabel) els.emptyTermLabel.textContent = dict.emptyTermLabel;
    if (els.emptyActionLabel) els.emptyActionLabel.textContent = dict.emptyActionLabel;
    if (els.detailPlaceholder) els.detailPlaceholder.textContent = dict.detailPlaceholder;
    if (els.detailBack) els.detailBack.textContent = dict.detailBack;
    if (els.detailClose) els.detailClose.textContent = dict.detailClose;

    if (els.detailTasksLabel) els.detailTasksLabel.textContent = dict.taskMeta;
    if (els.detailAliasesLabel) els.detailAliasesLabel.textContent = dict.aliasesMeta;
    if (els.detailTagsLabel) els.detailTagsLabel.textContent = dict.tagsMeta;
    if (els.detailIdLabel) els.detailIdLabel.textContent = dict.idMeta;
    if (els.detailExamplesLabel) els.detailExamplesLabel.textContent = dict.examplesLabel;

    if (els.aboutLink) els.aboutLink.textContent = dict.aboutLink;
    if (els.methodLink) els.methodLink.textContent = dict.methodLink;
    if (els.disclaimerLink) els.disclaimerLink.textContent = dict.disclaimerLink;
    if (els.creditsLink) els.creditsLink.textContent = dict.creditsLink;

    if (els.langToggle) {
      els.langToggle.setAttribute("aria-label", dict.langToggleLabel);
      els.langToggle.setAttribute("title", dict.langToggleLabel);
      if (dict.langToggleButton) els.langToggle.textContent = dict.langToggleButton;
    }

    updateThemeToggleLabel();

    updateFiltersToggleLabel();
    renderGuideExamples();
    renderEmptyExamples();
  }

  function applyStateToControls() {
    if (els.searchInput) els.searchInput.value = state.q || "";
    if (els.categorySelect) els.categorySelect.value = state.cat || "";
    updateModeChips();
    updateActionChipSelection();
    updateControlsVisibility();
  }

  function updateModeChips() {
    const modes = [
      { mode: "term", el: els.modeTerm },
      { mode: "category", el: els.modeCategory },
      { mode: "action", el: els.modeAction },
    ];
    modes.forEach(({ mode, el }) => {
      if (!el) return;
      const active = state.mode === mode;
      el.classList.toggle("is-selected", active);
      el.setAttribute("aria-pressed", String(active));
    });
  }

  function updateActionChipSelection() {
    if (!els.actionChips) return;
    const chips = els.actionChips.querySelectorAll(".chip[data-id]");
    chips.forEach((chip) => {
      const id = chip.dataset.id;
      const active = id && state.actions.includes(id);
      chip.classList.toggle("is-selected", active);
      chip.setAttribute("aria-pressed", String(Boolean(active)));
    });
  }

  function updateControlsVisibility() {
    if (!els.controls) return;
    const controls = els.controls;
    const isCategory = state.mode === "category";
    const isAction = state.mode === "action";
    controls.querySelectorAll("[data-mode]").forEach((el) => {
      if (el.dataset.mode === "category") el.hidden = !isCategory;
      if (el.dataset.mode === "action") el.hidden = !isAction;
    });
  }

  function setMode(mode) {
    const next = ["term", "category", "action"].includes(mode) ? mode : "term";
    state.mode = next;
    state.id = "";
    pushStateToUrl();
    applyStateToControls();
    renderList();
    closeDetail({ pushUrl: false });
  }

  function resetFilters() {
    state.mode = "term";
    state.q = "";
    state.cat = "";
    state.actions = [];
    state.id = "";
    if (els.searchInput) els.searchInput.value = "";
    if (els.categorySelect) els.categorySelect.value = "";
    pushStateToUrl();
    applyStateToControls();
    renderList();
    closeDetail({ pushUrl: false });
  }

  function toggleActionFilter(id) {
    const actionId = normalizeActionId(id);
    if (!actionId) return;
    const next = new Set(state.actions || []);
    if (next.has(actionId)) next.delete(actionId);
    else next.add(actionId);
    state.actions = [...next];
    state.id = "";
    pushStateToUrl();
    updateActionChipSelection();
    renderList();
    closeDetail({ pushUrl: false });
  }

  function applyTermPreset(term) {
    state.mode = "term";
    state.q = term;
    state.cat = "";
    state.actions = [];
    state.id = "";
    if (els.searchInput) {
      els.searchInput.value = term;
      els.searchInput.focus();
    }
    pushStateToUrl();
    applyStateToControls();
    renderList();
    closeDetail({ pushUrl: false });
  }

  function applyActionPreset(actionId) {
    const normalized = normalizeActionId(actionId);
    if (!normalized) return;
    state.mode = "action";
    state.q = "";
    state.cat = "";
    state.actions = [normalized];
    state.id = "";
    if (els.searchInput) els.searchInput.value = "";
    pushStateToUrl();
    applyStateToControls();
    renderList();
    closeDetail({ pushUrl: false });
  }

  function renderFilters() {
    renderCategorySelect();
    renderActionChips();
    applyStateToControls();
  }

  function renderCategorySelect() {
    if (!els.categorySelect) return;
    const dict = i18n[state.lang] || i18n.en;

    const current = state.cat || "";
    const allOpt =
      els.categorySelect.querySelector("#categoryDefaultOption") ||
      document.createElement("option");
    allOpt.id = "categoryDefaultOption";
    allOpt.value = "";
    allOpt.textContent = dict.catAll;

    els.categorySelect.innerHTML = "";
    els.categorySelect.appendChild(allOpt);

    const sorted = [...db.categories].sort((a, b) =>
      labelOf(a, state.lang).localeCompare(labelOf(b, state.lang))
    );
    for (const c of sorted) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = labelOf(c, state.lang);
      els.categorySelect.appendChild(opt);
    }

    els.categorySelect.value = current;
    state.cat = els.categorySelect.value || "";
    applyI18nText();
  }

  function renderActionChips() {
    if (!els.actionChips) return;
    const dict = i18n[state.lang] || i18n.en;
    els.actionChips.innerHTML = "";

    const sorted = [...db.actions].sort((a, b) =>
      labelOf(a, state.lang).localeCompare(labelOf(b, state.lang))
    );

    if (sorted.length === 0) {
      const empty = document.createElement("span");
      empty.textContent = dict.dash;
      empty.style.color = "var(--muted)";
      empty.style.fontSize = "12px";
      els.actionChips.appendChild(empty);
      return;
    }

    sorted.forEach((action) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = labelOf(action, state.lang);
      btn.dataset.id = action.id;
      btn.setAttribute("aria-pressed", String(state.actions.includes(action.id)));
      if (state.actions.includes(action.id)) btn.classList.add("is-selected");
      btn.addEventListener("click", () => {
        toggleActionFilter(action.id);
      });
      els.actionChips.appendChild(btn);
    });
  }

  /* -----------------------------
     List / Detail
  ------------------------------ */

  function renderList() {
    const dict = i18n[state.lang] || i18n.en;
    const results = getFilteredEntries();

    if (els.resultCount) {
      els.resultCount.textContent = formatResultCount(results.length, dict);
    }
    if (els.emptyState) {
      const isEmpty = results.length === 0;
      els.emptyState.hidden = !isEmpty;
      if (isEmpty) {
        if (state.dataEmpty) {
          if (els.emptyTitle) els.emptyTitle.textContent = dict.failed;
          if (els.emptyBody) els.emptyBody.textContent = dict.emptyDataHint;
          if (els.emptyExamplesTitle) els.emptyExamplesTitle.textContent = "";
          if (els.emptyTermLabel) els.emptyTermLabel.textContent = "";
          if (els.emptyActionLabel) els.emptyActionLabel.textContent = "";
          if (els.emptyTermExamples) els.emptyTermExamples.innerHTML = "";
          if (els.emptyActionExamples) els.emptyActionExamples.innerHTML = "";
        } else {
          if (els.emptyTitle) els.emptyTitle.textContent = dict.emptyTitle;
          if (els.emptyBody) els.emptyBody.textContent = dict.emptyBody;
          if (els.emptyExamplesTitle) els.emptyExamplesTitle.textContent = dict.emptyExamplesTitle;
          renderEmptyExamples();
        }
      }
    }

    if (!els.resultsList) return;
    els.resultsList.innerHTML = "";

    if (results.length === 0) return;

    const frag = document.createDocumentFragment();
    for (const e of results) frag.appendChild(renderResultItem(e));
    els.resultsList.appendChild(frag);

    // keep active highlight on re-render
    if (state.id) updateActiveCard(state.id);

    updateGuideVisibility(results.length);
  }

  function renderResultItem(entry) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card";
    btn.setAttribute("role", "listitem");
    btn.dataset.id = entry.id;

    btn.addEventListener("click", () => {
      // same id -> toggle close
      if (state.id === entry.id) {
        closeDetail({ pushUrl: true });
        return;
      }
      openDetail(entry.id, { pushUrl: true });
    });

    const title = document.createElement("div");
    title.className = "card__title";
    title.textContent = `${termOf(entry, "en")} / ${termOf(entry, "ja")}`;

    const desc = document.createElement("div");
    desc.className = "card__desc";
    desc.textContent = descOf(entry, state.lang);

    const tags = document.createElement("div");
    tags.className = "card__tags";

    const catIds = normalizeEntryCategoryIds(entry);
    const maxTags = 2;
    catIds.slice(0, maxTags).forEach((id) => {
      const def = db.categoriesMap.get(id);
      tags.appendChild(renderTag(def ? labelOf(def, state.lang) : id));
    });
    if (catIds.length > maxTags) {
      tags.appendChild(renderTag(`+${catIds.length - maxTags}`));
    }

    btn.appendChild(title);
    btn.appendChild(desc);
    btn.appendChild(tags);
    return btn;
  }

  function renderTag(text) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = text;
    return span;
  }

  function updateActiveCard(id) {
    if (!els.resultsList) return;
    const cards = els.resultsList.querySelectorAll(".card");
    cards.forEach((c) => {
      const active = c.dataset.id === id;
      c.classList.toggle("is-active", active);
      if (active) c.setAttribute("aria-current", "true");
      else c.removeAttribute("aria-current");
    });
  }

  function setDetailListText(container, items) {
    const dict = i18n[state.lang] || i18n.en;
    if (!container) return;

    const list = uniq(items);
    if (list.length === 0) {
      container.textContent = dict.dash;
      return;
    }

    container.textContent = list.join(", ");
  }

  function openDetail(id, { pushUrl }) {
    const entry = db.entriesById.get(id);
    if (!entry) return;

    state.id = id;
    if (pushUrl) pushStateToUrl();

    updateActiveCard(id);
    document.body.classList.add("detail-open");

    if (els.detailPlaceholder) els.detailPlaceholder.hidden = true;
    if (els.detailSheet) els.detailSheet.hidden = false;
    if (els.detailActions) els.detailActions.hidden = false;
    if (els.detail) els.detail.hidden = false;

    const dict = i18n[state.lang] || i18n.en;

    const termJa = termOf(entry, "ja");
    const termEn = termOf(entry, "en");
    const termCurrent = termOf(entry, state.lang);

    if (els.detailTitle) els.detailTitle.textContent = termCurrent || entry.id || dict.dash;
    if (els.detailSubtitle) {
      if (termJa && termEn) els.detailSubtitle.textContent = `${termJa} / ${termEn}`;
      else els.detailSubtitle.textContent = termJa || termEn || "";
    }

    // category line: labels joined
    if (els.detailCategory) {
      const catLabels = normalizeEntryCategoryIds(entry)
        .map((cid) => db.categoriesMap.get(cid))
        .filter(Boolean)
        .map((def) => labelOf(def, state.lang));
      els.detailCategory.textContent = catLabels.length ? catLabels.join(" / ") : dict.dash;
    }

    if (els.detailDescription) {
      els.detailDescription.textContent = descOf(entry, state.lang) || dict.dash;
    }

    if (els.detailExamplesSection && els.detailExamples) {
      const examples = examplesListForLang(entry, state.lang);
      els.detailExamples.innerHTML = "";
      if (examples.length) {
        examples.forEach((example) => {
          const li = document.createElement("li");
          li.textContent = example;
          els.detailExamples.appendChild(li);
        });
        els.detailExamplesSection.hidden = false;
      } else {
        els.detailExamplesSection.hidden = true;
      }
    }

    // task labels
    const taskLabels = normalizeEntryTaskIds(entry)
      .map((tid) => db.tasksMap.get(tid))
      .filter(Boolean)
      .map((def) => labelOf(def, state.lang));
    setDetailListText(els.detailTasks, taskLabels);

    // aliases for ja/en (if present)
    if (els.detailAliases) {
      const aliasPairs = aliasesListByLang(entry);
      const aliasText = [];
      if (aliasPairs.ja.length) {
        aliasText.push(`${dict.aliasesJaLabel}: ${aliasPairs.ja.join(", ")}`);
      }
      if (aliasPairs.en.length) {
        aliasText.push(`${dict.aliasesEnLabel}: ${aliasPairs.en.join(", ")}`);
      }
      setDetailListText(els.detailAliases, aliasText);
    }

    // tags (raw)
    setDetailListText(els.detailTags, tagsList(entry));

    if (els.detailId) els.detailId.textContent = entry.id || dict.dash;
  }

  function closeDetail({ pushUrl }) {
    state.id = "";
    if (pushUrl) pushStateToUrl();

    updateActiveCard(""); // remove highlight
    document.body.classList.remove("detail-open");

    if (els.detail) els.detail.hidden = true;
    if (els.detailSheet) els.detailSheet.hidden = true;
    if (els.detailActions) els.detailActions.hidden = true;
    if (els.detailPlaceholder) els.detailPlaceholder.hidden = false;
  }

  /* -----------------------------
     Filtering
  ------------------------------ */

  function getFilteredEntries() {
    const qRaw = state.q || "";
    const q = normalizeSearchText(qRaw);
    const cat = state.cat || "";
    const actions = Array.isArray(state.actions) ? state.actions : [];

    return db.entries.filter((entry) => {
      if (state.mode === "category") {
        if (cat) {
          const cats = normalizeEntryCategoryIds(entry);
          if (!cats.includes(cat)) return false;
        }
        if (q) {
          if (!matchesTermQuery(entry, q)) return false;
        }
        return true;
      }

      if (state.mode === "action") {
        if (actions.length === 0) return false;
        const entryActions = normalizeEntryActionTags(entry);
        const matchesAction = actions.some((id) => entryActions.includes(id));
        if (!matchesAction) return false;
        if (q) {
          if (!matchesTermQuery(entry, q)) return false;
        }
        return true;
      }

      if (q) {
        if (!matchesTermQuery(entry, q)) return false;
      }
      return true;
    });
  }

  function matchesTermQuery(entry, q) {
    const qLower = normalizeSearchText(q).toLowerCase();
    if (!qLower) return true;

    const hay = collectTermSearchFields(entry);
    return hay.some((value) => {
      const normalized = normalizeSearchText(value).toLowerCase();
      return normalized.includes(qLower);
    });
  }

  /* -----------------------------
     Normalizers / helpers
  ------------------------------ */

  function normalizeSearchText(value) {
    if (value === null || value === undefined) return "";
    return String(value).normalize("NFKC").trim();
  }

  function normalizeActionId(value) {
    if (!value) return "";
    return String(value).trim().toLowerCase();
  }

  function normalizeDefList(defs) {
    if (!defs) return [];
    if (Array.isArray(defs)) return defs.filter(Boolean);
    if (typeof defs === "object") {
      return Object.entries(defs).map(([id, v]) => {
        if (!v) return { id, label: { ja: id, en: id } };
        if (v.label) return { id, ...v };
        if (v.ja || v.en) return { id, label: { ja: v.ja || id, en: v.en || id } };
        return { id, label: { ja: id, en: id } };
      });
    }
    return [];
  }

  function normalizeEntryCategoryIds(entry) {
    const ids = new Set();
    if (!entry) return [];

    if (Array.isArray(entry.categories)) entry.categories.forEach((x) => x && ids.add(x));
    if (typeof entry.category === "string" && entry.category) ids.add(entry.category);

    if (Array.isArray(entry.tags)) {
      for (const t of entry.tags) {
        if (typeof t === "string" && db.categoriesMap.has(t)) ids.add(t);
      }
    }
    return [...ids];
  }

  function normalizeEntryTaskIds(entry) {
    const ids = new Set();
    if (!entry) return [];

    if (Array.isArray(entry.tasks)) entry.tasks.forEach((x) => x && ids.add(x));
    if (typeof entry.task === "string" && entry.task) ids.add(entry.task);

    if (Array.isArray(entry.tags)) {
      for (const t of entry.tags) {
        if (typeof t === "string" && db.tasksMap.has(t)) ids.add(t);
      }
    }
    return [...ids].filter((x) => db.tasksMap.has(x));
  }

  function normalizeEntryActionTags(entry) {
    const ids = new Set();
    if (!entry) return [];
    const raw = entry.actionTags || entry.actionTag || [];
    if (Array.isArray(raw)) raw.forEach((x) => x && ids.add(normalizeActionId(x)));
    if (typeof raw === "string") ids.add(normalizeActionId(raw));
    return [...ids].filter((id) => id && (!db.actionsMap.size || db.actionsMap.has(id)));
  }

  function termOf(entry, lang) {
    const t = entry.term || entry.title || {};
    const raw = t?.[lang];
    if (raw) return raw;
    return t?.en || t?.ja || entry.id || "";
  }

  function readingOf(entry, lang) {
    const t = entry.term || {};
    const read = entry.reading || entry.readings || t.reading || t.readings;
    if (!read) return "";
    if (typeof read === "string") return read;
    if (read && typeof read === "object") {
      return read[lang] || read.ja || read.en || "";
    }
    return "";
  }

  function collectTermSearchFields(entry) {
    const fields = [];
    fields.push(termOf(entry, "ja"));
    fields.push(termOf(entry, "en"));
    fields.push(readingOf(entry, "ja"));
    fields.push(readingOf(entry, "en"));

    const aliases = aliasesListByLang(entry);
    fields.push(...aliases.ja);
    fields.push(...aliases.en);
    return uniq(fields);
  }

  function descOf(entry, lang) {
    const d = entry.description || {};
    const raw = d?.[lang];
    if (raw) return raw;
    return d?.en || d?.ja || "";
  }

  function labelOf(def, lang) {
    if (!def) return "";
    if (def.label && (def.label[lang] || def.label.ja || def.label.en)) {
      return def.label[lang] || def.label.en || def.label.ja || def.id;
    }
    if (def[lang] || def.ja || def.en) return def[lang] || def.en || def.ja;
    return def.id || "";
  }

  function uniq(arr) {
    const out = [];
    const seen = new Set();
    for (const x of arr || []) {
      const s = String(x || "").trim();
      if (!s) continue;
      if (seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
    return out;
  }

  function aliasesListAll(entry) {
    const a = entry?.aliases || entry?.alias;
    const out = [];

    if (a && typeof a === "object" && !Array.isArray(a)) {
      if (Array.isArray(a.ja)) out.push(...a.ja);
      if (Array.isArray(a.en)) out.push(...a.en);
    } else if (Array.isArray(a)) {
      out.push(...a);
    } else if (typeof a === "string") {
      out.push(a);
    }
    return uniq(out);
  }

  function aliasesListForLang(entry, lang) {
    const a = entry?.aliases || entry?.alias;
    const out = [];

    if (a && typeof a === "object" && !Array.isArray(a)) {
      if (Array.isArray(a[lang])) out.push(...a[lang]);
    } else if (Array.isArray(a)) {
      out.push(...a);
    } else if (typeof a === "string") {
      out.push(a);
    }
    return uniq(out);
  }

  function aliasesListByLang(entry) {
    const a = entry?.aliases || entry?.alias;
    const ja = [];
    const en = [];

    if (a && typeof a === "object" && !Array.isArray(a)) {
      if (Array.isArray(a.ja)) ja.push(...a.ja);
      if (Array.isArray(a.en)) en.push(...a.en);
    } else if (Array.isArray(a)) {
      ja.push(...a);
      en.push(...a);
    } else if (typeof a === "string") {
      ja.push(a);
      en.push(a);
    }

    return { ja: uniq(ja), en: uniq(en) };
  }

  function examplesListForLang(entry, lang) {
    const ex = entry?.examples || entry?.example;
    if (!ex) return [];
    if (Array.isArray(ex)) return uniq(ex);
    if (typeof ex === "string") return uniq([ex]);
    if (typeof ex === "object") {
      const preferred = Array.isArray(ex[lang]) ? ex[lang] : [];
      const fallback = Array.isArray(ex.en) ? ex.en : Array.isArray(ex.ja) ? ex.ja : [];
      return uniq([...preferred, ...fallback]);
    }
    return [];
  }

  function tagsList(entry) {
    if (Array.isArray(entry?.tags)) return uniq(entry.tags);
    return [];
  }

  function sanitizeStateAgainstDefs() {
    if (state.cat && !db.categoriesMap.has(state.cat)) state.cat = "";
    if (state.actions && state.actions.length) {
      state.actions = state.actions.filter((id) => db.actionsMap.has(id));
    }
  }

  /* -----------------------------
     JSON fetch (robust)
  ------------------------------ */

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    const text = await res.text().catch(() => "");

    if (!res.ok) {
      throw new Error(`Failed to load: ${url} (${res.status})\n${text.slice(0, 200)}`);
    }

    const head = text.slice(0, 200).toLowerCase();
    const looksLikeHtml = head.includes("<!doctype html") || head.includes("<html");
    const looksLikeJson = ct.includes("json") || /^\s*[{[]/.test(text);

    if (!looksLikeJson || looksLikeHtml) {
      throw new Error(`Not JSON: ${url}\ncontent-type=${ct || "(none)"}\n${text.slice(0, 200)}`);
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`JSON parse failed: ${url}\n${text.slice(0, 200)}`);
    }
  }

  /* -----------------------------
     URL state
  ------------------------------ */

  function readUrlToState() {
    const sp = new URLSearchParams(location.search);

    const lang = sp.get("lang");
    state.lang = lang === "ja" ? "ja" : "en";
    state.theme = getStoredTheme();

    const mode = sp.get("mode");
    state.mode = ["term", "category", "action"].includes(mode) ? mode : "term";

    state.q = (sp.get("q") || "").trim();
    state.cat = sp.get("cat") || "";
    const actionsRaw = (sp.get("actions") || "").split(",").map((x) => normalizeActionId(x));
    state.actions = actionsRaw.filter(Boolean);
    state.id = sp.get("id") || "";
    state.debug = sp.get("debug") === "1";

    applyStateToControls();
  }

  function pushStateToUrl() {
    const sp = new URLSearchParams();

    // default en
    if (state.lang === "en") sp.set("lang", "en");
    if (state.mode && state.mode !== "term") sp.set("mode", state.mode);
    if (state.q) sp.set("q", state.q);
    if (state.cat) sp.set("cat", state.cat);
    if (state.actions && state.actions.length) sp.set("actions", state.actions.join(","));
    if (state.id) sp.set("id", state.id);
    if (state.debug) sp.set("debug", "1");

    const qs = sp.toString();
    const url = qs ? `?${qs}` : BASE.pathname; // keep trailing slash
    history.pushState(null, "", url);
  }

  function setLang(lang) {
    state.lang = lang === "ja" ? "ja" : "en";
    pushStateToUrl();

    applyI18n();
    renderFilters();
    renderList();

    if (state.id && db.entriesById.has(state.id)) openDetail(state.id, { pushUrl: false });
  }

  function setTheme(theme) {
    state.theme = theme === "light" ? "light" : "dark";
    setStoredTheme(state.theme);
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    updateThemeToggleLabel();
  }

  function updateThemeToggleLabel() {
    if (!els.themeToggle) return;
    const dict = i18n[state.lang] || i18n.en;
    const isLight = state.theme === "light";
    const label = isLight ? dict.themeToggleLabelDark : dict.themeToggleLabelLight;
    const text = isLight ? dict.themeToggleButtonDark : dict.themeToggleButtonLight;
    if (label) {
      els.themeToggle.setAttribute("aria-label", label);
      els.themeToggle.setAttribute("title", label);
    }
    if (text) els.themeToggle.textContent = text;
  }

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === "dark" ? "dark" : "light";
    } catch (error) {
      return "light";
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      // ignore storage errors
    }
  }

  function setFiltersOpen(open) {
    state.filtersOpen = Boolean(open);
    if (els.controls) els.controls.classList.toggle("is-collapsed", !state.filtersOpen);
    if (els.filtersToggle) {
      els.filtersToggle.setAttribute("aria-expanded", String(state.filtersOpen));
      updateFiltersToggleLabel();
    }
  }

  function updateFiltersToggleLabel() {
    const dict = i18n[state.lang] || i18n.en;
    if (!els.filtersToggle) return;
    els.filtersToggle.textContent = state.filtersOpen ? dict.filtersHide : dict.filtersShow;
  }

  function renderGuideExamples() {
    const dict = i18n[state.lang] || i18n.en;
    if (els.guideTitle) els.guideTitle.textContent = dict.guideTitle;
    if (!els.guideExamples) return;
    els.guideExamples.innerHTML = "";
    const examples = Array.isArray(dict.termPresets) ? dict.termPresets : dict.guideExamples || [];
    examples.forEach((term) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "guide-chip";
      btn.textContent = term;
      btn.addEventListener("click", () => {
        applyTermPreset(term);
      });
      els.guideExamples.appendChild(btn);
    });
  }

  function renderEmptyExamples() {
    const dict = i18n[state.lang] || i18n.en;
    if (!els.emptyTermExamples || !els.emptyActionExamples) return;
    els.emptyTermExamples.innerHTML = "";
    els.emptyActionExamples.innerHTML = "";

    const termPresets = Array.isArray(dict.termPresets) ? dict.termPresets : [];
    termPresets.forEach((term) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.textContent = term;
      btn.addEventListener("click", () => applyTermPreset(term));
      els.emptyTermExamples.appendChild(btn);
    });

    const actionPresets = Array.isArray(dict.actionPresets) ? dict.actionPresets : [];
    actionPresets.forEach((actionId) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      const label = labelOf(db.actionsMap.get(normalizeActionId(actionId)), state.lang);
      btn.textContent = label || actionId;
      btn.addEventListener("click", () => applyActionPreset(actionId));
      els.emptyActionExamples.appendChild(btn);
    });
  }

  function updateGuideVisibility(resultCount) {
    if (!els.quickGuide) return;
    const hasFilters = Boolean(state.q || state.cat || (state.actions && state.actions.length));
    els.quickGuide.hidden = hasFilters || resultCount === 0;
  }

  /* -----------------------------
     Debug UI
  ------------------------------ */

  function setupDebugUi() {
    if (els.debugWrap) return;
    const anchor = document.querySelector(".controls") || document.querySelector(".topbar");
    if (!anchor) return;

    const banner = document.createElement("div");
    banner.id = "debugIndexErrorBanner";
    banner.hidden = true;
    banner.style.cssText = [
      "margin: 10px 0",
      "padding: 10px 12px",
      "border: 1px solid var(--danger-border)",
      "background: var(--danger-bg)",
      "color: var(--danger-text)",
      "border-radius: 8px",
      "font-size: 13px",
      "line-height: 1.5",
      "white-space: pre-wrap",
    ].join(";");

    const wrap = document.createElement("section");
    wrap.id = "debugWrap";
    wrap.setAttribute("aria-label", "Status / Debug");
    wrap.style.cssText = ["margin: 10px 0 16px", "display: grid", "gap: 8px"].join(";");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "debugToggle";
    toggle.style.cssText = [
      "align-self: start",
      "font-size: 12px",
      "padding: 4px 8px",
      "border-radius: 999px",
      "border: 1px solid var(--debug-border)",
      "background: var(--debug-bg)",
      "color: var(--text)",
      "cursor: pointer",
    ].join(";");

    const panel = document.createElement("div");
    panel.id = "debugPanel";
    panel.hidden = !state.debug;
    panel.style.cssText = [
      "border: 1px dashed var(--debug-border)",
      "background: var(--debug-panel-bg)",
      "border-radius: 10px",
      "padding: 12px",
      "font-size: 12px",
      "line-height: 1.5",
    ].join(";");

    const title = document.createElement("div");
    title.style.cssText = ["font-weight: 600", "margin-bottom: 6px"].join(";");

    const summary = document.createElement("dl");
    summary.style.cssText = [
      "display: grid",
      "grid-template-columns: max-content 1fr",
      "gap: 4px 12px",
      "margin: 0 0 8px",
    ].join(";");

    const indexUrlValue = createDebugRow(summary);
    const packsResolvedValue = createDebugRow(summary);
    const loadedEntriesValue = createDebugRow(summary);
    const failedPacksValue = createDebugRow(summary);

    const indexErrorWrap = document.createElement("div");
    indexErrorWrap.style.cssText = [
      "margin: 8px 0",
      "padding: 8px",
      "border: 1px solid var(--danger-border-soft)",
      "background: var(--danger-bg-soft)",
      "border-radius: 8px",
      "white-space: pre-wrap",
    ].join(";");
    indexErrorWrap.hidden = true;
    const indexErrorTitle = document.createElement("div");
    indexErrorTitle.style.cssText = ["font-weight: 600", "margin-bottom: 4px"].join(";");
    const indexErrorValue = document.createElement("div");
    indexErrorWrap.append(indexErrorTitle, indexErrorValue);

    const failuresWrap = document.createElement("div");
    failuresWrap.style.cssText = ["margin-top: 8px"].join(";");
    failuresWrap.hidden = true;
    const failuresTitle = document.createElement("div");
    failuresTitle.style.cssText = ["font-weight: 600", "margin-bottom: 4px"].join(";");
    const failuresList = document.createElement("ul");
    failuresList.style.cssText = ["margin: 0", "padding-left: 18px"].join(";");
    failuresWrap.append(failuresTitle, failuresList);

    panel.append(title, summary, indexErrorWrap, failuresWrap);
    wrap.append(toggle, panel);

    anchor.insertAdjacentElement("afterend", wrap);
    wrap.insertAdjacentElement("beforebegin", banner);

    toggle.addEventListener("click", () => {
      setDebugOpen(!state.debug, { updateUrl: true });
    });

    els.debugWrap = wrap;
    els.debugToggle = toggle;
    els.debugPanel = panel;
    els.debugTitle = title;
    els.debugIndexUrlValue = indexUrlValue;
    els.debugPacksResolvedValue = packsResolvedValue;
    els.debugLoadedEntriesValue = loadedEntriesValue;
    els.debugFailedPacksValue = failedPacksValue;
    els.debugFailuresWrap = failuresWrap;
    els.debugFailuresTitle = failuresTitle;
    els.debugFailuresList = failuresList;
    els.debugIndexErrorWrap = indexErrorWrap;
    els.debugIndexErrorTitle = indexErrorTitle;
    els.debugIndexErrorValue = indexErrorValue;
    els.debugIndexErrorBanner = banner;
  }

  function createDebugRow(summary) {
    const dt = document.createElement("dt");
    dt.style.cssText = ["font-weight: 600"].join(";");
    const dd = document.createElement("dd");
    dd.style.cssText = ["margin: 0", "word-break: break-all"].join(";");
    summary.append(dt, dd);
    return { dt, dd };
  }

  function applyDebugI18n(dict) {
    if (els.debugToggle) {
      els.debugToggle.textContent = dict.debugToggle;
      els.debugToggle.setAttribute("aria-pressed", String(state.debug));
    }
    if (els.debugTitle) els.debugTitle.textContent = dict.debugTitle;

    if (els.debugIndexUrlValue?.dt) els.debugIndexUrlValue.dt.textContent = dict.debugIndexUrl;
    if (els.debugPacksResolvedValue?.dt)
      els.debugPacksResolvedValue.dt.textContent = dict.debugPacksResolved;
    if (els.debugLoadedEntriesValue?.dt)
      els.debugLoadedEntriesValue.dt.textContent = dict.debugLoadedEntries;
    if (els.debugFailedPacksValue?.dt)
      els.debugFailedPacksValue.dt.textContent = dict.debugFailedPacks;

    if (els.debugFailuresTitle) els.debugFailuresTitle.textContent = dict.debugFailuresTitle;
    if (els.debugIndexErrorTitle) els.debugIndexErrorTitle.textContent = dict.debugIndexErrorTitle;
  }

  function resetDebugInfo() {
    debugInfo.indexUrl = INDEX_URL;
    debugInfo.packsResolved = 0;
    debugInfo.loadedEntries = 0;
    debugInfo.failedPacks = 0;
    debugInfo.failures = [];
    debugInfo.indexError = null;
    state.dataEmpty = false;
    updateDebugPanel();
    if (els.debugIndexErrorBanner) els.debugIndexErrorBanner.hidden = true;
  }

  function updateDebugPanel() {
    if (els.debugIndexUrlValue?.dd) els.debugIndexUrlValue.dd.textContent = debugInfo.indexUrl;
    if (els.debugPacksResolvedValue?.dd)
      els.debugPacksResolvedValue.dd.textContent = String(debugInfo.packsResolved);
    if (els.debugLoadedEntriesValue?.dd)
      els.debugLoadedEntriesValue.dd.textContent = String(debugInfo.loadedEntries);
    if (els.debugFailedPacksValue?.dd)
      els.debugFailedPacksValue.dd.textContent = String(debugInfo.failedPacks);

    if (els.debugIndexErrorWrap && els.debugIndexErrorValue) {
      if (debugInfo.indexError) {
        els.debugIndexErrorWrap.hidden = false;
        els.debugIndexErrorValue.textContent = formatErrorShort(debugInfo.indexError);
      } else {
        els.debugIndexErrorWrap.hidden = true;
        els.debugIndexErrorValue.textContent = "";
      }
    }

    if (els.debugFailuresWrap && els.debugFailuresList) {
      if (debugInfo.failures.length > 0) {
        els.debugFailuresWrap.hidden = false;
        els.debugFailuresList.innerHTML = "";
        debugInfo.failures.forEach((failure) => {
          const li = document.createElement("li");
          li.textContent = `${failure.url} — ${formatErrorShort(failure.err)}`;
          els.debugFailuresList.appendChild(li);
        });
      } else {
        els.debugFailuresWrap.hidden = true;
        els.debugFailuresList.innerHTML = "";
      }
    }
  }

  function setDebugOpen(open, { updateUrl } = {}) {
    state.debug = Boolean(open);
    if (els.debugPanel) els.debugPanel.hidden = !state.debug;
    if (els.debugToggle) els.debugToggle.setAttribute("aria-pressed", String(state.debug));
    if (updateUrl) pushStateToUrl();
  }

  function handleIndexError(error) {
    debugInfo.indexError = error;
    debugInfo.loadedEntries = 0;
    updateDebugPanel();
    handleEmptyData();

    const dict = i18n[state.lang] || i18n.en;
    if (els.debugIndexErrorBanner) {
      els.debugIndexErrorBanner.hidden = false;
      els.debugIndexErrorBanner.textContent = `${dict.debugIndexErrorBanner}\n${INDEX_URL}\n${formatErrorShort(
        error
      )}`;
    }
  }

  function handleEmptyData() {
    state.dataEmpty = true;
    setDebugOpen(true, { updateUrl: false });
  }

  function formatErrorShort(error) {
    const raw = error?.message || String(error || "");
    return raw.replace(/\s+/g, " ").trim().slice(0, 180);
  }

  function formatResultCount(count, dict) {
    const template = dict?.resultCount || "{n}";
    return template.replace("{n}", String(count));
  }
})();
