(() => {
  "use strict";

  const MODE_KEY = "cta_lang_mode";
  const LEGACY_LANG_KEY = "cta_uilang";
  const MODES = new Set(["ja", "en", "both"]);
  const byId = new Map();
  let mode = MODES.has(localStorage.getItem(MODE_KEY)) ? localStorage.getItem(MODE_KEY) : (localStorage.getItem(LEGACY_LANG_KEY) === "en" ? "en" : "ja");
  let legacyLangButton = null;
  let ready = false;
  let renderTimer = 0;

  const UI_TEXT = {
    ja: {
      brandTitle: "建設工具・現場用語辞典",
      pageTitle: "建設工具・現場用語辞典",
      pageLead: "建設現場で使う工具名、作業名、別名、英語表記を検索できます。",
      privacyNote: "検索内容はサーバーに送信されません。",
      menuBtn: "メニュー",
      supportBtn: "支援",
      filterOpenBtn: "絞り込み▼",
      categoryBtn: "カテゴリ",
      taskBtn: "作業",
      supportInlineBtn: "支援する",
      supportSheetTitle: "支援",
      supportLead: "この辞典が役に立ったら、開発継続のためにご支援いただけると助かります。",
      supportNote: "外部の支援ページを新しいタブで開きます。",
      menuSheetTitle: "メニュー",
      howtoOpen: "使い方",
      howtoSheetTitle: "使い方",
      favsOnlyLabel: "★ お気に入りのみ表示",
      favsNote: "各用語の★でお気に入り保存できます。このブラウザ内だけに保存されます。",
      exportFavsBtn: "お気に入りを書き出し",
      importFavsBtn: "お気に入りを読み込み",
      footerDisclaimer: "当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。",
      searchPlaceholder: "例：コンクリに穴あける電動のやつ / インパクト / torque wrench",
      faqTitle: "よくある質問",
      detailTitle: "詳細"
    },
    en: {
      brandTitle: "Construction Tools Atlas",
      pageTitle: "Construction Tools Atlas",
      pageLead: "Search construction tools, jobsite terms, aliases, and Japanese/English names.",
      privacyNote: "Search terms are processed in your browser and are not sent to a server for search.",
      menuBtn: "Menu",
      supportBtn: "Support",
      filterOpenBtn: "Filters ▼",
      categoryBtn: "Category",
      taskBtn: "Task",
      supportInlineBtn: "Support",
      supportSheetTitle: "Support",
      supportLead: "If this dictionary helps, a small contribution supports continued development.",
      supportNote: "External support pages open in a new tab.",
      menuSheetTitle: "Menu",
      howtoOpen: "How to use",
      howtoSheetTitle: "How to use",
      favsOnlyLabel: "★ Favorites only",
      favsNote: "Use ★ to save terms as favorites. Favorites are stored only in this browser.",
      exportFavsBtn: "Export favorites",
      importFavsBtn: "Import favorites",
      footerDisclaimer: "This site may include ads. Information is not guaranteed; always check official sources.",
      searchPlaceholder: "e.g. impact driver / gypsum board / floor leveler / torque wrench",
      faqTitle: "FAQ",
      detailTitle: "Detail"
    }
  };

  const HOWTO = {
    ja: [
      "工具名・作業名・別名だけでなく、用途を説明する言葉でも検索できます。",
      "結果を選ぶと、意味・使用例・別名・分類を確認できます。",
      "★でお気に入り保存できます。お気に入りはこのブラウザ内だけに保存されます。",
      "日本語 / English / Both で表示方法を切り替えられます。",
      "日本語またはEnglishでは、各説明の副言語を必要な箇所だけ展開できます。",
      "カテゴリ・作業フィルタで候補を絞り込めます。"
    ],
    en: [
      "Search by tool names, jobsite terms, aliases, or a description of what the item does.",
      "Select a result to view meaning, examples, aliases, and classification.",
      "Use ★ to save favorites locally in this browser.",
      "Switch among Japanese, English, and Both display modes.",
      "In Japanese or English mode, expand the secondary language only where needed.",
      "Use category and task filters to narrow the results."
    ]
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const byDomId = (id) => document.getElementById(id);
  const text = (value) => typeof value === "string" ? value.trim() : "";
  const asArray = (value) => Array.isArray(value) ? value.filter(Boolean).map(String) : (typeof value === "string" && value.trim() ? [value.trim()] : []);
  const pair = (obj, ja, en) => ({ ja: text(obj?.ja) || text(ja), en: text(obj?.en) || text(en) });
  const clear = (node) => { if (node) while (node.firstChild) node.removeChild(node.firstChild); };
  const baseLang = () => mode === "en" ? "en" : "ja";
  const secondaryLang = () => baseLang() === "ja" ? "en" : "ja";

  function normalize(raw) {
    const description = pair(raw?.description, raw?.description_ja || raw?.summary_ja, raw?.description_en || raw?.summary_en);
    const detail = pair(raw?.detail, raw?.detail_ja, raw?.detail_en);
    const summary = pair(raw?.summary, raw?.summary_ja, raw?.summary_en);
    return {
      id: text(raw?.id || raw?.slug),
      term: pair(raw?.term, raw?.ja || raw?.jp, raw?.en),
      aliases: {
        ja: asArray(raw?.aliases?.ja || raw?.alias?.ja || raw?.aliases_ja),
        en: asArray(raw?.aliases?.en || raw?.alias?.en || raw?.aliases_en)
      },
      description: {
        ja: description.ja || summary.ja || detail.ja,
        en: description.en || summary.en || detail.en
      },
      detail,
      bullets: {
        ja: asArray(raw?.bullets?.ja || raw?.bullets_ja),
        en: asArray(raw?.bullets?.en || raw?.bullets_en)
      },
      examples: {
        ja: asArray(raw?.examples?.ja || raw?.example?.ja || raw?.examples_ja || raw?.usage?.ja),
        en: asArray(raw?.examples?.en || raw?.example?.en || raw?.examples_en || raw?.usage?.en)
      },
      categories: asArray(raw?.categories || raw?.category),
      tasks: asArray(raw?.tasks || raw?.task),
      region: asArray(raw?.region),
      type: text(raw?.type),
      meta: raw?.meta && typeof raw.meta === "object" ? raw.meta : {}
    };
  }

  function ensureCss() {
    if (document.querySelector('link[data-cta-bilingual="v2.3"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./bilingual-v2.3.css?v=20260914-bilingual-1";
    link.setAttribute("data-cta-bilingual", "v2.3");
    document.head.appendChild(link);
  }

  function ensureLanguageControls() {
    const existing = byDomId("langModeGroup");
    if (existing) return existing;
    const old = byDomId("langBtn");
    if (!old?.parentNode) return null;
    legacyLangButton = old;
    const group = document.createElement("div");
    group.id = "langModeGroup";
    group.className = "ctaLangModes";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Display language");
    [
      ["ja", "日本語"],
      ["en", "English"],
      ["both", "Both"]
    ].forEach(([value, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ctaLangModes__button";
      button.dataset.langMode = value;
      button.textContent = label;
      button.addEventListener("click", () => setMode(value));
      group.appendChild(button);
    });
    old.replaceWith(group);
    return group;
  }

  function syncLegacyRuntime(targetBase) {
    if (!legacyLangButton) return;
    const current = document.documentElement.lang === "en" ? "en" : "ja";
    if (current !== targetBase) legacyLangButton.click();
    localStorage.setItem(LEGACY_LANG_KEY, targetBase);
  }

  function setMode(next) {
    if (!MODES.has(next)) return;
    mode = next;
    localStorage.setItem(MODE_KEY, mode);
    const targetBase = baseLang();
    syncLegacyRuntime(targetBase);
    document.documentElement.lang = targetBase;
    document.documentElement.dataset.langMode = mode;
    applyStaticI18n();
    updateModeButtons();
    scheduleApply();
    window.dispatchEvent(new CustomEvent("cta:language-mode", { detail: { mode, baseLang: targetBase } }));
  }

  function updateModeButtons() {
    document.querySelectorAll("[data-lang-mode]").forEach((button) => {
      const active = button.dataset.langMode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function setNodeText(id, value) {
    const node = byDomId(id);
    if (node) node.textContent = value;
  }

  function applyHowto(current) {
    const list = byDomId("howtoList");
    if (!list) return;
    clear(list);
    HOWTO[current].forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function applyMenuLinks(current) {
    const menu = byDomId("menuSheet");
    if (!menu) return;
    const labels = current === "en" ? ["FAQ", "Related tools", "Support links"] : ["よくある質問", "関連ツール", "支援リンク"];
    Array.from(menu.querySelectorAll(".menuJump")).forEach((link, index) => {
      if (labels[index]) link.textContent = labels[index];
    });
  }

  function applyStaticI18n() {
    const current = baseLang();
    const labels = UI_TEXT[current];
    Object.entries(labels).forEach(([id, value]) => {
      if (id === "searchPlaceholder" || id === "faqTitle" || id === "detailTitle") return;
      setNodeText(id, value);
    });
    const input = byDomId("searchInput");
    if (input) input.placeholder = labels.searchPlaceholder;
    const faqTitle = document.querySelector("#faq h2");
    if (faqTitle) faqTitle.textContent = labels.faqTitle;
    const detailTitle = byDomId("detailTitle");
    if (detailTitle) detailTitle.textContent = labels.detailTitle;
    applyHowto(current);
    applyMenuLinks(current);
  }

  function selectedId() {
    const sheet = byDomId("detailSheet");
    if (!sheet || sheet.hidden) return "";
    const selected = document.querySelector("#resultList .row--selected[data-entry-id]");
    if (selected?.dataset.entryId) return selected.dataset.entryId;
    try { return new URL(window.location.href).searchParams.get("entry") || ""; }
    catch (_) { return ""; }
  }

  function appendLanguageCopy(parent, langCode, content, isList) {
    const wrap = document.createElement("div");
    wrap.className = "bilingualCopy";
    wrap.dataset.copyLang = langCode;
    const tag = document.createElement("div");
    tag.className = "bilingualCopy__tag";
    tag.textContent = langCode === "ja" ? "日本語" : "English";
    wrap.appendChild(tag);
    if (isList) {
      const list = document.createElement("ul");
      list.className = "dictionaryBlock__list";
      asArray(content).forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      wrap.appendChild(list);
    } else {
      const paragraph = document.createElement("p");
      paragraph.className = "dictionaryBlock__text";
      paragraph.textContent = text(content);
      wrap.appendChild(paragraph);
    }
    parent.appendChild(wrap);
    return wrap;
  }

  function appendSection(parent, labels, content, className, isList = false) {
    if (!parent) return;
    const jaValue = isList ? asArray(content?.ja) : text(content?.ja);
    const enValue = isList ? asArray(content?.en) : text(content?.en);
    const hasJa = isList ? jaValue.length > 0 : Boolean(jaValue);
    const hasEn = isList ? enValue.length > 0 : Boolean(enValue);
    if (!hasJa && !hasEn) return;

    const section = document.createElement("section");
    section.className = className || "dictionaryBlock";
    const heading = document.createElement("h3");
    heading.className = "dictionaryBlock__label";
    if (mode === "both") heading.textContent = `${labels.ja} / ${labels.en}`;
    else heading.textContent = labels[baseLang()];
    section.appendChild(heading);

    if (mode === "both") {
      if (hasJa) appendLanguageCopy(section, "ja", jaValue, isList);
      if (hasEn) appendLanguageCopy(section, "en", enValue, isList);
    } else {
      const primary = baseLang();
      const secondary = secondaryLang();
      const primaryValue = primary === "ja" ? jaValue : enValue;
      const secondaryValue = secondary === "ja" ? jaValue : enValue;
      const hasPrimary = isList ? primaryValue.length > 0 : Boolean(primaryValue);
      const hasSecondary = isList ? secondaryValue.length > 0 : Boolean(secondaryValue);
      if (hasPrimary) appendLanguageCopy(section, primary, primaryValue, isList);
      else if (hasSecondary) appendLanguageCopy(section, secondary, secondaryValue, isList);

      if (hasPrimary && hasSecondary) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "secondaryLanguageToggle";
        button.setAttribute("aria-expanded", "false");
        button.textContent = secondary === "ja" ? "日本語 ▼" : "English ▼";
        const secondaryCopy = appendLanguageCopy(section, secondary, secondaryValue, isList);
        secondaryCopy.hidden = true;
        button.addEventListener("click", () => {
          const open = button.getAttribute("aria-expanded") === "true";
          button.setAttribute("aria-expanded", open ? "false" : "true");
          secondaryCopy.hidden = open;
          button.textContent = secondary === "ja" ? `日本語 ${open ? "▼" : "▲"}` : `English ${open ? "▼" : "▲"}`;
        });
        section.insertBefore(button, secondaryCopy);
      }
    }
    parent.appendChild(section);
  }

  function renderTerms(entry) {
    const terms = byDomId("detailTerms");
    if (!terms) return;
    clear(terms);
    const primary = mode === "en" ? entry.term.en : entry.term.ja;
    const secondary = mode === "en" ? entry.term.ja : entry.term.en;
    const title = document.createElement("div");
    title.className = "termblock__title";
    title.textContent = primary || secondary || "—";
    terms.appendChild(title);
    if (secondary && secondary !== primary) {
      const second = document.createElement("div");
      second.className = "termblock__secondaryName";
      second.textContent = secondary;
      terms.appendChild(second);
    }
    const aliases = [...entry.aliases.ja, ...entry.aliases.en].filter(Boolean);
    if (aliases.length) {
      const sub = document.createElement("div");
      sub.className = "termblock__sub";
      sub.textContent = aliases.join(" / ");
      terms.appendChild(sub);
    }
  }

  function renderTabs(entry) {
    const current = baseLang();
    const tabLabels = current === "en"
      ? { meaning: "Meaning", examples: "Examples", aliases: "Aliases", meta: "Meta" }
      : { meaning: "意味", examples: "使用例", aliases: "別名", meta: "分類" };
    document.querySelectorAll("#detailTabs .tab").forEach((button) => {
      if (tabLabels[button.dataset.tab]) button.textContent = tabLabels[button.dataset.tab];
    });

    const meaning = byDomId("tabMeaning");
    clear(meaning);
    appendSection(meaning, { ja: "これは何？", en: "What is it?" }, entry.description, "dictionaryBlock dictionaryBlock--definition");
    appendSection(meaning, { ja: "使い方・注意", en: "Use / notes" }, entry.detail, "dictionaryBlock dictionaryBlock--notes");
    appendSection(meaning, { ja: "要点", en: "Key points" }, entry.bullets, "dictionaryBlock dictionaryBlock--bullets", true);

    const examples = byDomId("tabExamples");
    clear(examples);
    appendSection(examples, { ja: "使用例", en: "Examples" }, entry.examples, "dictionaryBlock dictionaryBlock--examples", true);
    if (examples && !examples.children.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = current === "ja" ? "使用例はまだありません。" : "No examples yet.";
      examples.appendChild(empty);
    }

    const aliases = byDomId("tabAliases");
    clear(aliases);
    appendSection(aliases, { ja: "別名・現場呼称", en: "Aliases / jobsite names" }, entry.aliases, "dictionaryBlock dictionaryBlock--aliases", true);
    if (aliases && !aliases.children.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = current === "ja" ? "別名はまだありません。" : "No aliases yet.";
      aliases.appendChild(empty);
    }

    const meta = byDomId("tabMeta");
    clear(meta);
    if (meta) meta.hidden = true;
  }

  function hideLegacyTopMeta() {
    ["detailChips", "detailDesc", "detailBullets"].forEach((id) => {
      const node = byDomId(id);
      if (node) {
        node.hidden = true;
        node.style.display = "none";
      }
    });
  }

  function applyDetail() {
    if (!ready) return;
    const id = selectedId();
    if (!id || !byId.has(id)) {
      hideLegacyTopMeta();
      return;
    }
    const entry = byId.get(id);
    renderTerms(entry);
    hideLegacyTopMeta();
    renderTabs(entry);
    const title = byDomId("detailTitle");
    if (title) title.textContent = UI_TEXT[baseLang()].detailTitle;
  }

  function scheduleApply() {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => {
      applyStaticI18n();
      updateModeButtons();
      applyDetail();
    }, 0);
  }

  async function loadEntries() {
    try {
      const raw = await window.CTA_DATA_LOADER?.loadEntries?.();
      if (!Array.isArray(raw)) return;
      raw.map(normalize).forEach((entry) => { if (entry.id) byId.set(entry.id, entry); });
      ready = true;
      scheduleApply();
    } catch (error) {
      console.warn("CTA bilingual presentation skipped", error);
    }
  }

  function init() {
    ensureCss();
    ensureLanguageControls();
    const targetBase = baseLang();
    syncLegacyRuntime(targetBase);
    document.documentElement.lang = targetBase;
    document.documentElement.dataset.langMode = mode;
    applyStaticI18n();
    updateModeButtons();
    loadEntries();

    document.addEventListener("click", (event) => {
      if (event.target.closest(".secondaryLanguageToggle")) return;
      window.setTimeout(scheduleApply, 0);
      window.setTimeout(scheduleApply, 80);
    }, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") window.setTimeout(scheduleApply, 0);
    }, true);

    window.CTA_LANGUAGE_PRESENTATION = Object.freeze({
      version: "2.3",
      modes: ["ja", "en", "both"],
      getMode: () => mode,
      setMode
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
