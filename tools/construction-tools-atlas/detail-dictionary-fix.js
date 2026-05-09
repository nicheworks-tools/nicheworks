(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const byId = new Map();
  let ready = false;

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function asArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string" && value.trim()) return [value.trim()];
    return [];
  }

  function pair(obj, ja, en) {
    return {
      ja: text(obj?.ja) || text(ja),
      en: text(obj?.en) || text(en),
    };
  }

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function pick(value) {
    const l = lang();
    return l === "ja" ? (value?.ja || value?.en || "") : (value?.en || value?.ja || "");
  }

  function normalize(raw) {
    const description = pair(raw?.description, raw?.description_ja, raw?.description_en);
    const detail = pair(raw?.detail, raw?.detail_ja, raw?.detail_en);
    const summary = pair(raw?.summary, raw?.summary_ja, raw?.summary_en);
    return {
      id: text(raw?.id || raw?.slug),
      description: {
        ja: description.ja || summary.ja || detail.ja,
        en: description.en || summary.en || detail.en,
      },
      detail: {
        ja: detail.ja,
        en: detail.en,
      },
      bullets: {
        ja: asArray(raw?.bullets?.ja || raw?.bullets_ja),
        en: asArray(raw?.bullets?.en || raw?.bullets_en),
      },
    };
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function addBlock(node, label, body, className) {
    if (!node || !body) return;
    const wrap = document.createElement("div");
    if (className) wrap.className = className;
    const heading = document.createElement("div");
    heading.className = "tabpanel__label";
    heading.textContent = label;
    const textNode = document.createElement("div");
    textNode.className = "tabpanel__text";
    textNode.textContent = body;
    wrap.appendChild(heading);
    wrap.appendChild(textNode);
    node.appendChild(wrap);
  }

  function selectedId() {
    const sheet = $("#detailSheet");
    if (!sheet || sheet.hidden) return "";
    const meta = $("#tabMeta");
    const textContent = meta?.textContent || "";
    const found = textContent.match(/id:\s*([^\n]+)/);
    return found ? found[1].trim() : "";
  }

  function applyDictionaryMeaning() {
    if (!ready) return;
    const id = selectedId();
    if (!id || !byId.has(id)) return;

    const entry = byId.get(id);
    const definition = pick(entry.description);
    const note = pick(entry.detail);
    const bullets = lang() === "ja" ? entry.bullets.ja : entry.bullets.en;

    const detailDesc = $("#detailDesc");
    if (detailDesc && definition) detailDesc.textContent = definition;

    const meaning = $("#tabMeaning");
    if (meaning) {
      clear(meaning);
      addBlock(meaning, lang() === "ja" ? "意味" : "Meaning", definition, "dictionaryBlock dictionaryBlock--definition");
      if (note && note !== definition) addBlock(meaning, lang() === "ja" ? "使い方・注意" : "Use / notes", note, "dictionaryBlock dictionaryBlock--notes");
      if (bullets.length) {
        const wrap = document.createElement("div");
        wrap.className = "dictionaryBlock dictionaryBlock--bullets";
        const heading = document.createElement("div");
        heading.className = "tabpanel__label";
        heading.textContent = lang() === "ja" ? "要点" : "Key points";
        const ul = document.createElement("ul");
        bullets.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });
        wrap.appendChild(heading);
        wrap.appendChild(ul);
        meaning.appendChild(wrap);
      }
    }
  }

  async function loadRawEntries() {
    try {
      const raw = await window.CTA_DATA_LOADER?.loadEntries?.();
      if (!Array.isArray(raw)) return;
      raw.map(normalize).forEach((entry) => {
        if (entry.id) byId.set(entry.id, entry);
      });
      ready = true;
      applyDictionaryMeaning();
    } catch (error) {
      console.warn("CTA dictionary meaning fix skipped", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadRawEntries();
    document.addEventListener("click", () => setTimeout(applyDictionaryMeaning, 0), true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") setTimeout(applyDictionaryMeaning, 0);
    }, true);
  });
})();
