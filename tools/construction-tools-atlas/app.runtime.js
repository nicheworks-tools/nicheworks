(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const LS = { theme: "cta_theme", lang: "cta_uilang", favs: "cta_favs", action: "cta_action", category: "cta_category", task: "cta_task" };
  const ACTIONS = [
    { id: "all", label: "All", tokens: [] },
    { id: "cut", label: "Cut", tokens: ["cut", "cutting", "saw", "切断", "切る"] },
    { id: "fasten", label: "Fasten", tokens: ["fasten", "fastening", "bolt", "screw", "締付", "固定"] },
    { id: "measure", label: "Measure", tokens: ["measure", "measurement", "level", "計測", "測定"] },
    { id: "drill", label: "Drill", tokens: ["drill", "hole", "穴あけ", "穿孔"] }
  ];
  const els = {};
  const state = {
    theme: localStorage.getItem(LS.theme) || "light",
    lang: localStorage.getItem(LS.lang) || "ja",
    q: "",
    action: localStorage.getItem(LS.action) || "all",
    category: localStorage.getItem(LS.category) || "all",
    task: localStorage.getItem(LS.task) || "all",
    favs: new Set(json(localStorage.getItem(LS.favs), [])),
    entries: [], filtered: [], visibleCount: 50, pageSize: 50, current: null
  };
  let draft = { action: state.action, category: state.category, task: state.task };

  function bindEls() {
    ["overlay","themeBtn","langBtn","menuBtn","supportBtn","searchInput","clearBtn","actionChips","filterOpenBtn","categoryBtn","taskBtn","resultCount","hintText","resultList","loadMoreWrap","loadMoreBtn","loadMoreHint","statusArea","detailSheet","detailClose","detailTitle","detailStar","detailChips","detailTerms","detailDesc","detailBullets","detailTabs","tabMeaning","tabExamples","tabAliases","tabMeta","supportInlineBtn","supportSheet","supportClose","menuSheet","menuClose","howtoOpen","howtoSheet","howtoClose","favsOnly","importFavsBtn","exportFavsBtn","filterSheet","filterClose","filterActionItems","filterCategoryItems","filterTaskItems","filterApplyBtn","filterResetBtn"].forEach((id) => { els[id] = $("#" + id); });
  }
  function json(s, f) { try { return s ? JSON.parse(s) : f; } catch (_) { return f; } }
  function str(v) { return typeof v === "string" ? v.trim() : ""; }
  function arr(v) { if (Array.isArray(v)) return v.filter(Boolean).map(String); if (typeof v === "string" && v.trim()) return [v.trim()]; return []; }
  function loc(obj, ja, en) { return { ja: str(obj?.ja) || str(ja), en: str(obj?.en) || str(en) }; }
  function pick(pair) { return state.lang === "ja" ? (pair?.ja || pair?.en || "") : (pair?.en || pair?.ja || ""); }
  function clear(n) { if (!n) return; while (n.firstChild) n.removeChild(n.firstChild); }
  function div(text, cls) { const el = document.createElement("div"); if (cls) el.className = cls; el.textContent = text || ""; return el; }
  function chip(parent, text) { const t = str(text); if (!parent || !t) return; const s = document.createElement("span"); s.className = "chip"; s.textContent = t; parent.appendChild(s); }
  function ul(parent, items, empty) { clear(parent); if (!parent) return; const values = arr(items); if (!values.length) { if (empty) parent.appendChild(div(empty, "muted")); return; } const list = document.createElement("ul"); values.forEach((v) => { const li = document.createElement("li"); li.textContent = v; list.appendChild(li); }); parent.appendChild(list); }
  function norm(v) { return String(v || "").trim().toLowerCase(); }
  function normTerm(v) { return String(v || "").toLowerCase().replace(/[\s\u3000]+/g, " ").replace(/[／]/g, "/").trim(); }
  function entryTermKey(e) { const ja = normTerm(e?.term?.ja); const en = normTerm(e?.term?.en); return ja || en ? `${ja}::${en}` : ""; }

  function normalize(raw, i) {
    const description = loc(raw?.description, raw?.description_ja, raw?.description_en);
    const detail = loc(raw?.detail, raw?.detail_ja, raw?.detail_en);
    const summary = loc(raw?.summary, raw?.summary_ja, raw?.summary_en);
    return {
      id: str(raw?.id || raw?.slug) || `entry_${i}`,
      type: str(raw?.type),
      term: loc(raw?.term, raw?.ja || raw?.jp, raw?.en),
      aliases: { ja: arr(raw?.aliases?.ja || raw?.alias?.ja || raw?.aliases_ja), en: arr(raw?.aliases?.en || raw?.alias?.en || raw?.aliases_en) },
      description: { ja: description.ja || summary.ja || detail.ja, en: description.en || summary.en || detail.en },
      summary: { ja: summary.ja || description.ja, en: summary.en || description.en },
      detail: { ja: detail.ja, en: detail.en },
      bullets: { ja: arr(raw?.bullets?.ja || raw?.bullets_ja), en: arr(raw?.bullets?.en || raw?.bullets_en) },
      examples: { ja: arr(raw?.examples?.ja || raw?.example?.ja || raw?.examples_ja || raw?.usage?.ja), en: arr(raw?.examples?.en || raw?.example?.en || raw?.examples_en || raw?.usage?.en) },
      categories: arr(raw?.categories || raw?.category), tasks: arr(raw?.tasks || raw?.task), fuzzy: arr(raw?.fuzzy), region: arr(raw?.region),
      meta: raw?.meta && typeof raw.meta === "object" ? raw.meta : {}
    };
  }
  function title(e) { return `${e.term.en || "—"} / ${e.term.ja || "—"}`; }
  function aliasLine(e) { return [...e.aliases.ja, ...e.aliases.en].filter(Boolean).join(" / "); }
  function hay(e) { return [e.id,e.type,e.term.ja,e.term.en,e.description.ja,e.description.en,e.summary.ja,e.summary.en,e.detail.ja,e.detail.en,...e.aliases.ja,...e.aliases.en,...e.categories,...e.tasks,...e.fuzzy,...e.region].join("\n").toLowerCase(); }
  function queryParts() { return norm(state.q).split(/\s+/).filter(Boolean); }
  function matchQuery(e) { const parts = queryParts(); if (!parts.length) return true; const h = hay(e); return parts.every((p) => h.includes(p)); }
  function scoreField(value, part, exact, starts, includes) {
    const v = norm(value);
    if (!v || !part) return 0;
    if (v === part) return exact;
    if (v.startsWith(part)) return starts;
    if (v.includes(part)) return includes;
    return 0;
  }
  function queryScore(e) {
    const parts = queryParts();
    if (!parts.length) return 0;
    let score = 0;
    const termFields = [e.term.ja, e.term.en];
    const aliasFields = [...e.aliases.ja, ...e.aliases.en];
    const taxonomyFields = [e.type, ...e.categories, ...e.tasks];
    const fuzzyFields = [...e.fuzzy, ...e.region];
    const bodyFields = [e.summary.ja, e.summary.en, e.description.ja, e.description.en, e.detail.ja, e.detail.en];
    const fullQuery = norm(state.q);
    termFields.forEach((f) => { if (norm(f) === fullQuery) score += 5000; });
    aliasFields.forEach((f) => { if (norm(f) === fullQuery) score += 4200; });
    termFields.forEach((f) => { if (norm(f).includes(fullQuery)) score += 1800; });
    aliasFields.forEach((f) => { if (norm(f).includes(fullQuery)) score += 1400; });
    parts.forEach((p) => {
      termFields.forEach((f) => { score += scoreField(f, p, 1200, 950, 750); });
      aliasFields.forEach((f) => { score += scoreField(f, p, 1000, 800, 620); });
      taxonomyFields.forEach((f) => { score += scoreField(f, p, 420, 320, 240); });
      fuzzyFields.forEach((f) => { score += scoreField(f, p, 320, 240, 180); });
      bodyFields.forEach((f) => { score += scoreField(f, p, 120, 80, 45); });
      score += scoreField(e.id, p, 80, 60, 30);
    });
    return score;
  }
  function compareResult(a, b) {
    const q = norm(state.q);
    if (q) {
      const scoreDiff = queryScore(b) - queryScore(a);
      if (scoreDiff !== 0) return scoreDiff;
    }
    return title(a).localeCompare(title(b), state.lang === "ja" ? "ja" : "en");
  }
  function actionMatch(e) { const a = ACTIONS.find((x) => x.id === state.action) || ACTIONS[0]; if (!a.tokens.length) return true; const h = hay(e); return a.tokens.some((t) => h.includes(String(t).toLowerCase())); }
  function openSheet(sheet) { if (!sheet) return; [els.detailSheet,els.supportSheet,els.menuSheet,els.howtoSheet,els.filterSheet].forEach((x) => { if (x) x.hidden = true; }); if (els.overlay) els.overlay.hidden = false; sheet.hidden = false; }
  function closeSheets() { [els.detailSheet,els.supportSheet,els.menuSheet,els.howtoSheet,els.filterSheet].forEach((x) => { if (x) x.hidden = true; }); if (els.overlay) els.overlay.hidden = true; }
  function setTheme(theme) { state.theme = theme; document.documentElement.setAttribute("data-theme", theme); localStorage.setItem(LS.theme, theme); if (els.themeBtn) els.themeBtn.textContent = theme === "light" ? "☼" : "☾"; }
  function setLang(lang) { state.lang = lang; document.documentElement.lang = lang; localStorage.setItem(LS.lang, lang); render(); if (state.current) renderDetail(state.current); }
  function saveFavs() { localStorage.setItem(LS.favs, JSON.stringify([...state.favs])); }
  function filter() {
    state.filtered = state.entries.filter((e) => {
      if (els.favsOnly?.checked && !state.favs.has(e.id)) return false;
      if (!matchQuery(e)) return false;
      if (!actionMatch(e)) return false;
      if (state.category !== "all" && !e.categories.includes(state.category)) return false;
      if (state.task !== "all" && !e.tasks.includes(state.task)) return false;
      return true;
    }).sort(compareResult);
  }
  function renderActions() {
    clear(els.actionChips);
    ACTIONS.forEach((a) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "pillbtn" + (state.action === a.id ? " pillbtn--accent" : ""); b.textContent = a.label;
      b.addEventListener("click", () => { state.action = a.id; localStorage.setItem(LS.action, a.id); state.visibleCount = state.pageSize; render(); });
      els.actionChips?.appendChild(b);
    });
  }
  function renderList() {
    clear(els.resultList);
    const frag = document.createDocumentFragment();
    state.filtered.slice(0, state.visibleCount).forEach((e) => {
      const row = document.createElement("div"); row.className = "row"; row.setAttribute("role", "button"); row.tabIndex = 0;
      const main = document.createElement("div"); main.className = "row__main";
      main.appendChild(div(title(e), "row__title"));
      main.appendChild(div(pick(e.summary) || pick(e.description) || (state.lang === "ja" ? "説明なし" : "No description"), "row__desc"));
      const meta = document.createElement("div"); meta.className = "row__meta"; [e.type,...e.categories.slice(0,2),...e.tasks.slice(0,1)].forEach((x) => chip(meta, x)); main.appendChild(meta);
      const star = document.createElement("button"); star.type = "button"; star.className = "starbtn"; star.textContent = state.favs.has(e.id) ? "★" : "☆";
      star.addEventListener("click", (ev) => { ev.stopPropagation(); state.favs.has(e.id) ? state.favs.delete(e.id) : state.favs.add(e.id); saveFavs(); renderList(); });
      const open = () => openDetail(e.id); row.addEventListener("click", open); row.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); } });
      row.appendChild(main); row.appendChild(star); frag.appendChild(row);
    });
    els.resultList?.appendChild(frag);
    if (els.resultCount) els.resultCount.textContent = `Results: ${state.filtered.length}`;
    if (els.hintText) els.hintText.textContent = state.filtered.length ? "" : (state.lang === "ja" ? "一致する用語がありません" : "No matches");
    const shown = Math.min(state.visibleCount, state.filtered.length);
    const more = state.filtered.length > shown;
    if (els.loadMoreWrap) els.loadMoreWrap.hidden = !more;
    if (els.loadMoreBtn) els.loadMoreBtn.hidden = !more;
    if (els.loadMoreHint) els.loadMoreHint.textContent = more ? (state.lang === "ja" ? `表示中: ${shown} / ${state.filtered.length}` : `Showing ${shown} / ${state.filtered.length}`) : "";
  }
  function tab(name) { $$(".tab", els.detailTabs || document).forEach((b) => b.classList.toggle("tab--active", b.dataset.tab === name)); if (els.tabMeaning) els.tabMeaning.hidden = name !== "meaning"; if (els.tabExamples) els.tabExamples.hidden = name !== "examples"; if (els.tabAliases) els.tabAliases.hidden = name !== "aliases"; if (els.tabMeta) els.tabMeta.hidden = name !== "meta"; }
  function labeled(parent, label, body, cls) { if (!parent || !body) return; const wrap = div("", cls || "dictionaryBlock"); wrap.appendChild(div(label, "tabpanel__label")); wrap.appendChild(div(body, "tabpanel__text")); parent.appendChild(wrap); }
  function reorderDetailTop() {
    const block = els.detailTerms?.parentElement;
    if (!block) return;
    if (els.detailTerms) block.appendChild(els.detailTerms);
    if (els.detailDesc) block.appendChild(els.detailDesc);
    if (els.detailBullets) block.appendChild(els.detailBullets);
    if (els.detailChips) block.appendChild(els.detailChips);
  }
  function renderDetail(e) {
    if (!e) return;
    reorderDetailTop();
    if (els.detailTitle) els.detailTitle.textContent = state.lang === "ja" ? "詳細" : "Detail";
    if (els.detailStar) els.detailStar.textContent = state.favs.has(e.id) ? "★" : "☆";
    const definition = pick(e.description) || pick(e.summary);
    const note = pick(e.detail);
    const aliases = aliasLine(e);
    clear(els.detailTerms);
    els.detailTerms?.appendChild(div(title(e), "termblock__title"));
    if (aliases) els.detailTerms?.appendChild(div(aliases, "termblock__sub"));
    if (els.detailDesc) els.detailDesc.textContent = definition;
    ul(els.detailBullets, state.lang === "ja" ? e.bullets.ja : e.bullets.en, "");
    clear(els.detailChips);
    [e.type,...e.categories,...e.tasks].forEach((x) => chip(els.detailChips, x));
    clear(els.tabMeaning);
    labeled(els.tabMeaning, state.lang === "ja" ? "意味" : "Meaning", definition, "dictionaryBlock dictionaryBlock--definition");
    if (note && note !== definition) labeled(els.tabMeaning, state.lang === "ja" ? "使い方・注意" : "Use / notes", note, "dictionaryBlock dictionaryBlock--notes");
    ul(els.tabExamples, state.lang === "ja" ? e.examples.ja : e.examples.en, state.lang === "ja" ? "例はまだありません。" : "No examples yet.");
    ul(els.tabAliases, [...e.aliases.ja,...e.aliases.en].filter(Boolean), state.lang === "ja" ? "別名はまだありません。" : "No aliases yet.");
    ul(els.tabMeta, [`id: ${e.id}`,`type: ${e.type}`,`categories: ${e.categories.join(", ")}`,`tasks: ${e.tasks.join(", ")}`,`region: ${e.region.join(", ")}`,`quality_batch: ${e.meta?.quality_batch || ""}`], "");
  }
  function openDetail(id) { const e = state.entries.find((x) => x.id === id); if (!e) return; state.current = e; renderDetail(e); tab("meaning"); openSheet(els.detailSheet); }
  function renderFilters() {
    draft = { action: state.action, category: state.category, task: state.task };
    const group = (node, values, key) => { clear(node); values.forEach((v) => { const b = document.createElement("button"); b.type = "button"; b.className = "pillbtn" + (draft[key] === v ? " pillbtn--accent" : ""); b.textContent = v; b.addEventListener("click", () => { draft[key] = v; group(node, values, key); }); node?.appendChild(b); }); };
    const cats = [...new Set(state.entries.flatMap((e) => e.categories).filter(Boolean))].sort();
    const tasks = [...new Set(state.entries.flatMap((e) => e.tasks).filter(Boolean))].sort();
    group(els.filterActionItems, ACTIONS.map((a) => a.id), "action"); group(els.filterCategoryItems, ["all",...cats], "category"); group(els.filterTaskItems, ["all",...tasks], "task");
  }
  function render() { filter(); renderActions(); renderList(); if (els.statusArea) els.statusArea.hidden = true; }
  async function load() {
    if (els.statusArea) { clear(els.statusArea); els.statusArea.hidden = false; els.statusArea.appendChild(div(state.lang === "ja" ? "読み込み中" : "Loading", "status__title")); }
    try {
      const raw = await window.CTA_DATA_LOADER?.loadEntries?.();
      const seenIds = new Set();
      const seenTerms = new Set();
      state.entries = (Array.isArray(raw) ? raw : []).map(normalize).filter((e) => {
        if (!e.id || seenIds.has(e.id)) return false;
        const key = entryTermKey(e);
        if (key && seenTerms.has(key)) return false;
        seenIds.add(e.id);
        if (key) seenTerms.add(key);
        return true;
      });
      render();
    } catch (err) { console.error("CTA data load failed", err); if (els.statusArea) { clear(els.statusArea); els.statusArea.hidden = false; els.statusArea.appendChild(div(state.lang === "ja" ? "読み込みに失敗しました" : "Failed to load data", "status__title")); } }
  }
  function wire() {
    bindEls(); setTheme(state.theme); document.documentElement.lang = state.lang;
    els.searchInput?.removeAttribute("stable"); els.searchInput?.removeAttribute("content"); if (els.searchInput) els.searchInput.placeholder = "例：インパクト / 石膏ボード / 床レベラー / torque wrench";
    els.themeBtn?.addEventListener("click", () => setTheme(state.theme === "light" ? "dark" : "light")); els.langBtn?.addEventListener("click", () => setLang(state.lang === "ja" ? "en" : "ja"));
    els.searchInput?.addEventListener("input", () => { state.q = els.searchInput.value || ""; state.visibleCount = state.pageSize; render(); }); els.clearBtn?.addEventListener("click", () => { if (els.searchInput) els.searchInput.value = ""; state.q = ""; render(); });
    els.loadMoreBtn?.addEventListener("click", () => { state.visibleCount += state.pageSize; renderList(); });
    [els.detailClose,els.supportClose,els.menuClose,els.howtoClose,els.filterClose,els.overlay].forEach((x) => x?.addEventListener("click", closeSheets));
    els.menuBtn?.addEventListener("click", () => openSheet(els.menuSheet)); els.supportBtn?.addEventListener("click", () => openSheet(els.supportSheet)); els.supportInlineBtn?.addEventListener("click", () => openSheet(els.supportSheet)); els.howtoOpen?.addEventListener("click", () => openSheet(els.howtoSheet));
    [els.filterOpenBtn,els.categoryBtn,els.taskBtn].forEach((x) => x?.addEventListener("click", () => { renderFilters(); openSheet(els.filterSheet); }));
    els.filterApplyBtn?.addEventListener("click", () => { state.action = draft.action; state.category = draft.category; state.task = draft.task; localStorage.setItem(LS.action,state.action); localStorage.setItem(LS.category,state.category); localStorage.setItem(LS.task,state.task); state.visibleCount = state.pageSize; closeSheets(); render(); });
    els.filterResetBtn?.addEventListener("click", () => { state.action = state.category = state.task = "all"; localStorage.setItem(LS.action,"all"); localStorage.setItem(LS.category,"all"); localStorage.setItem(LS.task,"all"); closeSheets(); render(); });
    els.detailTabs?.addEventListener("click", (ev) => { const b = ev.target.closest(".tab"); if (b) tab(b.dataset.tab || "meaning"); });
    els.detailStar?.addEventListener("click", () => { if (!state.current) return; state.favs.has(state.current.id) ? state.favs.delete(state.current.id) : state.favs.add(state.current.id); saveFavs(); renderDetail(state.current); renderList(); });
    els.favsOnly?.addEventListener("change", () => { state.visibleCount = state.pageSize; render(); });
    els.exportFavsBtn?.addEventListener("click", () => navigator.clipboard?.writeText(JSON.stringify({ v:1, tool:"construction-tools-atlas", type:"favorites", ids:[...state.favs] }, null, 2)).catch(() => {}));
    els.importFavsBtn?.addEventListener("click", () => { const data = json(prompt("Paste favorites JSON:"), null); if (!data || !Array.isArray(data.ids)) return; const ids = new Set(state.entries.map((e) => e.id)); state.favs = new Set(data.ids.filter((id) => ids.has(id))); saveFavs(); render(); });
  }
  document.addEventListener("DOMContentLoaded", () => { wire(); load(); });
})();
