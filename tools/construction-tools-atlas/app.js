/* =========================================================
   Construction Tools & Slang Atlas (NicheWorks)
   - Static data: data/index.json + data/packs/*.json
   - Features: q search, category filter, task filter, JA/EN, list->detail,
               URL state (q, cat, task, id, lang)
   ========================================================= */

const DATA_ROOT = "./data";
const INDEX_URL = `${DATA_ROOT}/index.json`;

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

const els = {
  // language
  langJa: document.getElementById("langJa"),
  langEn: document.getElementById("langEn"),

  // search
  qInput: document.getElementById("qInput"),

  // filters
  catWrap: document.getElementById("categoryChips"),
  taskSelect: document.getElementById("taskSelect"),

  // results
  count: document.getElementById("resultCount"),
  list: document.getElementById("resultList"),

  // detail
  detail: document.getElementById("detailPanel"),
  detailTitle: document.getElementById("detailTitle"),
  detailDesc: document.getElementById("detailDesc"),
  detailCats: document.getElementById("detailCategories"),
  detailTasks: document.getElementById("detailTasks"),
};

const i18n = {
  ja: {
    taskTitle: "Task",
    taskHelp: "目的/作業で絞り込み（任意）",
    taskAll: "すべてのTask",
    empty: "該当する用語がありません。",
    cats: "カテゴリ",
    tasks: "Task",
  },
  en: {
    taskTitle: "Task",
    taskHelp: "Filter by task (optional)",
    taskAll: "All tasks",
    empty: "No matching entries.",
    cats: "Categories",
    tasks: "Tasks",
  },
};

init().catch((e) => {
  console.error(e);
  safeSetText(els.list, "Failed to load data.");
});

async function init() {
  readUrlToState();
  bindEvents();
  await loadAllData();
  renderAll();
  // if id exists in URL, open it
  if (state.id && db.entriesById.has(state.id)) {
    openDetail(state.id, { pushUrl: false });
  } else {
    closeDetail({ pushUrl: false });
  }
}

function bindEvents() {
  // lang buttons (optional existence)
  els.langJa?.addEventListener("click", () => setLang("ja"));
  els.langEn?.addEventListener("click", () => setLang("en"));

  // search
  els.qInput?.addEventListener("input", (e) => {
    state.q = (e.target.value || "").trim();
    state.id = ""; // search changes -> clear detail selection
    pushStateToUrl();
    renderList();
    closeDetail({ pushUrl: false });
  });

  // task filter
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
    applyStateToControls();
    renderAll();
    if (state.id && db.entriesById.has(state.id)) openDetail(state.id, { pushUrl: false });
    else closeDetail({ pushUrl: false });
  });
}

async function loadAllData() {
  const index = await fetchJson(INDEX_URL);
  db.index = index;

  // categories / tasks: accept array or object
  db.categories = normalizeDefList(index.categories);
  db.tasks = normalizeDefList(index.tasks);

  db.categoriesMap = new Map(db.categories.map((c) => [c.id, c]));
  db.tasksMap = new Map(db.tasks.map((t) => [t.id, t]));

  // packs
  const packs = Array.isArray(index.packs) ? index.packs : [];
  const packUrls = packs.map((p) => `${DATA_ROOT}/packs/${p.file}`);

  const packJsons = await Promise.all(packUrls.map((u) => fetchJson(u)));
  const entries = packJsons.flatMap((pj) => Array.isArray(pj.entries) ? pj.entries : []);

  db.entries = entries;
  db.entriesById = new Map(entries.map((e) => [e.id, e]));
  db.entriesById.forEach((v, k) => db.entriesById.set(k, v));
  db.entriesById.forEach((v) => db.entriesById.set(v.id, v));
}

function renderAll() {
  applyStateToControls();
  renderTaskSelect();
  renderCategoryChips();
  renderList();
  updateLangButtons();
  applyI18nText();
}

function applyStateToControls() {
  if (els.qInput) els.qInput.value = state.q || "";
  if (els.taskSelect) els.taskSelect.value = state.task || "";
}

function updateLangButtons() {
  if (els.langJa) els.langJa.setAttribute("aria-pressed", state.lang === "ja" ? "true" : "false");
  if (els.langEn) els.langEn.setAttribute("aria-pressed", state.lang === "en" ? "true" : "false");
}

function applyI18nText() {
  const dict = i18n[state.lang] || i18n.ja;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  // update default option label for task select
  const opt = els.taskSelect?.querySelector('option[value=""]');
  if (opt) opt.textContent = dict.taskAll;
}

