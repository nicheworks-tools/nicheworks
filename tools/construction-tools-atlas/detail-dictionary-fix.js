(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const byId = new Map();
  let ready = false;

  const IMAGE_PILOT = new Map([
    ["q011_torque_wrench", { ja: "トルクレンチ", en: "Torque wrench", caption_ja: "指定トルクで締付確認する工具。", caption_en: "Tool used to tighten to a specified torque." }],
    ["q011_anchor_bolt", { ja: "アンカーボルト", en: "Anchor bolt", caption_ja: "基礎やコンクリートに部材を固定するボルト。", caption_en: "Bolt used to fix members to concrete or foundations." }],
    ["q011_gypsum_board", { ja: "石膏ボード", en: "Gypsum board", caption_ja: "壁や天井の下地に使う板材。", caption_en: "Board used for wall and ceiling lining." }],
    ["q011_floor_leveler", { ja: "床レベラー", en: "Floor leveler", caption_ja: "床の不陸をならす下地調整材。", caption_en: "Material used to level uneven floors." }],
    ["q011_laser_level", { ja: "レーザー墨出し器", en: "Laser level", caption_ja: "水平・垂直の基準線を投影する工具。", caption_en: "Tool that projects level and plumb reference lines." }],
    ["q011_caulking_gun", { ja: "コーキングガン", en: "Caulking gun", caption_ja: "シーリング材を目地へ押し出す工具。", caption_en: "Tool used to dispense sealant into joints." }],
    ["q013_scaffold_clamp", { ja: "クランプ", en: "Scaffold clamp", caption_ja: "単管同士を固定する足場用金具。", caption_en: "Clamp used to connect scaffold pipes." }],
    ["q015_cable_tray", { ja: "ケーブルトレイ", en: "Cable tray", caption_ja: "ケーブルをまとめて敷設する受け材。", caption_en: "Tray used to support and organize cable runs." }],
    ["q014_window_sash", { ja: "サッシ", en: "Window sash", caption_ja: "ガラスを納める窓の枠・可動部材。", caption_en: "Window frame or operable unit that holds glazing." }],
    ["q016_safety_glasses", { ja: "保護メガネ", en: "Safety glasses", caption_ja: "切粉や粉じんから目を守る保護具。", caption_en: "Eye protection used against chips and dust." }],
  ]);

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
      searchPlaceholder: "例：インパクト / 石膏ボード / 床レベラー / torque wrench",
      faqTitle: "よくある質問",
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
    },
  };

  const HOWTO = {
    ja: [
      "検索欄に工具名・作業名・別名・英語名を入力します。",
      "結果の用語をタップすると、意味・例・別名・分類を確認できます。",
      "★を押すとお気に入りに保存できます。",
      "メニュー内の「お気に入りのみ表示」で保存済み用語だけに絞れます。",
      "JA / EN で表示言語を切り替えられます。",
      "カテゴリ・作業フィルタで絞り込めます。",
    ],
    en: [
      "Type a tool name, jobsite term, alias, or English/Japanese name into the search box.",
      "Tap a result to view its meaning, examples, aliases, and classification.",
      "Tap ★ to save a term as a favorite.",
      "Use Favorites only in the menu to show saved terms.",
      "Use JA / EN to switch the display language.",
      "Use category and task filters to narrow the results.",
    ],
  };

  function text(value) { return typeof value === "string" ? value.trim() : ""; }
  function asArray(value) { if (Array.isArray(value)) return value.filter(Boolean).map(String); if (typeof value === "string" && value.trim()) return [value.trim()]; return []; }
  function pair(obj, ja, en) { return { ja: text(obj?.ja) || text(ja), en: text(obj?.en) || text(en) }; }
  function lang() { return document.documentElement.lang === "en" ? "en" : "ja"; }
  function pick(value) { return lang() === "ja" ? (value?.ja || value?.en || "") : (value?.en || value?.ja || ""); }
  function clear(node) { if (!node) return; while (node.firstChild) node.removeChild(node.firstChild); }
  function byDomId(id) { return document.getElementById(id); }

  function normalize(raw) {
    const description = pair(raw?.description, raw?.description_ja, raw?.summary_ja);
    const descriptionEn = pair(raw?.description, raw?.description_ja, raw?.description_en || raw?.summary_en);
    const detail = pair(raw?.detail, raw?.detail_ja, raw?.detail_en);
    const summary = pair(raw?.summary, raw?.summary_ja, raw?.summary_en);
    return {
      id: text(raw?.id || raw?.slug),
      term: pair(raw?.term, raw?.ja || raw?.jp, raw?.en),
      aliases: { ja: asArray(raw?.aliases?.ja || raw?.alias?.ja || raw?.aliases_ja), en: asArray(raw?.aliases?.en || raw?.alias?.en || raw?.aliases_en) },
      description: { ja: description.ja || summary.ja || detail.ja, en: descriptionEn.en || summary.en || detail.en },
      detail: { ja: detail.ja, en: detail.en },
      bullets: { ja: asArray(raw?.bullets?.ja || raw?.bullets_ja), en: asArray(raw?.bullets?.en || raw?.bullets_en) },
      examples: { ja: asArray(raw?.examples?.ja || raw?.example?.ja || raw?.examples_ja || raw?.usage?.ja), en: asArray(raw?.examples?.en || raw?.example?.en || raw?.examples_en || raw?.usage?.en) },
      categories: asArray(raw?.categories || raw?.category),
      tasks: asArray(raw?.tasks || raw?.task),
      fuzzy: asArray(raw?.fuzzy),
      region: asArray(raw?.region),
      type: text(raw?.type),
      meta: raw?.meta && typeof raw.meta === "object" ? raw.meta : {},
    };
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
    values.forEach((item) => { const li = document.createElement("li"); li.textContent = item; ul.appendChild(li); });
    wrap.appendChild(heading);
    wrap.appendChild(ul);
    node.appendChild(wrap);
  }

  function addChip(parent, value) { const v = text(value); if (!parent || !v) return; const chip = document.createElement("span"); chip.className = "chip"; chip.textContent = v; parent.appendChild(chip); }

  function selectedId() {
    const sheet = $("#detailSheet");
    if (!sheet || sheet.hidden) return "";
    const meta = $("#tabMeta");
    const textContent = meta?.textContent || "";
    const found = textContent.match(/id:\s*([^\n]+)/);
    return found ? found[1].trim() : "";
  }

  function termTitle(entry) { return `${entry.term.en || "—"} / ${entry.term.ja || "—"}`; }
  function aliasLine(entry) { return [...entry.aliases.ja, ...entry.aliases.en].filter(Boolean).join(" / "); }

  function createSvgNode(name) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 320 180");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", name);

    const bg = document.createElementNS(ns, "rect");
    bg.setAttribute("width", "320");
    bg.setAttribute("height", "180");
    bg.setAttribute("rx", "18");
    bg.setAttribute("fill", "#f7f7f4");
    svg.appendChild(bg);

    const card = document.createElementNS(ns, "rect");
    card.setAttribute("x", "42");
    card.setAttribute("y", "54");
    card.setAttribute("width", "236");
    card.setAttribute("height", "76");
    card.setAttribute("rx", "12");
    card.setAttribute("fill", "#ffffff");
    card.setAttribute("stroke", "#d4d7dd");
    card.setAttribute("stroke-width", "3");
    svg.appendChild(card);

    const line1 = document.createElementNS(ns, "path");
    line1.setAttribute("d", "M76 88h168");
    line1.setAttribute("stroke", "#20242a");
    line1.setAttribute("stroke-width", "10");
    line1.setAttribute("stroke-linecap", "round");
    svg.appendChild(line1);

    const line2 = document.createElementNS(ns, "path");
    line2.setAttribute("d", "M98 112h124");
    line2.setAttribute("stroke", "#737a84");
    line2.setAttribute("stroke-width", "6");
    line2.setAttribute("stroke-linecap", "round");
    svg.appendChild(line2);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", "30");
    label.setAttribute("y", "35");
    label.setAttribute("font-family", "Arial, sans-serif");
    label.setAttribute("font-size", "16");
    label.setAttribute("fill", "#20242a");
    label.textContent = name;
    svg.appendChild(label);

    return svg;
  }

  function ensureImageSlot() {
    const terms = byDomId("detailTerms");
    if (!terms) return null;
    let slot = byDomId("detailImagePilot");
    if (!slot) {
      slot = document.createElement("figure");
      slot.id = "detailImagePilot";
      slot.className = "detailImagePilot";
      terms.insertAdjacentElement("afterend", slot);
    }
    return slot;
  }

  function renderPilotImage(entry) {
    const slot = ensureImageSlot();
    if (!slot) return;
    clear(slot);
    slot.hidden = true;
    const item = IMAGE_PILOT.get(entry?.id || "");
    if (!item) return;
    const current = lang();
    const label = current === "ja" ? item.ja : item.en;
    const captionText = current === "ja" ? item.caption_ja : item.caption_en;
    slot.appendChild(createSvgNode(label));
    const caption = document.createElement("figcaption");
    caption.textContent = captionText;
    slot.appendChild(caption);
    slot.hidden = false;
  }

  function hidePilotImage() {
    const slot = byDomId("detailImagePilot");
    if (!slot) return;
    clear(slot);
    slot.hidden = true;
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
    addListBlock(meta, lang() === "ja" ? "管理情報" : "Record", [`id: ${entry.id}`, `region: ${entry.region.join(", ")}`, `quality_batch: ${entry.meta?.quality_batch || ""}`], "dictionaryBlock dictionaryBlock--record");
  }

  function hideTopMeta() {
    ["detailChips", "detailDesc", "detailBullets"].forEach((id) => {
      const node = byDomId(id);
      if (node) {
        node.hidden = true;
        node.style.display = "none";
      }
    });
  }

  function applyDictionaryLayout() {
    if (!ready) return;
    const id = selectedId();
    if (!id || !byId.has(id)) { hideTopMeta(); hidePilotImage(); return; }
    const entry = byId.get(id);
    const definition = pick(entry.description);
    const note = pick(entry.detail);
    const bullets = lang() === "ja" ? entry.bullets.ja : entry.bullets.en;
    const examples = lang() === "ja" ? entry.examples.ja : entry.examples.en;
    const aliases = aliasLine(entry);

    const terms = byDomId("detailTerms");
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
    hideTopMeta();
    renderPilotImage(entry);

    const meaning = byDomId("tabMeaning");
    if (meaning) {
      clear(meaning);
      addBlock(meaning, lang() === "ja" ? "意味" : "Meaning", definition, "dictionaryBlock dictionaryBlock--definition");
      if (note && note !== definition) addBlock(meaning, lang() === "ja" ? "使い方・注意" : "Use / notes", note, "dictionaryBlock dictionaryBlock--notes");
      addListBlock(meaning, lang() === "ja" ? "要点" : "Key points", bullets, "dictionaryBlock dictionaryBlock--bullets");
    }
    const examplesNode = byDomId("tabExamples");
    if (examplesNode) {
      clear(examplesNode);
      addListBlock(examplesNode, lang() === "ja" ? "使用例" : "Examples", examples, "dictionaryBlock dictionaryBlock--examples");
      if (!examples.length) addBlock(examplesNode, lang() === "ja" ? "使用例" : "Examples", lang() === "ja" ? "例はまだありません。" : "No examples yet.", "dictionaryBlock dictionaryBlock--empty");
    }
    const aliasesNode = byDomId("tabAliases");
    if (aliasesNode) {
      clear(aliasesNode);
      addListBlock(aliasesNode, lang() === "ja" ? "別名・英語表記" : "Aliases / English", [...entry.aliases.ja, ...entry.aliases.en], "dictionaryBlock dictionaryBlock--aliases");
    }
    renderMeta(entry);
  }

  function setNodeText(id, value) { const el = byDomId(id); if (el) el.textContent = value; }
  function setPlaceholder(id, value) { const el = byDomId(id); if (!el) return; el.removeAttribute("stable"); el.removeAttribute("content"); el.setAttribute("placeholder", value); }

  function applyHowto(current) {
    const list = byDomId("howtoList");
    if (!list) return;
    clear(list);
    HOWTO[current].forEach((item) => { const li = document.createElement("li"); li.textContent = item; list.appendChild(li); });
  }

  function applyMenuLinks(current) {
    const menu = byDomId("menuSheet");
    if (!menu) return;
    const labels = current === "en" ? ["FAQ", "Related tools", "Support links"] : ["よくある質問", "関連ツール", "支援リンク"];
    Array.from(menu.querySelectorAll(".menuJump")).forEach((link, index) => { if (labels[index]) link.textContent = labels[index]; });
  }

  function applyStaticI18n() {
    const current = lang();
    const t = UI_TEXT[current];
    Object.keys(t).forEach((key) => {
      if (key === "searchPlaceholder" || key === "faqTitle") return;
      setNodeText(key, t[key]);
    });
    setPlaceholder("searchInput", t.searchPlaceholder);
    const faqTitle = document.querySelector("#faq h2");
    if (faqTitle) faqTitle.textContent = t.faqTitle;
    applyHowto(current);
    applyMenuLinks(current);
    hideTopMeta();
  }

  function scheduleApply() {
    setTimeout(() => { applyStaticI18n(); applyDictionaryLayout(); }, 0);
    setTimeout(() => { applyStaticI18n(); applyDictionaryLayout(); }, 80);
  }

  async function loadRawEntries() {
    try {
      const raw = await window.CTA_DATA_LOADER?.loadEntries?.();
      if (!Array.isArray(raw)) return;
      raw.map(normalize).forEach((entry) => { if (entry.id) byId.set(entry.id, entry); });
      ready = true;
      scheduleApply();
    } catch (error) {
      console.warn("CTA dictionary layout fix skipped", error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyStaticI18n();
    loadRawEntries();
    document.addEventListener("click", scheduleApply, true);
    document.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") scheduleApply(); }, true);
    new MutationObserver(scheduleApply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  });
})();
