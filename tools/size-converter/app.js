/* app.js — Size Converter (JP ↔ US/EU)
 * Phase 1: Shoe fit checker by cm (foot length required, width optional)
 * Phase 2: Brand adjustment via brand.json (optional)
 */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const els = {
    category: $("categorySelect"),
    gender: $("genderSelect"),
    base: $("baseSelect"),
    tbody: $("sizeTableBody"),
    table: document.querySelector(".size-table"),

    // i18n
    langButtons: document.querySelectorAll(".nw-lang-switch button"),
    i18nNodes: document.querySelectorAll("[data-i18n]"),

    // mode
    tabTable: $("tabTable"),
    tabFit: $("tabFit"),
    fitPanel: $("fitPanel"),
    footLength: $("footLength"),
    footWidth: $("footWidth"),
    brandSelect: $("brandSelect"),
    fitRun: $("fitRun"),
    fitReset: $("fitReset"),
    fitResult: $("fitResult"),
  };

  // MVP data (later we can move to JSON)
  const DATA = {
    shoes: {
      men: [
        { jp: "24.5", us: "6.5", eu: "39" },
        { jp: "25.0", us: "7", eu: "40" },
        { jp: "25.5", us: "7.5", eu: "40.5" },
        { jp: "26.0", us: "8", eu: "41" },
        { jp: "26.5", us: "8.5", eu: "42" },
        { jp: "27.0", us: "9", eu: "42.5" },
        { jp: "27.5", us: "9.5", eu: "43" },
        { jp: "28.0", us: "10", eu: "44" },
      ],
      women: [
        { jp: "22.0", us: "5", eu: "35" },
        { jp: "22.5", us: "5.5", eu: "36" },
        { jp: "23.0", us: "6", eu: "36.5" },
        { jp: "23.5", us: "6.5", eu: "37.5" },
        { jp: "24.0", us: "7", eu: "38" },
        { jp: "24.5", us: "7.5", eu: "39" },
        { jp: "25.0", us: "8", eu: "39.5" },
      ],
    },
    clothing: {
      men: [
        { jp: "S", us: "S", eu: "46" },
        { jp: "M", us: "M", eu: "48" },
        { jp: "L", us: "L", eu: "50" },
        { jp: "XL", us: "XL", eu: "52" },
        { jp: "XXL", us: "XXL", eu: "54" },
      ],
      women: [
        { jp: "S", us: "2–4", eu: "34–36" },
        { jp: "M", us: "6–8", eu: "38–40" },
        { jp: "L", us: "10–12", eu: "42–44" },
        { jp: "XL", us: "14–16", eu: "46–48" },
      ],
    },
  };

  const LABELS = {
    ja: {
      noData: "この条件のデータがありません。",
      invalidLen: "足長（cm）を正しく入力してください（例: 26.5）。",
      notShoe: "実寸判定は「靴」のみ対応です。",
      fitTitle: "判定結果（目安）",
      recommend: "推奨サイズ",
      near: "候補（上下）",
      cautionWide: "幅広の傾向：窮屈なら +0.5cm を検討。",
      cautionNarrow: "幅細めの傾向：大きすぎ注意（まずは基準サイズ）。",
      cautionStd: "標準的：まずは基準サイズから。",
      borderline: "境界付近です。±0.5cm どちらも候補に入ります（レビュー優先推奨）。",
      widthHowto: "足幅は「最も広い部分」を立った状態でまっすぐ測るのが目安です。",
      brandBlockTitle: "ブランド補正（任意）",
      brandApplied: "ブランド補正を適用しました",
      brandUnavailable: "ブランド辞書を読み込めませんでした（補正なしで動作中）",
      headers: { jp: "JP", us: "US", eu: "EU" },
    },
    en: {
      noData: "No data for this selection.",
      invalidLen: "Enter a valid foot length in cm (e.g., 26.5).",
      notShoe: "Fit checker supports shoes only.",
      fitTitle: "Result (approx.)",
      recommend: "Recommended",
      near: "Candidates (±0.5)",
      cautionWide: "Wider foot: consider +0.5 cm if tight.",
      cautionNarrow: "Narrower foot: beware of sizing up too much.",
      cautionStd: "Typical: start with the base size.",
      borderline: "Borderline. Both ±0.5 cm can be valid (check reviews if unsure).",
      widthHowto: "Measure width at the widest part (standing is recommended).",
      brandBlockTitle: "Brand adjustment (optional)",
      brandApplied: "Brand adjustment applied",
      brandUnavailable: "Could not load brand dictionary (running without it).",
      headers: { jp: "JP", us: "US", eu: "EU" },
    },
  };

  let currentLang = "ja";
  let currentMode = "table"; // table | fit

  // --- brand dictionary ---
  let brandDict = null;
  let brandLoadError = false;

  async function loadBrandDict() {
    brandLoadError = false;
    try {
      const res = await fetch("./brand.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`brand.json HTTP ${res.status}`);
      const json = await res.json();
      brandDict = json;
    } catch (e) {
      brandDict = null;
      brandLoadError = true;
      // silent in console to keep UX clean, but still helpful for dev:
      console.warn("[size-converter] brand.json load failed:", e);
    } finally {
      rebuildBrandOptions();
    }
  }

  function getBrandListForCurrent() {
    // brand.json schema:
    // { shoes: { men: [...], women: [...] } }
    const gen = els.gender?.value || "men";
    return brandDict?.shoes?.[gen] ?? [];
  }

  function rebuildBrandOptions() {
    if (!els.brandSelect) return;

    // If not in shoes category, keep empty/disabled
    const shoeOnly = els.category?.value === "shoes";
    els.brandSelect.disabled = !shoeOnly;

    // clear options
    while (els.brandSelect.firstChild) els.brandSelect.removeChild(els.brandSelect.firstChild);

    // default option
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "—";
    els.brandSelect.appendChild(opt0);

    if (!shoeOnly) return;

    const brands = getBrandListForCurrent();

    if (!brands.length) {
      // No brand dict: keep only default
      return;
    }

    brands.forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.label || b.id;
      els.brandSelect.appendChild(opt);
    });
  }

  function findBrandById(id) {
    if (!id) return null;
    const list = getBrandListForCurrent();
    return list.find((b) => b.id === id) || null;
  }

  // ---------- i18n ----------
  function detectInitialLang() {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  }

  function applyLang(lang) {
    currentLang = lang;

    els.i18nNodes.forEach((node) => {
      node.style.display = node.dataset.i18n === lang ? "" : "none";
    });

    els.langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang === "ja" ? "ja" : "en";

    // refresh
    renderTable();
    renderFitResult(null);
  }

  // ---------- table mode ----------
  function getRows() {
    const cat = els.category.value;
    const gen = els.gender.value;
    return DATA?.[cat]?.[gen] ?? [];
  }

  function clearTbody() {
    while (els.tbody.firstChild) els.tbody.removeChild(els.tbody.firstChild);
  }

  function setHeaderHighlight(baseKey) {
    const ths = els.table.querySelectorAll("thead th");
    const order = ["jp", "us", "eu"];
    ths.forEach((th, idx) => th.classList.toggle("is-base", order[idx] === baseKey));
  }

  function ensureTableHeaders() {
    const ths = els.table.querySelectorAll("thead th");
    if (ths.length === 3) {
      ths[0].textContent = LABELS[currentLang].headers.jp;
      ths[1].textContent = LABELS[currentLang].headers.us;
      ths[2].textContent = LABELS[currentLang].headers.eu;
    }
  }

  function renderEmptyRow(text) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 3;
    td.className = "empty";
    td.textContent = text;
    tr.appendChild(td);
    els.tbody.appendChild(tr);
  }

  function renderRows(rows, baseKey) {
    rows.forEach((r) => {
      const tr = document.createElement("tr");

      const tdJP = document.createElement("td");
      tdJP.textContent = r.jp ?? "";
      tdJP.className = baseKey === "jp" ? "is-base" : "";

      const tdUS = document.createElement("td");
      tdUS.textContent = r.us ?? "";
      tdUS.className = baseKey === "us" ? "is-base" : "";

      const tdEU = document.createElement("td");
      tdEU.textContent = r.eu ?? "";
      tdEU.className = baseKey === "eu" ? "is-base" : "";

      tr.appendChild(tdJP);
      tr.appendChild(tdUS);
      tr.appendChild(tdEU);
      els.tbody.appendChild(tr);
    });
  }

  function renderTable() {
    if (currentMode !== "table") return;

    const baseKey = els.base.value; // jp | us | eu
    const rows = getRows();

    ensureTableHeaders();
    setHeaderHighlight(baseKey);
    clearTbody();

    if (!rows.length) {
      renderEmptyRow(LABELS[currentLang].noData);
      return;
    }

    renderRows(rows, baseKey);
  }

  // ---------- fit mode (shoes) ----------
  function parseDecimal(val) {
    if (typeof val !== "string") return null;
    const cleaned = val.trim().replace(",", ".");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function getShoeRows() {
    return DATA?.shoes?.[els.gender.value] ?? [];
  }

  function closestIndexByJP(rows, targetJP) {
    // rows.jp is string numeric, like "26.5"
    let bestIdx = -1;
    let bestDiff = Infinity;

    for (let i = 0; i < rows.length; i++) {
      const jp = Number(rows[i].jp);
      if (!Number.isFinite(jp)) continue;
      const diff = Math.abs(jp - targetJP);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function widthClass(lengthCm, widthCm) {
    // Heuristic ratio-based classification (rough)
    // ratio ~ 0.37–0.40 typical, >0.41 tends wide, <0.36 tends narrow
    if (!Number.isFinite(lengthCm) || !Number.isFinite(widthCm)) return null;
    const ratio = widthCm / lengthCm;
    if (ratio >= 0.41) return "wide";
    if (ratio <= 0.36) return "narrow";
    return "std";
  }

  function buildFitPayload() {
    if (els.category.value !== "shoes") {
      return { error: LABELS[currentLang].notShoe };
    }

    const lengthCm = parseDecimal(els.footLength.value);
    if (!Number.isFinite(lengthCm) || lengthCm < 18 || lengthCm > 35) {
      return { error: LABELS[currentLang].invalidLen };
    }

    const widthCm = parseDecimal(els.footWidth.value);
    const rows = getShoeRows();
    if (!rows.length) return { error: LABELS[currentLang].noData };

    // --- Core sizing rule (JP ~ length rounded to 0.5) ---
    const roundedJP = Math.round(lengthCm * 2) / 2;

    // Borderline detection: near midpoint between 0.5 steps
    const lowerStep = Math.floor(lengthCm * 2) / 2;
    const stepMid = lowerStep + 0.25;
    const distToMid = Math.abs(lengthCm - stepMid);
    const isBorderline = distToMid <= 0.10; // ±0.10cm zone

    // Candidate sizes (lower/upper around rounded)
    const lowerJP = roundedJP - 0.5;
    const upperJP = roundedJP + 0.5;

    const idx = closestIndexByJP(rows, roundedJP);
    if (idx < 0) return { error: LABELS[currentLang].noData };

    const rec = rows[idx];

    // Build candidates list explicitly (lower, rec, upper) without duplicates
    const candidates = [];
    const pushIfExistsByJP = (jpVal) => {
      const i = closestIndexByJP(rows, jpVal);
      if (i < 0) return;
      const r = rows[i];
      if (candidates.some((x) => x.jp === r.jp && x.us === r.us && x.eu === r.eu)) return;
      candidates.push(r);
    };

    pushIfExistsByJP(lowerJP);
    pushIfExistsByJP(roundedJP);
    pushIfExistsByJP(upperJP);

    // Width classification (rough)
    const wc = Number.isFinite(widthCm) ? widthClass(lengthCm, widthCm) : null;

    let caution = "";
    if (wc === "wide") caution = LABELS[currentLang].cautionWide;
    else if (wc === "narrow") caution = LABELS[currentLang].cautionNarrow;
    else if (wc === "std") caution = LABELS[currentLang].cautionStd;

    // Brand adjustment (optional)
    const brandId = els.brandSelect ? (els.brandSelect.value || "") : "";
    const brand = findBrandById(brandId);
    const brandOffset = brand ? Number(brand.offset || 0) : 0;

    let brandRoundedJP = null;
    let brandRec = null;
    let brandNote = null;

    if (brand) {
      // Apply offset then snap to 0.5 steps
      const adjusted = roundedJP + brandOffset;
      const snapped = Math.round(adjusted * 2) / 2;
      brandRoundedJP = snapped;

      const bIdx = closestIndexByJP(rows, snapped);
      if (bIdx >= 0) brandRec = rows[bIdx];

      brandNote = currentLang === "ja" ? (brand.note_ja || "") : (brand.note_en || "");
    }

    return {
      error: null,
      lengthCm,
      widthCm: Number.isFinite(widthCm) ? widthCm : null,
      roundedJP,
      lowerJP,
      upperJP,
      isBorderline,
      recommend: rec,
      candidates,
      widthClass: wc,
      caution,

      // brand
      brandSelected: !!brand,
      brandId: brand ? brand.id : "",
      brandLabel: brand ? (brand.label || brand.id) : "",
      brandOffset,
      brandRoundedJP,
      brandRecommend: brandRec,
      brandNote,
      brandLoadError,
    };
  }

  function renderFitResult(payload) {
    // If payload is null, show nothing (keep empty).
    if (!els.fitResult) return;

    if (!payload) {
      els.fitResult.innerHTML = "";
      return;
    }

    if (payload.error) {
      els.fitResult.innerHTML = `<div class="fit-card error">${escapeHtml(payload.error)}</div>`;
      return;
    }

    const title = LABELS[currentLang].fitTitle;
    const recommend = LABELS[currentLang].recommend;
    const near = LABELS[currentLang].near;

    const rec = payload.recommend;

    const nearHtml = (payload.candidates || [])
      .map(
        (r) => `
        <li>
          <strong>JP ${escapeHtml(String(r.jp))}</strong>
          <span class="muted">/ US ${escapeHtml(String(r.us))} / EU ${escapeHtml(String(r.eu))}</span>
        </li>`
      )
      .join("");

    const widthLine =
      payload.widthCm != null
        ? `<div class="fit-meta">
             <span class="muted">${currentLang === "ja" ? "足幅" : "Width"}:</span>
             <strong>${payload.widthCm.toFixed(1)} cm</strong>
           </div>`
        : "";

    const cautionLine =
      payload.caution
        ? `<div class="fit-caution">${escapeHtml(payload.caution)}</div>`
        : "";

    const borderlineLine =
      payload.isBorderline
        ? `<div class="fit-borderline">${escapeHtml(LABELS[currentLang].borderline)}</div>`
        : "";

    const howtoLine =
      payload.widthCm != null
        ? `<div class="fit-howto">${escapeHtml(LABELS[currentLang].widthHowto)}</div>`
        : "";

    // Brand block
    let brandBlock = "";
    if (payload.brandSelected && payload.brandRecommend) {
      const b = payload.brandRecommend;
      const sign = payload.brandOffset > 0 ? "+" : payload.brandOffset < 0 ? "−" : "";
      const abs = Math.abs(payload.brandOffset);
      const offsetText = `${sign}${abs.toFixed(1)}cm`;

      brandBlock = `
        <div class="fit-brandblock">
          <div class="fit-label">${escapeHtml(LABELS[currentLang].brandBlockTitle)}</div>
          <div class="fit-brandline">
            <span class="muted">${escapeHtml(payload.brandLabel)}:</span>
            <strong>${escapeHtml(LABELS[currentLang].brandApplied)}</strong>
            <span class="muted">(${escapeHtml(offsetText)})</span>
          </div>
          <div class="fit-big">
            <span class="pill">JP ${escapeHtml(String(b.jp))}</span>
            <span class="pill">US ${escapeHtml(String(b.us))}</span>
            <span class="pill">EU ${escapeHtml(String(b.eu))}</span>
          </div>
          ${payload.brandNote ? `<div class="fit-brandnote">${escapeHtml(payload.brandNote)}</div>` : ""}
        </div>
      `;
    } else if (payload.brandLoadError && (els.brandSelect && els.brandSelect.value)) {
      // user selected brand but dict failed: show a small notice
      brandBlock = `
        <div class="fit-brandblock">
          <div class="fit-label">${escapeHtml(LABELS[currentLang].brandBlockTitle)}</div>
          <div class="fit-brandnote">${escapeHtml(LABELS[currentLang].brandUnavailable)}</div>
        </div>
      `;
    }

    els.fitResult.innerHTML = `
      <div class="fit-card">
        <div class="fit-title">${escapeHtml(title)}</div>

        <div class="fit-meta">
          <span class="muted">${currentLang === "ja" ? "足長" : "Length"}:</span>
          <strong>${payload.lengthCm.toFixed(1)} cm</strong>
          <span class="muted">→</span>
          <span class="muted">${currentLang === "ja" ? "判定JP" : "Target JP"}:</span>
          <strong>${payload.roundedJP.toFixed(1)} cm</strong>
        </div>

        ${widthLine}

        <div class="fit-main">
          <div class="fit-label">${escapeHtml(recommend)}</div>
          <div class="fit-big">
            <span class="pill">JP ${escapeHtml(String(rec.jp))}</span>
            <span class="pill">US ${escapeHtml(String(rec.us))}</span>
            <span class="pill">EU ${escapeHtml(String(rec.eu))}</span>
          </div>
        </div>

        ${cautionLine}
        ${borderlineLine}
        ${howtoLine}
        ${brandBlock}

        <div class="fit-sub">
          <div class="fit-label">${escapeHtml(near)}</div>
          <ul class="fit-list">${nearHtml}</ul>
        </div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // ---------- mode ----------
  function setMode(mode) {
    currentMode = mode;

    const isFit = mode === "fit";

    // tabs
    els.tabTable?.classList.toggle("active", !isFit);
    els.tabFit?.classList.toggle("active", isFit);

    // panel
    if (els.fitPanel) els.fitPanel.hidden = !isFit;

    // shoes-only handling for fit tab
    const shoeOnly = els.category.value === "shoes";
    if (els.tabFit) {
      els.tabFit.disabled = !shoeOnly;
      els.tabFit.classList.toggle("disabled", !shoeOnly);
    }

    // base selector is table-only
    els.base.disabled = isFit;

    // brand select is shoes-only
    if (els.brandSelect) {
      els.brandSelect.disabled = !shoeOnly;
      if (!shoeOnly) els.brandSelect.value = "";
    }

    if (!isFit) {
      renderFitResult(null);
      renderTable();
    } else {
      renderTable();
      renderFitResult(null);
    }
  }

  // ---------- events ----------
  function bindEvents() {
    // common selectors
    els.category.addEventListener("change", () => {
      // Fit is shoes-only
      if (els.category.value !== "shoes" && currentMode === "fit") {
        setMode("table");
      } else {
        // update fit tab enabled state
        setMode(currentMode);
      }

      // rebuild brand options on category change
      rebuildBrandOptions();

      renderTable();
    });

    els.gender.addEventListener("change", () => {
      renderTable();
      renderFitResult(null);
      rebuildBrandOptions();
    });

    els.base.addEventListener("change", renderTable);

    // mode tabs
    els.tabTable?.addEventListener("click", () => setMode("table"));
    els.tabFit?.addEventListener("click", () => {
      if (els.category.value !== "shoes") return;
      setMode("fit");
    });

    // brand change just clears result (so user re-checks)
    els.brandSelect?.addEventListener("change", () => {
      renderFitResult(null);
    });

    // fit actions
    els.fitRun?.addEventListener("click", () => {
      const payload = buildFitPayload();
      renderFitResult(payload);
      els.fitResult?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });

    els.fitReset?.addEventListener("click", () => {
      els.footLength.value = "";
      els.footWidth.value = "";
      if (els.brandSelect) els.brandSelect.value = "";
      renderFitResult(null);
      els.footLength?.focus?.();
    });

    // Enter key triggers check in fit inputs
    [els.footLength, els.footWidth].forEach((inp) => {
      inp?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          els.fitRun?.click();
        }
      });
    });

    // i18n buttons
    els.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    bindEvents();
    applyLang(detectInitialLang());
    setMode("table");
    renderTable();

    // load brand dictionary after DOM ready
    await loadBrandDict();
  });
})();
