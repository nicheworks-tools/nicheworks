(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const LANG_KEY = "nw_lang";

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

  const CLOTH_CHART = {
    men: {
      tops: [
        { size: "S", chest: [82, 90], waist: [68, 76], hip: [82, 90] },
        { size: "M", chest: [90, 98], waist: [76, 84], hip: [90, 98] },
        { size: "L", chest: [98, 106], waist: [84, 92], hip: [98, 106] },
        { size: "XL", chest: [106, 114], waist: [92, 100], hip: [106, 114] },
        { size: "XXL", chest: [114, 122], waist: [100, 108], hip: [114, 122] }
      ],
      bottoms: [
        { size: "S", waist: [68, 76], hip: [82, 90] },
        { size: "M", waist: [76, 84], hip: [90, 98] },
        { size: "L", waist: [84, 92], hip: [98, 106] },
        { size: "XL", waist: [92, 100], hip: [106, 114] },
        { size: "XXL", waist: [100, 108], hip: [114, 122] }
      ]
    },
    women: {
      tops: [
        { size: "S", chest: [78, 84], waist: [60, 66], hip: [84, 90] },
        { size: "M", chest: [84, 90], waist: [66, 72], hip: [90, 96] },
        { size: "L", chest: [90, 96], waist: [72, 78], hip: [96, 102] },
        { size: "XL", chest: [96, 102], waist: [78, 84], hip: [102, 108] }
      ],
      bottoms: [
        { size: "S", waist: [60, 66], hip: [84, 90] },
        { size: "M", waist: [66, 72], hip: [90, 96] },
        { size: "L", waist: [72, 78], hip: [96, 102] },
        { size: "XL", waist: [78, 84], hip: [102, 108] }
      ]
    }
  };

  const TEXT = {
    ja: {
      table: "対応表",
      tableCopy: "対応表をTSVコピー",
      copyResult: "判定結果をコピー",
      copied: "コピーしました。",
      copyFail: "コピーできませんでした。",
      noData: "この条件のデータがありません。",
      inputError: "入力エラー",
      shoesOnly: "靴カテゴリでのみ使えます。",
      clothingOnly: "衣類カテゴリでのみ使えます。",
      footLengthError: "足長は 18〜35cm の数値で入力してください。",
      footWidthError: "足幅は数値で入力してください。未入力でも使えます。",
      waistError: "ウエストは数値で入力してください。",
      optionalNumberError: "任意項目は、入力する場合は数値にしてください。",
      closeSize: "近いサイズ目安",
      nearby: "近い候補",
      basis: "根拠",
      note: "一般的な目安です。ブランド公式サイズ表を優先してください。",
      boundary: "境界付近です。迷う場合は上のサイズや返品条件も確認してください。",
      widthOptional: "足幅は任意です。入力した場合のみ幅の傾向を補足します。",
      widthWide: "足幅は広めの傾向です。靴型によっては窮屈に感じる場合があります。",
      widthNarrow: "足幅は細めの傾向です。大きめ選択で緩くなる場合があります。",
      widthStd: "足幅は標準寄りの目安です。",
      unitCm: "入力単位: cm",
      unitInch: "入力単位: inch（cm換算も表示）",
      converted: "cm換算",
      brandApplied: "ブランド補正を適用しました。",
      brandNote: "ブランドメモ",
      tabs: { fit: "実寸で判定（靴）", cloth: "実寸で判定（服）" },
      clothTypes: { tops: "トップス", bottoms: "ボトムス" }
    },
    en: {
      table: "Table",
      tableCopy: "Copy table TSV",
      copyResult: "Copy result",
      copied: "Copied.",
      copyFail: "Copy failed.",
      noData: "No data for this selection.",
      inputError: "Input error",
      shoesOnly: "Available only for the shoes category.",
      clothingOnly: "Available only for the clothing category.",
      footLengthError: "Enter foot length as a number between 18 and 35 cm.",
      footWidthError: "Foot width must be numeric. It can be left blank.",
      waistError: "Enter waist as a number.",
      optionalNumberError: "Optional fields must be numeric when filled.",
      closeSize: "Close size estimate",
      nearby: "Nearby candidates",
      basis: "Basis",
      note: "This is a general estimate. Prefer the brand's official size chart.",
      boundary: "Near a boundary. Check the larger size and return policy if unsure.",
      widthOptional: "Foot width is optional. It is used only for a width tendency note.",
      widthWide: "Foot width looks wider. Some shoe shapes may feel tight.",
      widthNarrow: "Foot width looks narrower. Sizing up may feel loose.",
      widthStd: "Foot width looks close to standard.",
      unitCm: "Input unit: cm",
      unitInch: "Input unit: inch (cm conversion shown)",
      converted: "Converted to cm",
      brandApplied: "Brand adjustment applied.",
      brandNote: "Brand note",
      tabs: { fit: "Fit by cm (Shoes)", cloth: "Fit by cm (Clothing)" },
      clothTypes: { tops: "Tops", bottoms: "Bottoms" }
    }
  };

  const els = {
    category: $("categorySelect"),
    gender: $("genderSelect"),
    base: $("baseSelect"),
    tbody: $("sizeTableBody"),
    table: document.querySelector(".size-table"),
    resultSection: $("resultSection"),
    tabTable: $("tabTable"),
    tabFit: $("tabFit"),
    tabCloth: $("tabCloth"),
    fitPanel: $("fitPanel"),
    clothPanel: $("clothPanel"),
    footLength: $("footLength"),
    footWidth: $("footWidth"),
    fitRun: $("fitRun"),
    fitReset: $("fitReset"),
    fitResult: $("fitResult"),
    shoeBrand: $("brandSelect"),
    clothBrand: $("clothBrand"),
    clothType: $("clothType"),
    clothUnit: $("clothUnit"),
    clothChest: $("clothChest"),
    clothWaist: $("clothWaist"),
    clothHip: $("clothHip"),
    clothRun: $("clothRun"),
    clothReset: $("clothReset"),
    clothResult: $("clothResult"),
    langButtons: document.querySelectorAll(".nw-lang-switch button[data-lang]"),
    i18nNodes: document.querySelectorAll("[data-i18n]")
  };

  let currentLang = getInitialLang();
  let currentMode = "table";
  let brandDict = null;
  let lastResultText = "";

  function getInitialLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "ja" || saved === "en") return saved;
    } catch (_) {}
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function tr(key) {
    return TEXT[currentLang][key] || TEXT.ja[key] || key;
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function parseNumber(input) {
    const value = String(input?.value || "").trim().replace(",", ".");
    if (!value) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : NaN;
  }

  function toCm(value, unit) {
    return unit === "inch" ? value * 2.54 : value;
  }

  function applyLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    try { localStorage.setItem(LANG_KEY, currentLang); } catch (_) {}
    document.documentElement.lang = currentLang;

    els.i18nNodes.forEach((node) => {
      node.style.display = node.dataset.i18n === currentLang ? "" : "none";
    });
    els.langButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === currentLang);
    });
    syncSelectLabels();
    syncTabLabels();
    renderTable();
  }

  function syncSelectLabels() {
    if (!els.clothType) return;
    Array.from(els.clothType.options).forEach((option) => {
      const label = currentLang === "en" ? option.dataset.labelEn : option.dataset.labelJa;
      if (label) option.textContent = label;
    });
  }

  function syncTabLabels() {
    setButtonText(els.tabFit, tr("tabs").fit);
    setButtonText(els.tabCloth, tr("tabs").cloth);
  }

  function setButtonText(button, text) {
    if (!button) return;
    button.textContent = text;
  }

  function rows() {
    return DATA[els.category.value]?.[els.gender.value] || [];
  }

  function renderTable() {
    if (!els.tbody) return;
    clear(els.tbody);
    const base = els.base.value;
    const currentRows = rows();
    const ths = els.table?.querySelectorAll("thead th") || [];
    ["jp", "us", "eu"].forEach((key, index) => {
      if (ths[index]) ths[index].classList.toggle("is-base", key === base);
    });

    if (!currentRows.length) {
      const row = el("tr");
      const cell = el("td", "empty", tr("noData"));
      cell.colSpan = 3;
      row.appendChild(cell);
      els.tbody.appendChild(row);
      return;
    }

    currentRows.forEach((item) => {
      const row = el("tr");
      ["jp", "us", "eu"].forEach((key) => {
        const cell = el("td", key === base ? "is-base" : "", item[key]);
        row.appendChild(cell);
      });
      els.tbody.appendChild(row);
    });
  }

  function setMode(mode) {
    currentMode = mode;
    const isTable = mode === "table";
    const isFit = mode === "fit";
    const isCloth = mode === "cloth";
    els.resultSection.hidden = !isTable;
    els.fitPanel.hidden = !isFit;
    els.clothPanel.hidden = !isCloth;
    [els.tabTable, els.tabFit, els.tabCloth].forEach((button) => {
      if (!button) return;
      button.classList.toggle("active", button.dataset.mode === mode);
    });
    renderTable();
  }

  function syncCategoryModes() {
    const isShoes = els.category.value === "shoes";
    setTabAvailability(els.tabFit, isShoes);
    setTabAvailability(els.tabCloth, !isShoes);
    if ((currentMode === "fit" && !isShoes) || (currentMode === "cloth" && isShoes)) {
      setMode("table");
    }
    rebuildBrandOptions();
  }

  function setTabAvailability(button, enabled) {
    if (!button) return;
    button.disabled = !enabled;
    button.setAttribute("aria-disabled", String(!enabled));
    button.classList.toggle("is-disabled", !enabled);
  }

  async function loadBrands() {
    try {
      const response = await fetch("./brand.json", { cache: "no-store" });
      if (!response.ok) throw new Error("brand.json not available");
      brandDict = await response.json();
    } catch (_) {
      brandDict = null;
    }
    rebuildBrandOptions();
  }

  function rebuildBrandOptions() {
    rebuildSelect(els.shoeBrand, brandDict?.shoes?.[els.gender.value] || []);
    const clothType = els.clothType?.value || "tops";
    rebuildSelect(els.clothBrand, brandDict?.clothing?.[els.gender.value]?.[clothType] || []);
    if (els.shoeBrand) els.shoeBrand.disabled = els.category.value !== "shoes";
    if (els.clothBrand) els.clothBrand.disabled = els.category.value !== "clothing";
  }

  function rebuildSelect(select, items) {
    if (!select) return;
    const selected = select.value;
    clear(select);
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "—";
    select.appendChild(empty);
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id || item.label || "";
      option.textContent = item.label || item.id || "";
      select.appendChild(option);
    });
    select.value = Array.from(select.options).some((option) => option.value === selected) ? selected : "";
  }

  function selectedBrand(kind) {
    const gender = els.gender.value;
    if (kind === "shoe") {
      const id = els.shoeBrand?.value;
      return (brandDict?.shoes?.[gender] || []).find((item) => item.id === id) || null;
    }
    const id = els.clothBrand?.value;
    const type = els.clothType?.value || "tops";
    return (brandDict?.clothing?.[gender]?.[type] || []).find((item) => item.id === id) || null;
  }

  function renderError(target, message) {
    clear(target);
    const card = el("div", "fit-card error");
    card.appendChild(el("div", "fit-title", tr("inputError")));
    card.appendChild(el("p", "", message));
    target.appendChild(card);
    lastResultText = message;
  }

  function findClosestShoe(lengthCm) {
    const brand = selectedBrand("shoe");
    const offset = Number(brand?.length_offset_cm || 0);
    const target = Math.round((lengthCm + (Number.isFinite(offset) ? offset : 0)) * 2) / 2;
    const currentRows = DATA.shoes[els.gender.value] || [];
    let best = currentRows[0];
    let bestIndex = 0;
    let bestDiff = Infinity;
    currentRows.forEach((row, index) => {
      const diff = Math.abs(Number(row.jp) - target);
      if (diff < bestDiff) {
        best = row;
        bestIndex = index;
        bestDiff = diff;
      }
    });
    return { best, target, near: currentRows.slice(Math.max(0, bestIndex - 1), bestIndex + 2), brand, offset, boundary: bestDiff >= 0.25 };
  }

  function widthNote(lengthCm, widthCm) {
    if (!Number.isFinite(widthCm)) return tr("widthOptional");
    const ratio = widthCm / lengthCm;
    if (ratio >= 0.41) return tr("widthWide");
    if (ratio <= 0.36) return tr("widthNarrow");
    return tr("widthStd");
  }

  function runShoeFit() {
    if (els.category.value !== "shoes") return renderError(els.fitResult, tr("shoesOnly"));
    const length = parseNumber(els.footLength);
    const width = parseNumber(els.footWidth);
    if (!Number.isFinite(length) || length < 18 || length > 35) return renderError(els.fitResult, tr("footLengthError"));
    if (Number.isNaN(width)) return renderError(els.fitResult, tr("footWidthError"));

    const result = findClosestShoe(length);
    clear(els.fitResult);
    const card = el("div", "fit-card");
    card.appendChild(el("div", "fit-title", tr("closeSize")));
    card.appendChild(metaLine(currentLang === "ja" ? "足長" : "Foot length", `${length.toFixed(1)} cm`));
    if (Number.isFinite(width)) card.appendChild(metaLine(currentLang === "ja" ? "足幅" : "Foot width", `${width.toFixed(1)} cm`));
    card.appendChild(metaLine(currentLang === "ja" ? "判定用JP" : "Target JP", `${result.target.toFixed(1)} cm`));
    card.appendChild(sizePills(result.best));
    card.appendChild(el("p", "fit-caution", widthNote(length, width)));
    if (result.boundary) card.appendChild(el("p", "fit-caution", tr("boundary")));
    if (result.brand) {
      card.appendChild(el("p", "fit-caution", tr("brandApplied")));
      const note = currentLang === "ja" ? result.brand.note_ja : result.brand.note_en;
      if (note) card.appendChild(el("p", "fit-brandnote", `${tr("brandNote")}: ${note}`));
    }
    card.appendChild(listSizes(tr("nearby"), result.near));
    card.appendChild(el("p", "fit-note", tr("note")));
    addCopyButton(card);
    els.fitResult.appendChild(card);
    lastResultText = buildShoeText(length, width, result);
  }

  function metaLine(label, value) {
    const row = el("div", "fit-meta");
    row.appendChild(el("span", "muted", `${label}: `));
    row.appendChild(el("strong", "", value));
    return row;
  }

  function sizePills(row) {
    const wrap = el("div", "fit-big");
    ["jp", "us", "eu"].forEach((key) => wrap.appendChild(el("span", "pill", `${key.toUpperCase()} ${row[key]}`)));
    return wrap;
  }

  function listSizes(title, items) {
    const section = el("div", "fit-sub");
    section.appendChild(el("div", "fit-label", title));
    const list = el("ul", "fit-list");
    items.forEach((row) => {
      list.appendChild(el("li", "", `JP ${row.jp} / US ${row.us} / EU ${row.eu}`));
    });
    section.appendChild(list);
    return section;
  }

  function buildShoeText(length, width, result) {
    const lines = [
      `${tr("closeSize")}: JP ${result.best.jp} / US ${result.best.us} / EU ${result.best.eu}`,
      `${currentLang === "ja" ? "足長" : "Foot length"}: ${length.toFixed(1)} cm`,
      `${currentLang === "ja" ? "判定用JP" : "Target JP"}: ${result.target.toFixed(1)} cm`,
      widthNote(length, width),
      tr("note")
    ];
    if (Number.isFinite(width)) lines.splice(2, 0, `${currentLang === "ja" ? "足幅" : "Foot width"}: ${width.toFixed(1)} cm`);
    return lines.join("\n");
  }

  function normalizeClothInputs() {
    const unit = els.clothUnit?.value || "cm";
    const chestRaw = parseNumber(els.clothChest);
    const waistRaw = parseNumber(els.clothWaist);
    const hipRaw = parseNumber(els.clothHip);
    if (!Number.isFinite(waistRaw)) return { error: tr("waistError") };
    if (Number.isNaN(chestRaw) || Number.isNaN(hipRaw)) return { error: tr("optionalNumberError") };
    return {
      unit,
      chestRaw: Number.isFinite(chestRaw) ? chestRaw : null,
      waistRaw,
      hipRaw: Number.isFinite(hipRaw) ? hipRaw : null,
      chest: Number.isFinite(chestRaw) ? toCm(chestRaw, unit) : null,
      waist: toCm(waistRaw, unit),
      hip: Number.isFinite(hipRaw) ? toCm(hipRaw, unit) : null
    };
  }

  function runClothFit() {
    if (els.category.value !== "clothing") return renderError(els.clothResult, tr("clothingOnly"));
    const input = normalizeClothInputs();
    if (input.error) return renderError(els.clothResult, input.error);
    const type = els.clothType?.value || "tops";
    const chart = CLOTH_CHART[els.gender.value]?.[type] || [];
    const result = findBestCloth(chart, type, input);
    clear(els.clothResult);
    const card = el("div", "fit-card");
    card.appendChild(el("div", "fit-title", tr("closeSize")));
    card.appendChild(metaLine(currentLang === "ja" ? "入力単位" : "Input unit", input.unit));
    if (input.unit === "inch") card.appendChild(metaLine(tr("converted"), formatMeasurements(input)));
    card.appendChild(el("div", "fit-big", result.size));
    card.appendChild(el("p", "fit-caution", result.reason));
    if (result.boundary) card.appendChild(el("p", "fit-caution", tr("boundary")));
    const brand = selectedBrand("cloth");
    if (brand) {
      card.appendChild(el("p", "fit-caution", tr("brandApplied")));
      const note = currentLang === "ja" ? brand.note_ja : brand.note_en;
      if (note) card.appendChild(el("p", "fit-brandnote", `${tr("brandNote")}: ${note}`));
    }
    card.appendChild(el("p", "fit-note", tr("note")));
    addCopyButton(card);
    els.clothResult.appendChild(card);
    lastResultText = `${tr("closeSize")}: ${result.size}\n${formatMeasurements(input)}\n${result.reason}\n${tr("note")}`;
  }

  function findBestCloth(chart, type, input) {
    let best = chart[0];
    let bestScore = Infinity;
    let reason = "";
    chart.forEach((row) => {
      let score = 0;
      if (type === "tops" && Number.isFinite(input.chest)) score += rangeDistance(input.chest, row.chest) * 1.5;
      score += rangeDistance(input.waist, row.waist);
      if (Number.isFinite(input.hip) && row.hip) score += rangeDistance(input.hip, row.hip) * 0.75;
      if (score < bestScore) {
        bestScore = score;
        best = row;
      }
    });
    const primary = type === "tops" && Number.isFinite(input.chest) ? "chest" : "waist";
    const range = best[primary];
    const value = primary === "chest" ? input.chest : input.waist;
    const boundary = range ? Math.min(Math.abs(value - range[0]), Math.abs(value - range[1])) <= 1 : false;
    reason = `${tr("basis")}: ${primary} ${value.toFixed(1)} cm / ${range?.[0]}–${range?.[1]} cm`;
    return { size: best.size, reason, boundary };
  }

  function rangeDistance(value, range) {
    if (!Number.isFinite(value) || !range) return 0;
    if (value < range[0]) return range[0] - value;
    if (value > range[1]) return value - range[1];
    return 0;
  }

  function formatMeasurements(input) {
    const parts = [];
    if (Number.isFinite(input.chest)) parts.push(`${currentLang === "ja" ? "胸囲" : "Chest"} ${input.chest.toFixed(1)} cm`);
    parts.push(`${currentLang === "ja" ? "ウエスト" : "Waist"} ${input.waist.toFixed(1)} cm`);
    if (Number.isFinite(input.hip)) parts.push(`${currentLang === "ja" ? "ヒップ" : "Hip"} ${input.hip.toFixed(1)} cm`);
    return parts.join(" / ");
  }

  function addCopyButton(parent) {
    const button = el("button", "ghost", tr("copyResult"));
    button.type = "button";
    button.addEventListener("click", () => copyText(lastResultText));
    parent.appendChild(button);
  }

  function addTableCopyButton() {
    if (!els.resultSection || $("copySizeTable")) return;
    const button = el("button", "ghost", tr("tableCopy"));
    button.type = "button";
    button.id = "copySizeTable";
    button.addEventListener("click", () => copyText(tableTsv()));
    els.resultSection.insertBefore(button, els.resultSection.firstChild);
  }

  function tableTsv() {
    const currentRows = rows();
    const lines = [["JP", "US", "EU"].join("\t")];
    currentRows.forEach((row) => lines.push([row.jp, row.us, row.eu].join("\t")));
    return lines.join("\n");
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "readonly");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!ok) throw new Error("copy failed");
      }
      toast(tr("copied"));
    } catch (_) {
      toast(tr("copyFail"));
    }
  }

  function toast(message) {
    let node = $("sizeToast");
    if (!node) {
      node = el("div", "toast", "");
      node.id = "sizeToast";
      node.setAttribute("role", "status");
      document.body.appendChild(node);
    }
    node.textContent = message;
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => { node.textContent = ""; }, 2200);
  }

  function resetShoe() {
    [els.footLength, els.footWidth].forEach((input) => { if (input) input.value = ""; });
    clear(els.fitResult);
    lastResultText = "";
  }

  function resetCloth() {
    [els.clothChest, els.clothWaist, els.clothHip].forEach((input) => { if (input) input.value = ""; });
    clear(els.clothResult);
    lastResultText = "";
  }

  function bind() {
    els.langButtons.forEach((button) => button.addEventListener("click", () => applyLang(button.dataset.lang)));
    [els.category, els.gender, els.base].forEach((select) => select?.addEventListener("change", () => {
      syncCategoryModes();
      renderTable();
    }));
    els.clothType?.addEventListener("change", rebuildBrandOptions);
    els.tabTable?.addEventListener("click", () => setMode("table"));
    els.tabFit?.addEventListener("click", () => { if (!els.tabFit.disabled) setMode("fit"); });
    els.tabCloth?.addEventListener("click", () => { if (!els.tabCloth.disabled) setMode("cloth"); });
    els.fitRun?.addEventListener("click", runShoeFit);
    els.fitReset?.addEventListener("click", resetShoe);
    els.clothRun?.addEventListener("click", runClothFit);
    els.clothReset?.addEventListener("click", resetCloth);
  }

  function init() {
    bind();
    addTableCopyButton();
    applyLang(currentLang);
    syncCategoryModes();
    setMode("table");
    loadBrands();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
