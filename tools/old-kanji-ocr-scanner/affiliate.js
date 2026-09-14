(() => {
  "use strict";

  const rows = [
    { id: "amazonBookScanner", target: "book_scanner" },
    { id: "amazonMagnifier", target: "magnifier" }
  ];

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function placePanelAfterResultActions() {
    const panel = document.querySelector(".amazon-resource-panel");
    const resultActions = document.getElementById("copy-actions");
    if (!panel || !resultActions || resultActions.nextElementSibling === panel) return;
    resultActions.after(panel);
  }

  function mount() {
    const helper = window.NWAmazonAffiliate;
    const config = window.NWOldKanjiOcrAffiliate;
    if (!helper || !config) return;

    placePanelAfterResultActions();

    helper.configure({
      enabled: config.enabled === true,
      tool: "old-kanji-ocr-scanner",
      targets: config.targets || {}
    });

    const currentLang = lang();
    const heading = document.getElementById("amazonResourceHeading");
    const note = document.getElementById("amazonResourceNote");
    if (heading) heading.textContent = currentLang === "en" ? "Optional tools for paper-document OCR" : "必要な場合だけ使える紙資料用の道具";
    if (note) note.textContent = currentLang === "en"
      ? "Optional Amazon searches for scanning books or reading small print. OCR text, image names, and scan contents are never added to these links."
      : "本を傷めず読み取る機器や小さい文字を見る道具が必要な場合だけ使えるAmazon検索です。OCR結果・画像名・スキャン内容はリンクへ追加しません。";

    rows.forEach(({ id, target }) => {
      const item = config.searches?.[target];
      helper.mount({
        container: document.getElementById(id),
        target,
        label: currentLang === "en" ? item?.labelEn : item?.labelJa,
        placement: "ocr_resources",
        className: "amazon-resource-link"
      });
    });

    helper.renderDisclosure(document.getElementById("amazonDisclosure"), { includeEnglish: true });
  }

  function init() {
    mount();
    [document.getElementById("lang-ja"), document.getElementById("lang-en")].filter(Boolean).forEach((button) => {
      button.addEventListener("click", () => queueMicrotask(mount));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();