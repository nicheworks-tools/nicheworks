(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const LANG_KEY = "nw_lang";

  // brand.json is intentionally not loaded: brand-wide numerical offsets are disabled
  // until verified brand/model-level charts can support them safely.

  const DATA = {
    shoes: {
      men: [
        { jp: "22.0", us: "4", eu: "36" }, { jp: "22.5", us: "4.5", eu: "36.5" },
        { jp: "23.0", us: "5", eu: "37.5" }, { jp: "23.5", us: "5.5", eu: "38" },
        { jp: "24.0", us: "6", eu: "39" }, { jp: "24.5", us: "6.5", eu: "39.5" },
        { jp: "25.0", us: "7", eu: "40" }, { jp: "25.5", us: "7.5", eu: "40.5" },
        { jp: "26.0", us: "8", eu: "41" }, { jp: "26.5", us: "8.5", eu: "42" },
        { jp: "27.0", us: "9", eu: "42.5" }, { jp: "27.5", us: "9.5", eu: "43" },
        { jp: "28.0", us: "10", eu: "44" }, { jp: "28.5", us: "10.5", eu: "44.5" },
        { jp: "29.0", us: "11", eu: "45" }, { jp: "29.5", us: "11.5", eu: "45.5" },
        { jp: "30.0", us: "12", eu: "46" }, { jp: "30.5", us: "12.5", eu: "47" },
        { jp: "31.0", us: "13", eu: "47.5" }
      ],
      women: [
        { jp: "21.0", us: "4", eu: "34" }, { jp: "21.5", us: "4.5", eu: "34.5" },
        { jp: "22.0", us: "5", eu: "35" }, { jp: "22.5", us: "5.5", eu: "36" },
        { jp: "23.0", us: "6", eu: "36.5" }, { jp: "23.5", us: "6.5", eu: "37.5" },
        { jp: "24.0", us: "7", eu: "38" }, { jp: "24.5", us: "7.5", eu: "39" },
        { jp: "25.0", us: "8", eu: "39.5" }, { jp: "25.5", us: "8.5", eu: "40" },
        { jp: "26.0", us: "9", eu: "40.5" }, { jp: "26.5", us: "9.5", eu: "41" },
        { jp: "27.0", us: "10", eu: "42" }, { jp: "27.5", us: "10.5", eu: "42.5" },
        { jp: "28.0", us: "11", eu: "43" }, { jp: "28.5", us: "11.5", eu: "44" },
        { jp: "29.0", us: "12", eu: "44.5" }
      ]
    },
    clothing: {
      men: [
        { jp: "XS", us: "XS", eu: "44" }, { jp: "S", us: "S", eu: "46" },
        { jp: "M", us: "M", eu: "48" }, { jp: "L", us: "L", eu: "50" },
        { jp: "XL", us: "XL", eu: "52" }, { jp: "XXL", us: "XXL", eu: "54" },
        { jp: "3XL", us: "3XL", eu: "56" }
      ],
      women: [
        { jp: "XS", us: "0", eu: "32" }, { jp: "S", us: "2–4", eu: "34–36" },
        { jp: "M", us: "6–8", eu: "38–40" }, { jp: "L", us: "10–12", eu: "42–44" },
        { jp: "XL", us: "14–16", eu: "46–48" }, { jp: "XXL", us: "18–20", eu: "50–52" }
      ]
    }
  };

  const CLOTH_CHART = {
    men: {
      tops: [
        { size: "XS", chest: [78, 84], waist: [62, 68], hip: [78, 84] },
        { size: "S", chest: [82, 90], waist: [68, 76], hip: [82, 90] },
        { size: "M", chest: [90, 98], waist: [76, 84], hip: [90, 98] },
        { size: "L", chest: [98, 106], waist: [84, 92], hip: [98, 106] },
        { size: "XL", chest: [106, 114], waist: [92, 100], hip: [106, 114] },
        { size: "XXL", chest: [114, 122], waist: [100, 108], hip: [114, 122] },
        { size: "3XL", chest: [122, 130], waist: [108, 116], hip: [122, 130] }
      ],
      bottoms: [
        { size: "XS", waist: [62, 68], hip: [78, 84] }, { size: "S", waist: [68, 76], hip: [82, 90] },
        { size: "M", waist: [76, 84], hip: [90, 98] }, { size: "L", waist: [84, 92], hip: [98, 106] },
        { size: "XL", waist: [92, 100], hip: [106, 114] }, { size: "XXL", waist: [100, 108], hip: [114, 122] },
        { size: "3XL", waist: [108, 116], hip: [122, 130] }
      ]
    },
    women: {
      tops: [
        { size: "XS", chest: [72, 78], waist: [54, 60], hip: [78, 84] },
        { size: "S", chest: [78, 84], waist: [60, 66], hip: [84, 90] },
        { size: "M", chest: [84, 90], waist: [66, 72], hip: [90, 96] },
        { size: "L", chest: [90, 96], waist: [72, 78], hip: [96, 102] },
        { size: "XL", chest: [96, 102], waist: [78, 84], hip: [102, 108] },
        { size: "XXL", chest: [102, 108], waist: [84, 90], hip: [108, 114] }
      ],
      bottoms: [
        { size: "XS", waist: [54, 60], hip: [78, 84] }, { size: "S", waist: [60, 66], hip: [84, 90] },
        { size: "M", waist: [66, 72], hip: [90, 96] }, { size: "L", waist: [72, 78], hip: [96, 102] },
        { size: "XL", waist: [78, 84], hip: [102, 108] }, { size: "XXL", waist: [84, 90], hip: [108, 114] }
      ]
    }
  };

  const TEXT = {
    ja: {
      approx: "一般的な目安", resultTitle: "換算結果", noMatch: "このサイズは現在の対応表にありません。候補から選ぶか、基準・カテゴリを確認してください。",
      official: "ブランドや製品で差があります。購入前は公式サイズ表を確認してください。",
      copied: "コピーしました。", copyFail: "コピーできませんでした。",
      footError: "足長は18〜35cmの数値で入力してください。", widthError: "足幅は数値で入力してください。未入力でも使えます。",
      waistError: "ウエストを数値で入力してください。", optionalError: "任意項目は、入力する場合は数値にしてください。",
      fitTitle: "近いサイズ目安", nearby: "近い候補", boundary: "サイズ境界付近です。上のサイズや返品条件も確認してください。",
      widthWide: "足幅は広めの傾向です。靴型によっては窮屈に感じる場合があります。",
      widthNarrow: "足幅は細めの傾向です。サイズを上げると緩くなる場合があります。",
      widthStd: "足幅は標準寄りの目安です。", widthNone: "足幅は任意です。入力すると幅の傾向を補足します。",
      amazonShoes: "Amazonでシューズを探す", amazonClothing: "Amazonで服を探す"
    },
    en: {
      approx: "General estimate", resultTitle: "Conversion result", noMatch: "That size is not in the current reference table. Choose a suggestion or check the source system and category.",
      official: "Fit varies by brand and product. Check the official size chart before buying.",
      copied: "Copied.", copyFail: "Copy failed.",
      footError: "Enter foot length as a number from 18 to 35 cm.", widthError: "Foot width must be numeric. It can be left blank.",
      waistError: "Enter waist as a number.", optionalError: "Optional fields must be numeric when filled.",
      fitTitle: "Nearby size estimate", nearby: "Nearby candidates", boundary: "Near a size boundary. Check the larger size and return policy too.",
      widthWide: "Foot width looks wider. Some shoe shapes may feel tight.", widthNarrow: "Foot width looks narrower. Sizing up may feel loose.",
      widthStd: "Foot width looks close to standard.", widthNone: "Foot width is optional. Add it for a rough width note.",
      amazonShoes: "Find shoes on Amazon", amazonClothing: "Find clothing on Amazon"
    }
  };

  const els = {
    category: $("categorySelect"), gender: $("genderSelect"), base: $("baseSelect"), sizeInput: $("sizeInput"), sizeOptions: $("sizeOptions"),
    quickResult: $("quickResult"), copyQuick: $("copyQuickResult"), tbody: $("sizeTableBody"), copyTable: $("copySizeTable"),
    shoeSection: $("shoeFitSection"), clothingSection: $("clothingFitSection"), footLength: $("footLength"), footWidth: $("footWidth"),
    shoeRun: $("shoeFitRun"), shoeReset: $("shoeFitReset"), shoeResult: $("shoeFitResult"),
    clothType: $("clothType"), clothUnit: $("clothUnit"), clothChest: $("clothChest"), clothWaist: $("clothWaist"), clothHip: $("clothHip"),
    clothRun: $("clothFitRun"), clothReset: $("clothFitReset"), clothResult: $("clothFitResult"),
    affiliate: $("sizeAffiliate"), disclosure: $("amazonDisclosure"), exampleButtons: document.querySelectorAll("[data-example]"),
    langButtons: document.querySelectorAll("[data-lang]"), i18n: document.querySelectorAll("[data-i18n]")
  };

  let currentLang = initialLang();
  let selectedIndex = 0;
  let lastQuickText = "";

  function initialLang() {
    try { const saved = localStorage.getItem(LANG_KEY); if (saved === "ja" || saved === "en") return saved; } catch (_) {}
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function t(key) { return TEXT[currentLang][key] || TEXT.ja[key] || key; }
  function rows() { return DATA[els.category.value]?.[els.gender.value] || []; }
  function clear(node) { if (node) node.replaceChildren(); }
  function make(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; }

  function parseDecimal(val) {
    if (val == null) return null;
    const raw = String(val).trim().replace(",", ".");
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : NaN;
  }

  function inputNumber(input) { return parseDecimal(input?.value); }
  function normalizeSize(value) {
    return String(value ?? "").trim().toUpperCase().replace(/CM$/i, "").replace(/[–—−]/g, "-").replace(/\s+/g, "");
  }

  function parseSizeEntry(raw) {
    const text = String(raw || "").trim();
    const match = /^(JP|US|EU)\s*[:\-]?\s*(.+)$/i.exec(text);
    if (!match) return { system: els.base.value, value: text };
    return { system: match[1].toLowerCase(), value: match[2] };
  }

  function applyLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = currentLang;
    try { localStorage.setItem(LANG_KEY, currentLang); } catch (_) {}
    els.i18n.forEach((node) => { node.style.display = node.dataset.i18n === currentLang ? "" : "none"; });
    els.langButtons.forEach((button) => button.classList.toggle("active", button.dataset.lang === currentLang));
    renderQuickResult();
    mountAffiliate();
  }

  function selectedRow() { return rows()[selectedIndex] || null; }

  function rebuildSizeSuggestions({ reset = false, syncInput = true } = {}) {
    const current = rows();
    if (reset || selectedIndex >= current.length) selectedIndex = Math.floor(Math.max(0, current.length - 1) / 2);
    clear(els.sizeOptions);
    current.forEach((row) => {
      const option = document.createElement("option");
      option.value = row[els.base.value];
      option.label = `${els.base.value.toUpperCase()} ${row[els.base.value]}`;
      els.sizeOptions.appendChild(option);
    });
    if (syncInput && current[selectedIndex]) els.sizeInput.value = current[selectedIndex][els.base.value];
    renderTable();
    renderQuickResult();
  }

  function findSizeIndex(system, value) {
    const wanted = normalizeSize(value);
    if (!wanted) return -1;
    return rows().findIndex((row) => normalizeSize(row[system]) === wanted);
  }

  function resolveSizeInput() {
    const parsed = parseSizeEntry(els.sizeInput.value);
    if (parsed.system !== els.base.value) {
      els.base.value = parsed.system;
      rebuildSizeSuggestions({ syncInput: false });
    }
    const index = findSizeIndex(parsed.system, parsed.value);
    if (index < 0) {
      selectedIndex = -1;
      renderQuickResult();
      return false;
    }
    selectedIndex = index;
    const row = selectedRow();
    els.sizeInput.value = row[els.base.value];
    renderQuickResult();
    return true;
  }

  function quickText(row) {
    if (!row) return "";
    const source = els.base.value;
    const targets = ["jp", "us", "eu"].filter((key) => key !== source).map((key) => `${key.toUpperCase()} ${row[key]}`).join(" / ");
    return `${source.toUpperCase()} ${row[source]} → ${targets}`;
  }

  function renderQuickResult() {
    clear(els.quickResult);
    const row = selectedRow();
    lastQuickText = "";
    els.copyQuick.hidden = true;
    if (!row) {
      els.quickResult.appendChild(make("p", "empty-note no-match", t("noMatch")));
      mountAffiliate();
      return;
    }

    const summary = make("div", "result-summary", quickText(row));
    els.quickResult.appendChild(summary);
    const heading = make("div", "result-heading");
    heading.appendChild(make("strong", "", t("resultTitle")));
    heading.appendChild(make("span", "result-badge", t("approx")));
    els.quickResult.appendChild(heading);
    const grid = make("div", "result-grid");
    ["jp", "us", "eu"].forEach((key) => {
      const item = make("div", `result-cell${key === els.base.value ? " is-base" : ""}`);
      item.appendChild(make("span", "result-system", key.toUpperCase()));
      item.appendChild(make("strong", "result-value", row[key]));
      grid.appendChild(item);
    });
    els.quickResult.appendChild(grid);
    els.quickResult.appendChild(make("p", "result-note", t("official")));
    lastQuickText = `${quickText(row)}\n${t("official")}`;
    els.copyQuick.hidden = false;
    mountAffiliate();
  }

  function renderTable() {
    clear(els.tbody);
    rows().forEach((row) => {
      const tr = document.createElement("tr");
      ["jp", "us", "eu"].forEach((key) => tr.appendChild(make("td", key === els.base.value ? "is-base" : "", row[key])));
      els.tbody.appendChild(tr);
    });
  }

  function syncCategory() {
    const shoes = els.category.value === "shoes";
    els.shoeSection.hidden = !shoes;
    els.clothingSection.hidden = shoes;
    rebuildSizeSuggestions({ reset: true });
    mountAffiliate();
  }

  function nearestShoe(length) {
    const current = DATA.shoes[els.gender.value] || [];
    let bestIndex = 0;
    let bestDiff = Infinity;
    current.forEach((row, index) => { const diff = Math.abs(Number(row.jp) - length); if (diff < bestDiff) { bestDiff = diff; bestIndex = index; } });
    return { row: current[bestIndex], near: current.slice(Math.max(0, bestIndex - 1), Math.min(current.length, bestIndex + 2)), boundary: bestDiff >= 0.25 };
  }

  function widthNote(length, width) {
    if (!Number.isFinite(width)) return t("widthNone");
    const ratio = width / length;
    if (ratio >= 0.41) return t("widthWide");
    if (ratio <= 0.36) return t("widthNarrow");
    return t("widthStd");
  }

  function appendSizePills(parent, row) {
    const wrap = make("div", "fit-size-grid");
    ["jp", "us", "eu"].forEach((key) => { const item = make("div", "fit-size-pill"); item.appendChild(make("span", "", key.toUpperCase())); item.appendChild(make("strong", "", row[key])); wrap.appendChild(item); });
    parent.appendChild(wrap);
  }

  function renderFitError(target, message) { clear(target); const card = make("div", "fit-card error"); card.appendChild(make("p", "", message)); target.appendChild(card); }

  function runShoeFit() {
    const length = inputNumber(els.footLength);
    const width = inputNumber(els.footWidth);
    if (!Number.isFinite(length) || length < 18 || length > 35) return renderFitError(els.shoeResult, t("footError"));
    if (Number.isNaN(width)) return renderFitError(els.shoeResult, t("widthError"));
    const result = nearestShoe(length);
    clear(els.shoeResult);
    const card = make("div", "fit-card");
    card.appendChild(make("h4", "", t("fitTitle")));
    appendSizePills(card, result.row);
    card.appendChild(make("p", "fit-note", widthNote(length, width)));
    if (result.boundary) card.appendChild(make("p", "fit-warning", t("boundary")));
    card.appendChild(make("p", "near-title", t("nearby")));
    const list = make("ul", "near-list");
    result.near.forEach((row) => list.appendChild(make("li", "", `JP ${row.jp} / US ${row.us} / EU ${row.eu}`)));
    card.appendChild(list);
    card.appendChild(make("p", "fit-note", t("official")));
    els.shoeResult.appendChild(card);
  }

  function toCm(value, unit) { return unit === "inch" ? value * 2.54 : value; }
  function rangeDistance(value, range) { if (!Number.isFinite(value) || !range) return 0; if (value < range[0]) return range[0] - value; if (value > range[1]) return value - range[1]; return 0; }

  function runClothingFit() {
    const unit = els.clothUnit.value;
    const chestRaw = inputNumber(els.clothChest);
    const waistRaw = inputNumber(els.clothWaist);
    const hipRaw = inputNumber(els.clothHip);
    if (!Number.isFinite(waistRaw)) return renderFitError(els.clothResult, t("waistError"));
    if (Number.isNaN(chestRaw) || Number.isNaN(hipRaw)) return renderFitError(els.clothResult, t("optionalError"));
    const input = { chest: Number.isFinite(chestRaw) ? toCm(chestRaw, unit) : null, waist: toCm(waistRaw, unit), hip: Number.isFinite(hipRaw) ? toCm(hipRaw, unit) : null };
    const type = els.clothType.value;
    const chart = CLOTH_CHART[els.gender.value]?.[type] || [];
    let best = chart[0]; let bestScore = Infinity;
    chart.forEach((row) => { let score = rangeDistance(input.waist, row.waist); if (type === "tops" && Number.isFinite(input.chest)) score += rangeDistance(input.chest, row.chest) * 1.5; if (Number.isFinite(input.hip)) score += rangeDistance(input.hip, row.hip) * 0.75; if (score < bestScore) { bestScore = score; best = row; } });
    clear(els.clothResult);
    const card = make("div", "fit-card");
    card.appendChild(make("h4", "", t("fitTitle")));
    card.appendChild(make("div", "clothing-fit-size", best?.size || "—"));
    card.appendChild(make("p", "fit-note", t("official")));
    els.clothResult.appendChild(card);
  }

  function resetShoe() { els.footLength.value = ""; els.footWidth.value = ""; clear(els.shoeResult); }
  function resetClothing() { els.clothChest.value = ""; els.clothWaist.value = ""; els.clothHip.value = ""; clear(els.clothResult); }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast(t("copied")); }
    catch (_) { toast(t("copyFail")); }
  }

  function copyTable() { return copyText(["JP\tUS\tEU", ...rows().map((row) => `${row.jp}\t${row.us}\t${row.eu}`)].join("\n")); }
  function toast(message) { let node = $("sizeToast"); if (!node) { node = make("div", "toast"); node.id = "sizeToast"; node.setAttribute("role", "status"); document.body.appendChild(node); } node.textContent = message; clearTimeout(toast.timer); toast.timer = setTimeout(() => { node.textContent = ""; }, 2200); }

  function configureAffiliate() {
    const helper = window.NWAmazonAffiliate;
    const config = window.NWSizeConverterAffiliate || { enabled: false, targets: {} };
    if (!helper) return;
    helper.configure({ enabled: config.enabled === true, tool: "size-converter", targets: config.targets || {} });
    helper.renderDisclosure(els.disclosure, { includeEnglish: true });
  }

  function mountAffiliate() {
    const helper = window.NWAmazonAffiliate;
    if (!helper || !selectedRow()) { if (els.affiliate) { els.affiliate.hidden = true; els.affiliate.replaceChildren(); } return; }
    const target = els.category.value === "shoes" ? "shoes" : "clothing";
    helper.mount({ container: els.affiliate, target, label: target === "shoes" ? t("amazonShoes") : t("amazonClothing"), placement: "quick_result", className: "amazon-cta" });
  }

  function bind() {
    els.langButtons.forEach((button) => button.addEventListener("click", () => applyLang(button.dataset.lang)));
    els.category.addEventListener("change", syncCategory);
    els.gender.addEventListener("change", () => rebuildSizeSuggestions({ reset: true }));
    els.base.addEventListener("change", () => rebuildSizeSuggestions({ syncInput: true }));
    els.sizeInput.addEventListener("input", resolveSizeInput);
    els.sizeInput.addEventListener("change", resolveSizeInput);
    els.sizeInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); resolveSizeInput(); } });
    els.exampleButtons.forEach((button) => button.addEventListener("click", () => { els.sizeInput.value = button.dataset.example || ""; resolveSizeInput(); els.sizeInput.focus(); }));
    els.copyQuick.addEventListener("click", () => { if (lastQuickText) copyText(lastQuickText); });
    els.copyTable.addEventListener("click", copyTable);
    els.shoeRun.addEventListener("click", runShoeFit);
    els.shoeReset.addEventListener("click", resetShoe);
    els.clothRun.addEventListener("click", runClothingFit);
    els.clothReset.addEventListener("click", resetClothing);
  }

  function init() {
    bind();
    configureAffiliate();
    selectedIndex = Math.floor((rows().length - 1) / 2);
    rebuildSizeSuggestions();
    syncCategory();
    applyLang(currentLang);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();