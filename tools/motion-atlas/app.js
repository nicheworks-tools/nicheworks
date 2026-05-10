(() => {
  const lang = document.body.dataset.lang === "ja" ? "ja" : "en";
  const dataPath = lang === "ja" ? "../data/motions.json" : "data/motions.json";
  const t = {
    en: { copied: "Copied", copyFailed: "Copy failed. Select and copy manually.", emptyCompare: "Choose one more motion to compare.", replaceCompare: "Free compare is limited to 2 motions. Remove one first.", noFav: "No favorites yet.", noRecent: "No recent items yet.", view: "View detail", compare: "Add compare", favorite: "Favorite", unfavorite: "Unfavorite", copyPrompt: "Copy prompt", copyCode: "Copy code", replay: "Replay", pause: "Pause", speed: "Speed", aliases: "Aliases", looks: "What it looks like", moves: "How it moves", beginner: "Beginner wording", intent: "Practical intent", useCase: "Good for", notFor: "Not for", bad: "Bad request", better: "Better request", why: "Why better", prompt: "Short AI prompt", code: "Basic CSS hint", reduced: "Reduced motion fallback", notes: "Implementation notes", dataError: "Motion data could not be loaded. Please reload the page." },
    ja: { copied: "コピーしました", copyFailed: "コピーに失敗しました。手動で選択してコピーしてください。", emptyCompare: "比較するモーションをもう1件選んでください。", replaceCompare: "無料版の比較は2件までです。先に1件削除してください。", noFav: "まだお気に入りはありません。", noRecent: "まだ履歴はありません。", view: "詳細を見る", compare: "比較に追加", favorite: "お気に入り", unfavorite: "解除", copyPrompt: "依頼文をコピー", copyCode: "コードをコピー", replay: "再生", pause: "一時停止", speed: "速度", aliases: "別名", looks: "どう見えるか", moves: "どう動くか", beginner: "初心者の言い方", intent: "実務上の目的", useCase: "向いている用途", notFor: "向いていない用途", bad: "悪い依頼例", better: "良い依頼例", why: "なぜ良いか", prompt: "短いAI依頼文", code: "基本CSSヒント", reduced: "reduced motion 代替", notes: "実装注意", dataError: "モーションデータを読み込めませんでした。ページを再読み込みしてください。" }
  }[lang];

  const $ = (sel) => document.querySelector(sel);
  const els = {
    search: $("#motion-search"), cat: $("#category-filter"), type: $("#type-filter"), trigger: $("#trigger-filter"), intensity: $("#intensity-filter"), speedFilter: $("#speed-filter"), mobile: $("#mobile-filter"), a11y: $("#a11y-filter"), count: $("#result-count"), list: $("#motion-list"), detail: $("#motion-detail"), zero: $("#zero-state"), suggestions: $("#quick-suggestions"), reducedToggle: $("#reduced-toggle"), reducedNote: $("#reduced-note"), favList: $("#favorites-list"), recentList: $("#recent-list"), tray: $("#compare-tray"), table: $("#compare-table")
  };

  let motions = [];
  let filtered = [];
  let selected = null;
  let favorites = readLS("motionAtlasFavorites", []);
  let recent = readLS("motionAtlasRecent", []);
  let compare = readLS("motionAtlasCompare", []);
  let speed = 1;
  const osReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const savedReduced = localStorage.getItem("motionAtlasReduced");
  let reduced = savedReduced == null ? osReduce : savedReduced === "true";

  document.documentElement.classList.toggle("is-reduced", reduced);
  if (els.reducedToggle) els.reducedToggle.checked = reduced;
  if (els.reducedNote) els.reducedNote.hidden = !reduced;

  fetch(dataPath).then((r) => {
    if (!r.ok) throw new Error("data");
    return r.json();
  }).then((data) => {
    motions = data;
    filtered = motions;
    hydrateFilters();
    bindEvents();
    applyFilters();
    selectMotion(motions[0]?.slug);
  }).catch(() => {
    if (els.list) els.list.textContent = t.dataError;
  });

  function bindEvents() {
    [els.search, els.cat, els.type, els.trigger, els.intensity, els.speedFilter, els.mobile, els.a11y].forEach((el) => {
      if (!el) return;
      el.addEventListener("input", applyFilters);
      el.addEventListener("change", applyFilters);
    });
    document.querySelector("[data-reset]")?.addEventListener("click", resetFilters);
    document.querySelector("[data-clear-compare]")?.addEventListener("click", () => {
      compare = [];
      saveLS("motionAtlasCompare", compare);
      renderCompare();
    });
    els.reducedToggle?.addEventListener("change", () => {
      reduced = els.reducedToggle.checked;
      localStorage.setItem("motionAtlasReduced", String(reduced));
      document.documentElement.classList.toggle("is-reduced", reduced);
      if (els.reducedNote) els.reducedNote.hidden = !reduced;
      renderList();
      renderDetail();
    });
  }

  function hydrateFilters() {
    fillMulti(els.cat, uniq(motions.map((m) => m.category)));
    fillMulti(els.type, uniq(motions.flatMap((m) => array(m.motion_type))));
    fillMulti(els.trigger, uniq(motions.map((m) => m.trigger)));
    fillSelect(els.intensity, uniq(motions.map((m) => m.intensity)));
    fillSelect(els.speedFilter, uniq(motions.map((m) => m.speed_feel)));
    fillSelect(els.mobile, uniq(motions.map((m) => m.mobile_fit)));
    fillSelect(els.a11y, uniq(motions.map((m) => m.a11y_load)));
    ["fade", "slide", "hover", "loading", "scroll reveal", "shake error"].forEach((q) => {
      const b = makeButton(q);
      b.addEventListener("click", () => {
        els.search.value = q;
        applyFilters();
      });
      els.suggestions?.appendChild(b);
    });
  }

  function applyFilters() {
    const q = (els.search?.value || "").trim().toLowerCase();
    const cats = selectedOptions(els.cat);
    const types = selectedOptions(els.type);
    const triggers = selectedOptions(els.trigger);
    const one = (el) => el?.value || "";
    filtered = motions.map((m) => ({ m, score: score(m, q) })).filter(({ m, score }) => (!q || score > 0) && (!cats.length || cats.includes(m.category)) && (!types.length || array(m.motion_type).some((v) => types.includes(v))) && (!triggers.length || triggers.includes(m.trigger)) && (!one(els.intensity) || m.intensity === one(els.intensity)) && (!one(els.speedFilter) || m.speed_feel === one(els.speedFilter)) && (!one(els.mobile) || m.mobile_fit === one(els.mobile)) && (!one(els.a11y) || m.a11y_load === one(els.a11y))).sort((a, b) => b.score - a.score).map(({ m }) => m);
    if (!filtered.some((m) => m.slug === selected?.slug)) selected = filtered[0] || selected;
    renderList();
    renderDetail();
  }

  function score(m, q) {
    if (!q) return 1;
    if (m.slug === q || m.id === q) return 100;
    if ((m.name_en || "").toLowerCase() === q || (m.name_ja || "").toLowerCase() === q) return 90;
    const aliases = array(m.aliases_en).concat(array(m.aliases_ja)).join(" ").toLowerCase();
    if (aliases.includes(q)) return 70;
    const haystack = [m.id, m.slug, m.name_en, m.name_ja, m.category, m.trigger, ...array(m.motion_type), ...array(m.aliases_en), ...array(m.aliases_ja), m.summary_en, m.summary_ja, ...array(m.beginner_wording_en), ...array(m.beginner_wording_ja), m.practical_intent_en, m.practical_intent_ja, ...array(m.use_case_en), ...array(m.use_case_ja), ...array(m.not_for_en), ...array(m.not_for_ja), m.bad_request_en, m.bad_request_ja, m.better_request_en, m.better_request_ja, m.short_ai_prompt_en, m.short_ai_prompt_ja].join(" ").toLowerCase();
    return haystack.includes(q) ? 20 : 0;
  }

  function renderList() {
    if (!els.list) return;
    els.count.textContent = String(filtered.length);
    els.zero.hidden = filtered.length > 0;
    els.list.replaceChildren();
    filtered.forEach((m) => {
      const card = document.createElement("article");
      card.className = "motion-card";
      card.dataset.active = selected?.slug === m.slug ? "true" : "false";
      card.append(demo(m, "mini"));
      const h = el("h3", `${m.name_en} / ${m.name_ja}`);
      const meta = el("p", `${m.category} · ${array(m.motion_type).join(", ")} · ${m.trigger}`, "meta");
      const summary = el("p", pick(m, "summary"));
      const chips = document.createElement("div");
      chips.className = "chip-row";
      [m.intensity, m.mobile_fit, m.a11y_load].forEach((c) => chips.append(chip(c)));
      const actions = document.createElement("div");
      actions.className = "card-actions";
      actions.append(action(t.view, () => selectMotion(m.slug)), action(t.compare, () => addCompare(m.slug)), action(favorites.includes(m.slug) ? t.unfavorite : t.favorite, () => toggleFavorite(m.slug)), action(t.copyPrompt, () => copy(pick(m, "short_ai_prompt"))), action(t.replay, () => replay(card)));
      card.addEventListener("click", (ev) => { if (!ev.target.closest("button")) selectMotion(m.slug); });
      card.append(h, meta, summary, chips, actions);
      els.list.append(card);
    });
    renderMemory();
    renderCompare();
  }

  function renderDetail() {
    if (!selected || !els.detail) return;
    const m = selected;
    els.detail.replaceChildren();
    const controls = document.createElement("div");
    controls.className = "detail-controls";
    controls.append(action(t.replay, () => replay(els.detail)), action(t.pause, () => els.detail.toggleAttribute("data-paused")));
    const speedSelect = document.createElement("select");
    [0.5, 1, 1.5].forEach((v) => {
      const o = new Option(`${v}x`, String(v));
      if (v === speed) o.selected = true;
      speedSelect.append(o);
    });
    speedSelect.addEventListener("change", () => { speed = Number(speedSelect.value); document.documentElement.style.setProperty("--motion-speed", String(speed)); replay(els.detail); });
    const speedLabel = el("label", `${t.speed} `);
    speedLabel.append(speedSelect);
    controls.append(speedLabel);
    els.detail.append(demo(m, "large"), controls, el("h2", `${m.name_en} / ${m.name_ja}`), el("p", `${m.category} · ${array(m.motion_type).join(", ")} · ${m.trigger}`, "meta"));
    addSection(t.aliases, array(m[`aliases_${lang}`]).join(", "));
    addSection(t.looks, pick(m, "summary"));
    addSection(t.moves, `${array(m.motion_type).join(", ")} / ${m.demo_type}`);
    addSection(t.beginner, array(m[`beginner_wording_${lang}`]).join(" · "));
    addSection(t.intent, pick(m, "practical_intent"));
    addList(t.useCase, array(m[`use_case_${lang}`]));
    addList(t.notFor, array(m[`not_for_${lang}`]));
    addSection(t.bad, pick(m, "bad_request"));
    addSection(t.better, pick(m, "better_request"));
    addSection(t.why, pick(m, "why_better"));
    addCopyBlock(t.prompt, pick(m, "short_ai_prompt"), t.copyPrompt);
    addCopyBlock(t.code, m.code_hint_css, t.copyCode);
    addSection(t.reduced, pick(m, "reduced_motion_fallback"));
    addSection(t.notes, pick(m, "implementation_notes"));
  }

  function addSection(title, value) { const s = document.createElement("section"); s.className = "detail-section"; s.append(el("h3", title), el("p", value || "—")); els.detail.append(s); }
  function addList(title, items) { const s = document.createElement("section"); s.className = "detail-section"; const ul = document.createElement("ul"); items.forEach((v) => ul.append(el("li", v))); s.append(el("h3", title), ul); els.detail.append(s); }
  function addCopyBlock(title, value, label) { const s = document.createElement("section"); s.className = "detail-section"; const pre = document.createElement("pre"); const code = document.createElement("code"); code.textContent = value || ""; pre.append(code); s.append(el("h3", title), pre, action(label, () => copy(value || ""))); els.detail.append(s); }

  function selectMotion(slug) { const m = motions.find((x) => x.slug === slug); if (!m) return; selected = m; recent = [slug, ...recent.filter((x) => x !== slug)].slice(0, 12); saveLS("motionAtlasRecent", recent); renderList(); renderDetail(); }
  function addCompare(slug) { if (compare.includes(slug)) return; if (compare.length >= 2) { toast(t.replaceCompare); return; } compare.push(slug); saveLS("motionAtlasCompare", compare); renderCompare(); }
  function renderCompare() {
    if (!els.tray || !els.table) return;
    els.tray.replaceChildren();
    if (!compare.length) els.tray.textContent = t.emptyCompare;
    compare.forEach((slug) => { const m = motions.find((x) => x.slug === slug); if (!m) return; const b = makeButton(`${m.name_en} ×`); b.addEventListener("click", () => { compare = compare.filter((x) => x !== slug); saveLS("motionAtlasCompare", compare); renderCompare(); }); els.tray.append(b); });
    els.table.replaceChildren();
    if (compare.length !== 2) return;
    const [a, b] = compare.map((slug) => motions.find((m) => m.slug === slug));
    const rows = [["name", "name_en"], ["category", "category"], ["motion type", (m) => array(m.motion_type).join(", ")], ["trigger", "trigger"], ["intensity", "intensity"], ["speed feel", "speed_feel"], ["best use", (m) => array(m[`use_case_${lang}`]).join(" / ")], ["not for", (m) => array(m[`not_for_${lang}`]).join(" / ")], ["mobile fit", "mobile_fit"], ["a11y load", "a11y_load"], ["reduced fallback", (m) => pick(m, "reduced_motion_fallback")], ["AI prompt", (m) => pick(m, "short_ai_prompt")], ["code difference", "code_hint_css"]];
    const table = document.createElement("table"); table.className = "compare-table"; const tbody = document.createElement("tbody");
    rows.forEach(([label, key]) => { const tr = document.createElement("tr"); [label, get(a, key), get(b, key)].forEach((v, i) => tr.append(el(i === 0 ? "th" : "td", v))); tbody.append(tr); });
    table.append(tbody); els.table.append(table);
  }
  function renderMemory() { renderChipList(els.favList, favorites, t.noFav); renderChipList(els.recentList, recent, t.noRecent); }
  function renderChipList(node, slugs, empty) { if (!node) return; node.replaceChildren(); if (!slugs.length) { node.textContent = empty; return; } slugs.forEach((slug) => { const m = motions.find((x) => x.slug === slug); if (!m) return; const b = makeButton(m.name_en); b.addEventListener("click", () => selectMotion(slug)); node.append(b); }); }
  function toggleFavorite(slug) { favorites = favorites.includes(slug) ? favorites.filter((x) => x !== slug) : [...favorites.slice(-9), slug]; saveLS("motionAtlasFavorites", favorites); renderList(); }

  function demo(m, size) { const box = document.createElement("div"); box.className = `motion-demo ${size}`; box.dataset.demo = m.demo_type; box.setAttribute("aria-label", `${m.name_en} demo`); const shape = document.createElement("span"); shape.className = "demo-shape"; shape.textContent = m.demo_type === "typewriter" ? "Motion" : ""; box.append(shape); if (reduced && ["shake", "bounce", "pulse", "spinner", "skeleton"].includes(m.demo_type)) box.dataset.reduced = "true"; return box; }
  function replay(scope) { scope.querySelectorAll(".motion-demo").forEach((d) => { d.classList.remove("is-replaying"); void d.offsetWidth; requestAnimationFrame(() => d.classList.add("is-replaying")); }); }
  function resetFilters() { if (els.search) els.search.value = ""; [els.cat, els.type, els.trigger].forEach((el) => Array.from(el?.options || []).forEach((o) => o.selected = false)); [els.intensity, els.speedFilter, els.mobile, els.a11y].forEach((el) => { if (el) el.value = ""; }); applyFilters(); }
  async function copy(value) { try { await navigator.clipboard.writeText(value); toast(t.copied); } catch { toast(t.copyFailed); } }
  function toast(msg) { const node = el("div", msg, "toast"); document.body.append(node); setTimeout(() => node.remove(), 1800); }

  function pick(m, key) { return m[`${key}_${lang}`] || m[key] || ""; }
  function get(m, key) { return typeof key === "function" ? key(m) : m[key]; }
  function array(v) { return Array.isArray(v) ? v : v ? [v] : []; }
  function uniq(v) { return [...new Set(v.filter(Boolean))].sort(); }
  function selectedOptions(el) { return Array.from(el?.selectedOptions || []).map((o) => o.value); }
  function fillMulti(el, values) { if (el) values.forEach((v) => el.append(new Option(v, v))); }
  function fillSelect(el, values) { if (el) values.forEach((v) => el.append(new Option(v, v))); }
  function chip(value) { return el("span", value, "chip"); }
  function makeButton(label) { const b = document.createElement("button"); b.type = "button"; b.textContent = label; return b; }
  function action(label, fn) { const b = makeButton(label); b.addEventListener("click", fn); return b; }
  function el(tag, txt, cls) { const n = document.createElement(tag); if (cls) n.className = cls; n.textContent = txt || ""; return n; }
  function readLS(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } }
  function saveLS(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { toast("Local saving is unavailable in this browser mode."); } }
})();
