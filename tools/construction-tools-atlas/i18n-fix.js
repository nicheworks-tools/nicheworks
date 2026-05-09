(() => {
  "use strict";

  const TEXT = {
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
      loadMoreBtn: "Load more",
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
      relatedLabel: "関連ツール",
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
      loadMoreBtn: "Load more",
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
      relatedLabel: "Related tools",
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

  function $(id) {
    return document.getElementById(id);
  }

  function currentLang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function setPlaceholder(id, value) {
    const el = $(id);
    if (el) {
      el.removeAttribute("stable");
      el.removeAttribute("content");
      el.setAttribute("placeholder", value);
    }
  }

  function applyHowto(lang) {
    const list = $("howtoList");
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    HOWTO[lang].forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function applyMenuLinks(lang) {
    const menu = $("menuSheet");
    if (!menu) return;
    const jumps = Array.from(menu.querySelectorAll(".menuJump"));
    const labels = lang === "en" ? ["FAQ", "Related tools", "Support links"] : ["よくある質問", "関連ツール", "支援リンク"];
    jumps.forEach((link, index) => {
      if (labels[index]) link.textContent = labels[index];
    });
  }

  function hideTopDetailMeta() {
    const chips = $("detailChips");
    const desc = $("detailDesc");
    const bullets = $("detailBullets");
    if (chips) {
      chips.hidden = true;
      chips.style.display = "none";
    }
    if (desc) {
      desc.hidden = true;
      desc.style.display = "none";
    }
    if (bullets) {
      bullets.hidden = true;
      bullets.style.display = "none";
    }
  }

  function applyI18n() {
    const lang = currentLang();
    const t = TEXT[lang];

    setText("brandTitle", t.brandTitle);
    setText("pageTitle", t.pageTitle);
    setText("pageLead", t.pageLead);
    setText("privacyNote", t.privacyNote);
    setText("menuBtn", t.menuBtn);
    setText("supportBtn", t.supportBtn);
    setText("filterOpenBtn", t.filterOpenBtn);
    setText("categoryBtn", t.categoryBtn);
    setText("taskBtn", t.taskBtn);
    setText("loadMoreBtn", t.loadMoreBtn);
    setText("supportInlineBtn", t.supportInlineBtn);
    setText("supportSheetTitle", t.supportSheetTitle);
    setText("supportLead", t.supportLead);
    setText("supportNote", t.supportNote);
    setText("menuSheetTitle", t.menuSheetTitle);
    setText("howtoOpen", t.howtoOpen);
    setText("howtoSheetTitle", t.howtoSheetTitle);
    setText("favsOnlyLabel", t.favsOnlyLabel);
    setText("favsNote", t.favsNote);
    setText("exportFavsBtn", t.exportFavsBtn);
    setText("importFavsBtn", t.importFavsBtn);
    setText("footerDisclaimer", t.footerDisclaimer);
    setPlaceholder("searchInput", t.searchPlaceholder);
    applyHowto(lang);
    applyMenuLinks(lang);
    hideTopDetailMeta();

    const faq = document.querySelector("#faq h2");
    if (faq) faq.textContent = t.faqTitle;
    const related = $("relatedTools");
    if (related) related.setAttribute("aria-label", t.relatedLabel);
  }

  function scheduleApply() {
    setTimeout(applyI18n, 0);
    setTimeout(applyI18n, 80);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyI18n();
    $("langBtn")?.addEventListener("click", scheduleApply);
    $("menuBtn")?.addEventListener("click", scheduleApply);
    $("supportBtn")?.addEventListener("click", scheduleApply);
    document.addEventListener("click", scheduleApply, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") scheduleApply();
    }, true);

    new MutationObserver(scheduleApply).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  });
})();
