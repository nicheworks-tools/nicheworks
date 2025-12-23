/* app.js — Size Converter (JP ↔ US/EU)
 * Phase 1: Shoe fit checker by cm (foot length required, width optional)
 * Phase 2: Brand adjustment via brand.json (optional)
 * Phase 2.5: Brand list scaling (grouped optgroup)
 * Phase 3: Clothing fit by measurements (cm/inch) -> JP size -> US/EU
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

    // mode tabs
    tabTable: $("tabTable"),
    tabFit: $("tabFit"),
    tabCloth: $("tabCloth"),

    // panels
    fitPanel: $("fitPanel"),
    clothPanel: $("clothPanel"),

    // shoes fit
    footLength: $("footLength"),
    footWidth: $("footWidth"),
    brandSelect: $("brandSelect"),
    fitRun: $("fitRun"),
    fitReset: $("fitReset"),
    fitResult: $("fitResult"),

    // clothing fit
    clothType: $("clothType"),
    clothUnit: $("clothUnit"),
    clothChest: $("clothChest"),
    clothWaist: $("clothWaist"),
    clothHip: $("clothHip"),
    clothRun: $("clothRun"),
    clothReset: $("clothReset"),
    clothResult: $("clothResult"),
  };

  // MVP data (table output)
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
        { jp: "28.0", us: "10", eu: "44" }
      ],
      women: [
        { jp: "22.0", us: "5", eu: "35" },
        { jp: "22.5", us: "5.5", eu: "36" },
        { jp: "23.0", us: "6", eu: "36.5" },
        { jp: "23.5", us: "6.5", eu: "37.5" },
        { jp: "24.0", us: "7", eu: "38" },
        { jp: "24.5", us: "7.5", eu: "39" },
        { jp: "25.0", us: "8", eu: "39.5" }
      ]
    },
    clothing: {
      men: [
        { jp: "S", us: "S", eu: "46" },
        { jp: "M", us: "M", eu: "48" },
        { jp: "L", us: "L", eu: "50" },
        { jp: "XL", us: "XL", eu: "52" },
        { jp: "XXL", us: "XXL", eu: "54" }
      ],
      women: [
        { jp: "S", us: "2–4", eu: "34–36" },
        { jp: "M", us: "6–8", eu: "38–40" },
        { jp: "L", us: "10–12", eu: "42–44" },
        { jp: "XL", us: "14–16", eu: "46–48" }
      ]
    }
  };

  // Phase 3: measurement heuristics (cm ranges) — "approximate"
  // We intentionally keep simple: pick size by waist primarily, refine with chest/hip if present.
  // Ranges are inclusive lower bound, exclusive upper bound.
  const CLOTH_RULES = {
    men: {
      tops: [
        { jp: "S", chest: [84, 92], waist: [70, 78] },
        { jp: "M", chest: [92, 100], waist: [78, 86] },
        { jp: "L", chest: [100, 108], waist: [86, 94] },
        { jp: "XL", chest: [108, 116], waist: [94, 102] },
        { jp: "XXL", chest: [116, 124], waist: [102, 110] }
      ],
      bottoms: [
        { jp: "S", waist: [70, 78], hip: [86, 94] },
        { jp: "M", waist: [78, 86], hip: [94, 102] },
        { jp: "L", waist: [86, 94], hip: [102, 110] },
        { jp: "XL", waist: [94, 102], hip: [110, 118] },
        { jp: "XXL", waist: [102, 110], hip: [118, 126] }
      ]
    },
    women: {
      tops: [
        { jp: "S", chest: [76, 84], waist: [58, 66], hip: [82, 90] },
        { jp: "M", chest: [84, 92], waist: [66, 74], hip: [90, 98] },
        { jp: "L", chest: [92, 100], waist: [74, 82], hip: [98, 106] },
        { jp: "XL", chest: [100, 108], waist: [82, 90], hip: [106, 114] }
      ],
      bottoms: [
        { jp: "S", waist: [58, 66], hip: [82, 90] },
        { jp: "M", waist: [66, 74], hip: [90, 98] },
        { jp: "L", waist: [74, 82], hip: [98, 106] },
        { jp: "XL", waist: [82, 90], hip: [106, 114] }
      ]
    }
  };

  const LABELS = {
    ja: {
      noData: "この条件のデータがありません。",
      invalidLen: "足長（cm）を正しく入力してください（例: 26.5）。",
      invalidCloth: "ウエストを正しく入力してください（例: 78）。",
      notShoe: "実寸判定は「靴」のみ対応です。",
      notCloth: "服の実寸判定は「衣類」のみ対応です。",
      fitTitle: "判定結果（目安）",
      recommend: "推奨サイズ",
      near: "候補（±0.5）",
      cautionWide: "幅広の傾向：窮屈なら +0.5cm を検討。",
      cautionNarrow: "幅細めの傾向：大きすぎ注意（まずは基準サイズ）。",
      cautionStd: "標準的：まずは基準サイズから。",
      borderline: "境界付近です。±0.5cm どちらも候補に入ります（レビュー優先推奨）。",
      widthHowto: "足幅は「最も広い部分」を立った状態でまっすぐ測るのが目安です。",
      brandBlockTitle: "ブランド補正（任意）",
      brandApplied: "ブランド補正を適用しました",
      brandUnavailable: "ブランド辞書を読み込めませんでした（補正なしで動作中）",
      clothTitle: "服の判定結果（目安）",
      clothBasedOn: "主にウエスト基準（胸囲/ヒップがあれば補助）",
      clothUnitCm: "cm換算",
      clothBorder: "境界付近：上下サイズも候補です（好みのフィット感で調整）。",
      groups: {
        sports: "スポーツ",
        running: "ランニング",
        outdoor: "アウトドア",
        casual: "カジュアル",
        leather: "革靴",
        boots: "ブーツ",
        comfort: "コンフォート"
      },
      headers: { jp: "JP", us: "US", eu: "EU" }
    },
    en: {
      noData: "No data for this selection.",
      invalidLen: "Enter a valid foot length in cm (e.g., 26.5).",
      invalidCloth: "Enter a valid waist value (e.g., 78).",
      notShoe: "Fit checker supports shoes only.",
      notCloth: "Clothing fit supports clothing category only.",
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
      clothTitle: "Clothing result (approx.)",
      clothBasedOn: "Mostly based on waist (chest/hip help if provided).",
      clothUnitCm: "converted to cm",
      clothBorder: "Borderline: consider adjacent sizes (adjust by preference).",
      groups: {
        sports: "Sports",
        running: "Running",
        outdoor: "Outdoor",
        casual: "Casual",
        leather: "Leather",
        boots: "Boots",
        comfort: "Comfort"
      },
      headers: { jp: "JP", us: "US", eu: "EU" }
    }
  };

  let currentLang = "ja";
  let currentMode = "table"; // table | fit | cloth

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
      console.warn("[size-converter] brand.json load failed:", e);
    } finally {
      rebuildBrandOptions();
    }
  }

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function parseDecimal(val) {
    if (typeof val !== "string") return null;
    const cleaned = val.trim().replace(",", ".");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  function toCm(n, unit) {
    if (!Number.isFinite(n)) return null;
    if (unit === "inch") return n * 2.54;
    return n;
  }

  function getBrandListForCurrent() {
    const gen = els.gender?.value || "men";
    return brandDict?.shoes?.[gen] ?? [];
  }

  function findBrandById(id) {
    if (!id) return null;
    const list = getBrandListForCurrent();
    return list.find((b) => b.id === id) || null;
  }

  function groupLabel(groupKey) {
    const g = LABELS?.[currentLang]?.groups?.[groupKey];
    return g || groupKey || "Other";
  }

  function rebuildBrandOptions() {
    if (!els.brandSelect) return;

    const shoeOnly = els.category?.value === "shoes";
    els.brandSelect.disabled = !shoeOnly;

    const prev = els.brandSelect.value || "";

    while (els.brandSelect.firstChild) els.brandSelect.removeChild(els.brandSelect.firstChild);

    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "—";
    els.brandSelect.appendChild(opt0);

    if (!shoeOnly) {
      els.brandSelect.value = "";
      return;
    }

    const brands = getBrandListForCurrent();
    if (!brands.length) {
      els.brandSelect.value = "";
      return;
    }

    const buckets = new Map();
    brands.forEach((b) => {
      const key = (b.group || "other").toLowerCase();
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(b);
    });

    const order = ["running", "sports", "outdoor", "casual", "leather", "boots", "comfort", "other"];
    const keys = Array.from(buckets.keys()).sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      const pa = ia === -1 ? 999 : ia;
      const pb = ib === -1 ? 999 : ib;
      if (pa !== pb) return pa - pb;
      return a.localeCompare(b);
    });

    keys.forEach((key) => {
      const list = buckets.get(key) || [];
      list.sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)));

      const og = document.createElement("optgroup");
      og.label = groupLabel(key);

      list.forEach((b) => {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = b.label || b.id;
        og.appendChild(opt);
      });

      els.brandSelect.appendChild(og);
    });

    const still = !!findBrandById(prev);
    els.brandSelect.value = still ? prev : "";
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

    rebuildBrandOptions();
    renderTable();
    renderFitResult(null);
    renderClothResult(null);
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

    const baseKey = els.base.value;
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

  // ---------- shoe fit ----------
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

  function buildFitPayload() {
    if (els.category.value !== "shoes") return { error: LABELS[currentLang].notShoe };

    const lengthCm = parseDecimal(els.footLength.value);
    if (!Number.isFinite(lengthCm) || lengthCm < 18 || lengthCm > 35) {
      return { error: LABELS[currentLang].invalidLen };
    }

    const widthCm = parseDecimal(els.footWidth.value);
    const rows = getShoeRows();
    if (!rows.length) return { error: LABELS[currentLang].noData };

    const roundedJP = Math.round(lengthCm * 2) / 2;

    const lowerStep = Math.floor(lengthCm * 2) / 2;
    const stepMid = lowerStep + 0.25;
    const distToMid = Math.abs(lengthCm - stepMid);
    const isBorderline = distToMid <= 0.10;

    const lowerJP = roundedJP - 0.5;
    const upperJP = roundedJP + 0.5;

    const idx = closestIndexByJP(rows, roundedJP);
    if (idx < 0) return { error: LABELS[currentLang].noData };

    const rec = rows[idx];

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

    const wc = Number.isFinite(widthCm) ? widthClass(lengthCm, widthCm) : null;

    let caution = "";
    if (wc === "wide") caution = LABELS[currentLang].cautionWide;
    else if (wc === "narrow") caution = LABELS[currentLang].cautionNarrow;
    else if (wc === "std") caution = LABELS[currentLang].cautionStd;

    const brandId = els.brandSelect ? (els.brandSelect.value || "") : "";
    const brand = findBrandById(brandId);
    const brandOffset = brand ? Number(brand.offset || 0) : 0;

    let brandRec = null;
    let brandNote = null;

    if (brand) {
      const adjusted = roundedJP + brandOffset;
      const snapped = Math.round(adjusted * 2) / 2;

      const bIdx = closestIndexByJP(rows, snapped);
      if (bIdx >= 0) brandRec = rows[bIdx];

      brandNote = currentLang === "ja" ? (brand.note_ja || "") : (brand.note_en || "");
    }

    return {
      error: null,
      lengthCm,
      widthCm: Number.isFinite(widthCm) ? widthCm : null,
      roundedJP,
      isBorderline,
      recommend: rec,
      candidates,
      caution,
      brandSelected: !!brand,
      brandLabel: brand ? (brand.label || brand.id) : "",
      brandOffset,
      brandRecommend: brandRec,
      brandNote,
      brandLoadError
    };
  }

  function renderFitResult(payload) {
    if (!els.fitResult) return;

    if (!payload) { els.fitResult.innerHTML = ""; return; }

    if (payload.error) {
      els.fitResult.innerHTML = `<div class="fit-card error">${escapeHtml(payload.error)}</div>`;
      return;
    }

    const title = LABELS[currentLang].fitTitle;
    const recommend = LABELS[currentLang].recommend;
    const near = LABELS[currentLang].near;

    const rec = payload.recommend;
    const nearHtml = (payload.candidates || [])
      .map((r) => `
        <li>
          <strong>JP ${escapeHtml(String(r.jp))}</strong>
          <span class="muted">/ US ${escapeHtml(String(r.us))} / EU ${escapeHtml(String(r.eu))}</span>
        </li>`).join("");

    const widthLine =
      payload.widthCm != null
        ? `<div class="fit-meta">
             <span class="muted">${currentLang === "ja" ? "足幅" : "Width"}:</span>
             <strong>${payload.widthCm.toFixed(1)} cm</strong>
           </div>`
        : "";

    const cautionLine = payload.caution ? `<div class="fit-caution">${escapeHtml(payload.caution)}</div>` : "";
    const borderlineLine = payload.isBorderline ? `<div class="fit-borderline">${escapeHtml(LABELS[currentLang].borderline)}</div>` : "";
    const howtoLine = payload.widthCm != null ? `<div class="fit-howto">${escapeHtml(LABELS[currentLang].widthHowto)}</div>` : "";

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

  // ---------- clothing fit ----------
  function mapClothingJPToRow(jpSize) {
    const rows = DATA?.clothing?.[els.gender.value] ?? [];
    return rows.find((r) => String(r.jp).toUpperCase() === String(jpSize).toUpperCase()) || null;
  }

  function inRange(val, range) {
    if (!range || range.length !== 2) return false;
    return val >= range[0] && val < range[1];
  }

  function scoreRule(rule, meas) {
    // waist is primary; chest/hip refine if provided
    let score = 0;

    if (Number.isFinite(meas.waist)) {
      if (rule.waist && inRange(meas.waist, rule.waist)) score += 5;
      else score -= 5;
    }

    if (Number.isFinite(meas.chest) && rule.chest) {
      if (inRange(meas.chest, rule.chest)) score += 2;
      else score -= 1;
    }

    if (Number.isFinite(meas.hip) && rule.hip) {
      if (inRange(meas.hip, rule.hip)) score += 2;
      else score -= 1;
    }

    return score;
  }

  function pickClothingRule(rules, meas) {
    let best = null;
    let bestScore = -Infinity;

    rules.forEach((r) => {
      const s = scoreRule(r, meas);
      if (s > bestScore) {
        bestScore = s;
        best = r;
      }
    });

    return { best, bestScore };
  }

  function isBorderlineCloth(rule, meas) {
    // If waist is close to boundary within 1.5cm => borderline
    if (!rule?.waist || !Number.isFinite(meas.waist)) return false;
    const [lo, hi] = rule.waist;
    const d = Math.min(Math.abs(meas.waist - lo), Math.abs(meas.waist - hi));
    return d <= 1.5;
  }

  function adjacentSize(jp) {
    const orderMen = ["S", "M", "L", "XL", "XXL"];
    const orderWomen = ["S", "M", "L", "XL"];
    const order = els.gender.value === "men" ? orderMen : orderWomen;

    const idx = order.indexOf(String(jp).toUpperCase());
    return {
      prev: idx > 0 ? order[idx - 1] : null,
      next: idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
    };
  }

  function buildClothPayload() {
    if (els.category.value !== "clothing") return { error: LABELS[currentLang].notCloth };

    const unit = els.clothUnit?.value || "cm";
    const type = els.clothType?.value || "tops";
    const gen = els.gender.value;

    const chestRaw = parseDecimal(els.clothChest.value);
    const waistRaw = parseDecimal(els.clothWaist.value);
    const hipRaw = parseDecimal(els.clothHip.value);

    const chest = toCm(chestRaw, unit);
    const waist = toCm(waistRaw, unit);
    const hip = toCm(hipRaw, unit);

    // require waist
    if (!Number.isFinite(waist) || waist < 40 || waist > 160) {
      return { error: LABELS[currentLang].invalidCloth };
    }

    const rules = CLOTH_RULES?.[gen]?.[type] ?? [];
    if (!rules.length) return { error: LABELS[currentLang].noData };

    const meas = {
      chest: Number.isFinite(chest) ? chest : null,
      waist,
      hip: Number.isFinite(hip) ? hip : null
    };

    const { best } = pickClothingRule(rules, meas);
    if (!best) return { error: LABELS[currentLang].noData };

    const recRow = mapClothingJPToRow(best.jp);
    if (!recRow) return { error: LABELS[currentLang].noData };

    const border = isBorderlineCloth(best, meas);
    const adj = adjacentSize(best.jp);

    const candidates = [];
    const pushRow = (jp) => {
      if (!jp) return;
      const row = mapClothingJPToRow(jp);
      if (!row) return;
      if (candidates.some((x) => x.jp === row.jp)) return;
      candidates.push(row);
    };
    if (adj.prev) pushRow(adj.prev);
    pushRow(best.jp);
    if (adj.next) pushRow(adj.next);

    return {
      error: null,
      unit,
      type,
      gen,
      meas,
      recommendJP: best.jp,
      recommendRow: recRow,
      candidates,
      borderline: border
    };
  }

  function renderClothResult(payload) {
    if (!els.clothResult) return;

    if (!payload) { els.clothResult.innerHTML = ""; return; }

    if (payload.error) {
      els.clothResult.innerHTML = `<div class="fit-card error">${escapeHtml(payload.error)}</div>`;
      return;
    }

    const title = LABELS[currentLang].clothTitle;
    const rec = payload.recommendRow;

    const cmLineParts = [];
    if (payload.meas.chest != null) cmLineParts.push(`${currentLang === "ja" ? "胸囲" : "Chest"}: ${payload.meas.chest.toFixed(1)} cm`);
    cmLineParts.push(`${currentLang === "ja" ? "ウエスト" : "Waist"}: ${payload.meas.waist.toFixed(1)} cm`);
    if (payload.meas.hip != null) cmLineParts.push(`${currentLang === "ja" ? "ヒップ" : "Hip"}: ${payload.meas.hip.toFixed(1)} cm`);

    const nearHtml = (payload.candidates || [])
      .map((r) => `
        <li>
          <strong>JP ${escapeHtml(String(r.jp))}</strong>
          <span class="muted">/ US ${escapeHtml(String(r.us))} / EU ${escapeHtml(String(r.eu))}</span>
        </li>`).join("");

    const borderLine = payload.borderline
      ? `<div class="fit-borderline">${escapeHtml(LABELS[currentLang].clothBorder)}</div>`
      : "";

    els.clothResult.innerHTML = `
      <div class="fit-card">
        <div class="fit-title">${escapeHtml(title)}</div>

        <div class="fit-meta">
          <span class="muted">${escapeHtml(LABELS[currentLang].clothBasedOn)}</span>
        </div>

        <div class="fit-meta">
          <span class="muted">${escapeHtml(LABELS[currentLang].clothUnitCm)}:</span>
          <strong>${escapeHtml(cmLineParts.join(" / "))}</strong>
        </div>

        <div class="fit-main">
          <div class="fit-label">${escapeHtml(LABELS[currentLang].recommend)}</div>
          <div class="fit-big">
            <span class="pill">JP ${escapeHtml(String(rec.jp))}</span>
            <span class="pill">US ${escapeHtml(String(rec.us))}</span>
            <span class="pill">EU ${escapeHtml(String(rec.eu))}</span>
          </div>
        </div>

        ${borderLine}

        <div class="fit-sub">
          <div class="fit-label">${escapeHtml(LABELS[currentLang].near)}</div>
          <ul class="fit-list">${nearHtml}</ul>
        </div>
      </div>
    `;
  }

  // ---------- mode ----------
  function setMode(mode) {
    currentMode = mode;

    const isFit = mode === "fit";
    const isCloth = mode === "cloth";

    els.tabTable?.classList.toggle("active", mode === "table");
    els.tabFit?.classList.toggle("active", isFit);
    els.tabCloth?.classList.toggle("active", isCloth);

    if (els.fitPanel) els.fitPanel.hidden = !isFit;
    if (els.clothPanel) els.clothPanel.hidden = !isCloth;

    const shoeOnly = els.category.value === "shoes";
    const clothOnly = els.category.value === "clothing";

    if (els.tabFit) {
      els.tabFit.disabled = !shoeOnly;
      els.tabFit.classList.toggle("disabled", !shoeOnly);
    }
    if (els.tabCloth) {
      els.tabCloth.disabled = !clothOnly;
      els.tabCloth.classList.toggle("disabled", !clothOnly);
    }

    els.base.disabled = (isFit || isCloth);

    if (els.brandSelect) {
      els.brandSelect.disabled = !shoeOnly;
      if (!shoeOnly) els.brandSelect.value = "";
    }

    if (mode === "table") {
      renderFitResult(null);
      renderClothResult(null);
      renderTable();
    } else if (isFit) {
      renderClothResult(null);
      renderTable();
      renderFitResult(null);
    } else if (isCloth) {
      renderFitResult(null);
      renderTable();
      renderClothResult(null);
    }
  }

  // ---------- utils ----------
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // ---------- events ----------
  function bindEvents() {
    els.category.addEventListener("change", () => {
      // if current mode becomes invalid, fallback to table
      if (els.category.value !== "shoes" && currentMode === "fit") setMode("table");
      if (els.category.value !== "clothing" && currentMode === "cloth") setMode("table");

      rebuildBrandOptions();
      renderTable();
      renderFitResult(null);
      renderClothResult(null);

      // update tab enabled state without switching mode forcibly
      setMode(currentMode);
    });

    els.gender.addEventListener("change", () => {
      renderTable();
      renderFitResult(null);
      renderClothResult(null);
      rebuildBrandOptions();
    });

    els.base.addEventListener("change", renderTable);

    // mode tabs
    els.tabTable?.addEventListener("click", () => setMode("table"));

    els.tabFit?.addEventListener("click", () => {
      if (els.category.value !== "shoes") return;
      setMode("fit");
    });

    els.tabCloth?.addEventListener("click", () => {
      if (els.category.value !== "clothing") return;
      setMode("cloth");
    });

    // shoe fit actions
    els.brandSelect?.addEventListener("change", () => renderFitResult(null));

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

    [els.footLength, els.footWidth].forEach((inp) => {
      inp?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          els.fitRun?.click();
        }
      });
    });

    // cloth fit actions
    els.clothRun?.addEventListener("click", () => {
      const payload = buildClothPayload();
      renderClothResult(payload);
      els.clothResult?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });

    els.clothReset?.addEventListener("click", () => {
      els.clothChest.value = "";
      els.clothWaist.value = "";
      els.clothHip.value = "";
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
    await loadBrandDict();
  });
})();