function renderTaskSelect() {
  if (!els.taskSelect) return;

  const dict = i18n[state.lang] || i18n.ja;

  // keep first option (All)
  const current = els.taskSelect.value || "";
  els.taskSelect.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = dict.taskAll;
  els.taskSelect.appendChild(allOpt);

  // options
  const frag = document.createDocumentFragment();
  const sorted = [...db.tasks].sort((a, b) => labelOf(a, state.lang).localeCompare(labelOf(b, state.lang)));
  for (const t of sorted) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = labelOf(t, state.lang);
    frag.appendChild(opt);
  }
  els.taskSelect.appendChild(frag);

  // restore selection
  els.taskSelect.value = current;
}

function renderCategoryChips() {
  if (!els.catWrap) return;
  els.catWrap.innerHTML = "";

  const allChip = makeChip({
    label: state.lang === "ja" ? "すべて" : "All",
    active: !state.cat,
    onClick: () => setCategory(""),
  });
  els.catWrap.appendChild(allChip);

  const sorted = [...db.categories].sort((a, b) => labelOf(a, state.lang).localeCompare(labelOf(b, state.lang)));
  for (const c of sorted) {
    const chip = makeChip({
      label: labelOf(c, state.lang),
      active: state.cat === c.id,
      onClick: () => setCategory(c.id),
    });
    els.catWrap.appendChild(chip);
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
}

function setLang(lang) {
  state.lang = lang === "en" ? "en" : "ja";
  pushStateToUrl();
  renderAll();
  // keep detail open if selected
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
  for (const e of results) {
    frag.appendChild(renderCard(e));
  }
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

  // show categories (label)
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

  // categories
  if (els.detailCats) {
    els.detailCats.innerHTML = "";
    const catIds = normalizeEntryCategoryIds(entry);
    for (const cid of catIds) {
      const def = db.categoriesMap.get(cid);
      els.detailCats.appendChild(renderTag(def ? labelOf(def, state.lang) : cid));
    }
  }

  // tasks (揺れ吸収 + label化)
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
      none.textContent = "—";
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
  // Search across: term/aliases/description/fuzzy (ja/en)
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

  const joined = hay.join(" ").toLowerCase();
  return joined.includes(qLower);
}

/* -----------------------------
   Normalizers (揺れ吸収)
------------------------------ */

function normalizeDefList(defs) {
  if (!defs) return [];
  if (Array.isArray(defs)) return defs.filter(Boolean);
  if (typeof defs === "object") {
    // object map {id: {label:{ja,en}} } or {id:{ja,en}} etc
    return Object.entries(defs).map(([id, v]) => {
      if (!v) return { id, label: { ja: id, en: id } };
      if (v.label) return { id, ...v };
      // if {ja,en} directly
      if (v.ja || v.en) return { id, label: { ja: v.ja || id, en: v.en || id } };
      return { id, label: { ja: id, en: id } };
    });
  }
  return [];
}

function normalizeEntryCategoryIds(entry) {
  const ids = new Set();
  if (!entry) return [];

  // common
  if (Array.isArray(entry.categories)) entry.categories.forEach((x) => x && ids.add(x));
  if (typeof entry.category === "string" && entry.category) ids.add(entry.category);

  // sometimes in tags
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

  // preferred
  if (Array.isArray(entry.tasks)) entry.tasks.forEach((x) => x && ids.add(x));
  if (typeof entry.task === "string" && entry.task) ids.add(entry.task);

  // sometimes in tags
  if (Array.isArray(entry.tags)) {
    for (const t of entry.tags) {
      if (typeof t === "string" && db.tasksMap.has(t)) ids.add(t);
    }
  }

  // filter to known task IDs only (avoid junk)
  return [...ids].filter((x) => db.tasksMap.has(x));
}

/* -----------------------------
   Helpers
------------------------------ */

function termOf(entry, lang) {
  const t = entry.term || entry.title || {};
  const raw = t?.[lang];
  if (raw) return raw;
  // fallback
  return t?.ja || t?.en || entry.id || "";
}

function descOf(entry, lang) {
  const d = entry.description || {};
  const raw = d?.[lang];
  if (raw) return raw;
  // fallback
  return d?.ja || d?.en || "";
}

function labelOf(def, lang) {
  if (!def) return "";
  if (def.label && (def.label[lang] || def.label.ja || def.label.en)) {
    return def.label[lang] || def.label.ja || def.label.en || def.id;
  }
  // if {ja,en}
  if (def[lang] || def.ja || def.en) return def[lang] || def.ja || def.en;
  return def.id || "";
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load: ${url} (${res.status})`);
  return res.json();
}

function safeSetText(el, text) {
  if (!el) return;
  el.textContent = text;
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
