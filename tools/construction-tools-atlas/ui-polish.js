(() => {
  "use strict";

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  if (originalFetch) {
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : (input && input.url) || "";
      if (/tools\.basic\.json(?:$|[?#])/.test(url)) {
        return originalFetch("./data/tools.priority.json", init);
      }
      return originalFetch(input, init);
    };
  }

  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

  const TEXT = {
    ja: {
      htmlLang: "ja",
      brand: "建設工具・現場用語辞典",
      pageTitle: "建設工具・現場用語辞典",
      pageLead: "建設現場で使う工具名、作業名、別名、英語表記を検索できる小さな辞典です。用語をタップすると、意味・用途・関連語を確認できます。",
      privacyNote: "検索内容やお気に入りはサーバーに送信されません。お気に入りはこのブラウザ内に保存されます。",
      menu: "メニュー",
      support: "支援",
      filter: "絞り込み",
      filterMobile: "絞り込み▼",
      category: "カテゴリ",
      task: "作業",
      action: "作業",
      apply: "適用",
      reset: "リセット",
      loadMore: "さらに表示",
      searchPlaceholder: "例：インパクト / 丸のこ / レベル / impact driver",
      supportInline: "このツールを支援",
      howto: "使い方",
      favsOnly: "★ お気に入りのみ",
      favsNote: "よく使う用語は★で保存できます。お気に入りはこのブラウザ内に保存され、JSONとして書き出し・読み込みできます。",
      exportFavs: "お気に入りを書き出し（JSON）",
      importFavs: "お気に入りを読み込み（JSON）",
      faqTitle: "よくある質問",
      donateText: "この辞典が役に立ったら、開発継続のためのご支援をいただけると助かります。",
      footerDisclaimer: "掲載情報の正確性は保証しません。必ず公式情報をご確認ください。",
      actionLabels: { All: "すべて", Cut: "切る", Fasten: "締める", Measure: "測る", Drill: "穴をあける" },
      tabs: { meaning: "意味", examples: "使い方", aliases: "別名", meta: "分類" },
      howtoItems: [
        "検索欄に「日本語 / 英語 / 別名」を入力します。",
        "結果をタップして詳細を確認します。",
        "JA/ENで表示言語を切り替えます。",
        "フィルタで作業や分類を絞り込みます。"
      ]
    },
    en: {
      htmlLang: "en",
      brand: "Construction Tools Atlas",
      pageTitle: "Construction tools and jobsite terms dictionary",
      pageLead: "Search construction tools, jobsite terms, aliases, tasks, and English/Japanese names. Tap a term to see its meaning, usage, aliases, and related labels.",
      privacyNote: "Searches and favorites are not sent to a server. Favorites are stored only in this browser.",
      menu: "Menu",
      support: "Support",
      filter: "Filter",
      filterMobile: "Filter▼",
      category: "Category",
      task: "Task",
      action: "Action",
      apply: "Apply",
      reset: "Reset",
      loadMore: "Load more",
      searchPlaceholder: "Example: impact driver / circular saw / level / インパクト",
      supportInline: "Support this tool",
      howto: "How to use",
      favsOnly: "★ Favorites only",
      favsNote: "Save frequently used terms with ★. Favorites are stored in this browser and can be exported or imported as JSON.",
      exportFavs: "Export favorites (JSON)",
      importFavs: "Import favorites (JSON)",
      faqTitle: "FAQ",
      donateText: "If this dictionary helps, a small contribution supports continued development.",
      footerDisclaimer: "Information accuracy is not guaranteed. Always check official sources when needed.",
      actionLabels: { All: "All", Cut: "Cut", Fasten: "Fasten", Measure: "Measure", Drill: "Drill" },
      tabs: { meaning: "Meaning", examples: "Examples", aliases: "Aliases", meta: "Meta" },
      howtoItems: [
        "Enter a Japanese term, English name, or alias in the search box.",
        "Tap a result to open details.",
        "Switch display language with JA/EN.",
        "Use filters to narrow by task or category."
      ]
    }
  };

  const getLang = () => localStorage.getItem("cta_uilang") === "en" ? "en" : "ja";
  const setText = (id, value) => { const el = $("#" + id); if (el) el.textContent = value; };

  function patchStaticText(){
    const lang = getLang();
    const t = TEXT[lang];
    document.documentElement.lang = t.htmlLang;

    setText("brandTitle", t.brand);
    setText("pageTitle", t.pageTitle);
    setText("pageLead", t.pageLead);
    setText("privacyNote", t.privacyNote);
    setText("menuBtn", t.menu);
    setText("supportBtn", t.support);
    setText("filterOpenBtn", t.filterMobile);
    setText("categoryBtn", t.category);
    setText("taskBtn", t.task);
    setText("loadMoreBtn", t.loadMore);
    setText("supportInlineBtn", t.supportInline);
    setText("favsOnlyLabel", t.favsOnly);
    setText("favsNote", t.favsNote);
    setText("exportFavsBtn", t.exportFavs);
    setText("importFavsBtn", t.importFavs);
    setText("faqTitle", t.faqTitle);
    setText("donateText", t.donateText);
    setText("footerDisclaimer", t.footerDisclaimer);
    setText("filterTitle", t.filter);
    setText("filterApplyBtn", t.apply);
    setText("filterResetBtn", t.reset);
    setText("howtoOpen", t.howto);

    const search = $("#searchInput");
    if (search) search.placeholder = t.searchPlaceholder;

    const supportTitle = $("#supportSheet .sheet__title");
    if (supportTitle) supportTitle.textContent = t.support;
    const menuTitle = $("#menuSheet .sheet__title");
    if (menuTitle) menuTitle.textContent = t.menu;
    const howtoTitle = $("#howtoSheet .sheet__title");
    if (howtoTitle) howtoTitle.textContent = t.howto;

    const filterTitles = $$("#filterSheet .filterGroup__title");
    if (filterTitles[0]) filterTitles[0].textContent = t.action;
    if (filterTitles[1]) filterTitles[1].textContent = t.category;
    if (filterTitles[2]) filterTitles[2].textContent = t.task;

    $$("#detailTabs .tab").forEach((btn) => {
      const tab = btn.dataset.tab;
      if (t.tabs[tab]) btn.textContent = t.tabs[tab];
    });

    const list = $("#howtoList");
    if (list) list.innerHTML = t.howtoItems.map((x) => `<li>${escapeHtml(x)}</li>`).join("");

    $$('[data-faq-ja][data-faq-en]').forEach((el) => {
      el.textContent = el.dataset[lang === "ja" ? "faqJa" : "faqEn"] || el.textContent;
    });
  }

  function patchRenderedText(){
    const lang = getLang();
    const t = TEXT[lang];

    $$("#actionChips .pillbtn, #filterActionItems .pillbtn").forEach((btn) => {
      const raw = btn.textContent.trim();
      if (TEXT.ja.actionLabels[raw] && lang === "en") return;
      const en = Object.entries(TEXT.ja.actionLabels).find(([, ja]) => ja === raw)?.[0] || raw;
      if (t.actionLabels[en]) btn.textContent = t.actionLabels[en];
    });

    const count = $("#resultCount");
    if (count) {
      const n = (count.textContent.match(/\d+/) || ["0"])[0];
      count.textContent = lang === "ja" ? `結果: ${n}件` : `Results: ${n}`;
    }

    const detailSheet = $("#detailSheet");
    const detailTitle = $("#detailTitle");
    const detailTerms = $("#detailTerms");
    if (detailSheet && !detailSheet.hidden && detailTitle && detailTerms) {
      const parts = detailTerms.textContent.split("/").map((x) => x.trim()).filter(Boolean);
      if (parts.length >= 2) detailTitle.textContent = lang === "ja" ? parts[0] : parts[1];
    }

    $$("#detailTabs .tab").forEach((btn) => {
      const tab = btn.dataset.tab;
      if (t.tabs[tab]) btn.textContent = t.tabs[tab];
    });
  }

  function apply(){
    patchStaticText();
    patchRenderedText();
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  }

  document.addEventListener("DOMContentLoaded", () => {
    apply();
    const observer = new MutationObserver(() => apply());
    ["#actionChips", "#filterActionItems", "#resultCount", "#detailTitle", "#detailTabs"].forEach((sel) => {
      const el = $(sel);
      if (el) observer.observe(el, { childList:true, subtree:true, characterData:true });
    });
    const langBtn = $("#langBtn");
    if (langBtn) langBtn.addEventListener("click", () => setTimeout(apply, 0));
  });
})();
