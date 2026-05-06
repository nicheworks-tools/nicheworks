(() => {
  "use strict";

  const $ = (q, el = document) => el.querySelector(q);

  const state = {
    entries: [],
    filtered: [],
    q: "",
    action: "all",
    visible: 50,
    pageSize: 50,
    current: null,
    favs: new Set(JSON.parse(localStorage.getItem("cta_favs") || "[]")),
    lang: localStorage.getItem("cta_uilang") || "ja"
  };

  const ACTIONS = [
    { id: "all", label: "All", tokens: [] },
    { id: "cut", label: "Cut", tokens: ["cut", "cutting", "saw", "切", "切断"] },
    { id: "fasten", label: "Fasten", tokens: ["fasten", "fastening", "screw", "bolt", "締", "固定"] },
    { id: "measure", label: "Measure", tokens: ["measure", "measuring", "level", "scale", "測", "墨"] },
    { id: "drill", label: "Drill", tokens: ["drill", "drilling", "穴"] }
  ];

  function saveFavs() {
    localStorage.setItem("cta_favs", JSON.stringify([...state.favs]));
  }

  function toArray(v) {
    return Array.isArray(v) ? v : v ? [v] : [];
  }

  function normalizePackArray(item) {
    const [id, ja, en, cat, task, summaryJa, summaryEn, detailJa, detailEn, aliasesJa = [], aliasesEn = []] = item;
    const safeSummaryJa = summaryJa || `${ja}：${cat || "現場"}分野の${task || "作業"}に関する用語`;
    const safeSummaryEn = summaryEn || `${en}: a ${cat || "site"} term related to ${task || "construction"} work.`;
    const safeDetailJa = detailJa || `${ja}は、${cat || "建設"}分野で使われる現場用語です。用途、材料、周辺部材、施工条件を合わせて確認します。`;
    const safeDetailEn = detailEn || `${en} is a construction reference term used in ${cat || "site"} work. Check purpose, materials, adjacent components, and work conditions together.`;
    return {
      id,
      termJa: ja || "",
      termEn: en || "",
      summaryJa: safeSummaryJa,
      summaryEn: safeSummaryEn,
      detailJa: safeDetailJa,
      detailEn: safeDetailEn,
      aliasesJa: toArray(aliasesJa),
      aliasesEn: toArray(aliasesEn),
      categories: [cat].filter(Boolean),
      tasks: [task].filter(Boolean),
      type: "pack_term",
      fuzzy: [ja, en, cat, task, ...toArray(aliasesJa), ...toArray(aliasesEn)].filter(Boolean),
      examplesJa: [`${ja}を使う場面を確認する。`],
      examplesEn: [`Check when ${en} is used.`],
      bulletsJa: ["用途と施工条件を確認する。", "必要に応じて公式資料や現場基準を確認する。"],
      bulletsEn: ["Confirm purpose and work conditions.", "Check official or site-specific standards when needed."]
    };
  }

  function normalizeObject(x, i) {
    const term = x.term || {};
    const aliases = x.aliases || x.alias || {};
    const summary = x.summary || {};
    const detail = x.detail || x.description || x.desc || x.definition || {};
    const bullets = x.bullets || {};
    const examples = x.examples || x.example || x.usage || {};
    return {
      id: x.id || x.slug || `entry_${i}`,
      termJa: term.ja || x.ja || x.jp || "",
      termEn: term.en || x.en || "",
      summaryJa: summary.ja || x.summary_ja || "",
      summaryEn: summary.en || x.summary_en || "",
      detailJa: detail.ja || x.detail_ja || x.description_ja || "",
      detailEn: detail.en || x.detail_en || x.description_en || "",
      aliasesJa: toArray(aliases.ja || x.aliases_ja),
      aliasesEn: toArray(aliases.en || x.aliases_en),
      categories: toArray(x.categories || x.category).flat().filter(Boolean),
      tasks: toArray(x.tasks || x.task).flat().filter(Boolean),
      type: x.type || "",
      fuzzy: toArray(x.fuzzy).flat().filter(Boolean),
      examplesJa: toArray(examples.ja || x.examples_ja || x.usage_ja),
      examplesEn: toArray(examples.en || x.examples_en || x.usage_en),
      bulletsJa: toArray(bullets.ja || x.bullets_ja),
      bulletsEn: toArray(bullets.en || x.bullets_en)
    };
  }

  function normalize(raw) {
    const arr = Array.isArray(raw) ? raw : Array.isArray(raw?.entries) ? raw.entries : Array.isArray(raw?.data) ? raw.data : [];
    return arr.map((x, i) => Array.isArray(x) ? normalizePackArray(x) : normalizeObject(x, i)).filter((x) => x.id && (x.termJa || x.termEn));
  }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`${path} ${res.status}`);
    return res.json();
  }

  async function loadAll() {
    const base = await fetchJson("./data/tools.basic.json?v=20260506-safe");
    const baseEntries = normalize(base);
    let packs = [];
    try {
      const manifest = await fetchJson("./data/packs/manifest.json?v=20260506-safe");
      const files = Array.isArray(manifest.files) ? manifest.files : [];
      const results = await Promise.all(files.map(async (file) => {
        try {
          return normalize(await fetchJson(`./data/packs/${file}?v=20260506-safe`));
        } catch (err) {
          console.warn("CTA pack skipped", file, err);
          return [];
        }
      }));
      packs = results.flat();
    } catch (err) {
      console.warn("CTA packs unavailable", err);
    }
    const seen = new Set();
    state.entries = baseEntries.concat(packs).filter((item) => {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  function hay(e) {
    return [e.termJa, e.termEn, e.summaryJa, e.summaryEn, e.detailJa, e.detailEn, ...e.aliasesJa, ...e.aliasesEn, ...e.categories, ...e.tasks, ...e.fuzzy].join(" ").toLowerCase();
  }

  function applyFilter() {
    const q = state.q.trim().toLowerCase();
    const action = ACTIONS.find((a) => a.id === state.action) || ACTIONS[0];
    state.filtered = state.entries.filter((e) => {
      const h = hay(e);
      if (q && !q.split(/\s+/).every((token) => h.includes(token))) return false;
      if (action.id !== "all" && !action.tokens.some((token) => h.includes(token.toLowerCase()))) return false;
      return true;
    });
  }

  function rowTitle(e) {
    return `${e.termEn || "—"} / ${e.termJa || "—"}`;
  }

  function summary(e) {
    return state.lang === "ja" ? (e.summaryJa || e.summaryEn || e.detailJa || e.detailEn || "") : (e.summaryEn || e.summaryJa || e.detailEn || e.detailJa || "");
  }

  function detail(e) {
    return state.lang === "ja" ? (e.detailJa || e.detailEn || e.summaryJa || e.summaryEn || "") : (e.detailEn || e.detailJa || e.summaryEn || e.summaryJa || "");
  }

  function renderActions() {
    const box = $("#actionChips");
    if (!box) return;
    box.innerHTML = "";
    ACTIONS.forEach((a) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pillbtn" + (state.action === a.id ? " pillbtn--accent" : "");
      b.textContent = a.label;
      b.addEventListener("click", () => {
        state.action = a.id;
        state.visible = state.pageSize;
        render();
      });
      box.appendChild(b);
    });
  }

  function renderList() {
    const list = $("#resultList");
    const count = $("#resultCount");
    const hint = $("#hintText");
    const status = $("#statusArea");
    const moreWrap = $("#loadMoreWrap");
    const moreBtn = $("#loadMoreBtn");
    const moreHint = $("#loadMoreHint");
    if (!list) return;
    list.innerHTML = "";
    if (status) status.hidden = true;
    if (count) count.textContent = `Results: ${state.filtered.length}`;
    if (hint) hint.textContent = state.filtered.length ? "" : (state.lang === "ja" ? "一致する用語がありません" : "No matches");

    const visible = state.filtered.slice(0, state.visible);
    const frag = document.createDocumentFragment();
    visible.forEach((e) => {
      const row = document.createElement("div");
      row.className = "row";
      row.tabIndex = 0;
      const main = document.createElement("div");
      main.className = "row__main";
      const title = document.createElement("div");
      title.className = "row__title";
      title.textContent = rowTitle(e);
      const desc = document.createElement("div");
      desc.className = "row__desc";
      desc.textContent = summary(e) || (state.lang === "ja" ? "（説明なし）" : "(no description)");
      const meta = document.createElement("div");
      meta.className = "row__meta";
      [e.type, ...e.categories, ...e.tasks].filter(Boolean).slice(0, 4).forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = tag;
        meta.appendChild(chip);
      });
      main.append(title, desc, meta);
      const star = document.createElement("button");
      star.type = "button";
      star.className = "starbtn";
      star.textContent = state.favs.has(e.id) ? "★" : "☆";
      star.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (state.favs.has(e.id)) state.favs.delete(e.id); else state.favs.add(e.id);
        saveFavs();
        renderList();
      });
      row.addEventListener("click", () => openDetail(e));
      row.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") openDetail(e); });
      row.append(main, star);
      frag.appendChild(row);
    });
    list.appendChild(frag);

    const hasMore = state.filtered.length > state.visible;
    if (moreWrap) moreWrap.hidden = !hasMore;
    if (moreBtn) moreBtn.textContent = state.lang === "ja" ? "さらに表示" : "Load more";
    if (moreHint) moreHint.textContent = state.lang === "ja" ? `表示中: ${Math.min(state.visible, state.filtered.length)} / ${state.filtered.length}` : `Showing ${Math.min(state.visible, state.filtered.length)} / ${state.filtered.length}`;
  }

  function render() {
    state.lang = localStorage.getItem("cta_uilang") || state.lang || "ja";
    applyFilter();
    renderActions();
    renderList();
  }

  function showOverlay(show) {
    const overlay = $("#overlay");
    if (overlay) overlay.hidden = !show;
  }

  function openDetail(e) {
    state.current = e;
    const sheet = $("#detailSheet");
    if (!sheet) return;
    $("#detailTitle") && ($("#detailTitle").textContent = state.lang === "ja" ? "詳細" : "Detail");
    $("#detailStar") && ($("#detailStar").textContent = state.favs.has(e.id) ? "★" : "☆");
    const chips = $("#detailChips");
    const terms = $("#detailTerms");
    const desc = $("#detailDesc");
    const bullets = $("#detailBullets");
    if (chips) {
      chips.innerHTML = "";
      [e.type, ...e.categories, ...e.tasks].filter(Boolean).slice(0, 8).forEach((tag) => {
        const s = document.createElement("span");
        s.className = "chip";
        s.textContent = tag;
        chips.appendChild(s);
      });
    }
    if (terms) terms.textContent = rowTitle(e);
    if (desc) desc.textContent = detail(e) || summary(e) || "";
    if (bullets) {
      bullets.innerHTML = "";
      const bs = state.lang === "ja" ? e.bulletsJa : e.bulletsEn;
      (bs.length ? bs : [state.lang === "ja" ? "用途と施工条件を確認してください。" : "Confirm purpose and work conditions."]).forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        bullets.appendChild(li);
      });
    }
    fillPanel("#tabMeaning", [detail(e), summary(e)].filter(Boolean));
    fillPanel("#tabExamples", state.lang === "ja" ? e.examplesJa : e.examplesEn);
    fillPanel("#tabAliases", (state.lang === "ja" ? e.aliasesJa : e.aliasesEn));
    fillPanel("#tabMeta", [`ID: ${e.id}`, `Category: ${e.categories.join(", ") || "-"}`, `Task: ${e.tasks.join(", ") || "-"}`]);
    ["#tabExamples", "#tabAliases", "#tabMeta"].forEach((sel) => { const el = $(sel); if (el) el.hidden = true; });
    const meaning = $("#tabMeaning");
    if (meaning) meaning.hidden = false;
    document.querySelectorAll("#detailTabs .tab").forEach((btn) => btn.classList.toggle("tab--active", btn.dataset.tab === "meaning"));
    sheet.hidden = false;
    showOverlay(true);
  }

  function fillPanel(selector, items) {
    const el = $(selector);
    if (!el) return;
    el.innerHTML = "";
    const list = document.createElement("ul");
    (items && items.length ? items : [state.lang === "ja" ? "情報はありません。" : "No information."]).forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      list.appendChild(li);
    });
    el.appendChild(list);
  }

  function bind() {
    const input = $("#searchInput");
    if (input) {
      input.addEventListener("input", () => {
        state.q = input.value || "";
        state.visible = state.pageSize;
        render();
      });
    }
    const clear = $("#clearBtn");
    if (clear) clear.addEventListener("click", () => { if (input) input.value = ""; state.q = ""; state.visible = state.pageSize; render(); });
    const more = $("#loadMoreBtn");
    if (more) more.addEventListener("click", () => { state.visible += state.pageSize; renderList(); });
    const close = $("#detailClose");
    if (close) close.addEventListener("click", () => { const s = $("#detailSheet"); if (s) s.hidden = true; showOverlay(false); });
    const star = $("#detailStar");
    if (star) star.addEventListener("click", () => {
      const e = state.current;
      if (!e) return;
      if (state.favs.has(e.id)) state.favs.delete(e.id); else state.favs.add(e.id);
      saveFavs();
      star.textContent = state.favs.has(e.id) ? "★" : "☆";
      renderList();
    });
    document.querySelectorAll("#detailTabs .tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.tab;
        document.querySelectorAll("#detailTabs .tab").forEach((b) => b.classList.toggle("tab--active", b === btn));
        ["meaning", "examples", "aliases", "meta"].forEach((key) => {
          const el = $(`#tab${key[0].toUpperCase()}${key.slice(1)}`);
          if (el) el.hidden = key !== name;
        });
      });
    });
    const lang = $("#langBtn");
    if (lang) lang.addEventListener("click", () => setTimeout(render, 0));
  }

  async function boot() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 80));
      await loadAll();
      bind();
      render();
    } catch (err) {
      console.error("CTA safe pack apply failed", err);
    }
  }

  boot();
})();
