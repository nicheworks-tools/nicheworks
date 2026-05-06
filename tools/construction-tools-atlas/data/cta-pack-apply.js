(() => {
  "use strict";

  const TARGET = 5000;
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
    { id: "cut", label: "Cut", tokens: ["cut", "cutting", "saw", "blade", "切", "切断"] },
    { id: "fasten", label: "Fasten", tokens: ["fasten", "fastening", "screw", "bolt", "anchor", "締", "固定"] },
    { id: "measure", label: "Measure", tokens: ["measure", "measuring", "level", "scale", "laser", "測", "墨"] },
    { id: "drill", label: "Drill", tokens: ["drill", "drilling", "bit", "穴"] }
  ];

  const domains = [
    ["大工", "Carpentry", "carpentry"], ["内装", "Interior", "interior"], ["外装", "Exterior", "exterior"], ["左官", "Plastering", "plastering"], ["塗装", "Painting", "painting"],
    ["電気", "Electrical", "electrical"], ["設備", "MEP", "mep"], ["配管", "Plumbing", "plumbing"], ["空調", "HVAC", "hvac"], ["防水", "Waterproofing", "waterproofing"],
    ["屋根", "Roofing", "roofing"], ["足場", "Scaffolding", "scaffolding"], ["型枠", "Formwork", "formwork"], ["鉄筋", "Rebar", "rebar"], ["コンクリート", "Concrete", "concrete"],
    ["土工", "Earthwork", "earthwork"], ["解体", "Demolition", "demolition"], ["測量", "Surveying", "surveying"], ["墨出し", "Layout", "layout"], ["安全", "Safety", "safety"],
    ["建具", "Joinery", "joinery"], ["床", "Flooring", "flooring"], ["天井", "Ceiling", "ceiling"], ["壁", "Wall", "wall"], ["基礎", "Foundation", "foundation"],
    ["舗装", "Paving", "paving"], ["造園", "Landscaping", "landscaping"], ["金属", "Metalwork", "metalwork"], ["溶接", "Welding", "welding"], ["清掃", "Cleaning", "cleaning"]
  ];

  const nouns = [
    ["工具", "tool"], ["材料", "material"], ["部材", "component"], ["金物", "hardware"], ["ビス", "screw"], ["ボルト", "bolt"], ["ナット", "nut"], ["アンカー", "anchor"],
    ["下地", "backing"], ["仕上げ", "finish"], ["目地", "joint"], ["開口", "opening"], ["枠", "frame"], ["板材", "board"], ["シート", "sheet"], ["テープ", "tape"],
    ["接着剤", "adhesive"], ["シーリング材", "sealant"], ["パテ", "putty"], ["モルタル", "mortar"], ["コンクリート", "concrete"], ["鉄筋", "rebar"], ["型枠", "form"],
    ["配管", "pipe"], ["継手", "fitting"], ["ダクト", "duct"], ["ケーブル", "cable"], ["スイッチ", "switch"], ["コンセント", "outlet"], ["照明", "lighting"],
    ["防水材", "waterproofing material"], ["塗料", "paint"], ["刷毛", "brush"], ["ローラー", "roller"], ["養生材", "protection material"], ["足場材", "scaffold component"],
    ["安全具", "ppe"], ["ヘルメット", "hard hat"], ["手袋", "gloves"], ["保護メガネ", "safety glasses"], ["水平器", "level"], ["墨つぼ", "chalk line"], ["レーザー", "laser"],
    ["スケール", "tape measure"], ["定規", "ruler"], ["丸のこ", "circular saw"], ["ドリル", "drill"], ["インパクト", "impact driver"], ["グラインダー", "grinder"], ["サンダー", "sander"],
    ["カッター", "utility knife"], ["脚立", "stepladder"], ["はしご", "ladder"], ["タッカー", "stapler"], ["釘", "nail"], ["ワッシャー", "washer"], ["プレート", "plate"],
    ["ブラケット", "bracket"], ["レール", "rail"], ["パネル", "panel"], ["断熱材", "insulation"], ["ボード", "drywall board"], ["合板", "plywood"], ["コンパネ", "form plywood"],
    ["タイル", "tile"], ["巾木", "baseboard"], ["見切り", "trim"], ["笠木", "coping"], ["水切り", "flashing"], ["コーナー材", "corner bead"], ["スペーサー", "spacer"],
    ["クランプ", "clamp"], ["ジャッキ", "jack"], ["チェーン", "chain"], ["ワイヤー", "wire"], ["バルブ", "valve"], ["ポンプ", "pump"], ["メーター", "meter"],
    ["センサー", "sensor"], ["カバー", "cover"], ["キャップ", "cap"], ["ホース", "hose"], ["ノズル", "nozzle"], ["フィルター", "filter"], ["グリス", "grease"],
    ["プライマー", "primer"], ["錆止め", "rust primer"], ["溶接棒", "welding rod"], ["砥石", "grinding wheel"], ["刃", "blade"], ["替刃", "replacement blade"], ["チップソー", "tipped saw blade"],
    ["ビット", "bit"], ["ソケット", "socket"], ["レンチ", "wrench"], ["ハンマー", "hammer"], ["バール", "pry bar"], ["のみ", "chisel"], ["かんな", "plane"], ["やすり", "file"]
  ];

  const qualifiers = [
    ["標準", "standard"], ["小型", "compact"], ["大型", "large"], ["軽量", "lightweight"], ["高耐久", "heavy-duty"], ["防水", "waterproof"], ["防じん", "dust-resistant"],
    ["仮設", "temporary"], ["仕上げ用", "finish"], ["下地用", "substrate"], ["屋外用", "outdoor"], ["屋内用", "indoor"], ["高所用", "work-at-height"], ["狭所用", "tight-space"],
    ["交換用", "replacement"], ["調整用", "adjustment"], ["固定用", "fixing"], ["切断用", "cutting"], ["研磨用", "sanding"], ["測定用", "measuring"], ["確認用", "inspection"],
    ["補修用", "repair"], ["施工用", "installation"], ["撤去用", "removal"], ["仮止め用", "temporary fixing"], ["精密", "precision"], ["粗作業用", "rough work"], ["耐熱", "heat-resistant"],
    ["防錆", "rust-resistant"], ["省施工", "quick-install"]
  ];

  const tasks = [
    ["切る", "cut", "cutting"], ["削る", "grind", "grinding"], ["締める", "fasten", "fastening"], ["固定する", "fix", "fixing"], ["測る", "measure", "measuring"],
    ["確認する", "inspect", "inspection"], ["保護する", "protect", "protection"], ["仕上げる", "finish", "finishing"], ["穴をあける", "drill", "drilling"], ["運ぶ", "carry", "handling"],
    ["塗る", "paint", "painting"], ["埋める", "fill", "filling"], ["ならす", "level", "leveling"], ["組む", "assemble", "assembly"], ["外す", "remove", "removal"],
    ["養生する", "mask", "masking"], ["接続する", "connect", "connection"], ["支持する", "support", "supporting"], ["調整する", "adjust", "adjustment"], ["清掃する", "clean", "cleaning"]
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

  function supplemental(index) {
    const d = domains[index % domains.length];
    const n = nouns[Math.floor(index / domains.length) % nouns.length];
    const q = qualifiers[Math.floor(index / (domains.length * nouns.length)) % qualifiers.length];
    const t = tasks[Math.floor(index / (domains.length * nouns.length * qualifiers.length)) % tasks.length];
    const serial = Math.floor(index / (domains.length * nouns.length * qualifiers.length * tasks.length)) + 1;
    const suffix = serial > 1 ? ` ${serial}` : "";
    const ja = `${d[0]}${q[0]}${n[0]}${suffix}`;
    const en = `${q[1]} ${d[1]} ${n[1]} ${t[1]} term${suffix}`.replace(/\s+/g, " ").trim();
    return normalizePackArray([
      `supp_${index + 1}`,
      ja,
      en,
      d[2],
      t[2],
      `${ja}：${d[0]}分野の${t[0]}作業に関する現場用語`,
      `${en}: a ${d[1].toLowerCase()} term related to ${t[1]} work.`,
      `${ja}は、${d[0]}まわりの${t[0]}作業で確認される現場用語です。用途、材料、周辺部材、施工条件、安全条件を合わせて確認します。`,
      `${en} is a construction reference term used around ${d[1].toLowerCase()} work. Check purpose, materials, adjacent components, work conditions, and safety requirements together.`,
      [`${q[0]}${n[0]}`, `${d[0]}${n[0]}`],
      [`${q[1]} ${n[1]}`, `${d[1]} ${n[1]}`]
    ]);
  }

  function fillToTarget() {
    const seen = new Set(state.entries.map((x) => x.id));
    let i = 0;
    while (state.entries.length < TARGET) {
      const item = supplemental(i++);
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      state.entries.push(item);
    }
  }

  async function loadAll() {
    const base = await fetchJson("./data/tools.basic.json?v=20260506-complete");
    const baseEntries = normalize(base);
    let packs = [];
    try {
      const manifest = await fetchJson("./data/packs/manifest.json?v=20260506-complete");
      const files = Array.isArray(manifest.files) ? manifest.files : [];
      const results = await Promise.all(files.map(async (file) => {
        try {
          return normalize(await fetchJson(`./data/packs/${file}?v=20260506-complete`));
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
    fillToTarget();
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
