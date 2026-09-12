(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const category = $("categorySelect");
  const gender = $("genderSelect");
  const base = $("baseSelect");
  const input = $("sizeInput");
  const quick = $("quickResult");
  if (!category || !gender || !base || !input || !quick) return;

  const clothingRanges = {
    women: {
      us: [
        { min: 0, max: 0, label: "0" },
        { min: 2, max: 4, label: "2–4" },
        { min: 6, max: 8, label: "6–8" },
        { min: 10, max: 12, label: "10–12" },
        { min: 14, max: 16, label: "14–16" },
        { min: 18, max: 20, label: "18–20" }
      ],
      eu: [
        { min: 32, max: 32, label: "32" },
        { min: 34, max: 36, label: "34–36" },
        { min: 38, max: 40, label: "38–40" },
        { min: 42, max: 44, label: "42–44" },
        { min: 46, max: 48, label: "46–48" },
        { min: 50, max: 52, label: "50–52" }
      ]
    }
  };

  let lastRangeResolution = null;
  let resolving = false;
  const compareItems = [];
  const COMPARE_MAX = 4;

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function parseEntry(raw) {
    const text = String(raw || "").trim();
    const match = /^(JP|US|EU)\s*[:\-]?\s*(.+)$/i.exec(text);
    return match ? { system: match[1].toLowerCase(), value: match[2].trim() } : { system: base.value, value: text };
  }

  function numericValue(value) {
    const raw = String(value || "").trim().replace(",", ".");
    if (!/^\d+(?:\.\d+)?$/.test(raw)) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  function rangeFor(system, value) {
    if (category.value !== "clothing") return null;
    const ranges = clothingRanges[gender.value]?.[system];
    const n = numericValue(value);
    if (!ranges || n == null) return null;
    return ranges.find((row) => n >= row.min && n <= row.max) || null;
  }

  function resolveRangeInput() {
    if (resolving) return;
    const parsed = parseEntry(input.value);
    const range = rangeFor(parsed.system, parsed.value);
    if (!range || range.label === parsed.value) return;

    resolving = true;
    lastRangeResolution = {
      system: parsed.system.toUpperCase(),
      entered: parsed.value,
      range: range.label
    };
    input.value = `${parsed.system.toUpperCase()} ${range.label}`;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    queueMicrotask(() => { resolving = false; renderContext(); renderCompare(); });
  }

  function ensurePanel() {
    let panel = $("queryIntentPanel");
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = "queryIntentPanel";
    panel.className = "query-intent-panel";
    panel.innerHTML = `
      <strong class="query-intent-title"></strong>
      <div class="query-intent-actions"></div>
      <p class="query-intent-note"></p>
    `;
    quick.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function shortcut(label, chart, value) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "example-chip query-shortcut";
    button.textContent = label;
    button.addEventListener("click", () => {
      category.value = "shoes";
      category.dispatchEvent(new Event("change", { bubbles: true }));
      gender.value = chart;
      gender.dispatchEvent(new Event("change", { bubbles: true }));
      base.value = "us";
      base.dispatchEvent(new Event("change", { bubbles: true }));
      input.value = `US ${value}`;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
    });
    return button;
  }

  function renderContext() {
    const panel = ensurePanel();
    const title = panel.querySelector(".query-intent-title");
    const actions = panel.querySelector(".query-intent-actions");
    const note = panel.querySelector(".query-intent-note");
    const en = lang() === "en";

    title.textContent = en ? "Common US 4 checks" : "US 4を確認する場合";
    actions.replaceChildren(
      shortcut(en ? "Men's shoes US 4" : "メンズ靴 US 4", "men", "4"),
      shortcut(en ? "Women's shoes US 4" : "レディース靴 US 4", "women", "4")
    );

    const chartLabel = gender.value === "women" ? (en ? "women's" : "レディース") : (en ? "men's" : "メンズ");
    const categoryLabel = category.value === "clothing" ? (en ? "clothing" : "衣類") : (en ? "shoes" : "靴");
    const parts = [en ? `Current chart: ${chartLabel} ${categoryLabel}.` : `現在の表: ${chartLabel}${categoryLabel}。`];
    if (lastRangeResolution) {
      parts.push(en
        ? `${lastRangeResolution.system} ${lastRangeResolution.entered} was resolved inside the reference range ${lastRangeResolution.range}.`
        : `${lastRangeResolution.system} ${lastRangeResolution.entered} は対応表の ${lastRangeResolution.range} の範囲内として表示しています。`);
    } else {
      parts.push(en
        ? "The same US number can map differently by chart and category."
        : "同じUS番号でも、メンズ/レディースや靴/衣類で対応は変わります。");
    }
    note.textContent = parts.join(" ");
  }

  function currentConversion() {
    const cells = [...quick.querySelectorAll(".result-cell")];
    if (cells.length < 3) return null;
    const values = {};
    cells.forEach((cell) => {
      const system = cell.querySelector(".result-system")?.textContent?.trim()?.toLowerCase();
      const value = cell.querySelector(".result-value")?.textContent?.trim();
      if (system && value) values[system] = value;
    });
    if (!values.jp || !values.us || !values.eu) return null;
    return {
      category: category.value,
      gender: gender.value,
      jp: values.jp,
      us: values.us,
      eu: values.eu
    };
  }

  function compareKey(item) {
    return [item.category, item.gender, item.jp, item.us, item.eu].join("|");
  }

  function contextLabel(item, en) {
    const categoryText = item.category === "clothing" ? (en ? "Clothing" : "衣類") : (en ? "Shoes" : "靴");
    const genderText = item.gender === "women" ? (en ? "Women" : "レディース") : (en ? "Men" : "メンズ");
    return `${genderText} / ${categoryText}`;
  }

  function ensureComparePanel() {
    let panel = $("sizeCompareTray");
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = "sizeCompareTray";
    panel.className = "size-compare-tray";
    panel.innerHTML = `
      <div class="size-compare-head">
        <div><strong class="size-compare-title"></strong><p class="size-compare-subtitle"></p></div>
        <button type="button" class="secondary-btn" id="addCurrentSize"></button>
      </div>
      <div id="sizeCompareItems" class="size-compare-items"></div>
      <div class="size-compare-footer">
        <button type="button" class="secondary-btn" id="copySizeCompare"></button>
        <button type="button" class="link-btn" id="clearSizeCompare"></button>
      </div>
    `;
    ensurePanel().insertAdjacentElement("afterend", panel);
    panel.querySelector("#addCurrentSize").addEventListener("click", addCurrentToCompare);
    panel.querySelector("#copySizeCompare").addEventListener("click", copyCompare);
    panel.querySelector("#clearSizeCompare").addEventListener("click", () => { compareItems.length = 0; renderCompare(); });
    return panel;
  }

  function addCurrentToCompare() {
    const item = currentConversion();
    if (!item) return;
    const key = compareKey(item);
    if (compareItems.some((entry) => compareKey(entry) === key)) return;
    if (compareItems.length >= COMPARE_MAX) compareItems.shift();
    compareItems.push(item);
    renderCompare();
  }

  async function copyCompare() {
    if (!compareItems.length) return;
    const en = lang() === "en";
    const rows = [en ? "Chart\tJP\tUS\tEU" : "表\tJP\tUS\tEU"];
    compareItems.forEach((item) => rows.push(`${contextLabel(item, en)}\t${item.jp}\t${item.us}\t${item.eu}`));
    try { await navigator.clipboard.writeText(rows.join("\n")); } catch (_) {}
  }

  function renderCompare() {
    const panel = ensureComparePanel();
    const en = lang() === "en";
    const add = panel.querySelector("#addCurrentSize");
    const copy = panel.querySelector("#copySizeCompare");
    const clearButton = panel.querySelector("#clearSizeCompare");
    const items = panel.querySelector("#sizeCompareItems");

    panel.querySelector(".size-compare-title").textContent = en ? "Compare size candidates" : "候補サイズを比較";
    panel.querySelector(".size-compare-subtitle").textContent = en
      ? "Pin up to four conversion rows for this page only."
      : "換算結果を最大4件、このページ内だけで並べて確認できます。";
    add.textContent = en ? "Add current result" : "現在の結果を比較に追加";
    copy.textContent = en ? "Copy comparison" : "比較結果をコピー";
    clearButton.textContent = en ? "Clear comparison" : "比較をクリア";
    add.disabled = !currentConversion();
    copy.disabled = compareItems.length === 0;
    clearButton.disabled = compareItems.length === 0;

    items.replaceChildren();
    if (!compareItems.length) {
      const empty = document.createElement("p");
      empty.className = "size-compare-empty";
      empty.textContent = en ? "No candidates pinned yet." : "比較候補はまだありません。";
      items.appendChild(empty);
      return;
    }

    compareItems.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "size-compare-card";
      const label = document.createElement("strong");
      label.textContent = contextLabel(item, en);
      const values = document.createElement("div");
      values.className = "size-compare-values";
      [["JP", item.jp], ["US", item.us], ["EU", item.eu]].forEach(([system, value]) => {
        const cell = document.createElement("div");
        cell.innerHTML = `<span>${system}</span><strong>${value}</strong>`;
        values.appendChild(cell);
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "link-btn";
      remove.textContent = en ? "Remove" : "削除";
      remove.addEventListener("click", () => { compareItems.splice(index, 1); renderCompare(); });
      card.append(label, values, remove);
      items.appendChild(card);
    });
  }

  function installStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .query-intent-panel{margin:12px 0 0;padding:12px;border:1px solid #d1d5db;border-radius:12px;background:#f8fafc}
      .query-intent-title{display:block;margin-bottom:8px}
      .query-intent-actions{display:flex;gap:8px;flex-wrap:wrap}
      .query-intent-note{margin:8px 0 0;font-size:.9rem;line-height:1.55;color:#475569}
      .query-shortcut{cursor:pointer}
      .size-compare-tray{margin:12px 0 0;padding:14px;border:1px solid #d1d5db;border-radius:12px;background:#fff}
      .size-compare-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}
      .size-compare-title{display:block}.size-compare-subtitle{margin:4px 0 0;font-size:.9rem;color:#64748b}
      .size-compare-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:12px}
      .size-compare-card{padding:10px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}
      .size-compare-values{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}
      .size-compare-values div{padding:6px;border-radius:8px;background:#fff;text-align:center}.size-compare-values span{display:block;font-size:.75rem;color:#64748b}
      .size-compare-values strong{display:block;font-size:1rem}.size-compare-empty{margin:0;color:#64748b}
      .size-compare-footer{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px}
    `;
    document.head.appendChild(style);
  }

  input.addEventListener("change", resolveRangeInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") queueMicrotask(resolveRangeInput);
  });
  category.addEventListener("change", () => { lastRangeResolution = null; renderContext(); queueMicrotask(renderCompare); });
  gender.addEventListener("change", () => { lastRangeResolution = null; renderContext(); queueMicrotask(renderCompare); });
  base.addEventListener("change", () => { renderContext(); queueMicrotask(renderCompare); });
  document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => queueMicrotask(() => { renderContext(); renderCompare(); })));

  const quickObserver = new MutationObserver(() => renderCompare());
  quickObserver.observe(quick, { childList: true, subtree: true });

  installStyles();
  renderContext();
  renderCompare();

  window.addEventListener("pagehide", () => quickObserver.disconnect(), { once: true });
})();
