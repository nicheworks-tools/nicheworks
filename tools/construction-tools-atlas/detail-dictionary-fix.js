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
    return lang() === "ja" ? (value?.ja || value?.en || "") : (value?.en || value?.ja || "");
  }

  function normalize(raw) {
    const description = pair(raw?.description, raw?.description_ja, raw?.description_en);
    const detail = pair(raw?.detail, raw?.detail_ja, raw?.detail_en);
    const summary = pair(raw?.summary, raw?.summary_ja, raw?.summary_en);
    return {
      id: text(raw?.id || raw?.slug),
      term: pair(raw?.term, raw?.ja || raw?.jp, raw?.en),
      aliases: {
        ja: asArray(raw?.aliases?.ja || raw?.alias?.ja || raw?.aliases_ja),
        en: asArray(raw?.aliases?.en || raw?.alias?.en || raw?.aliases_en),
      },
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
      examples: {
        ja: asArray(raw?.examples?.ja || raw?.example?.ja || raw?.examples_ja || raw?.usage?.ja),
        en: asArray(raw?.examples?.en || raw?.example?.en || raw?.examples_en || raw?.usage?.en),
      },
      categories: asArray(raw?.categories || raw?.category),
      tasks: asArray(raw?.tasks || raw?.task),
      fuzzy: asArray(raw?.fuzzy),
      region: asArray(raw?.region),
      type: text(raw?.type),
      meta: raw?.meta && typeof raw.meta === "object" ? raw.meta : {},
    };
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function addBlock(node, label, body, className) {
    if (!node || !body) return;
    const wrap = document.createElement("section");
    wrap.className = className || "dictionaryBlock";
    const heading = document.createElement("h3");
    heading.className = "dictionaryBlock__label";
    heading.textContent = label;
    const textNode = document.createElement("p");
    textNode.className = "dictionaryBlock__text";
    textNode.textContent = body;
    wrap.appendChild(heading);
    wrap.appendChild(textNode);
    node.appendChild(wrap);
  }

  function addListBlock(node, label, items, className) {
    const values = asArray(items);
    if (!node || !values.length) return;
    const wrap = document.createElement("section");
    wrap.className = className || "dictionaryBlock";
    const heading = document.createElement("h3");
    heading.className = "dictionaryBlock__label";
    heading.textContent = label;
    const ul = document.createElement("ul");
    ul.className = "dictionaryBlock__list";
    values.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    wrap.appendChild(heading);
    wrap.appendChild(ul);
    node.appendChild(wrap);
  }

  function addChip(parent, value) {
    const v = text(value);
    if (!parent || !v) return;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = v;
    parent.appendChild(chip);
  }

  function selectedId() {
    const sheet = $("#detailSheet");
    if (!sheet || sheet.hidden) return "";
    const meta = $("#tabMeta");
    const textContent = meta?.textContent || "";
    const found = textContent.match(/id:\s*([^\n]+)/);
    return found ? found[1].trim() : "";
  }

  function termTitle(entry) {
    return `${entry.term.en || "—"} / ${entry.term.ja || "—"}`;
  }

  function aliasLine(entry) {
    return [...entry.aliases.ja, ...entry.aliases.en].filter(Boolean).join(" / ");
  }

  function renderMeta(entry) {
    const meta = $("#tabMeta");
    if (!meta) return;
    clear(meta);

    const tagWrap = document.createElement("section");
    tagWrap.className = "dictionaryBlock dictionaryBlock--meta";
    const heading = document.createElement("h3");
    heading.className = "dictionaryBlock__label";
    heading.textContent = lang() === "ja" ? "分類タグ" : "Tags";
    const chips = document.createElement("div");
    chips.className = "termblock__chiprow";
    [entry.type, ...entry.categories, ...entry.tasks].forEach((item) => addChip(chips, item));
    tagWrap.appendChild(heading);
    tagWrap.appendChild(chips);
    meta.appendChild(tagWrap);

    addListBlock(meta, lang() === "ja" ? "管理情報" : "Record", [
      `id: ${entry.id}`,
      `region: ${entry.region.join(", ")}`,
      `quality_batch: ${entry.meta?.quality_batch || ""}`,
    ], "dictionaryBlock dictionaryBlock--record");
  }

  function applyDictionaryLayout() {
    if (!ready) return;
    const id = selectedId();
    if (!id || !byId.has(id)) return;

    const entry = byId.get(id);
    const definition = pick(entry.description);
    const note = pick(entry.detail);
    const bullets = lang() === "ja" ? entry.bullets.ja : entry.bullets.en;
    const examples = lang() === "ja" ? entry.examples.ja : entry.examples.en;
    const aliases = aliasLine(entry);

    const terms = $("#detailTerms");
    const desc = $("#detailDesc");
    const bulletsTop = $("#detailBullets");
    const chipsTop = $("#detailChips");

    if (terms) {
      clear(terms);
      const title = document.createElement("div");
      title.className = "termblock__title";
      title.textContent = termTitle(entry);
      terms.appendChild(title);
      if (aliases) {
        const sub = document.createElement("div");
        sub.className = "termblock__sub";
        sub.textContent = aliases;
        terms.appendChild(sub);
      }
    }

    if (desc) {
      desc.textContent = "";
      desc.hidden = true;
    }
    if (bulletsTop) {
      clear(bulletsTop);
      bulletsTop.hidden = true;
    }
    if (chipsTop) {
      clear(chipsTop);
      chipsTop.hidden = true;
    }

    const meaning = $("#tabMeaning");
    if (meaning) {
      clear(meaning);
      addBlock(meaning, lang() === "ja" ? "意味" : "Meaning", definition, "dictionaryBlock dictionaryBlock--definition");
      if (note && note !== definition) addBlock(meaning, lang() === "ja" ? "使い方・注意" : "Use / notes", note, "dictionaryBlock dictionaryBlock--notes");
      addListBlock(meaning, lang() === "ja" ? "要点" : "Key points", bullets, "dictionaryBlock dictionaryBlock--bullets");
    }

    const examplesNode = $("#tabExamples");
    if (examplesNode) {
      clear(examplesNode);
      addListBlock(examplesNode, lang() === "ja" ? "使用例" : "Examples", examples, "dictionaryBlock dictionaryBlock--examples");
      if (!examples.length) addBlock(examplesNode, lang() === "ja" ? "使用例" : "Examples", lang() === "ja" ? "例はまだありません。" : "No examples yet.", "dictionaryBlock dictionaryBlock--empty");
    }

    const aliasesNode = $("#tabAliases");
    if (aliasesNode) {
      clear(aliasesNode);
      addListBlock(aliasesNode, lang() === "ja" ? "別名・英語表記" : "Aliases / English", [...entry.aliases.ja, ...entry.aliases.en], "dictionaryBlock dictionaryBlock--aliases");
    }

    renderMeta(entry);
  }

  async function loadRawEntries() {
    try {
      const raw = await window.CTA_DATA_LOADER?.loadEntries?.();
      if (!Array.isArray(raw)) return;
      raw.map(normalize).forEach((entry) => {
        if (entry.id) byId.set(entry.id, entry);
      });
      ready = true;
      applyDictionaryLayout();
    } catch (error) {
      console.warn("CTA dictionary layout fix skipped", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadRawEntries();
    document.addEventListener("click", () => setTimeout(applyDictionaryLayout, 0), true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") setTimeout(applyDictionaryLayout, 0);
    }, true);
  });
})();
