(() => {
  "use strict";

  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const MOBILE_QUERY = "(max-width: 899px)";
  const PAGE_SIZE = 50;
  // Curated canonical starting points, not search popularity or product recommendations.
  const STARTER_IDS = ["drill_driver", "q011_mortar_mixer", "q013_scaffold_clamp", "q015_cable_gland", "q016_vinyl_sheet_flooring", "q012_air_impact_wrench"];
  const LS = {
    lang: "cta_uilang",
    favs: "cta_favs",
    action: "cta_action",
    type: "cta_type",
    category: "cta_category",
    task: "cta_task",
    favOnly: "cta_favs_only"
  };

  const ACTIONS = [
    { id: "all", ja: "すべて", en: "All", tokens: [] },
    { id: "cut", ja: "切る", en: "Cut", tokens: ["cut", "cutting", "saw", "切断", "切る"] },
    { id: "fasten", ja: "固定", en: "Fasten", tokens: ["fasten", "fastening", "bolt", "screw", "締付", "固定"] },
    { id: "measure", ja: "測る", en: "Measure", tokens: ["measure", "measurement", "level", "計測", "測定"] },
    { id: "drill", ja: "穴あけ", en: "Drill", tokens: ["drill", "hole", "穴あけ", "穿孔"] }
  ];
  const TYPES = [
    { id: "all", ja: "すべて", en: "All" },
    { id: "tool", ja: "工具", en: "Tools" },
    { id: "material", ja: "材料", en: "Materials" },
    { id: "task", ja: "作業", en: "Tasks" },
    { id: "term", ja: "用語", en: "Terms" }
  ];

  const state = {
    lang: initialLang(),
    q: "",
    action: localStorage.getItem(LS.action) || "all",
    type: localStorage.getItem(LS.type) || "all",
    category: localStorage.getItem(LS.category) || "all",
    task: localStorage.getItem(LS.task) || "all",
    favOnly: localStorage.getItem(LS.favOnly) === "true",
    favs: new Set(readJson(localStorage.getItem(LS.favs), [])),
    entries: [],
    entryById: new Map(),
    filtered: [],
    visibleCount: PAGE_SIZE,
    current: null,
    images: new Map(),
    offers: new Map(),
    searchEngine: null,
    interpretations: [],
    ignoredSignals: new Set(),
    ready: false
  };

  const els = {};

  function initialLang() {
    const stored = localStorage.getItem(LS.lang);
    if (["ja", "en", "both"].includes(stored)) return stored;
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }
  function readJson(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; } }
  function text(value) { return typeof value === "string" ? value.trim() : ""; }
  function list(value) {
    if (Array.isArray(value)) return value.flatMap((v) => typeof v === "string" ? [v.trim()] : []).filter(Boolean);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }
  function unique(values) { return [...new Set(values.filter(Boolean))]; }
  function pair(value, jaFallback = "", enFallback = "") {
    return { ja: text(value?.ja) || text(jaFallback), en: text(value?.en) || text(enFallback) };
  }
  function clear(node) { if (node) node.replaceChildren(); }
  function isMobile() { return window.matchMedia(MOBILE_QUERY).matches; }
  function normalized(value) {
    if (state.searchEngine?.normalizeText) return state.searchEngine.normalizeText(value);
    return String(value || "").normalize("NFKC").trim().toLowerCase().replace(/[\s\u3000]+/g, " ");
  }
  function entryTermKey(entry) { return `${normalized(entry.term.ja)}::${normalized(entry.term.en)}`; }

  function bindElements() {
    [
      "langControl","favoritesToggle","pageTitle","pageLead","privacyNote","searchInput","clearSearch","autocomplete",
      "interpretationBar","interpretationLabel","interpretationChips","actionLabel","actionFilters","typeLabel","typeFilters",
      "openFilters","dictionaryJump","dictionaryJumpLabel","dictionaryJumpButtons","atlasWorkspace","resultCount","resultHint","loadingState","resultList","loadMoreWrap","loadMore","loadMoreHint",
      "detailPanel","detailEmpty","detailContent","detailClose","detailFavorite","detailCopy","detailShare","detailEyebrow","detailTitle",
      "detailSecondary","detailTaxonomy","detailImage","detailImageMissing","whatHeading","detailDefinition","notesSection","notesHeading",
      "detailNotes","detailBullets","examplesSection","examplesHeading","detailExamples","aliasesSection","aliasesHeading","detailAliases",
      "relatedSection","relatedHeading","detailRelated","affiliateSection","affiliateHeading","affiliateLead","affiliateMount","affiliateDisclosure",
      "detailLink","mobileBackdrop","filterDialog","filterDialogTitle","categoryHeading","categoryFilters","taskHeading","taskFilters",
      "favoritesTransferHeading","exportFavsBtn","importFavsBtn","resetFilters"
    ].forEach((id) => { els[id] = document.getElementById(id); });
  }

  function normalizeEntry(raw, index) {
    const description = pair(raw?.description, raw?.description_ja, raw?.description_en);
    const summary = pair(raw?.summary, raw?.summary_ja, raw?.summary_en);
    const detail = pair(raw?.detail, raw?.detail_ja, raw?.detail_en);
    return {
      id: text(raw?.id || raw?.slug) || `entry_${index}`,
      type: text(raw?.type),
      term: pair(raw?.term, raw?.ja || raw?.jp, raw?.en),
      aliases: {
        ja: list(raw?.aliases?.ja || raw?.alias?.ja || raw?.aliases_ja),
        en: list(raw?.aliases?.en || raw?.alias?.en || raw?.aliases_en)
      },
      description: { ja: description.ja || summary.ja || detail.ja, en: description.en || summary.en || detail.en },
      summary: { ja: summary.ja || description.ja, en: summary.en || description.en },
      detail,
      bullets: { ja: list(raw?.bullets?.ja || raw?.bullets_ja), en: list(raw?.bullets?.en || raw?.bullets_en) },
      examples: { ja: list(raw?.examples?.ja || raw?.examples_ja || raw?.usage?.ja), en: list(raw?.examples?.en || raw?.examples_en || raw?.usage?.en) },
      categories: list(raw?.categories || raw?.category),
      tasks: list(raw?.tasks || raw?.task),
      fuzzy: list(raw?.fuzzy),
      region: list(raw?.region),
      relationIds: extractRelationIds(raw)
    };
  }

  function extractRelationIds(raw) {
    const candidates = [
      raw?.related, raw?.related_ids, raw?.similar, raw?.similar_ids, raw?.used_with, raw?.used_with_ids,
      raw?.often_confused_with, raw?.often_confused_with_ids, raw?.relationships?.related, raw?.relationships?.similar,
      raw?.relationships?.used_with, raw?.relationships?.often_confused_with, raw?.meta?.related, raw?.meta?.used_with
    ];
    const ids = [];
    candidates.forEach((candidate) => {
      if (!Array.isArray(candidate)) return;
      candidate.forEach((item) => {
        const id = typeof item === "string" ? item : text(item?.id || item?.entry_id || item?.target);
        if (id) ids.push(id);
      });
    });
    return unique(ids);
  }

  function languageLabel(item) {
    if (state.lang === "en") return item.en || item.ja || item.id;
    if (state.lang === "both" && item.ja && item.en) return `${item.ja} / ${item.en}`;
    return item.ja || item.en || item.id;
  }
  function primaryTerm(entry) {
    if (state.lang === "en") return entry.term.en || entry.term.ja || "—";
    return entry.term.ja || entry.term.en || "—";
  }
  function secondaryTerm(entry) {
    if (state.lang === "en") return entry.term.ja || "";
    return entry.term.en || "";
  }
  function primaryPair(value) {
    if (state.lang === "en") return value.en || value.ja || "";
    return value.ja || value.en || "";
  }
  function preferredItems(value) {
    if (state.lang === "en") return value.en.length ? value.en : value.ja;
    return value.ja.length ? value.ja : value.en;
  }
  function isTemplateText(value) {
    const copy = text(value);
    return /^(仕様と下地条件を確認する。|周辺部材との取り合いを確認する。|Check the specification and substrate conditions\.|Confirm adjacent details before finishing\.)$/.test(copy)
      || /^.+を使う前に寸法と仕様を確認する。$/.test(copy)
      || /^Check dimensions and specifications before using .+\.$/.test(copy)
      || /^.+は仕様、下地条件、周辺部材との取り合いを確認して使う。施工前後の確認を省くと不具合や手戻りの原因になる。$/.test(copy)
      || /^Use .+ after checking the specification, substrate, and adjacent details\. Missing checks can cause defects or rework\.$/.test(copy);
  }

  function humanize(value) {
    const raw = text(value);
    if (!raw || /^q\d+[_-]/i.test(raw)) return "";
    const known = {
      tool: { ja: "工具", en: "Tool" }, tools: { ja: "工具", en: "Tools" },
      material: { ja: "材料", en: "Material" }, materials: { ja: "材料", en: "Materials" },
      task: { ja: "作業", en: "Task" }, term: { ja: "用語", en: "Term" },
      safety: { ja: "安全", en: "Safety" }, measuring: { ja: "測定", en: "Measuring" },
      cutting: { ja: "切断", en: "Cutting" }, fastening: { ja: "固定・締結", en: "Fastening" }
    };
    const key = normalized(raw).replace(/[\s-]+/g, "_");
    if (known[key]) return state.lang === "en" ? known[key].en : known[key].ja;
    if (/^[a-z0-9_-]+$/i.test(raw)) {
      const words = raw.replace(/[_-]+/g, " ").trim();
      return words.replace(/\b\w/g, (m) => m.toUpperCase());
    }
    return raw;
  }

  function entryKind(entry) {
    const value = normalized(entry.type);
    if (/material|component|hardware|材|部材|金物|塗料|接着/.test(value)) return "material";
    if (/task|work|operation|施工|工事|作業/.test(value)) return "task";
    if (/tool|equipment|machine|instrument|工具|機械|器具|測定/.test(value)) return "tool";
    return "term";
  }

  function haystack(entry) {
    return [
      entry.id, entry.type, entry.term.ja, entry.term.en, entry.description.ja, entry.description.en,
      entry.summary.ja, entry.summary.en, entry.detail.ja, entry.detail.en,
      ...entry.aliases.ja, ...entry.aliases.en, ...entry.categories, ...entry.tasks, ...entry.fuzzy, ...entry.region
    ].join("\n").toLowerCase();
  }
  function queryParts() { return normalized(state.q).split(/\s+/).filter(Boolean); }
  function scoreField(value, part, exact, starts, includes) {
    const candidate = normalized(value);
    if (!candidate || !part) return 0;
    if (candidate === part) return exact;
    if (candidate.startsWith(part)) return starts;
    if (candidate.includes(part)) return includes;
    return 0;
  }
  function queryScore(entry) {
    if (!normalized(state.q)) return 0;
    if (state.searchEngine) return state.searchEngine.scoreEntry(entry, state.q, state.interpretations);
    const parts = queryParts();
    const full = normalized(state.q);
    const termFields = [entry.term.ja, entry.term.en];
    const aliasFields = [...entry.aliases.ja, ...entry.aliases.en];
    const taxonomyFields = [entry.type, ...entry.categories, ...entry.tasks];
    const bodyFields = [entry.summary.ja, entry.summary.en, entry.description.ja, entry.description.en, entry.detail.ja, entry.detail.en];
    let score = 0;
    termFields.forEach((v) => { if (normalized(v) === full) score += 5000; else if (normalized(v).includes(full)) score += 1800; });
    aliasFields.forEach((v) => { if (normalized(v) === full) score += 4200; else if (normalized(v).includes(full)) score += 1400; });
    parts.forEach((part) => {
      termFields.forEach((v) => { score += scoreField(v, part, 1200, 950, 750); });
      aliasFields.forEach((v) => { score += scoreField(v, part, 1000, 800, 620); });
      taxonomyFields.forEach((v) => { score += scoreField(v, part, 420, 320, 240); });
      bodyFields.forEach((v) => { score += scoreField(v, part, 120, 80, 45); });
    });
    return score;
  }
  function actionMatch(entry) {
    const action = ACTIONS.find((item) => item.id === state.action) || ACTIONS[0];
    if (!action.tokens.length) return true;
    const hay = haystack(entry);
    return action.tokens.some((token) => hay.includes(String(token).toLowerCase()));
  }

  function refreshFiltered() {
    state.interpretations = state.searchEngine?.interpret?.(state.q, state.ignoredSignals) || [];
    state.filtered = state.entries.filter((entry) => {
      if (state.favOnly && !state.favs.has(entry.id)) return false;
      if (normalized(state.q) && queryScore(entry) <= 0) return false;
      if (!actionMatch(entry)) return false;
      if (state.type !== "all" && entryKind(entry) !== state.type) return false;
      if (state.category !== "all" && !entry.categories.includes(state.category)) return false;
      if (state.task !== "all" && !entry.tasks.includes(state.task)) return false;
      return true;
    }).sort((a, b) => {
      if (normalized(state.q)) {
        const delta = queryScore(b) - queryScore(a);
        if (delta) return delta;
      }
      return primaryTerm(a).localeCompare(primaryTerm(b), state.lang === "en" ? "en" : "ja");
    });
  }

  function makeChip(label, pressed, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip chipButton";
    button.textContent = label;
    button.setAttribute("aria-pressed", String(Boolean(pressed)));
    button.addEventListener("click", onClick);
    return button;
  }

  function renderPrimaryFilters() {
    clear(els.actionFilters);
    ACTIONS.forEach((action) => {
      els.actionFilters.appendChild(makeChip(languageLabel(action), state.action === action.id, () => {
        state.action = action.id; localStorage.setItem(LS.action, state.action); state.visibleCount = PAGE_SIZE; render();
      }));
    });
    clear(els.typeFilters);
    TYPES.forEach((type) => {
      els.typeFilters.appendChild(makeChip(languageLabel(type), state.type === type.id, () => {
        state.type = type.id; localStorage.setItem(LS.type, state.type); state.visibleCount = PAGE_SIZE; render();
      }));
    });
  }

  function renderDialogFilters() {
    const categories = [...new Set(state.entries.flatMap((entry) => entry.categories).filter(Boolean))].sort();
    const tasks = [...new Set(state.entries.flatMap((entry) => entry.tasks).filter(Boolean))].sort();
    const renderGroup = (node, values, key) => {
      clear(node);
      node.appendChild(makeChip(state.lang === "en" ? "All" : "すべて", state[key] === "all", () => {
        state[key] = "all"; localStorage.setItem(key === "category" ? LS.category : LS.task, "all"); renderDialogFilters(); render();
      }));
      values.forEach((value) => {
        node.appendChild(makeChip(humanize(value), state[key] === value, () => {
          state[key] = value; localStorage.setItem(key === "category" ? LS.category : LS.task, value); renderDialogFilters(); render();
        }));
      });
    };
    renderGroup(els.categoryFilters, categories, "category");
    renderGroup(els.taskFilters, tasks, "task");
  }

  function createThumb(entry, className) {
    const image = state.images.get(entry.id);
    if (!image) {
      const missing = document.createElement("div");
      missing.className = className === "resultThumb" ? "resultThumbMissing" : "thumbMissing";
      const kind = entryKind(entry);
      const labels = state.lang === "en"
        ? { tool:"Tool", material:"Material", task:"Task", term:"Term" }
        : { tool:"工具", material:"部材", task:"作業", term:"用語" };
      missing.textContent = labels[kind];
      missing.title = state.lang === "en" ? "Representative photo not yet reviewed" : "代表写真は未登録";
      missing.dataset.kind = kind;
      return missing;
    }
    const img = document.createElement("img");
    img.className = className;
    img.src = image.thumbnail || image.display;
    img.alt = state.lang === "en" ? (image.alt_en || entry.term.en || "") : (image.alt_ja || entry.term.ja || "");
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  }

  function renderAutocomplete() {
    clear(els.autocomplete);
    const active = document.activeElement === els.searchInput && normalized(state.q) && state.filtered.length;
    if (!active) { els.autocomplete.hidden = true; return; }
    state.filtered.slice(0, 7).forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      if (state.images.has(entry.id)) button.appendChild(createThumb(entry, "autocompleteThumb"));
      else button.classList.add("autocompleteNoImage");
      const copy = document.createElement("div");
      const strong = document.createElement("strong"); strong.textContent = primaryTerm(entry);
      const sub = document.createElement("span"); sub.textContent = secondaryTerm(entry) || primaryPair(entry.summary);
      copy.append(strong, sub); button.appendChild(copy);
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => { openDetail(entry.id, "push"); els.searchInput.blur(); els.autocomplete.hidden = true; });
      els.autocomplete.appendChild(button);
    });
    els.autocomplete.hidden = false;
  }

  function renderInterpretations() {
    clear(els.interpretationChips);
    const signals = state.interpretations || [];
    els.interpretationBar.hidden = !normalized(state.q) || !signals.length;
    signals.forEach((signal) => {
      const ja = text(signal?.label?.ja) || signal.id;
      const en = text(signal?.label?.en) || signal.id;
      const label = state.lang === "en" ? en : state.lang === "both" ? `${ja} / ${en}` : ja;
      els.interpretationChips.appendChild(makeChip(`${label} ×`, true, () => {
        state.ignoredSignals.add(signal.id); state.visibleCount = PAGE_SIZE; render();
      }));
    });
  }

  function renderList() {
    clear(els.resultList);
    const fragment = document.createDocumentFragment();
    state.filtered.slice(0, state.visibleCount).forEach((entry) => {
      const row = document.createElement("div");
      row.className = "resultRow";
      row.dataset.entryId = entry.id;
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      row.setAttribute("aria-current", String(state.current?.id === entry.id));
      if (state.images.has(entry.id)) row.appendChild(createThumb(entry, "resultThumb"));
      else row.classList.add("resultRow--no-image");

      const copy = document.createElement("div"); copy.className = "resultText";
      const title = document.createElement("div"); title.className = "resultTitle"; title.textContent = primaryTerm(entry);
      const secondary = document.createElement("div"); secondary.className = "resultSecondary"; secondary.textContent = secondaryTerm(entry);
      const summary = document.createElement("div"); summary.className = "resultSummary"; summary.textContent = primaryPair(entry.summary) || primaryPair(entry.description);
      const meta = document.createElement("div"); meta.className = "resultMeta";
      [humanize(entry.type), ...entry.categories.slice(0, 1).map(humanize)].filter(Boolean).forEach((value) => {
        const span = document.createElement("span"); span.className = "chip"; span.textContent = value; meta.appendChild(span);
      });
      const reviewedNotes = preferredItems(entry.bullets).filter((value) => !isTemplateText(value));
      const note = reviewedNotes[0] || primaryPair(entry.detail);
      const example = preferredItems(entry.examples).find((value) => !isTemplateText(value));
      const aliases = preferredItems(entry.aliases).slice(0, 3);
      copy.append(title); if (secondary.textContent) copy.append(secondary);
      if (summary.textContent) copy.append(summary);
      if (note && note !== summary.textContent && !isTemplateText(note)) {
        const context = document.createElement("div"); context.className = "resultContext";
        context.textContent = (state.lang === "en" ? "Use / note: " : "用途・注意：") + note;
        copy.append(context);
      }
      if (example) {
        const usage = document.createElement("div"); usage.className = "resultExample";
        usage.textContent = (state.lang === "en" ? "Example: " : "使用例：") + example;
        copy.append(usage);
      }
      if (aliases.length) {
        const alias = document.createElement("div"); alias.className = "resultAliases";
        alias.textContent = (state.lang === "en" ? "Also: " : "別名：") + aliases.join(" / ");
        copy.append(alias);
      }
      copy.append(meta);

      const star = document.createElement("button"); star.type = "button"; star.className = `starButton${state.favs.has(entry.id) ? " active" : ""}`; star.textContent = state.favs.has(entry.id) ? "★" : "☆";
      star.setAttribute("aria-label", state.favs.has(entry.id) ? "Remove favorite" : "Add favorite");
      star.addEventListener("click", (event) => { event.stopPropagation(); toggleFavorite(entry.id); });
      const open = () => openDetail(entry.id, "push");
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
      row.append(copy, star); fragment.appendChild(row);
    });
    els.resultList.appendChild(fragment);

    els.resultCount.textContent = state.lang === "en" ? `${state.filtered.length} results` : `${state.filtered.length}件`;
    els.resultHint.textContent = normalized(state.q) && !state.filtered.length ? (state.lang === "en" ? "No matches" : "一致する用語がありません") : "";
    const shown = Math.min(state.visibleCount, state.filtered.length);
    const more = shown < state.filtered.length;
    els.loadMoreWrap.hidden = !more;
    els.loadMoreHint.textContent = more ? `${shown} / ${state.filtered.length}` : "";
    renderAutocomplete();
  }

  function renderPair(node, value) {
    clear(node);
    if (state.lang !== "both") { node.textContent = primaryPair(value); return; }
    const wrap = document.createElement("div"); wrap.className = "dual";
    [["JA", value.ja], ["EN", value.en]].forEach(([label, body]) => {
      if (!body) return;
      const item = document.createElement("div");
      const tag = document.createElement("span"); tag.className = "langTag"; tag.textContent = label;
      const content = document.createElement("div"); content.textContent = body;
      item.append(tag, content); wrap.appendChild(item);
    });
    node.appendChild(wrap);
  }

  function renderArray(node, value) {
    clear(node);
    if (state.lang === "both") {
      let count = 0;
      for (const [code, items] of [["JA", value.ja], ["EN", value.en]]) {
        for (const item of items) {
          const li = document.createElement("li");
          const tag = document.createElement("span"); tag.className = "langTag";
          tag.textContent = code;
          li.append(tag, document.createTextNode(item));
          node.appendChild(li); count++;
        }
      }
      return count;
    }
    const values = state.lang === "en" ? value.en : value.ja;
    values.forEach((item) => { const li = document.createElement("li"); li.textContent = item; node.appendChild(li); });
    return values.length;
  }

  function imageCaption(item) {
    const source = item.source || {};
    const bits = [];
    if (text(source.attribution || source.author)) bits.push(text(source.attribution || source.author));
    if (text(source.license)) bits.push(text(source.license));
    return bits.join(" · ");
  }

  function renderImage(entry) {
    clear(els.detailImage);
    const image = state.images.get(entry.id);
    els.detailImage.hidden = !image;
    // Do not reserve space or repeat a missing-photo message for entries without reviewed imagery.
    els.detailImageMissing.hidden = true;
    if (!image) return;
    const img = document.createElement("img");
    img.src = image.display;
    img.alt = state.lang === "en" ? (image.alt_en || entry.term.en || "") : (image.alt_ja || entry.term.ja || "");
    img.decoding = "async";
    const captionText = imageCaption(image);
    els.detailImage.appendChild(img);
    if (captionText || image.source?.source_page) {
      const caption = document.createElement("figcaption");
      if (captionText) caption.append(captionText);
      if (image.source?.source_page) {
        if (captionText) caption.append(" · ");
        const link = document.createElement("a"); link.href = image.source.source_page; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = state.lang === "en" ? "source" : "出典"; caption.appendChild(link);
      }
      els.detailImage.appendChild(caption);
    }
  }

  function renderTaxonomy(entry) {
    clear(els.detailTaxonomy);
    const labels = unique([humanize(entry.type), ...entry.categories.map(humanize), ...entry.tasks.map(humanize)]).filter(Boolean).slice(0, 8);
    labels.forEach((label) => { const span = document.createElement("span"); span.className = "chip"; span.textContent = label; els.detailTaxonomy.appendChild(span); });
  }

  function browseInSameContext(entry) {
    // Common task/category links are suggestions for browsing, NOT asserted tool relationships.
    const generic = new Set(["tool","material","term","task","general","construction","site","all"]);
    const tasks = new Set(entry.tasks.filter(x => !generic.has(normalized(x))));
    const categories = new Set(entry.categories.filter(x => !generic.has(normalized(x))));
    return state.entries.filter(item => item.id !== entry.id).map(item => {
      const sharedTasks = item.tasks.filter(x => tasks.has(x)).length;
      const sharedCategories = item.categories.filter(x => categories.has(x)).length;
      return { item, score: sharedTasks * 3 + sharedCategories * 2 };
    }).filter(x => x.score >= 2)
      .sort((a,b) => b.score - a.score || primaryTerm(a.item).localeCompare(primaryTerm(b.item), state.lang === "en" ? "en" : "ja"))
      .slice(0,6).map(x => x.item);
  }

  function renderRelated(entry) {
    clear(els.detailRelated);
    const maintained = entry.relationIds.map(id => state.entryById.get(resolveId(id)))
      .filter(Boolean).filter((item,index,arr) => arr.findIndex(x => x.id === item.id) === index)
      .filter(item => item.id !== entry.id).slice(0,12);
    const inferred = maintained.length === 0;
    const entries = inferred ? browseInSameContext(entry) : maintained;
    els.relatedHeading.textContent = inferred
      ? (state.lang === "en" ? "Explore the same task / category" : "同じ作業・分類から探す")
      : (state.lang === "en" ? "Maintained related entries" : "関連する工具・材料（登録済み）");
    els.relatedSection.hidden = !entries.length;
    entries.forEach(item => {
      const button = document.createElement("button"); button.type = "button";
      button.textContent = primaryTerm(item);
      button.addEventListener("click", () => openDetail(item.id,"push"));
      els.detailRelated.appendChild(button);
    });
  }

  function renderAffiliate(entry) {
    clear(els.affiliateMount); clear(els.affiliateDisclosure);
    const offer = state.offers.get(entry.id);
    const helper = window.NWAmazonAffiliate;
    if (!offer || offer.status !== "active" || !helper) { els.affiliateSection.hidden = true; return; }
    const label = state.lang === "en" ? offer.label_en : offer.label_ja;
    const mounted = helper.mountUrl({ container: els.affiliateMount, target: entry.id, url: offer.amazon_url, label: label || "Amazon", placement: "detail" });
    if (!mounted) { els.affiliateSection.hidden = true; return; }
    helper.renderDisclosure(els.affiliateDisclosure, { includeEnglish: state.lang !== "ja" });
    if (state.lang === "en") els.affiliateDisclosure.querySelectorAll('[lang="ja"]').forEach((node) => node.hidden = true);
    els.affiliateSection.hidden = false;
  }

  function composeDefinition(entry) {
    // Preserve reviewed source copy. Short source definitions may be shown with
    // their existing subject-specific notes rather than artificially generated filler.
    const definition = { ...entry.description };
    const notes = { ...entry.detail };
    for (const [language,definitionLimit,detailMin] of [["ja",60,65],["en",135,125]]) {
      const lead = definition[language] || "";
      const context = notes[language] || "";
      if (lead.length && lead.length < definitionLimit &&
          context.length >= detailMin && !context.includes(lead)) {
        definition[language] = lead + "\n" + context;
        notes[language] = ""; // Don't repeat the same text under the next heading.
      }
    }
    return { definition, notes };
  }

  function renderDetail(entry) {
    if (!entry) return;
    els.detailEyebrow.textContent = humanize(entry.type) || (state.lang === "en" ? "Dictionary entry" : "辞書項目");
    els.detailTitle.textContent = primaryTerm(entry);
    els.detailSecondary.textContent = secondaryTerm(entry);
    renderTaxonomy(entry);
    renderImage(entry);
    const composed = composeDefinition(entry);
    renderPair(els.detailDefinition, composed.definition);

    const hasNotes = Boolean(composed.notes.ja || composed.notes.en || entry.bullets.ja.length || entry.bullets.en.length);
    els.notesSection.hidden = !hasNotes;
    els.detailNotes.hidden = !composed.notes.ja && !composed.notes.en;
    renderPair(els.detailNotes, composed.notes);
    renderArray(els.detailBullets, entry.bullets);

    const hasExamples = renderArray(els.detailExamples, entry.examples);
    els.examplesSection.hidden = !hasExamples;

    clear(els.detailAliases);
    const aliases = state.lang === "en" ? entry.aliases.en : state.lang === "both" ? unique([...entry.aliases.ja, ...entry.aliases.en]) : entry.aliases.ja;
    aliases.forEach((alias) => { const span = document.createElement("span"); span.textContent = alias; els.detailAliases.appendChild(span); });
    els.aliasesSection.hidden = !aliases.length;

    renderRelated(entry);
    renderAffiliate(entry);
    els.detailLink.textContent = canonicalUrl(entry.id);
    els.detailFavorite.textContent = state.favs.has(entry.id) ? (state.lang === "en" ? "★ Favorited" : "★ お気に入り") : (state.lang === "en" ? "☆ Favorite" : "☆ お気に入り");
  }

  function resolveId(id) { return window.CTA_DATA_LOADER?.resolveCanonicalId?.(id) || id; }
  function canonicalUrl(id) {
    const url = new URL(window.location.href);
    url.searchParams.set("entry", id);
    url.hash = "";
    return url.toString();
  }
  function setEntryInUrl(id, mode) {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("entry", id); else url.searchParams.delete("entry");
    const method = mode === "replace" ? "replaceState" : "pushState";
    history[method]({ entry: id || null }, "", url);
  }

  function openDetail(id, historyMode = "none") {
    const canonicalId = resolveId(id);
    const entry = state.entryById.get(canonicalId);
    if (!entry) return false;
    state.current = entry;
    els.detailEmpty.hidden = true;
    els.detailContent.hidden = false;
    els.detailPanel.dataset.open = "true";
    if (isMobile()) els.mobileBackdrop.hidden = false;
    renderDetail(entry); renderList();
    if (historyMode === "push" || historyMode === "replace") setEntryInUrl(entry.id, historyMode);
    return true;
  }
  function closeDetail(updateUrl = true) {
    state.current = null;
    els.detailContent.hidden = true;
    els.detailEmpty.hidden = false;
    els.detailPanel.dataset.open = "false";
    els.mobileBackdrop.hidden = true;
    renderList();
    if (updateUrl) setEntryInUrl("", "replace");
  }

  function saveFavorites() {
    localStorage.setItem(LS.favs, JSON.stringify([...state.favs]));
  }
  function toggleFavorite(id) {
    if (state.favs.has(id)) state.favs.delete(id); else state.favs.add(id);
    saveFavorites();
    if (state.current?.id === id) renderDetail(state.current);
    render();
  }
  async function exportFavorites() {
    const payload = JSON.stringify({ v: 1, tool: "construction-tools-atlas", type: "favorites", ids: [...state.favs] }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      const original = els.exportFavsBtn.textContent;
      els.exportFavsBtn.textContent = state.lang === "en" ? "Copied" : "コピー済み";
      setTimeout(() => { els.exportFavsBtn.textContent = original; }, 1200);
    } catch (_) { window.prompt(state.lang === "en" ? "Copy favorites JSON:" : "お気に入りJSONをコピーしてください:", payload); }
  }
  function importFavorites() {
    const raw = window.prompt(state.lang === "en" ? "Paste favorites JSON:" : "お気に入りJSONを貼り付けてください:");
    if (!raw) return;
    const payload = readJson(raw, null);
    if (!payload || !Array.isArray(payload.ids)) return;
    const valid = unique(payload.ids.map(resolveId)).filter((id) => state.entryById.has(id));
    state.favs = new Set(valid);
    saveFavorites();
    state.visibleCount = PAGE_SIZE;
    render();
  }

  function applyLanguageChrome() {
    document.documentElement.lang = state.lang === "en" ? "en" : "ja";
    $$('[data-lang]', els.langControl).forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang)));
    const en = state.lang === "en";
    els.pageTitle.textContent = en ? "Construction Tools Atlas" : "建設工具・現場用語辞典";
    els.pageLead.textContent = en ? "Search construction tools, materials, tasks and site terminology by English, Japanese or aliases." : "工具名・材料名・作業名・現場用語を、日本語・英語・別名から検索できます。";
    els.privacyNote.textContent = en ? "Dictionary search runs in your browser; search terms are not sent to an external search service." : "検索はブラウザ内で処理され、検索語は外部の検索サービスへ送信しません。";
    els.searchInput.placeholder = en ? "e.g. impact driver / drywall / drill holes in concrete" : "例：インパクト / 石膏ボード / コンクリに穴あける電動のやつ";
    els.actionLabel.textContent = en ? "Action" : "動作";
    els.typeLabel.textContent = en ? "Type" : "種類";
    els.openFilters.textContent = en ? "More filters" : "詳細フィルター";
    els.interpretationLabel.textContent = en ? "Interpreted as" : "検索の解釈";
    els.filterDialogTitle.textContent = en ? "More filters" : "詳細フィルター";
    els.categoryHeading.textContent = en ? "Category" : "カテゴリ";
    els.taskHeading.textContent = en ? "Task" : "作業";
    els.favoritesTransferHeading.textContent = en ? "Favorites data" : "お気に入りデータ";
    els.exportFavsBtn.textContent = en ? "Export" : "エクスポート";
    els.importFavsBtn.textContent = en ? "Import" : "インポート";
    els.resetFilters.textContent = en ? "Reset" : "リセット";
    els.whatHeading.textContent = en ? "What is it?" : "これは何？";
    els.notesHeading.textContent = en ? "Main uses / notes" : "主な用途・注意";
    els.examplesHeading.textContent = en ? "Typical use" : "よく使われる場面";
    els.aliasesHeading.textContent = en ? "Aliases" : "別名・呼び方";
    els.relatedHeading.textContent = en ? "Related tools / materials" : "関連する工具・材料";
    els.affiliateHeading.textContent = en ? "Find related tools / materials" : "関連する工具・材料を探す";
    els.affiliateLead.textContent = en ? "Amazon links are shown only for explicitly maintained canonical mappings." : "購入先の参考として、管理済みの項目だけAmazonへのリンクを表示します。";
    els.loadMore.textContent = en ? "Load more" : "さらに表示";
    els.detailImageMissing.textContent = en ? "Photo not yet reviewed; the definition and usage are available." : "代表写真は未登録です。説明・使用例は閲覧できます。";
    els.favoritesToggle.textContent = state.favOnly ? (en ? "★ Favorites" : "★ お気に入り") : (en ? "☆ Favorites" : "☆ お気に入り");
  }

  function renderQuickStart() {
    clear(els.dictionaryJumpButtons);
    const entries = STARTER_IDS.map(id => state.entryById.get(id)).filter(Boolean);
    els.dictionaryJump.hidden = !entries.length;
    els.dictionaryJumpLabel.textContent = state.lang === "en" ? "Open an example entry" : "用語の実例を見る";
    entries.forEach(entry => {
      const button = document.createElement("button"); button.type = "button";
      button.textContent = primaryTerm(entry);
      button.addEventListener("click", () => openDetail(entry.id,"push"));
      els.dictionaryJumpButtons.appendChild(button);
    });
  }

  function render() {
    if (!state.ready) return;
    applyLanguageChrome();
    refreshFiltered();
    renderPrimaryFilters();
    renderQuickStart();
    renderInterpretations();
    renderList();
    els.favoritesToggle.setAttribute("aria-pressed", String(state.favOnly));
    if (state.current) renderDetail(state.current);
  }

  async function fetchJson(url) {
    try {
      const response = await window.fetch(url);
      if (!response.ok) return null;
      return await response.json();
    } catch (_) { return null; }
  }

  function buildImageMap(registry) {
    const formalStates = new Set(["reviewed", "verified"]);
    const direct = new Map();
    const inherited = [];
    for (const row of Array.isArray(registry?.items) ? registry.items : []) {
      if (!formalStates.has(row?.image_state) || row?.subject_match !== "matched" || row?.migration_state !== "promoted") continue;
      const id = text(row?.entry_id); const display = text(row?.primary?.display);
      if (!id || !display) continue;
      const item = { id, display, thumbnail: text(row?.primary?.thumbnail), alt_ja: text(row?.alt_ja), alt_en: text(row?.alt_en), source: row?.source || {} };
      const resolved = resolveId(id);
      if (resolved === id) direct.set(id, item); else inherited.push([resolved, item]);
    }
    inherited.forEach(([resolved, item]) => { if (resolved && !direct.has(resolved)) direct.set(resolved, { ...item, id: resolved }); });
    return direct;
  }

  function buildOfferMap(payload) {
    const map = new Map();
    const targets = {};
    for (const offer of Array.isArray(payload?.offers) ? payload.offers : []) {
      const id = resolveId(text(offer?.entry_id));
      if (!id || offer?.status !== "active" || map.has(id)) continue;
      map.set(id, { ...offer, entry_id: id });
      targets[id] = offer.amazon_url;
    }
    window.NWAmazonAffiliate?.configure?.({ enabled: true, tool: "construction-tools-atlas", targets });
    return map;
  }

  async function loadData() {
    els.loadingState.hidden = false;
    const [rawEntries, dictionary, registry, offers] = await Promise.all([
      window.CTA_DATA_LOADER?.loadEntries?.() || Promise.resolve([]),
      fetchJson("./data/search-dictionary-v2.3.json"),
      fetchJson("./data/image-registry-v2.3.json"),
      fetchJson("./data/affiliate-offers-v2.3.json")
    ]);
    const seenIds = new Set(); const seenTerms = new Set();
    state.entries = (Array.isArray(rawEntries) ? rawEntries : []).map(normalizeEntry).filter((entry) => {
      const key = entryTermKey(entry);
      if (!entry.id || seenIds.has(entry.id) || (key !== "::" && seenTerms.has(key))) return false;
      seenIds.add(entry.id); if (key !== "::") seenTerms.add(key); return true;
    });
    state.entryById = new Map(state.entries.map((entry) => [entry.id, entry]));
    if (dictionary && window.CTA_SEMANTIC_SEARCH?.createEngine) state.searchEngine = window.CTA_SEMANTIC_SEARCH.createEngine(dictionary);
    state.images = buildImageMap(registry);
    state.offers = buildOfferMap(offers);
    state.ready = true;
    els.loadingState.hidden = true;
    render();

    const requested = new URL(window.location.href).searchParams.get("entry");
    if (requested) {
      if (!openDetail(requested, "none")) {
        setEntryInUrl("", "replace");
        if (!isMobile()) {
          const fallback = STARTER_IDS.find(id => state.entryById.has(id)) || state.filtered[0]?.id;
          if (fallback) openDetail(fallback, "none");
        }
      } else if (resolveId(requested) !== requested) setEntryInUrl(state.current.id, "replace");
    } else if (!isMobile()) {
      // Keep a useful term visible even if the curated starter set changes.
      const starter = STARTER_IDS.find(id => state.entryById.has(id)) || state.filtered[0]?.id;
      if (starter) openDetail(starter, "none");
    }
  }

  function copyCurrentLink() {
    if (!state.current) return;
    const url = canonicalUrl(state.current.id);
    navigator.clipboard?.writeText(url).then(() => {
      const original = els.detailCopy.textContent;
      els.detailCopy.textContent = state.lang === "en" ? "Copied" : "コピー済み";
      setTimeout(() => { els.detailCopy.textContent = original; }, 1200);
    }).catch(() => {});
  }
  async function shareCurrent() {
    if (!state.current) return;
    const url = canonicalUrl(state.current.id);
    if (navigator.share) {
      try { await navigator.share({ title: primaryTerm(state.current), url }); return; } catch (_) { }
    }
    copyCurrentLink();
  }

  function wire() {
    bindElements();
    $$('[data-lang]', els.langControl).forEach((button) => button.addEventListener("click", () => {
      state.lang = button.dataset.lang;
      localStorage.setItem(LS.lang, state.lang);
      render();
      if (els.filterDialog.open) renderDialogFilters();
    }));
    els.favoritesToggle.addEventListener("click", () => { state.favOnly = !state.favOnly; localStorage.setItem(LS.favOnly, String(state.favOnly)); state.visibleCount = PAGE_SIZE; render(); });
    els.searchInput.addEventListener("input", () => { state.q = els.searchInput.value; state.ignoredSignals.clear(); state.visibleCount = PAGE_SIZE; els.clearSearch.hidden = !state.q; render(); });
    els.searchInput.addEventListener("focus", renderAutocomplete);
    els.searchInput.addEventListener("blur", () => setTimeout(() => { els.autocomplete.hidden = true; }, 100));
    els.clearSearch.addEventListener("click", () => { state.q = ""; els.searchInput.value = ""; els.clearSearch.hidden = true; state.ignoredSignals.clear(); state.visibleCount = PAGE_SIZE; render(); els.searchInput.focus(); });
    els.loadMore.addEventListener("click", () => { state.visibleCount += PAGE_SIZE; renderList(); });
    els.openFilters.addEventListener("click", () => { renderDialogFilters(); els.filterDialog.showModal(); });
    els.resetFilters.addEventListener("click", () => {
      state.action = state.type = state.category = state.task = "all";
      [LS.action,LS.type,LS.category,LS.task].forEach((key) => localStorage.setItem(key,"all"));
      state.visibleCount = PAGE_SIZE;
      render();
      renderDialogFilters();
    });
    els.exportFavsBtn.addEventListener("click", exportFavorites);
    els.importFavsBtn.addEventListener("click", importFavorites);
    els.detailClose.addEventListener("click", () => closeDetail(true));
    els.mobileBackdrop.addEventListener("click", () => closeDetail(true));
    els.detailFavorite.addEventListener("click", () => state.current && toggleFavorite(state.current.id));
    els.detailCopy.addEventListener("click", copyCurrentLink);
    els.detailShare.addEventListener("click", shareCurrent);
    window.addEventListener("popstate", () => {
      const id = new URL(window.location.href).searchParams.get("entry");
      if (id) openDetail(id, "none"); else closeDetail(false);
    });
    window.matchMedia(MOBILE_QUERY).addEventListener?.("change", () => {
      els.mobileBackdrop.hidden = !(state.current && isMobile());
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wire();
    applyLanguageChrome();
    loadData().catch((error) => {
      console.error("Construction Tools Atlas load failed", error);
      els.loadingState.textContent = state.lang === "en" ? "Failed to load dictionary." : "辞書の読み込みに失敗しました。";
    });
  });
})();
