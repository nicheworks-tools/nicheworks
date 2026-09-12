(() => {
  const isEn = /\/manual-finder\/en\/?/.test(location.pathname);
  const base = isEn ? ".." : ".";
  const FULL = `${base}/data/manuals.full.js?v=mf-wave1-20260912a`;
  const WAVE2 = `${base}/data/manuals.wave2.js?v=mf-wave2c-20260912a`;
  const JSON_URL = `${base}/data/manuals.json?v=mf-wave2c-20260912a`;
  const S = { all: [], filtered: [], page: 1, per: 48, lang: isEn ? "en" : "ja" };
  const $ = (id) => document.getElementById(id);
  const E = {
    results: $("results"), count: $("resultCount"), status: $("loadStatus"), q: $("searchInput"), cat: $("categorySelect"), quick: $("quickButtons"),
    emptyJa: $("emptyMessage"), emptyEn: $("emptyMessageEn"), i18n: document.querySelectorAll("[data-i18n]"), langBtns: document.querySelectorAll(".nw-lang-switch button")
  };
  const t = (ja, en) => S.lang === "ja" ? ja : en;
  const norm = (v) => String(v || "").trim().toLowerCase();
  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  function normalize(rows) {
    const seen = new Set();
    const normalized = (rows || []).filter(Boolean).map((x) => {
      const brand = x.brand || x.maker || x.nameEn || x.nameJa || "Unknown";
      const maker = x.maker || brand;
      const model = x.model || "";
      const family = x.family || "";
      const category = x.category || "その他";
      const aliases = Array.isArray(x.aliases) ? x.aliases.filter(Boolean) : [];
      const manualUrl = x.manualUrl || x.supportUrl || "";
      const supportUrl = x.supportUrl || x.manualUrl || "";
      return {
        id: x.id || "", brand, maker, model, family,
        nameJa: x.nameJa || (model ? `${maker} ${model}` : brand),
        nameEn: x.nameEn || (model ? `${maker} ${model}` : brand),
        category, country: x.country || "Global", manualUrl, supportUrl,
        note: x.note || "公式マニュアル／サポート入口です。",
        noteJa: x.noteJa || x.note || "公式マニュアル／サポート入口です。",
        noteEn: x.noteEn || "Official manual or support destination.",
        hint: x.hint || "",
        hintJa: x.hintJa || x.hint || `${brand} 型番、製品名、シリーズ名`,
        hintEn: x.hintEn || `${brand} model, product, or series`,
        aliases,
        tags: Array.isArray(x.tags) ? x.tags : String(`${brand} ${model} ${family} ${category}`).toLowerCase().split(/\s+/),
        sourceType: x.sourceType || "official", sourceLevel: x.sourceLevel || "", verifiedAt: x.verifiedAt || "",
        evidenceUrl: x.evidenceUrl || "", resolutionState: x.resolutionState || "", manualKind: x.manualKind || "",
        sharedTarget: Boolean(x.sharedTarget), linkReview: x.linkReview || "official entry"
      };
    }).filter((x) => {
      const key = x.id ? `id:${x.id}` : x.model ? `model:${x.maker}|${x.model}|${x.category}`.toLowerCase() : `base:${x.brand}|${x.category}|${x.manualUrl}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return normalized.sort((a, b) => {
      const maker = a.maker.localeCompare(b.maker, "en", { sensitivity: "base" });
      if (maker) return maker;
      return (a.model || a.nameEn).localeCompare(b.model || b.nameEn, "en", { numeric: true, sensitivity: "base" });
    });
  }

  function searchText(x) {
    return [x.brand, x.maker, x.model, x.family, x.nameJa, x.nameEn, x.category, x.country, x.note, x.noteJa, x.noteEn, x.hint, x.hintJa, x.hintEn, ...(x.aliases || []), ...(x.tags || [])].join(" ").toLowerCase();
  }

  function lang(lang) {
    S.lang = lang;
    E.i18n.forEach((n) => {
      const c = n.getAttribute("data-i18n");
      if (c) n.hidden = c !== lang;
    });
    E.langBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-lang") === lang));
    render();
  }

  function stylePager() {
    if (document.getElementById("mf-pager-style")) return;
    const st = document.createElement("style");
    st.id = "mf-pager-style";
    st.textContent = ".mf-pager{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0;padding:10px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa;font-size:12px;color:#4b5563}.mf-pager-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.mf-pager button,.mf-pager select{border:1px solid #d1d5db;border-radius:999px;background:#fff;padding:6px 10px;font-size:12px;cursor:pointer}.mf-pager button:disabled{opacity:.35;cursor:not-allowed}.mf-pager select{border-radius:8px}.mf-hidden{display:none!important}@media(max-width:640px){.mf-pager{align-items:flex-start;flex-direction:column}}";
    document.head.appendChild(st);
  }

  function pager() {
    let p = $("mfPager");
    if (p || !E.results) return p;
    stylePager();
    p = document.createElement("div");
    p.id = "mfPager";
    p.className = "mf-pager";
    p.innerHTML = `<div id="mfInfo"></div><div class="mf-pager-actions"><button id="mfPrev" type="button" aria-label="Previous page">‹</button><button id="mfNext" type="button" aria-label="Next page">›</button><label><span id="mfShowLabel"></span> <select id="mfPer"><option value="24">24</option><option value="48" selected>48</option><option value="96">96</option></select></label></div>`;
    E.results.after(p);
    $("mfPrev").onclick = () => { S.page = Math.max(1, S.page - 1); render(); };
    $("mfNext").onclick = () => { S.page += 1; render(); };
    $("mfPer").onchange = (e) => { S.per = Number(e.target.value) || 48; S.page = 1; render(); };
    return p;
  }

  function filter(keywordOverride) {
    const q = norm(keywordOverride || (E.q ? E.q.value : ""));
    const cat = E.cat ? E.cat.value : "";
    let list = S.all.slice();
    if (q) list = list.filter((x) => searchText(x).includes(q));
    if (cat) list = list.filter((x) => x.category === cat);
    S.filtered = list;
    S.page = 1;
    render();
  }

  function txt(tag, cls, value) {
    const n = document.createElement(tag);
    n.className = cls;
    n.textContent = value;
    return n;
  }

  function primaryLabel(x) {
    if (x.sharedTarget || x.resolutionState === "shared_official_manual_page") return t("公式共通ページ", "Official shared page");
    if (x.resolutionState === "direct_model_support") return t("公式製品・サポート", "Official product/support");
    return t("公式マニュアル", "Official manual");
  }

  function render() {
    if (!E.results || !E.count) return;
    const p = pager();
    const list = S.filtered || [];
    E.results.innerHTML = "";
    if (!S.all.length) {
      E.count.textContent = t("読み込み中...", "Loading...");
      if (p) p.classList.add("mf-hidden");
      return;
    }
    if (!list.length) {
      E.count.textContent = t("0件", "0 records");
      if (p) p.classList.add("mf-hidden");
      if (E.emptyJa) E.emptyJa.hidden = S.lang !== "ja";
      if (E.emptyEn) E.emptyEn.hidden = S.lang !== "en";
      return;
    }
    if (E.emptyJa) E.emptyJa.hidden = true;
    if (E.emptyEn) E.emptyEn.hidden = true;
    const pages = Math.max(1, Math.ceil(list.length / S.per));
    S.page = Math.min(Math.max(1, S.page), pages);
    const start = (S.page - 1) * S.per;
    const items = list.slice(start, start + S.per);
    const end = start + items.length;
    E.count.textContent = t(`全${list.length}件中 ${start + 1}-${end}件`, `Showing ${start + 1}-${end} of ${list.length}`);
    p.classList.remove("mf-hidden");
    $("mfInfo").textContent = t(`${S.page}/${pages}ページ`, `Page ${S.page}/${pages}`);
    $("mfShowLabel").textContent = t("表示", "Show");
    $("mfPrev").disabled = S.page <= 1;
    $("mfNext").disabled = S.page >= pages;
    $("mfPer").value = String(S.per);
    const frag = document.createDocumentFragment();
    items.forEach((x) => {
      const card = document.createElement("article");
      card.className = "card";
      card.appendChild(txt("div", "card-title", x.model ? `${x.maker} ${x.model}` : (S.lang === "ja" ? x.nameJa : x.nameEn)));
      const meta = document.createElement("div");
      meta.className = "card-meta";
      meta.appendChild(txt("span", "card-category", x.category));
      if (x.country) meta.appendChild(txt("span", "card-country", x.country));
      card.appendChild(meta);
      card.appendChild(txt("p", "card-note", S.lang === "ja" ? x.noteJa : x.noteEn));
      const hint = S.lang === "ja" ? x.hintJa : x.hintEn;
      if (hint) card.appendChild(txt("p", "card-hint", t(`検索ヒント：${hint}`, `Search hint: ${hint}`)));
      if (x.verifiedAt) {
        card.appendChild(txt("p", "card-audit", x.sharedTarget ? t(`確認：公式共通ページ・${x.verifiedAt}`, `Checked: official shared page · ${x.verifiedAt}`) : t(`確認：公式ページ・${x.verifiedAt}`, `Checked: official page · ${x.verifiedAt}`)));
      } else if (x.linkReview) {
        card.appendChild(txt("p", "card-audit", t("確認：公式入口として整理済み", "Checked: official entry normalized")));
      }
      const links = document.createElement("div");
      links.className = "card-links";
      if (x.manualUrl) {
        const a = document.createElement("a");
        a.href = x.manualUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = primaryLabel(x);
        links.appendChild(a);
      }
      if (x.supportUrl && x.supportUrl !== x.manualUrl) {
        const a = document.createElement("a");
        a.href = x.supportUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = t("公式索引・サポート", "Official index/support");
        links.appendChild(a);
      }
      links.appendChild(txt("span", "tag-official", t("公式サイト", "Official")));
      card.appendChild(links);
      frag.appendChild(card);
    });
    E.results.appendChild(frag);
  }

  async function loadWave1() {
    try {
      await loadScript(FULL);
      const batches = Array.isArray(window.MANUALFINDER_WAVE1_BATCHES) ? window.MANUALFINDER_WAVE1_BATCHES : [];
      await Promise.all(batches.map((name) => loadScript(`${base}/data/${name}?v=mf-wave1-20260912a`)));
      if (typeof window.MANUALFINDER_BUILD_WAVE1 === "function") return window.MANUALFINDER_BUILD_WAVE1();
      if (Array.isArray(window.MANUALFINDER_FULL_RECORDS)) return window.MANUALFINDER_FULL_RECORDS;
    } catch (_) {}
    return [];
  }

  async function loadWave2() {
    try {
      await loadScript(WAVE2);
      const batches = Array.isArray(window.MANUALFINDER_WAVE2_BATCHES) ? window.MANUALFINDER_WAVE2_BATCHES : [];
      await Promise.all(batches.map((name) => loadScript(`${base}/data/${name}?v=mf-wave2c-20260912a`)));
      if (typeof window.MANUALFINDER_BUILD_WAVE2 === "function") return window.MANUALFINDER_BUILD_WAVE2();
    } catch (_) {}
    return [];
  }

  async function initData() {
    if (E.status) E.status.textContent = t("データを読み込み中です...", "Loading manual directory...");
    const [wave1Rows, wave2Rows, baseRows] = await Promise.all([
      loadWave1(),
      loadWave2(),
      fetch(JSON_URL, { cache: "no-store" }).then((r) => r.ok ? r.json() : []).then((x) => Array.isArray(x) ? x : []).catch(() => [])
    ]);
    S.all = normalize([...baseRows, ...wave1Rows, ...wave2Rows]);
    if (E.status) {
      E.status.textContent = S.all.length ? "" : t("データを読み込めませんでした。", "Manual directory could not be loaded.");
      E.status.hidden = Boolean(S.all.length);
    }
    filter();
  }

  function bind() {
    E.langBtns.forEach((b) => b.onclick = () => {
      const v = b.getAttribute("data-lang");
      if (v) lang(v);
    });
    if (E.q) E.q.oninput = () => filter();
    if (E.cat) E.cat.onchange = () => filter();
    if (E.quick) E.quick.onclick = (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      const c = b.getAttribute("data-category");
      const k = b.getAttribute("data-keyword") || b.getAttribute("data-brand") || "";
      if (c) {
        if (E.cat) E.cat.value = c;
        if (E.q) E.q.value = "";
        filter();
      } else if (k) {
        if (E.q) E.q.value = k;
        if (E.cat) E.cat.value = "";
        filter(k);
      }
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    lang(S.lang);
    bind();
    initData();
  });
})();
