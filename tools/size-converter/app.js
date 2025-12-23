/* app.js — Size Converter (JP ↔ US/EU)
 * Phase 1–2:
 * - Table mode (clothing/shoes, base highlight)
 * - Fit by cm (Shoes): foot length required, width optional (+ optional brand adjustments)
 * - Fit by cm (Clothing): tops/bottoms, waist required (+ optional brand adjustments)
 * - JP/EN toggle via [data-i18n]
 * - Optional brand dictionary: ./brand.json
 */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const els = {
    // selectors / table
    category: $("categorySelect"),
    gender: $("genderSelect"),
    base: $("baseSelect"),
    tbody: $("sizeTableBody"),
    table: document.querySelector(".size-table"),
    resultSection: $("resultSection"),

    // i18n
    langButtons: document.querySelectorAll(".nw-lang-switch button"),
    i18nNodes: document.querySelectorAll("[data-i18n]"),

    // tabs / modes
    tabTable: $("tabTable"),
    tabFit: $("tabFit"),       // shoes
    tabCloth: $("tabCloth"),   // clothing (optional)
    fitPanel: $("fitPanel"),   // shoes panel
    clothPanel: $("clothPanel"), // clothing panel (optional)

    // shoes fit
    footLength: $("footLength"),
    footWidth: $("footWidth"),
    fitRun: $("fitRun"),
    fitReset: $("fitReset"),
    fitResult: $("fitResult"),
    fitBrand: $("fitBrand"),

    // clothing fit (optional)
    clothType: $("clothType"),
    clothChest: $("clothChest"),
    clothWaist: $("clothWaist"),
    clothHip: $("clothHip"),
    clothRun: $("clothRun"),
    clothReset: $("clothReset"),
    clothResult: $("clothResult"),
    clothBrand: $("clothBrand"),
  };

  // --------- MVP size table data (later: move to JSON) ----------
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

  // --------- Clothing fit heuristics (cm) ----------
  // NOTE: This is a simple “pre-check” heuristic, not a brand-accurate chart.
  // Use WAIST as primary metric for bottoms; CHEST for tops. HIP is tie-breaker.
  const CLOTH_CHART = {
    men: {
      tops: [
        { size: "S", chest: [82, 90], waist: [68, 76], hip: [82, 90] },
        { size: "M", chest: [90, 98], waist: [76, 84], hip: [90, 98] },
        { size: "L", chest: [98, 106], waist: [84, 92], hip: [98, 106] },
        { size: "XL", chest: [106, 114], waist: [92, 100], hip: [106, 114] },
        { size: "XXL", chest: [114, 122], waist: [100, 108], hip: [114, 122] },
      ],
      bottoms: [
        { size: "S", waist: [68, 76], hip: [82, 90] },
        { size: "M", waist: [76, 84], hip: [90, 98] },
        { size: "L", waist: [84, 92], hip: [98, 106] },
        { size: "XL", waist: [92, 100], hip: [106, 114] },
        { size: "XXL", waist: [100, 108], hip: [114, 122] },
      ],
    },
    women: {
      tops: [
        { size: "S", chest: [78, 84], waist: [60, 66], hip: [84, 90] },
        { size: "M", chest: [84, 90], waist: [66, 72], hip: [90, 96] },
        { size: "L", chest: [90, 96], waist: [72, 78], hip: [96, 102] },
        { size: "XL", chest: [96, 102], waist: [78, 84], hip: [102, 108] },
      ],
      bottoms: [
        { size: "S", waist: [60, 66], hip: [84, 90] },
        { size: "M", waist: [66, 72], hip: [90, 96] },
        { size: "L", waist: [72, 78], hip: [96, 102] },
        { size: "XL", waist: [78, 84], hip: [102, 108] },
      ],
    },
  };

  const LABELS = {
    ja: {
      noData: "この条件のデータがありません。",
      headers: { jp: "JP", us: "US", eu: "EU" },

      // mode
      notShoe: "実寸判定は「靴」のみ対応です。",
      invalidLen: "足長（cm）を正しく入力してください（例: 26.5）。",
      fitTitle: "判定結果（目安）",
      recommend: "推奨サイズ",
      near: "近いサイズ",
      cautionWide: "幅広の傾向：窮屈なら +0.5cm を検討。",
      cautionNarrow: "幅細めの傾向：大きすぎ注意（まずは基準サイズ）。",
      cautionStd: "標準的：まずは基準サイズから。",

      // brand
      brandBlockTitle: "ブランド補正",
      brandUnavailable: "ブランド辞書を読み込めませんでした（補正なしで動作中）",

      // clothing fit
      notCloth: "実寸判定（服）は「衣類」のみ対応です。",
      invalidWaist: "ウエスト（cm）を正しく入力してください（例: 78）。",
      invalidChest: "胸囲（cm）は数値で入力してください（任意）。",
      invalidHip: "ヒップ（cm）は数値で入力してください（任意）。",
      clothTitle: "判定結果（服・目安）",
      clothPrimary: "主に {primary} で判定しています。",
      chest: "胸囲",
      waist: "ウエスト",
      hip: "ヒップ",
      clothBorderline: "境界付近：迷うなら「上のサイズ」も検討。",
      clothBrandApplied: "ブランド補正を適用しました（服）",
      clothBrandUnavailable: "服ブランド辞書を読み込めませんでした（補正なしで動作中）",
    },
    en: {
      noData: "No data for this selection.",
      headers: { jp: "JP", us: "US", eu: "EU" },

      notShoe: "Fit checker supports shoes only.",
      invalidLen: "Enter a valid foot length in cm (e.g., 26.5).",
      fitTitle: "Result (approx.)",
      recommend: "Recommended",
      near: "Nearby sizes",
      cautionWide: "Wider foot: consider +0.5 cm if tight.",
      cautionNarrow: "Narrower foot: beware of sizing up too much.",
      cautionStd: "Typical: start with the base size.",

      brandBlockTitle: "Brand adjustment",
      brandUnavailable: "Could not load brand dictionary (running without adjustments).",

      notCloth: "Clothing fit supports clothing category only.",
      invalidWaist: "Enter a valid waist in cm (e.g., 78).",
      invalidChest: "Chest (cm) must be a number (optional).",
      invalidHip: "Hip (cm) must be a number (optional).",
      clothTitle: "Result (clothing, approx.)",
      clothPrimary: "Sizing is based mainly on {primary}.",
      chest: "Chest",
      waist: "Waist",
      hip: "Hip",
      clothBorderline: "Near boundary: consider sizing up if unsure.",
      clothBrandApplied: "Clothing brand adjustment applied",
      clothBrandUnavailable: "Could not load clothing brand dictionary (running without it).",
    },
  };

  let currentLang = "ja";
  let currentMode = "table"; // table | fit (shoes) | cloth
  let brandDict = null;
  let brandLoadError = false;

  // ---------- helpers ----------
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function parseDecimal(val) {
    if (val == null) return null;
    const cleaned = String(val).trim().replace(",", ".");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function detectInitialLang() {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  }

  function t(key, vars) {
    let s = LABELS[currentLang][key] ?? "";
    if (vars && typeof vars === "object") {
      Object.keys(vars).forEach((k) => {
        s = s.replaceAll(`{${k}}`, String(vars[k]));
      });
    }
    return s;
  }

  // ---------- brand dictionary ----------
  async function loadBrandDict() {
    try {
      const res = await fetch("./brand.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`brand.json HTTP ${res.status}`);
      const json = await res.json();
      brandDict = json;
      brandLoadError = false;
    } catch (e) {
      brandDict = null;
      brandLoadError = true;
      // keep silent; tool still works without it
      // console.warn(e);
    }
  }

  function rebuildShoeBrandOptions() {
    if (!els.fitBrand) return;

    const shoeOnly = els.category?.value === "shoes";
    els.fitBrand.disabled = !shoeOnly;

    const prev = els.fitBrand.value || "";
    while (els.fitBrand.firstChild) els.fitBrand.removeChild(els.fitBrand.firstChild);

    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "—";
    els.fitBrand.appendChild(opt0);

    if (!shoeOnly) {
      els.fitBrand.value = "";
      return;
    }

    const gen = els.gender?.value || "men";
    const list = brandDict?.shoes?.[gen] ?? [];
    if (!Array.isArray(list) || !list.length) {
      els.fitBrand.value = "";
      return;
    }

    list
      .slice()
      .sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)))
      .forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = b.label || b.id;
        els.fitBrand.appendChild(opt);
      });

    const still = list.some((b) => b.id === prev);
    els.fitBrand.value = still ? prev : "";
  }

  function rebuildClothBrandOptions() {
    if (!els.clothBrand) return;

    const clothOnly = els.category?.value === "clothing";
    els.clothBrand.disabled = !clothOnly;

    const prev = els.clothBrand.value || "";
    while (els.clothBrand.firstChild) els.clothBrand.removeChild(els.clothBrand.firstChild);

    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "—";
    els.clothBrand.appendChild(opt0);

    if (!clothOnly) {
      els.clothBrand.value = "";
      return;
    }

    const gen = els.gender?.value || "men";
    const type = els.clothType?.value || "tops";
    const list = brandDict?.clothing?.[gen]?.[type] ?? [];

    if (!Array.isArray(list) || !list.length) {
      els.clothBrand.value = "";
      return;
    }

    list
      .slice()
      .sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)))
      .forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = b.label || b.id;
        els.clothBrand.appendChild(opt);
      });

    const still = list.some((b) => b.id === prev);
    els.clothBrand.value = still ? prev : "";
  }

  // ---------- i18n ----------
  function applyLang(lang) {
    currentLang = lang;

    els.i18nNodes.forEach((node) => {
      node.style.display = node.dataset.i18n === lang ? "" : "none";
    });

    els.langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    document.documentElement.lang = lang === "ja" ? "ja" : "en";

    ensureTableHeaders();
    renderTable();
    renderFitResult(null);
    renderClothResult(null);

    // keep brand selects rebuilt (labels don't change, but availability does)
    rebuildShoeBrandOptions();
    rebuildClothBrandOptions();
  }

  // ---------- table mode ----------
  function getRows() {
    const cat = els.category?.value;
    const gen = els.gender?.value;
    return DATA?.[cat]?.[gen] ?? [];
  }

  function clearTbody() {
    if (!els.tbody) return;
    while (els.tbody.firstChild) els.tbody.removeChild(els.tbody.firstChild);
  }

  function setHeaderHighlight(baseKey) {
    if (!els.table) return;
    const ths = els.table.querySelectorAll("thead th");
    const order = ["jp", "us", "eu"];
    ths.forEach((th, idx) => th.classList.toggle("is-base", order[idx] === baseKey));
  }

  function ensureTableHeaders() {
    if (!els.table) return;
    const ths = els.table.querySelectorAll("thead th");
    if (ths.length === 3) {
      ths[0].textContent = LABELS[currentLang].headers.jp;
      ths[1].textContent = LABELS[currentLang].headers.us;
      ths[2].textContent = LABELS[currentLang].headers.eu;
    }
  }

  function renderEmptyRow(text) {
    if (!els.tbody) return;
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
    if (!els.base || !els.category || !els.gender) return;

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

  // ---------- shoes fit ----------
  function getShoeRows() {
    return DATA?.shoes?.[els.gender.value] ?? [];
  }

  function closestIndexByJP(rows, targetJP) {
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
    if (!Number.isFinite(lengthCm) || !Number.isFinite(widthCm)) return null;
    const ratio = widthCm / lengthCm;
    if (ratio >= 0.41) return "wide";
    if (ratio <= 0.36) return "narrow";
    return "std";
  }

  function getShoeBrand(gen, id) {
    if (!id) return null;
    const list = brandDict?.shoes?.[gen] ?? [];
    return list.find((b) => b.id === id) || null;
  }

  function buildFitPayload() {
    if (!els.category || !els.gender) return { error: LABELS[currentLang].noData };

    if (els.category.value !== "shoes") {
      return { error: LABELS[currentLang].notShoe };
    }

    const lengthCmRaw = parseDecimal(els.footLength?.value);
    if (!Number.isFinite(lengthCmRaw) || lengthCmRaw < 18 || lengthCmRaw > 35) {
      return { error: LABELS[currentLang].invalidLen };
    }

    const widthCm = parseDecimal(els.footWidth?.value);
    const gen = els.gender.value;

    // Optional brand length adjustment
    const brandId = els.fitBrand ? (els.fitBrand.value || "") : "";
    const brand = getShoeBrand(gen, brandId);
    const lenOffset = brand ? Number(brand.length_offset_cm || 0) : 0;

    const lengthCm = lengthCmRaw + (Number.isFinite(lenOffset) ? lenOffset : 0);

    const rows = getShoeRows();
    if (!rows.length) return { error: LABELS[currentLang].noData };

    // Rule: target JP ≈ foot length rounded to nearest 0.5
    const roundedJP = Math.round(lengthCm * 2) / 2;

    const idx = closestIndexByJP(rows, roundedJP);
    if (idx < 0) return { error: LABELS[currentLang].noData };

    const rec = rows[idx];
    const near = [];
    if (rows[idx - 1]) near.push(rows[idx - 1]);
    near.push(rows[idx]);
    if (rows[idx + 1]) near.push(rows[idx + 1]);

    const wc = Number.isFinite(widthCm) ? widthClass(lengthCmRaw, widthCm) : null;

    let caution = "";
    if (wc === "wide") caution = LABELS[currentLang].cautionWide;
    else if (wc === "narrow") caution = LABELS[currentLang].cautionNarrow;
    else if (wc === "std") caution = LABELS[currentLang].cautionStd;

    return {
      error: null,
      lengthCmRaw,
      lengthCmAdjusted: lengthCm,
      lenOffset: Number.isFinite(lenOffset) ? lenOffset : 0,
      widthCm: Number.isFinite(widthCm) ? widthCm : null,
      roundedJP,
      recommend: rec,
      near,
      widthClass: wc,
      caution,
      brandSelected: !!brand,
      brandLabel: brand ? (brand.label || brand.id) : "",
      brandNote: brand ? (currentLang === "ja" ? (brand.note_ja || "") : (brand.note_en || "")) : "",
      brandLoadError,
    };
  }

  function renderFitResult(payload) {
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

    const nearHtml = payload.near
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

    let brandBlock = "";
    if (payload.brandSelected) {
      const off = payload.lenOffset || 0;
      const sign = off > 0 ? "+" : off < 0 ? "−" : "";
      const abs = Math.abs(off).toFixed(1);
      const offText = `${sign}${abs}cm`;

      brandBlock = `
        <div class="fit-brandblock">
          <div class="fit-label">${escapeHtml(LABELS[currentLang].brandBlockTitle)}</div>
          <div class="fit-brandline">
            <span class="muted">${escapeHtml(payload.brandLabel)}:</span>
            <strong>${escapeHtml(currentLang === "ja" ? "足長補正を適用" : "Length adjustment applied")}</strong>
            <span class="muted">(${escapeHtml(offText)})</span>
          </div>
          ${payload.brandNote ? `<div class="fit-brandnote">${escapeHtml(payload.brandNote)}</div>` : ""}
        </div>
      `;
    } else if (payload.brandLoadError && els.fitBrand && els.fitBrand.value) {
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
          <strong>${payload.lengthCmRaw.toFixed(1)} cm</strong>
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

        <div class="fit-sub">
          <div class="fit-label">${escapeHtml(near)}</div>
          <ul class="fit-list">${nearHtml}</ul>
        </div>

        ${brandBlock}
      </div>
    `;
  }

  // ---------- clothing fit ----------
  function getClothBrand(gen, type, id) {
    if (!id) return null;
    const list = brandDict?.clothing?.[gen]?.[type] ?? [];
    return list.find((b) => b.id === id) || null;
  }

  function scoreRange(val, range) {
    if (!Number.isFinite(val) || !range) return 0;
    const [lo, hi] = range;
    if (val < lo) return lo - val;
    if (val > hi) return val - hi;
    // inside range => 0 (perfect)
    return 0;
  }

  function within(val, range) {
    if (!Number.isFinite(val) || !range) return false;
    const [lo, hi] = range;
    return val >= lo && val <= hi;
  }

  function findBestClothSize(gen, type, chest, waist, hip) {
    const chart = CLOTH_CHART?.[gen]?.[type] ?? [];
    if (!chart.length) return null;

    const primaryKey = type === "bottoms" ? "waist" : "chest";
    const primaryVal = type === "bottoms" ? waist : chest;

    // If primary metric missing (tops chest optional), fallback to waist.
    const primaryUsed = Number.isFinite(primaryVal) ? primaryKey : "waist";

    let best = null;
    let bestScore = Infinity;
    let borderline = false;

    chart.forEach((row) => {
      // Score = sum of distances to ranges for provided metrics (lower is better)
      let s = 0;
      if (Number.isFinite(chest) && row.chest) s += scoreRange(chest, row.chest);
      if (Number.isFinite(waist) && row.waist) s += scoreRange(waist, row.waist);
      if (Number.isFinite(hip) && row.hip) s += scoreRange(hip, row.hip);

      // Prefer sizes whose primary metric is within range
      if (Number.isFinite(primaryVal) && row[primaryKey]) {
        if (!within(primaryVal, row[primaryKey])) s += 0.6; // small penalty
      }

      if (s < bestScore) {
        bestScore = s;
        best = row;
      }
    });

    // Borderline heuristic: if best primary metric is within 1.0cm to boundary
    if (best && best[primaryUsed] && Number.isFinite(type === "bottoms" ? waist : chest)) {
      const v = type === "bottoms" ? waist : chest;
      const [lo, hi] = best[primaryUsed];
      if (Number.isFinite(v)) {
        const d = Math.min(Math.abs(v - lo), Math.abs(v - hi));
        borderline = d <= 1.0;
      }
    }

    return {
      best,
      score: bestScore,
      borderline,
      primaryUsed,
    };
  }

  function mapClothToTableSize(gen, sizeJP) {
    const rows = DATA?.clothing?.[gen] ?? [];
    return rows.find((r) => String(r.jp) === String(sizeJP)) || null;
  }

  function buildClothPayload() {
    if (!els.category || !els.gender) return { error: LABELS[currentLang].noData };
    if (els.category.value !== "clothing") return { error: LABELS[currentLang].notCloth };

    const gen = els.gender.value;
    const type = els.clothType ? (els.clothType.value || "tops") : "tops";

    const waistRaw = parseDecimal(els.clothWaist?.value);
    if (!Number.isFinite(waistRaw) || waistRaw < 40 || waistRaw > 160) {
      return { error: LABELS[currentLang].invalidWaist };
    }

    const chest = parseDecimal(els.clothChest?.value);
    if (els.clothChest && els.clothChest.value.trim() && !Number.isFinite(chest)) {
      return { error: LABELS[currentLang].invalidChest };
    }

    const hip = parseDecimal(els.clothHip?.value);
    if (els.clothHip && els.clothHip.value.trim() && !Number.isFinite(hip)) {
      return { error: LABELS[currentLang].invalidHip };
    }

    // Brand adjustment (clothing): apply waist_offset_cm to WAIST only (simple + safe)
    const brandId = els.clothBrand ? (els.clothBrand.value || "") : "";
    const brand = getClothBrand(gen, type, brandId);
    const waistOffset = brand ? Number(brand.waist_offset_cm || 0) : 0;

    const waist = waistRaw + (Number.isFinite(waistOffset) ? waistOffset : 0);

    const found = findBestClothSize(gen, type, chest, waist, hip);
    if (!found || !found.best) return { error: LABELS[currentLang].noData };

    const sizeJP = found.best.size;
    const mapped = mapClothToTableSize(gen, sizeJP) || { jp: sizeJP, us: "—", eu: "—" };

    // Nearby (prev/next in chart order)
    const chart = CLOTH_CHART?.[gen]?.[type] ?? [];
    const idx = chart.findIndex((r) => r.size === sizeJP);
    const near = [];
    if (idx >= 0) {
      if (chart[idx - 1]) near.push(chart[idx - 1].size);
      near.push(chart[idx].size);
      if (chart[idx + 1]) near.push(chart[idx + 1].size);
    } else {
      near.push(sizeJP);
    }
    const nearMapped = near.map((s) => mapClothToTableSize(gen, s) || { jp: s, us: "—", eu: "—" });

    const primaryLabel =
      found.primaryUsed === "chest" ? t("chest") :
      found.primaryUsed === "waist" ? t("waist") : t("hip");

    return {
      error: null,
      gen,
      type,
      input: {
        chest: Number.isFinite(chest) ? chest : null,
        waistRaw,
        waistAdjusted: waist,
        hip: Number.isFinite(hip) ? hip : null,
      },
      primaryLabel,
      borderline: !!found.borderline,
      recommend: mapped,
      near: nearMapped,
      brandSelected: !!brand,
      brandLabel: brand ? (brand.label || brand.id) : "",
      brandWaistOffset: Number.isFinite(waistOffset) ? waistOffset : 0,
      brandNote: brand ? (currentLang === "ja" ? (brand.note_ja || "") : (brand.note_en || "")) : "",
      brandLoadError,
    };
  }

  function renderClothResult(payload) {
    if (!els.clothResult) return;

    if (!payload) {
      els.clothResult.innerHTML = "";
      return;
    }

    if (payload.error) {
      els.clothResult.innerHTML = `<div class="fit-card error">${escapeHtml(payload.error)}</div>`;
      return;
    }

    const title = t("clothTitle");
    const recommend = t("recommend");
    const near = t("near");

    const rec = payload.recommend;

    const metaLines = [];
    if (payload.input.chest != null) metaLines.push(`${t("chest")}: ${payload.input.chest.toFixed(1)} cm`);
    metaLines.push(`${t("waist")}: ${payload.input.waistRaw.toFixed(1)} cm`);
    if (payload.input.hip != null) metaLines.push(`${t("hip")}: ${payload.input.hip.toFixed(1)} cm`);

    const primaryLine = `<div class="fit-howto">${escapeHtml(t("clothPrimary", { primary: payload.primaryLabel }))}</div>`;

    const borderlineLine = payload.borderline
      ? `<div class="fit-borderline">${escapeHtml(t("clothBorderline"))}</div>`
      : "";

    const nearHtml = payload.near
      .map(
        (r) => `
        <li>
          <strong>JP ${escapeHtml(String(r.jp))}</strong>
          <span class="muted">/ US ${escapeHtml(String(r.us))} / EU ${escapeHtml(String(r.eu))}</span>
        </li>`
      )
      .join("");

    let brandBlock = "";
    if (payload.brandSelected) {
      const off = payload.brandWaistOffset || 0;
      const sign = off > 0 ? "+" : off < 0 ? "−" : "";
      const abs = Math.abs(off).toFixed(1);
      const offText = `${sign}${abs}cm`;

      brandBlock = `
        <div class="fit-brandblock">
          <div class="fit-label">${escapeHtml(LABELS[currentLang].brandBlockTitle)}</div>
          <div class="fit-brandline">
            <span class="muted">${escapeHtml(payload.brandLabel)}:</span>
            <strong>${escapeHtml(LABELS[currentLang].clothBrandApplied)}</strong>
            <span class="muted">(${escapeHtml(offText)})</span>
          </div>
          ${payload.brandNote ? `<div class="fit-brandnote">${escapeHtml(payload.brandNote)}</div>` : ""}
        </div>
      `;
    } else if (payload.brandLoadError && els.clothBrand && els.clothBrand.value) {
      brandBlock = `
        <div class="fit-brandblock">
          <div class="fit-label">${escapeHtml(LABELS[currentLang].brandBlockTitle)}</div>
          <div class="fit-brandnote">${escapeHtml(LABELS[currentLang].clothBrandUnavailable)}</div>
        </div>
      `;
    }

    const waistAdjNote =
      payload.brandSelected && payload.input.waistAdjusted !== payload.input.waistRaw
        ? `<div class="fit-meta"><span class="muted">${escapeHtml(currentLang === "ja" ? "判定用ウエスト" : "Adjusted waist")}:</span> <strong>${payload.input.waistAdjusted.toFixed(1)} cm</strong></div>`
        : "";

    els.clothResult.innerHTML = `
      <div class="fit-card">
        <div class="fit-title">${escapeHtml(title)}</div>

        <div class="fit-meta">${escapeHtml(metaLines.join(" / "))}</div>
        ${waistAdjNote}
        ${primaryLine}

        <div class="fit-main">
          <div class="fit-label">${escapeHtml(recommend)}</div>
          <div class="fit-big">
            <span class="pill">JP ${escapeHtml(String(rec.jp))}</span>
            <span class="pill">US ${escapeHtml(String(rec.us))}</span>
            <span class="pill">EU ${escapeHtml(String(rec.eu))}</span>
          </div>
        </div>

        ${borderlineLine}

        <div class="fit-sub">
          <div class="fit-label">${escapeHtml(near)}</div>
          <ul class="fit-list">${nearHtml}</ul>
        </div>

        ${brandBlock}
      </div>
    `;
  }

  // ---------- mode ----------
  function setMode(mode) {
    currentMode = mode;

    const isTable = mode === "table";
    const isShoeFit = mode === "fit";
    const isCloth = mode === "cloth";

    // tabs
    if (els.tabTable) els.tabTable.classList.toggle("active", isTable);
    if (els.tabFit) els.tabFit.classList.toggle("active", isShoeFit);
    if (els.tabCloth) els.tabCloth.classList.toggle("active", isCloth);

    // panels
    if (els.fitPanel) els.fitPanel.hidden = !isShoeFit;
    if (els.clothPanel) els.clothPanel.hidden = !isCloth;

    // table section
    if (els.resultSection) els.resultSection.hidden = !isTable;

    // base selector is table-only
    if (els.base) els.base.disabled = !isTable;

    // Fit tabs enabled state depends on category
    const cat = els.category ? els.category.value : "clothing";

    const shoeOnly = cat === "shoes";
    if (els.tabFit) {
      els.tabFit.disabled = !shoeOnly;
      els.tabFit.classList.toggle("disabled", !shoeOnly);
    }

    const clothOnly = cat === "clothing";
    if (els.tabCloth) {
      els.tabCloth.disabled = !clothOnly;
      els.tabCloth.classList.toggle("disabled", !clothOnly);
    }

    // Brand selects availability
    rebuildShoeBrandOptions();
    rebuildClothBrandOptions();

    // refresh
    if (isTable) {
      renderFitResult(null);
      renderClothResult(null);
      renderTable();
    } else if (isShoeFit) {
      renderClothResult(null);
      renderFitResult(null);
    } else if (isCloth) {
      renderFitResult(null);
      renderClothResult(null);
    }
  }

  // ---------- events ----------
  function bindEvents() {
    // category
    els.category?.addEventListener("change", () => {
      // if current mode becomes invalid, fallback to table
      if (currentMode === "fit" && els.category.value !== "shoes") setMode("table");
      if (currentMode === "cloth" && els.category.value !== "clothing") setMode("table");

      // update tabs
      setMode(currentMode);

      // clear panels
      renderFitResult(null);
      renderClothResult(null);

      // table
      renderTable();
    });

    // gender
    els.gender?.addEventListener("change", () => {
      rebuildShoeBrandOptions();
      rebuildClothBrandOptions();
      renderTable();
      renderFitResult(null);
      renderClothResult(null);
    });

    // base
    els.base?.addEventListener("change", renderTable);

    // tabs
    els.tabTable?.addEventListener("click", () => setMode("table"));

    els.tabFit?.addEventListener("click", () => {
      if (els.category?.value !== "shoes") return;
      setMode("fit");
    });

    els.tabCloth?.addEventListener("click", () => {
      if (els.category?.value !== "clothing") return;
      setMode("cloth");
    });

    // shoe fit actions
    els.fitRun?.addEventListener("click", () => {
      const payload = buildFitPayload();
      renderFitResult(payload);
      els.fitResult?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });

    els.fitReset?.addEventListener("click", () => {
      if (els.footLength) els.footLength.value = "";
      if (els.footWidth) els.footWidth.value = "";
      if (els.fitBrand) els.fitBrand.value = "";
      renderFitResult(null);
      els.footLength?.focus?.();
    });

    [els.footLength, els.footWidth].forEach((inp) => {
      inp?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          els.fitRun?.click();
        }
      });
    });

    els.fitBrand?.addEventListener("change", () => {
      renderFitResult(null);
    });

    // clothing actions (optional)
    els.clothRun?.addEventListener("click", () => {
      const payload = buildClothPayload();
      renderClothResult(payload);
      els.clothResult?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });

    els.clothReset?.addEventListener("click", () => {
      if (els.clothChest) els.clothChest.value = "";
      if (els.clothWaist) els.clothWaist.value = "";
      if (els.clothHip) els.clothHip.value = "";
      if (els.clothBrand) els.clothBrand.value = "";
      renderClothResult(null);
      els.clothWaist?.focus?.();
    });

    [els.clothChest, els.clothWaist, els.clothHip].forEach((inp) => {
      inp?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          els.clothRun?.click();
        }
      });
    });

    els.clothType?.addEventListener("change", () => {
      rebuildClothBrandOptions();
      renderClothResult(null);
    });

    els.clothBrand?.addEventListener("change", () => {
      renderClothResult(null);
    });

    // i18n buttons
    els.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });
  }

  // ---------- boot ----------
  document.addEventListener("DOMContentLoaded", async () => {
    bindEvents();

    // load optional brand dict, then build selects
    await loadBrandDict();
    rebuildShoeBrandOptions();
    rebuildClothBrandOptions();

    applyLang(detectInitialLang());

    // initial mode: table, but respect category availability
    setMode("table");
    renderTable();
  });
})();
