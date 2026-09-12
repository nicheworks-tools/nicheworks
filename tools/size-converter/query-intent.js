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
    queueMicrotask(() => { resolving = false; renderContext(); });
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

  function installStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .query-intent-panel{margin:12px 0 0;padding:12px;border:1px solid #d1d5db;border-radius:12px;background:#f8fafc}
      .query-intent-title{display:block;margin-bottom:8px}
      .query-intent-actions{display:flex;gap:8px;flex-wrap:wrap}
      .query-intent-note{margin:8px 0 0;font-size:.9rem;line-height:1.55;color:#475569}
      .query-shortcut{cursor:pointer}
    `;
    document.head.appendChild(style);
  }

  input.addEventListener("change", resolveRangeInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") queueMicrotask(resolveRangeInput);
  });
  category.addEventListener("change", () => { lastRangeResolution = null; renderContext(); });
  gender.addEventListener("change", () => { lastRangeResolution = null; renderContext(); });
  base.addEventListener("change", renderContext);
  document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => queueMicrotask(renderContext)));

  installStyles();
  renderContext();
})();
