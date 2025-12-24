/* =========================================================
   Construction Tools & Slang Atlas (NicheWorks)
   - Static data: data/index.json + data/packs/*.json
   - Features: q search, category filter, task filter, JA/EN, list->detail,
               URL state (q, cat, task, id, lang)
   - Robust: base-url fix, JSON-vs-HTML detection, pack file path fix
   - UX: active selection, ESC close, detail chips, no global collisions
   ========================================================= */

(() => {
  const state = {
    lang: "en", // HTML default is en; URL overrides
    q: "",
    cat: "",
    task: "",
    id: "",
  };

  const db = {
    index: null,
    categories: [],
    tasks: [],
    categoriesMap: new Map(),
    tasksMap: new Map(),
    entries: [],
    entriesById: new Map(),
  };

  const els = {
    // lang toggle
    langToggle: document.getElementById("langToggle"),

    // hero
    eyebrow: document.getElementById("eyebrow"),
    heroTitle: document.getElementById("heroTitle"),
    heroLede: document.getElementById("heroLede"),

    // controls
    searchLabel: document.getElementById("searchLabel"),
    searchInput: document.getElementById("searchInput"),
    categoryLabel: document.getElementById("categoryLabel"),
    categorySelect: document.getElementById("categorySelect"),
    taskLabel: document.getElementById("taskLabel"),
    taskSelect: document.getElementById("taskSelect"),

    // results
    resultsTitle: document.getElementById("resultsTitle"),
    resultCount: document.getElementById("resultCount"),
    resultsList: document.getElementById("results"),
    emptyState: document.getElementById("emptyState"),

    // detail
    detailPlaceholder: document.getElementById("detailPlaceholder"),
    detail: document.getElementById("detail"),
    detailCategory: document.getElementById("detailCategory"),
    detailTitle: document.getElementById("detailTitle"),
    detailSubtitle: document.getElementById("detailSubtitle"),
    detailDescription: document.getElementById("detailDescription"),

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
  };

  const i18n = {
    en: {
      eyebrow: "Construction Tools & Slang Atlas",
      heroTitle: "Browse, search, and learn core field terms.",
      heroLede: "Quickly find terminology, tools, and work processes across categories.",
      searchLabel: "Search",
      searchPh: "Search tools, slang, descriptions",
      categoryLabel: "Category",
      taskLabel: "Task",
      resultsTitle: "Results",
      emptyState: "No results found. Try a different keyword or filter.",
      detailPlaceholder: "Select an entry to view details.",
      taskAll: "All tasks",
      catAll: "All categories",
      taskMeta: "Task",
      aliasesMeta: "Aliases",
      tagsMeta: "Tags",
      idMeta: "ID",
      dash: "—",
      failed: "Failed to load data. See console.",
    },
    ja: {
      eyebrow: "建設ツール＆スラング辞典",
      heroTitle: "現場用語を、探して、すぐ理解する。",
      heroLede: "カテゴリ横断で、用語・道具・作業プロセスを検索できます。",
      searchLabel: "検索",
      searchPh: "用語 / スラング / 説明を検索",
      categoryLabel: "カテゴリ",
      taskLabel: "Task",
      resultsTitle: "結果",
      emptyState: "該当する結果がありません。キーワードやフィルタを変えてください。",
      detailPlaceholder: "項目を選択すると詳細が表示されます。",
      taskAll: "すべてのTask",
      catAll: "すべてのカテゴリ",
      taskMeta: "Task",
      aliasesMeta: "別名",
      tagsMeta: "タグ",
      idMeta: "ID",
      dash: "—",
      failed: "データの読み込みに失敗しました（コンソール参照）",
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
      els.emptyState.textContent = dict.failed;
    }
  });

  async function init() {
    readUrlToState();
    bindEvents();
    await loadAllData();

    sanitizeStateAgainstDefs();
    applyI18n();
    renderFilters();
    renderList();

    if (state.id && db.entriesById.has(state.id)) openDetail(state.id, { pushUrl: false });
    else closeDetail({ pushUrl: false });
  }

  function bindEvents() {
    els.langToggle?.addEventListener("click", () => {
      setLang(state.lang === "ja" ? "en" : "ja");
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

    els.taskSelect?.addEventListener("change", (e) => {
      state.task = e.target.value || "";
      state.id = "";
      pushStateToUrl();
      renderList();
      closeDetail({ pushUrl: false });
    });

    // ESC close
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDetail({ pushUrl: true });
    });

    window.addEventListener("popstate", () => {
      readUrlToState();
      sanitizeStateAgainstDefs();
      applyI18n();
      applyStateToControls();
      renderFilters();
      renderList();

      if (state.id && db.entriesById.has(state.id)) openDetail(state.id, { pushUrl: false });
      else closeDetail({ pushUrl: false });
    });
  }

  /* -----------------------------
     Data loading
  ------------------------------ */

  async function loadAllData() {
    const index = await fetchJson(INDEX_URL);
    db.index = index;

    db.categories = normalizeDefList(index.categories);
    db.tasks = normalizeDefList(index.tasks);

    db.categoriesMap = new Map(db.categories.map((c) => [c.id, c]));
    db.tasksMap = new Map(db.tasks.map((t) => [t.id, t]));

    const packs = Array.isArray(index.packs) ? index.packs : [];
    const packUrls = packs.map((p) => resolvePackUrl(p?.file)).filter(Boolean);

    if (packUrls.length === 0) {
      throw new Error(`No pack URLs resolved. Check index.json packs[].file.\nINDEX_URL=${INDEX_URL}`);
    }

    const settled = await Promise.allSettled(packUrls.map((u) => fetchJson(u)));

    const okJsons = [];
    const errors = [];
    settled.forEach((r, i) => {
      if (r.status === "fulfilled") okJsons.push(r.value);
      else errors.push({ url: packUrls[i], err: r.reason });
    });
    if (errors.length) console.error("[packs] some failed:", errors);

    const entries = okJsons.flatMap((pj) => {
      if (Array.isArray(pj)) return pj;
      if (pj && Array.isArray(pj.entries)) return pj.entries;
      return [];
    });

    db.entries = entries.filter((e) => e && typeof e.id === "string" && e.id.trim().length > 0);
    db.entriesById = new Map(db.entries.map((e) => [e.id, e]));

    if (db.entries.length === 0) {
      throw new Error("No entries loaded from packs.");
    }
  }

  /* -----------------------------
     I18n + UI
  ------------------------------ */

  function applyI18n() {
    const dict = i18n[state.lang] || i18n.en;

    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-lang", state.lang);

    if (els.eyebrow) els.eyebrow.textContent = dict.eyebrow;
    if (els.heroTitle) els.heroTitle.textContent = dict.heroTitle;
    if (els.heroLede) els.heroLede.textContent = dict.heroLede;

    if (els.searchLabel) els.searchLabel.textContent = dict.searchLabel;
    if (els.categoryLabel) els.categoryLabel.textContent = dict.categoryLabel;
    if (els.taskLabel) els.taskLabel.textContent = dict.taskLabel;
    if (els.resultsTitle) els.resultsTitle.textContent = dict.resultsTitle;

    if (els.searchInput) els.searchInput.placeholder = dict.searchPh;

    if (els.emptyState) els.emptyState.textContent = dict.emptyState;
    if (els.detailPlaceholder) els.detailPlaceholder.textContent = dict.detailPlaceholder;

    if (els.detailTasksLabel) els.detailTasksLabel.textContent = dict.taskMeta;
    if (els.detailAliasesLabel) els.detailAliasesLabel.textContent = dict.aliasesMeta;
    if (els.detailTagsLabel) els.detailTagsLabel.textContent = dict.tagsMeta;
    if (els.detailIdLabel) els.detailIdLabel.textContent = dict.idMeta;
  }

  function applyStateToControls() {
    if (els.searchInput) els.searchInput.value = state.q || "";
    if (els.categorySelect) els.categorySelect.value = state.cat || "";
    if (els.taskSelect) els.taskSelect.value = state.task || "";
  }

  function renderFilters() {
    renderCategorySelect();
    renderTaskSelect();
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
  }

  function renderTaskSelect() {
    if (!els.taskSelect) return;
    const dict = i18n[state.lang] || i18n.en;

    const current = state.task || "";
    const allOpt =
      els.taskSelect.querySelector("#taskDefaultOption") ||
      document.createElement("option");
    allOpt.id = "taskDefaultOption";
    allOpt.value = "";
    allOpt.textContent = dict.taskAll;

    els.taskSelect.innerHTML = "";
    els.taskSelect.appendChild(allOpt);

    const sorted = [...db.tasks].sort((a, b) =>
      labelOf(a, state.lang).localeCompare(labelOf(b, state.lang))
    );
    for (const t of sorted) {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = labelOf(t, state.lang);
      els.taskSelect.appendChild(opt);
    }

    els.taskSelect.value = current;
    state.task = els.taskSelect.value || "";
  }

  /* -----------------------------
     List / Detail
  ------------------------------ */

  function renderList() {
    const results = getFilteredEntries();

    if (els.resultCount) els.resultCount.textContent = String(results.length);
    if (els.emptyState) els.emptyState.hidden = results.length !== 0;

    if (!els.resultsList) return;
    els.resultsList.innerHTML = "";

    if (results.length === 0) return;

    const frag = document.createDocumentFragment();
    for (const e of results) frag.appendChild(renderResultItem(e));
    els.resultsList.appendChild(frag);

    // keep active highlight on re-render
    if (state.id) updateActiveCard(state.id);
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
    for (const id of catIds) {
      const def = db.categoriesMap.get(id);
      tags.appendChild(renderTag(def ? labelOf(def, state.lang) : id));
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

    if (els.detailPlaceholder) els.detailPlaceholder.hidden = true;
    if (els.detail) els.detail.hidden = false;

    const dict = i18n[state.lang] || i18n.en;

    const termJa = termOf(entry, "ja");
    const termEn = termOf(entry, "en");
    const termCurrent = termOf(entry, state.lang);

    if (els.detailTitle) els.detailTitle.textContent = termCurrent || entry.id || dict.dash;
    if (els.detailSubtitle) {
      if (termJa && termEn) els.detailSubtitle.textContent = `${termJa} / ${termEn}`;
      else els.detailSubtitle.textContent = termJa || termEn || dict.dash;
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

    // task labels
    const taskLabels = normalizeEntryTaskIds(entry)
      .map((tid) => db.tasksMap.get(tid))
      .filter(Boolean)
      .map((def) => labelOf(def, state.lang));
    setDetailListText(els.detailTasks, taskLabels);

    // aliases for current lang
    setDetailListText(els.detailAliases, aliasesListForLang(entry, state.lang));

    // tags (raw)
    setDetailListText(els.detailTags, tagsList(entry));

    if (els.detailId) els.detailId.textContent = entry.id || dict.dash;
  }

  function closeDetail({ pushUrl }) {
    state.id = "";
    if (pushUrl) pushStateToUrl();

    updateActiveCard(""); // remove highlight

    if (els.detail) els.detail.hidden = true;
    if (els.detailPlaceholder) els.detailPlaceholder.hidden = false;
  }

  /* -----------------------------
     Filtering
  ------------------------------ */

  function getFilteredEntries() {
    const q = (state.q || "").trim().toLowerCase();
    const cat = state.cat || "";
    const task = state.task || "";

    return db.entries.filter((e) => {
      if (cat) {
        const cats = normalizeEntryCategoryIds(e);
        if (!cats.includes(cat)) return false;
      }
      if (task) {
        const tasks = normalizeEntryTaskIds(e);
        if (!tasks.includes(task)) return false;
      }
      if (q) {
        if (!matchesQuery(e, q)) return false;
      }
      return true;
    });
  }

  function matchesQuery(entry, qLower) {
    const hay = [];

    const tja = termOf(entry, "ja");
    const ten = termOf(entry, "en");
    if (tja) hay.push(tja);
    if (ten) hay.push(ten);

    const a = entry.aliases || entry.alias || {};
    if (Array.isArray(a.ja)) hay.push(...a.ja);
    if (Array.isArray(a.en)) hay.push(...a.en);
    if (Array.isArray(a)) hay.push(...a);

    const d = entry.description || {};
    if (d.ja) hay.push(d.ja);
    if (d.en) hay.push(d.en);

    if (Array.isArray(entry.fuzzy)) hay.push(...entry.fuzzy);
    if (Array.isArray(entry.tags)) hay.push(...entry.tags);

    return hay.join(" ").toLowerCase().includes(qLower);
  }

  /* -----------------------------
     Normalizers / helpers
  ------------------------------ */

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

  function termOf(entry, lang) {
    const t = entry.term || entry.title || {};
    const raw = t?.[lang];
    if (raw) return raw;
    return t?.en || t?.ja || entry.id || "";
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

  function tagsList(entry) {
    if (Array.isArray(entry?.tags)) return uniq(entry.tags);
    return [];
  }

  function sanitizeStateAgainstDefs() {
    if (state.cat && !db.categoriesMap.has(state.cat)) state.cat = "";
    if (state.task && !db.tasksMap.has(state.task)) state.task = "";
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

    const htmlLang = document.documentElement.getAttribute("data-lang");
    const lang = sp.get("lang") || htmlLang || "en";
    state.lang = lang === "ja" ? "ja" : "en";

    state.q = (sp.get("q") || "").trim();
    state.cat = sp.get("cat") || "";
    state.task = sp.get("task") || "";
    state.id = sp.get("id") || "";

    applyStateToControls();
  }

  function pushStateToUrl() {
    const sp = new URLSearchParams();

    // default en
    if (state.lang && state.lang !== "en") sp.set("lang", state.lang);
    if (state.q) sp.set("q", state.q);
    if (state.cat) sp.set("cat", state.cat);
    if (state.task) sp.set("task", state.task);
    if (state.id) sp.set("id", state.id);

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
})();
