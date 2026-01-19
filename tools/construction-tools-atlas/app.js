(() => {
  "use strict";

  const $ = (q, el=document) => el.querySelector(q);
  const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

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
    categoryBtn: $("#categoryBtn"),
    taskBtn: $("#taskBtn"),

    resultCount: $("#resultCount"),
    hintText: $("#hintText"),
    resultList: $("#resultList"),

    // sheets
    detailSheet: $("#detailSheet"),
    detailClose: $("#detailClose"),
    detailTitle: $("#detailTitle"),
    detailStar: $("#detailStar"),
    detailChips: $("#detailChips"),
    detailTerms: $("#detailTerms"),
    detailDesc: $("#detailDesc"),
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

    filterSheet: $("#filterSheet"),
    filterTitle: $("#filterTitle"),
    filterDesc: $("#filterDesc"),
    filterClose: $("#filterClose"),
    filterItems: $("#filterItems"),

    donationData: $(".donation-data"),
  };

  const LS = {
    theme: "cta_theme",
    uiLang: "cta_uilang",
    favs: "cta_favs",
    action: "cta_action",
    category: "cta_category",
    task: "cta_task",
  };

  const state = {
    theme: (localStorage.getItem(LS.theme) || "light"),
    uiLang: (localStorage.getItem(LS.uiLang) || "ja"), // affects description/labels (title always shows both)
    q: "",
    action: (localStorage.getItem(LS.action) || "all"),
    category: (localStorage.getItem(LS.category) || "all"),
    task: (localStorage.getItem(LS.task) || "all"),
    favs: new Set(safeJson(localStorage.getItem(LS.favs), [])),
    entries: [],
    filtered: [],
    current: null,
  };
  let lockCount = 0;

  function safeJson(s, fallback){
    try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
  }
  function saveFavs(){
    localStorage.setItem(LS.favs, JSON.stringify(Array.from(state.favs)));
  }
  function setTheme(theme){
    state.theme = theme;
    els.html.setAttribute("data-theme", theme);
    localStorage.setItem(LS.theme, theme);
    els.themeBtn.textContent = theme === "light" ? "☼" : "☾";
  }
  function toggleTheme(){
    setTheme(state.theme === "light" ? "dark" : "light");
  }
  function toggleLang(){
  // CTA_FIX_LANG_TOGGLE_DO_NOT_OPEN_DETAIL
  // 言語切替で「閉じているdetail」を勝手に開かない。開いていた場合のみ維持。
  const wasDetailOpen = els.detailSheet && !els.detailSheet.hidden;

  state.uiLang = state.uiLang === "ja" ? "en" : "ja";
  localStorage.setItem(LS.uiLang, state.uiLang);

  render();

  if (wasDetailOpen && state.current) {
    openDetail(state.current.id, { keepScroll: true });
  }
}

  function applyScrollLock(){
    const y = window.scrollY;
    document.body.dataset.scrollY = String(y);
    document.body.classList.add("is-locked");
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }
  function clearScrollLock(){
    const y = Number(document.body.dataset.scrollY || "0");
    document.body.classList.remove("is-locked");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    delete document.body.dataset.scrollY;
    window.scrollTo(0, y);
  }
  function lockScroll(){
    lockCount += 1;
    if (lockCount === 1) applyScrollLock();
  }
  function unlockScroll(){
    lockCount -= 1;
    if (lockCount <= 0) {
      lockCount = 0;
      clearScrollLock();
    }
  }
  function showOverlay(show){
    els.overlay.hidden = !show;
  }
  function openSheet(sheetEl){
    if (!sheetEl) return;
    closeAllSheets();
    showOverlay(true);
    sheetEl.hidden = false;
    lockScroll();
  }
  function closeSheet(sheetEl){
    if (!sheetEl) return;
    sheetEl.hidden = true;
    const anyOpen = [
      els.detailSheet,
      els.supportSheet,
      els.filterSheet,
      els.menuSheet,
      els.howtoSheet,
    ].some((el) => el && !el.hidden);
    showOverlay(anyOpen);
    if (!anyOpen) unlockScroll();
  }
  function closeAllSheets(){
    if (els.detailSheet) els.detailSheet.hidden = true;
    if (els.supportSheet) els.supportSheet.hidden = true;
    if (els.filterSheet) els.filterSheet.hidden = true;
    if (els.menuSheet) els.menuSheet.hidden = true;
    if (els.howtoSheet) els.howtoSheet.hidden = true;
    showOverlay(false);
    unlockScroll();
  }

  function donationLinks(){
    const ofuse = els.donationData?.dataset?.ofuse || "";
    const kofi = els.donationData?.dataset?.kofi || "";
    return { ofuse, kofi };
  }
  function applySupportLinks(){
    const { ofuse, kofi } = donationLinks();
    els.ofuseLink.href = ofuse || "#";
    els.kofiLink.href = kofi || "#";
    els.supportNote.textContent = state.uiLang === "ja"
      ? "応援（寄付）リンクを開きます。ありがとうございます。"
      : "Opens support links in a new tab. Thank you!";
  }

  function hasSupportElements(){
    return [
      els.supportBtn,
      els.supportSheet,
      els.supportClose,
      els.supportInlineBtn,
      els.ofuseLink,
      els.kofiLink,
      els.supportNote,
    ].every(Boolean);
  }

  function initSupport(){
    if (!hasSupportElements()) return;
    applySupportLinks();
    els.supportBtn.addEventListener("click", () => openSheet(els.supportSheet));
    els.supportClose.addEventListener("click", closeAllSheets);
    els.supportInlineBtn.addEventListener("click", () => openSheet(els.supportSheet));
  }

  // ---- Data loading (tries multiple likely paths) ----
  async function fetchJsonAny(paths){
    let lastErr = null;
    for (const p of paths){
      try{
        const r = await fetch(p, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status} for ${p}`);
        return await r.json();
      }catch(e){ lastErr = e; }
    }
    throw lastErr || new Error("fetch failed");
  }

  function normalize(raw){
    const arr = Array.isArray(raw) ? raw
      : Array.isArray(raw?.entries) ? raw.entries
      : Array.isArray(raw?.data) ? raw.data
      : [];

    return arr.map((x, i) => {
      const id = x?.id || x?.slug || `entry_${i}`;
      const termJa = x?.term?.ja || x?.ja || x?.jp || "";
      const termEn = x?.term?.en || x?.en || "";
      const descJa = x?.description?.ja || x?.desc?.ja || x?.definition?.ja || x?.description_ja || "";
      const descEn = x?.description?.en || x?.desc?.en || x?.definition?.en || x?.description_en || "";
      const aliasesJa = (x?.aliases?.ja || x?.alias?.ja || x?.aliases_ja || []).filter(Boolean);
      const aliasesEn = (x?.aliases?.en || x?.alias?.en || x?.aliases_en || []).filter(Boolean);
      const categories = (x?.categories || x?.category || []).flat().filter(Boolean);
      const tasks = (x?.tasks || x?.task || []).flat().filter(Boolean);
      const region = (x?.region || []).flat().filter(Boolean);
      const fuzzy = (x?.fuzzy || []).flat().filter(Boolean);
      const type = x?.type || "";

      return { id, termJa, termEn, descJa, descEn, aliasesJa, aliasesEn, categories, tasks, region, fuzzy, type, _raw:x };
    });
  }

  // ---- Filtering ----
  const ACTIONS = [
    { id: "all", label: { ja: "All", en: "All" }, match: () => true },
    { id: "cut", label: { ja: "Cut", en: "Cut" }, match: (e) => hasAny(e, ["cut", "cutting", "saw", "切断"]) },
    { id: "fasten", label: { ja: "Fasten", en: "Fasten" }, match: (e) => hasAny(e, ["fasten", "fastening", "bolt", "screw", "締付"]) },
    { id: "measure", label: { ja: "Measure", en: "Measure" }, match: (e) => hasAny(e, ["measure", "measuring", "level", "plumb", "計測"]) },
    { id: "drill", label: { ja: "Drill", en: "Drill" }, match: (e) => hasAny(e, ["drill", "boring", "穴あけ"]) },
  ];

  function hasAny(e, tokens){
    const hay = [
      e.termJa, e.termEn,
      e.descJa, e.descEn,
      ...(e.aliasesJa||[]), ...(e.aliasesEn||[]),
      ...(e.categories||[]), ...(e.tasks||[]), ...(e.fuzzy||[])
    ].join(" ").toLowerCase();
    return tokens.some(t => hay.includes(String(t).toLowerCase()));
  }

  function matchQuery(e, q){
    if (!q) return true;
    const s = q.trim().toLowerCase();
    if (!s) return true;
    const hay = [
      e.termJa, e.termEn,
      e.descJa, e.descEn,
      ...(e.aliasesJa||[]), ...(e.aliasesEn||[]),
      ...(e.categories||[]), ...(e.tasks||[]), ...(e.fuzzy||[])
    ].join("\n").toLowerCase();
    // split by spaces for AND match (simple)
    return s.split(/\s+/).every(tok => hay.includes(tok));
  }

  function primaryChip(e){
    // prefer action chip if matched
    const a = ACTIONS.find(x => x.id !== "all" && x.match(e));
    if (a) return a.label.en; // chip text is short
    // else category/task fallback
    return (e.categories?.[0] || e.tasks?.[0] || e.type || "—").toString();
  }

  function filterEntries(){
    const q = state.q;
    const action = state.action;
    const category = state.category;
    const task = state.task;

    state.filtered = state.entries.filter(e => {
      if (!matchQuery(e, q)) return false;
      if (action !== "all") {
        const a = ACTIONS.find(x => x.id === action);
        if (a && !a.match(e)) return false;
      }
      if (category !== "all" && !(e.categories||[]).includes(category)) return false;
      if (task !== "all" && !(e.tasks||[]).includes(task)) return false;
      return true;
    });
  }

  // ---- Render ----
  function renderActionChips(){
    els.actionChips.innerHTML = "";
    for (const a of ACTIONS){
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pillbtn" + (state.action === a.id ? " pillbtn--accent" : "");
      b.textContent = a.label.en; // UI wants compact; label kept EN
      b.addEventListener("click", () => {
        state.action = a.id;
        localStorage.setItem(LS.action, a.id);
        render();
      });
      els.actionChips.appendChild(b);
    }
  }

  function rowTitle(e){
    const en = e.termEn?.trim() || "—";
    const ja = e.termJa?.trim() || "—";
    return `${en} / ${ja}`;
  }
  function rowDesc(e){
    const d = state.uiLang === "ja" ? (e.descJa || e.descEn) : (e.descEn || e.descJa);
    return (d || "").trim() || (state.uiLang === "ja" ? "（説明なし）" : "(no description)");
  }

  function renderList(){
    els.resultList.innerHTML = "";

    const frag = document.createDocumentFragment();
    for (const e of state.filtered){
      const row = document.createElement("div");
      row.className = "row";
      row.setAttribute("role", "listitem");
      row.tabIndex = 0;

      const main = document.createElement("div");
      main.className = "row__main";

      const title = document.createElement("div");
      title.className = "row__title";
      title.textContent = rowTitle(e);

      const desc = document.createElement("div");
      desc.className = "row__desc";
      desc.textContent = rowDesc(e);

      const meta = document.createElement("div");
      meta.className = "row__meta";
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = primaryChip(e);
      meta.appendChild(chip);

      main.appendChild(title);
      main.appendChild(desc);
      main.appendChild(meta);

      const star = document.createElement("button");
      star.type = "button";
      star.className = "starbtn";
      const isFav = state.favs.has(e.id);
      star.textContent = isFav ? "★" : "☆";
      star.setAttribute("aria-label", isFav ? "Unfavorite" : "Favorite");

      star.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (state.favs.has(e.id)) state.favs.delete(e.id);
        else state.favs.add(e.id);
        saveFavs();
        star.textContent = state.favs.has(e.id) ? "★" : "☆";
        if (state.current && state.current.id === e.id){
          els.detailStar.textContent = star.textContent;
        }
      });

      row.addEventListener("click", () => openDetail(e.id));
      row.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") openDetail(e.id);
      });

      row.appendChild(main);
      row.appendChild(star);
      frag.appendChild(row);
    }
    els.resultList.appendChild(frag);

    els.resultCount.textContent = `Results: ${state.filtered.length}`;
    els.hintText.textContent = state.filtered.length === 0
      ? (state.uiLang === "ja" ? "一致する用語がありません" : "No matches")
      : "";
  }

  function setActiveTab(name){
    $$(".tab", els.detailTabs).forEach(btn => {
      btn.classList.toggle("tab--active", btn.dataset.tab === name);
    });
    els.tabMeaning.hidden = name !== "meaning";
    els.tabExamples.hidden = name !== "examples";
    els.tabAliases.hidden = name !== "aliases";
    els.tabMeta.hidden = name !== "meta";
  }

  function openDetail(id){
    const e = state.entries.find(x => x.id === id);
    if (!e) return;
    state.current = e;

    els.detailTitle.textContent = state.uiLang === "ja" ? "詳細" : "Detail";
    els.detailStar.textContent = state.favs.has(e.id) ? "★" : "☆";

    // chips (categories/tasks/type)
    els.detailChips.innerHTML = "";
    const chipTexts = []
      .concat(e.type ? [e.type] : [])
      .concat(e.categories || [])
      .concat(e.tasks || []);
    chipTexts.slice(0, 8).forEach(t => {
      const s = document.createElement("span");
      s.className = "chip";
      s.textContent = String(t);
      els.detailChips.appendChild(s);
    });

    // term block
    els.detailTerms.textContent = `${(e.termJa||"—")} / ${(e.termEn||"—")}`;
    const best = rowDesc(e);
    els.detailDesc.textContent = best;

    // tabs content
    const ja = (e.descJa || "").trim();
    const en = (e.descEn || "").trim();

    els.tabMeaning.innerHTML = `
      <div class="kv"><div class="kv__k">JP</div><div class="kv__v">${escapeHtml(ja || "—")}</div></div>
      <div class="kv"><div class="kv__k">EN</div><div class="kv__v">${escapeHtml(en || "—")}</div></div>
    `;

    els.tabExamples.innerHTML = `
      <div class="muted">${state.uiLang === "ja" ? "（例文は未整備。データが入れば表示します）" : "(Examples not available yet. Will show when data exists.)"}</div>
    `;

    const aj = (e.aliasesJa||[]).map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join(" ");
    const ae = (e.aliasesEn||[]).map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join(" ");
    els.tabAliases.innerHTML = `
      <div class="kv"><div class="kv__k">JP aliases</div><div class="kv__v">${aj || "—"}</div></div>
      <div class="kv"><div class="kv__k">EN aliases</div><div class="kv__v">${ae || "—"}</div></div>
    `;

    const cats = (e.categories||[]).join(", ") || "—";
    const tasks = (e.tasks||[]).join(", ") || "—";
    const region = (e.region||[]).join(", ") || "—";
    els.tabMeta.innerHTML = `
      <div class="kv"><div class="kv__k">id</div><div class="kv__v">${escapeHtml(e.id)}</div></div>
      <div class="kv"><div class="kv__k">type</div><div class="kv__v">${escapeHtml(e.type || "—")}</div></div>
      <div class="kv"><div class="kv__k">categories</div><div class="kv__v">${escapeHtml(cats)}</div></div>
      <div class="kv"><div class="kv__k">tasks</div><div class="kv__v">${escapeHtml(tasks)}</div></div>
      <div class="kv"><div class="kv__k">region</div><div class="kv__v">${escapeHtml(region)}</div></div>
    `;

    setActiveTab("meaning");
    openSheet(els.detailSheet);
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[c]));
  }

  function render(){
    renderActionChips();
    filterEntries();
    renderList();
  }

  // ---- Filter sheet (UI stub) ----
  function openFilter(kind){
    els.filterItems.innerHTML = "";
    const title = kind === "category" ? "Category" : "Task";
    els.filterTitle.textContent = title;

    const items = new Set(["all"]);
    for (const e of state.entries){
      const arr = kind === "category" ? (e.categories||[]) : (e.tasks||[]);
      arr.forEach(x => items.add(String(x)));
    }

    const current = kind === "category" ? state.category : state.task;

    [...items].sort((a,b)=> a==="all"?-1 : b==="all"?1 : a.localeCompare(b)).forEach(v => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pillbtn" + (v === current ? " pillbtn--accent" : "");
      b.textContent = v === "all" ? "All" : v;
      b.addEventListener("click", () => {
        if (kind === "category") {
          state.category = v;
          localStorage.setItem(LS.category, v);
        } else {
          state.task = v;
          localStorage.setItem(LS.task, v);
        }
        closeSheet(els.filterSheet);
        render();
      });
      els.filterItems.appendChild(b);
    });

    els.filterDesc.textContent = state.uiLang === "ja"
      ? "選択すると即反映します（ページスクロール維持）"
      : "Tap to apply immediately.";
    openSheet(els.filterSheet);
  }

  // ---- Events ----
  function bind(){
    setTheme(state.theme);

    els.themeBtn.addEventListener("click", toggleTheme);
    els.langBtn.addEventListener("click", toggleLang);

    els.menuBtn.addEventListener("click", () => openSheet(els.menuSheet));
    els.menuClose.addEventListener("click", closeAllSheets);
    if (els.howtoOpen) {
      els.howtoOpen.addEventListener("click", (event) => {
        event.preventDefault();
        openSheet(els.howtoSheet);
      });
    }
    if (els.howtoClose) {
      els.howtoClose.addEventListener("click", closeAllSheets);
    }

    initSupport();

    els.detailClose.addEventListener("click", closeAllSheets);
    els.detailStar.addEventListener("click", () => {
      if (!state.current) return;
      const id = state.current.id;
      if (state.favs.has(id)) state.favs.delete(id);
      else state.favs.add(id);
      saveFavs();
      els.detailStar.textContent = state.favs.has(id) ? "★" : "☆";
      // update list without losing scroll: just re-render stars by full render (simple)
      render();
    });

    els.overlay.addEventListener("click", closeAllSheets);

    els.detailTabs.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".tab");
      if (!btn) return;
      setActiveTab(btn.dataset.tab);
    });

    els.categoryBtn.addEventListener("click", () => openFilter("category"));
    els.taskBtn.addEventListener("click", () => openFilter("task"));
    els.filterClose.addEventListener("click", closeAllSheets);

    els.searchInput.addEventListener("input", () => {
      state.q = els.searchInput.value || "";
      render();
    });
    els.clearBtn.addEventListener("click", () => {
      els.searchInput.value = "";
      state.q = "";
      els.searchInput.focus();
      render();
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") closeAllSheets();
    });
  }

  async function init(){
    bind();

    // Try typical paths (tool-local first)
    const paths = [
      "./data/tools.basic.json",
      "./data/tools.json",
      "./data/dictionary.json",
      "./data.json",
      "../data/tools.basic.json",
      "../../data/tools.basic.json",
    ];

    try{
      const raw = await fetchJsonAny(paths);
      state.entries = normalize(raw);
      els.hintText.textContent = "";
    }catch(e){
      state.entries = [];
      els.hintText.textContent = state.uiLang === "ja"
        ? "データJSONが見つかりません（./data/ を確認）"
        : "Data JSON not found (check ./data/).";
      console.error(e);
    }

    render();
  }

  init();
})();
