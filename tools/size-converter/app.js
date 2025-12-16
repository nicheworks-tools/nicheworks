/* app.js — Size Converter (JP ↔ US/EU)
 * NicheWorks tool: /tools/size-converter/
 * - Data-driven table
 * - Base column highlight (JP/US/EU)
 * - JA/EN in-page toggle (common spec style)
 */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const els = {
    category: $("categorySelect"),
    gender: $("genderSelect"),
    base: $("baseSelect"),
    tbody: $("sizeTableBody"),
    langButtons: document.querySelectorAll(".nw-lang-switch button"),
    i18nNodes: document.querySelectorAll("[data-i18n]"),
    table: document.querySelector(".size-table"),
  };

  // MVP data (small but complete for all 4 combos)
  // NOTE: This will be replaced/expanded with JSON in the next step.
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
      headers: { jp: "JP", us: "US", eu: "EU" },
    },
    en: {
      noData: "No data for this selection.",
      headers: { jp: "JP", us: "US", eu: "EU" },
    },
  };

  let currentLang = "ja";

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

    // keep HTML lang attribute in sync
    document.documentElement.lang = lang === "ja" ? "ja" : "en";

    // rerender for localized empty-state if needed
    render();
  }

  function getRows() {
    const cat = els.category.value;
    const gen = els.gender.value;
    return (DATA[cat] && DATA[cat][gen]) ? DATA[cat][gen] : [];
  }

  function clearTbody() {
    while (els.tbody.firstChild) els.tbody.removeChild(els.tbody.firstChild);
  }

  function setHeaderHighlight(baseKey) {
    const ths = els.table.querySelectorAll("thead th");
    const order = ["jp", "us", "eu"];
    ths.forEach((th, idx) => {
      th.classList.toggle("is-base", order[idx] === baseKey);
    });
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

  function ensureTableHeaders() {
    // keep headers as JP/US/EU (minimal)
    const ths = els.table.querySelectorAll("thead th");
    if (ths.length === 3) {
      ths[0].textContent = LABELS[currentLang].headers.jp;
      ths[1].textContent = LABELS[currentLang].headers.us;
      ths[2].textContent = LABELS[currentLang].headers.eu;
    }
  }

  function render() {
    const baseKey = els.base.value; // jp | us | eu
    const rows = getRows();

    ensureTableHeaders();
    setHeaderHighlight(baseKey);
    clearTbody();

    if (!rows.length) {
      renderEmptyRow(LABELS[currentLang].noData);
      return;
    }

    // For MVP: table order stays JP/US/EU; base column is highlighted.
    renderRows(rows, baseKey);
  }

  function bindEvents() {
    els.category.addEventListener("change", render);
    els.gender.addEventListener("change", render);
    els.base.addEventListener("change", render);

    els.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.dataset.lang));
    });
  }

  function injectMinimalStylesIfMissing() {
    // style.css will be added next; this ensures basic highlight now.
    // If style.css already defines these, it's harmless (same class names).
    const css = `
      .size-table { width: 100%; border-collapse: collapse; }
      .size-table th, .size-table td { border: 1px solid #e5e7eb; padding: 10px; font-size: 14px; }
      .size-table thead th { background: #f9fafb; }
      .size-table .is-base { background: #fff7ed; font-weight: 600; }
      .size-table td.empty { text-align: center; color: #6b7280; padding: 18px 10px; }
      @media (max-width: 480px) {
        .tool-controls { display: grid; gap: 10px; }
        .tool-controls label span { display: block; font-size: 12px; color: #6b7280; margin-bottom: 6px; }
        .tool-controls select { width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; }
        .size-table th, .size-table td { padding: 9px; font-size: 13px; }
      }
    `;
    const style = document.createElement("style");
    style.setAttribute("data-injected", "size-converter-mvp");
    style.textContent = css;
    document.head.appendChild(style);
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectMinimalStylesIfMissing();
    bindEvents();
    applyLang(detectInitialLang());
    render();
  });
})();
