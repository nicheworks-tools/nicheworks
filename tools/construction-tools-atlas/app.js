/* =========================================================
   Construction Tools & Slang Atlas (NicheWorks)
   - Static data: data/index.json + data/packs/*.json
   - Features: q search, category filter, task filter, JA/EN, list->detail,
               URL state (q, cat, task, id, lang)
   - Robust: base-url fix, JSON-vs-HTML detection, pack file path fix
   - UI-robust: supports BOTH
       - category: chips OR select
       - lang: two buttons OR one toggle
       - list/count: multiple id fallbacks
   ========================================================= */

const state = {
  lang: "ja",
  q: "",
  cat: "",
  task: "",
  id: "",
};

let db = {
  index: null,
  categories: [],
  tasks: [],
  categoriesMap: new Map(),
  tasksMap: new Map(),
  entries: [],
  entriesById: new Map(),
};

function getElByIds(ids) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}
function getElBySelectors(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

const els = {
  // language (either 2 buttons or 1 toggle)
  langJa: getElByIds(["langJa"]),
  langEn: getElByIds(["langEn"]),
  langToggle: getElByIds(["langToggle", "langSwitch", "langBtn"]) || getElBySelectors(['[data-role="lang-toggle"]']),

  // search
  qInput: getElByIds(["qInput", "searchInput", "queryInput"]) || getElBySelectors(['input[type="search"]']),

  // category UI (chips OR select)
  catWrap: getElByIds(["categoryChips", "catChips"]),
  catSelect: getElByIds(["categorySelect", "catSelect", "category"]) || getElBySelectors(['select[name="category"]']),

  // task
  taskSelect: getElByIds(["taskSelect", "task"]) || getElBySelectors(['select[name="task"]']),

  // results
  count: getElByIds(["resultCount", "resultsCount", "count", "hitsCount"]),
  list: getElByIds(["resultList", "resultsList", "list", "results"]) || getElBySelectors(['[data-role="result-list"]']),

  // detail
  detail: getElByIds(["detailPanel", "detail", "detailPane"]),
  detailTitle: getElByIds(["detailTitle", "detailTerm", "detailHeading"]),
  detailDesc: getElByIds(["detailDesc", "detailDescription"]),
  detailCats: getElByIds(["detailCategories", "detailCats"]),
  detailTasks: getElByIds(["detailTasks"]),
};

const i18n = {
  ja: {
    taskAll: "すべてのTask",
    catAll: "すべてのカテゴリ",
    empty: "該当する用語がありません。",
    dash: "—",
    failed: "Failed to load data.",
  },
  en: {
    taskAll: "All tasks",
    catAll: "All categories",
    empty: "No matching entries.",
    dash: "—",
    failed: "Failed to load data.",
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
const BASE = getToolBaseUrl();
const INDEX_URL = new URL("data/index.json", BASE).toString();

function resolvePackUrl(file) {
  if (!file || typeof file !== "string") return null;

  if (/^https?:\/\//i.test(file)) return file;
  if (file.startsWith("/")) return new URL(file, location.origin).toString();

  let cleaned = file.trim().replace(/^\.?\/*/, ""); // remove ./ or leading /

  // ✅ file名だけなら packs/ を補う
  if (!cleaned.includes("/")) cleaned = `packs/${cleaned}`;

  // ✅ data/ が無ければ data/ を補う
  if (!cleaned.startsWith("data/")) cleaned = `data/${cleaned}`;

  return new URL(cleaned, BASE).toString();
}

/* -----------------------------
   Init
------------------------------ */

init().catch((e) => {
  console.error(e);
  safeSetText(els.list, (i18n[state.lang] || i18n.ja).failed);
});

async function init() {
  readUrlToState();
  bindEvents();
  await loadAllData();

  // URL由来の cat/task が存在しない場合はリセット（空表示回避）
  sanitizeStateAgainstDefs();

  renderAll();

  if (state.id && db.entriesById.has(state.id)) openDetail(state.id, { pushUrl: false });
  else closeDetail({ pushUrl: false });
}

function bindEvents() {
  // language: 2 buttons
  els.langJa?.addEventListener("click", () => setLang("ja"));
  els.langEn?.addEventListener("click", () => setLang("en"));

  // language: 1 toggle button (JA/EN)
  els.langToggle?.addEventListener("click", () => {
    setLang(state.lang === "ja" ? "en" : "ja");
  });

  // search
  els.qInput?.addEventListener("input", (e) => {
    state.q = (e.target.value || "").trim();
    state.id = "";
    pushStateToUrl();
    renderList();
    closeDetail({ pushUrl: false });
  });

  // category: select
  els.catSelect?.addEventListener("change", (e) => {
    state.cat = e.target.value || "";
    state.id = "";
    pushStateToUrl();
    renderList();
    closeDetail({ pushUrl: false });
  });

  // task: select
  els.taskSelect?.addEventListener("change", (e) => {
    state.task = e.target.value || "";
    state.id = "";
    pushStateToUrl();
    renderList();
    closeDetail({ pushUrl: false });
  });

  // back/forward
  window.addEventListener("popstate", () => {
    readUrlToState();
    sanitizeStateAgainstDefs();
    applyStateToControls();
    renderAll();
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
    const firstErr = errors[0];
    throw new Error(
      `No entries loaded from packs.\nINDEX_URL=${INDEX_URL}\n` +
      `packsResolved=${packUrls.length}\n` +
      (firstErr ? `firstPackError=${firstErr.url}\n${String(firstErr.err)}` : "")
    );
  }
}

/* -----------------------------
   Render
------------------------------ */

function renderAll() {
  applyStateToControls();
  renderTaskSelect();
  renderCategoryUI(); // chips OR select
  renderList();
  updateLangUI();
  applyI18nText();
}

function applyStateToControls() {
  if (els.qInput) els.qInput.value = state.q || "";
  if (els.taskSelect) els.taskSelect.value = state.task || "";
  if (els.catSelect) els.catSelect.value = state.cat || "";
}

function updateLangUI() {
  if (els.langJa) els.langJa.setAttribute("aria-pressed", state.lang === "ja" ? "true" : "false");
  if (els.langEn) els.langEn.setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
  if (els.langToggle) els.langToggle.setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
}

function applyI18nText() {
  const dict = i18n[state.lang] || i18n.ja;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  // task select default label
  const optTask = els.taskSelect?.querySelector('option[value=""]');
  if (optTask) optTask.textContent = dict.taskAll;

  // category select default label
  const optCat = els.catSelect?.querySelector('option[value=""]');
  if (optCat) optCat.textContent = dict.catAll;
}

function renderTaskSelect() {
  if (!els.taskSelect) return;
  const dict = i18n[state.lang] || i18n.ja;

  const current = state.task || "";
  els.taskSelect.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = dict.taskAll;
  els.taskSelect.appendChild(allOpt);

  const frag = document.createDocumentFragment();
  const sorted = [...db.tasks].sort((a, b) => labelOf(a, state.lang).localeCompare(labelOf(b, state.lang)));
  for (const t of sorted) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = labelOf(t, state.lang);
    frag.appendChild(opt);
  }
  els.taskSelect.appendChild(frag);

  els.taskSelect.value = current;
  state.task = els.taskSelect.value || "";
}

function renderCategoryUI() {
  // ✅ selectがあるならselectを優先
  if (els.catSelect) return renderCategorySelect();
  // ✅ なければ chips
  if (els.catWrap) return renderCategoryChips();
}

function renderCategorySelect() {
  const dict = i18n[state.lang] || i18n.ja;
  const sel = els.catSelect;
  if (!sel) return;

  const current = state.cat || "";
  sel.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = dict.catAll;
  sel.appendChild(allOpt);

  const frag = document.createDocumentFragment();
  const sorted = [...db.categories].sort((a, b) => labelOf(a, state.lang).localeCompare(labelOf(b, state.lang)));
  for (const c of sorted) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = labelOf(c, state.lang);
    frag.appendChild(opt);
  }
  sel.appendChild(frag);

  sel.value = current;
  state.cat = sel.value || "";
}

function renderCategoryChips() {
  const wrap = els.catWrap;
  if (!wrap) return;

  wrap.innerHTML = "";

  const allChip = makeChip({
    label: (i18n[state.lang] || i18n.ja).catAll,
    active: !state.cat,
    onClick: () => setCategory(""),
  });
  wrap.appendChild(allChip);

  const sorted = [...db.categories].sort((a, b) => labelOf(a, state.lang).localeCompare(labelOf(b, state.lang)));
  for (const c of sorted) {
    const chip = makeChip({
      label: labelOf(c, state.lang),
      active: state.cat === c.id,
      onClick: () => setCategory(c.id),
    });
    wrap.appendChild(chip);
  }
}

function makeChip({ label, active, onClick }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = active ? "chip chip--active" : "chip";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function setCategory(catId) {
  state.cat = catId || "";
  state.id = "";
  pushStateToUrl();
  renderList();
  closeDetail({ pushUrl: false });
  if (els.catSelect) els.catSelect.value = state.cat;
}

function setLang(lang) {
  state.lang = lang === "en" ? "en" : "ja";
  pushStateToUrl();
  renderAll();
  if (state.id && db.entriesById.has(state.id)) openDetail(state.id, { pushUrl: false });
}

function renderList() {
  const results = getFilteredEntries();
  if (els.count) els.count.textContent = String(results.length);

  if (!els.list) return;
  els.list.innerHTML = "";

  if (results.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = (i18n[state.lang] || i18n.ja).empty;
    els.list.appendChild(p);
    return;
  }

  const frag = document.createDocumentFragment();
  for (const e of results) frag.appendChild(renderCard(e));
  els.list.appendChild(frag);
}

function renderCard(entry) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card";
  card.addEventListener("click", () => openDetail(entry.id, { pushUrl: true }));

  const title = document.createElement("div");
  title.className = "card__title";
  title.textContent = `${termOf(entry, "ja")} / ${termOf(entry, "en")}`;

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

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(tags);
  return card;
}

function renderTag(text) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = text;
  return span;
}

function openDetail(id, { pushUrl }) {
  const entry = db.entriesById.get(id);
  if (!entry) return;

  state.id = id;
  if (pushUrl) pushStateToUrl();

  if (!els.detail) return;
  els.detail.hidden = false;

  if (els.detailTitle) els.detailTitle.textContent = `${termOf(entry, "ja")} / ${termOf(entry, "en")}`;
  if (els.detailDesc) els.detailDesc.textContent = descOf(entry, state.lang);

  if (els.detailCats) {
    els.detailCats.innerHTML = "";
    const catIds = normalizeEntryCategoryIds(entry);
    for (const cid of catIds) {
      const def = db.categoriesMap.get(cid);
      els.detailCats.appendChild(renderTag(def ? labelOf(def, state.lang) : cid));
    }
  }

  if (els.detailTasks) {
    els.detailTasks.innerHTML = "";
    const taskIds = normalizeEntryTaskIds(entry);
    for (const tid of taskIds) {
      const def = db.tasksMap.get(tid);
      els.detailTasks.appendChild(renderTag(def ? labelOf(def, state.lang) : tid));
    }
    if (taskIds.length === 0) {
      const none = document.createElement("span");
      none.className = "muted";
      none.textContent = (i18n[state.lang] || i18n.ja).dash;
      els.detailTasks.appendChild(none);
    }
  }
}

function closeDetail({ pushUrl }) {
  state.id = "";
  if (pushUrl) pushStateToUrl();
  if (els.detail) els.detail.hidden = true;
}

/* -----------------------------
   Filtering / matching
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

  const d = entry.description || {};
  if (d.ja) hay.push(d.ja);
  if (d.en) hay.push(d.en);

  if (Array.isArray(entry.fuzzy)) hay.push(...entry.fuzzy);
  if (Array.isArray(entry.tags)) hay.push(...entry.tags);

  return hay.join(" ").toLowerCase().includes(qLower);
}

/* -----------------------------
   Normalizers (揺れ吸収)
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

/* -----------------------------
   Helpers
------------------------------ */

function termOf(entry, lang) {
  const t = entry.term || entry.title || {};
  const raw = t?.[lang];
  if (raw) return raw;
  return t?.ja || t?.en || entry.id || "";
}

function descOf(entry, lang) {
  const d = entry.description || {};
  const raw = d?.[lang];
  if (raw) return raw;
  return d?.ja || d?.en || "";
}

function labelOf(def, lang) {
  if (!def) return "";
  if (def.label && (def.label[lang] || def.label.ja || def.label.en)) {
    return def.label[lang] || def.label.ja || def.label.en || def.id;
  }
  if (def[lang] || def.ja || def.en) return def[lang] || def.ja || def.en;
  return def.id || "";
}

/**
 * ✅ JSONのつもりがHTMLを掴んだら即死させる
 * ✅ ただし静的ホスティングで content-type が雑でも本文がJSONなら通す
 */
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

function safeSetText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function sanitizeStateAgainstDefs() {
  if (state.cat && !db.categoriesMap.has(state.cat)) state.cat = "";
  if (state.task && !db.tasksMap.has(state.task)) state.task = "";
}

/* -----------------------------
   URL state (q, cat, task, id, lang)
------------------------------ */

function readUrlToState() {
  const sp = new URLSearchParams(location.search);
  state.lang = sp.get("lang") === "en" ? "en" : "ja";
  state.q = (sp.get("q") || "").trim();
  state.cat = sp.get("cat") || "";
  state.task = sp.get("task") || "";
  state.id = sp.get("id") || "";
}

function pushStateToUrl() {
  const sp = new URLSearchParams();

  if (state.lang && state.lang !== "ja") sp.set("lang", state.lang);
  if (state.q) sp.set("q", state.q);
  if (state.cat) sp.set("cat", state.cat);
  if (state.task) sp.set("task", state.task);
  if (state.id) sp.set("id", state.id);

  const qs = sp.toString();
  const url = qs ? `?${qs}` : location.pathname;
  history.pushState(null, "", url);
}
