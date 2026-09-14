(() => {
  "use strict";

  const rows = [
    { id: "amazonDictionary", target: "dictionary" },
    { id: "amazonMagnifier", target: "magnifier" },
    { id: "amazonBookStand", target: "book_stand" }
  ];

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function mount() {
    const helper = window.NWAmazonAffiliate;
    const config = window.NWOldKanjiReferenceAffiliate;
    if (!helper || !config) return;

    helper.configure({
      enabled: config.enabled === true,
      tool: "old-kanji-reference",
      targets: config.targets || {}
    });

    const currentLang = lang();
    const heading = document.getElementById("amazonResourceHeading");
    const note = document.getElementById("amazonResourceNote");
    if (heading) heading.textContent = currentLang === "en" ? "Useful reference tools" : "調査に役立つ道具";
    if (note) note.textContent = currentLang === "en"
      ? "Optional Amazon searches related to checking old documents. Your searched kanji and page inputs are not added to these links."
      : "古い資料を調べるときに使えるAmazon検索です。検索した漢字やページ入力内容はリンクへ追加しません。";

    rows.forEach(({ id, target }) => {
      const item = config.searches?.[target];
      helper.mount({
        container: document.getElementById(id),
        target,
        label: currentLang === "en" ? item?.labelEn : item?.labelJa,
        placement: "reference_resources",
        className: "amazon-resource-link"
      });
    });

    helper.renderDisclosure(document.getElementById("amazonDisclosure"), { includeEnglish: true });
  }

  function init() {
    mount();
    document.querySelectorAll(".nw-lang-btn[data-lang]").forEach((button) => {
      button.addEventListener("click", () => queueMicrotask(mount));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
