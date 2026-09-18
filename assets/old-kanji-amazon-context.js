(() => {
  "use strict";

  const TRACKING_ID = "nicheworks09-22";
  const AMAZON_SEARCH_BASE = "https://www.amazon.co.jp/s";

  const CATALOG = Object.freeze({
    "old-kanji-reference": {
      placement: "reference_resources",
      anchor: "#groupContainer",
      activation: { type: "always" },
      headingJa: "調べた字をさらに確認する資料",
      headingEn: "Reference books for deeper checking",
      noteJa: "旧字体・異体字をさらに調べたい人向けの具体的な資料です。検索した漢字や入力本文はAmazonへ送りません。",
      noteEn: "Specific references for deeper old/variant-kanji research. Your searched characters and page input are never sent to Amazon.",
      offers: [
        ["itaiji_world", "9784309412443 異体字の世界 最新版 小池和夫", "『異体字の世界 最新版』をAmazonで見る", "Find The World of Variant Kanji (latest ed.) on Amazon"],
        ["kuzushiji_examples", "9784490103335 くずし字用例辞典 児玉幸多", "『くずし字用例辞典』をAmazonで見る", "Find Kuzushiji Usage Dictionary on Amazon"],
        ["japanese_notation", "9784062653497 日本語の正しい表記と用語の辞典 第三版", "『日本語の正しい表記と用語の辞典 第三版』をAmazonで見る", "Find the Japanese notation and usage dictionary on Amazon"]
      ]
    },
    "kanji-modernizer": {
      placement: "post_conversion",
      anchor: "#resultBlock",
      activation: { type: "visible", selector: "#resultBlock" },
      headingJa: "変換結果を辞典で確認する",
      headingEn: "Check the conversion against reference books",
      noteJa: "機械変換だけで判断したくない場合の確認資料です。変換前後の文章や文字はAmazonへ送りません。",
      noteEn: "References for checking a mechanical conversion. Your source or converted text is never sent to Amazon.",
      offers: [
        ["japanese_notation", "9784062653497 日本語の正しい表記と用語の辞典 第三版", "表記・用字を辞典で確認する", "Check Japanese notation and usage"],
        ["itaiji_world", "9784309412443 異体字の世界 最新版 小池和夫", "旧字・異体字の背景を確認する", "Check old/variant kanji background"],
        ["kanjigen", "漢字源 改訂第六版", "漢字辞典『漢字源』をAmazonで探す", "Find Kanjigen dictionary on Amazon"]
      ]
    },
    "old-kanji-ocr-scanner": {
      placement: "post_ocr_result",
      anchor: "#copy-actions",
      activation: { type: "value", selector: "#manual-text" },
      headingJa: "紙資料をもっと読み取りやすくする",
      headingEn: "Tools for better paper-document capture",
      noteJa: "実際に紙資料を撮影・OCRしている人向けの機材です。OCR結果、画像名、画像内容はAmazonへ送りません。",
      noteEn: "Capture tools for people actually working with paper documents. OCR text, filenames, and image contents are never sent to Amazon.",
      offers: [
        ["czur_et24", "CZUR ET24 Pro ブックスキャナー", "CZUR ET24 ProをAmazonで確認する", "Check CZUR ET24 Pro on Amazon"],
        ["book_scanner", "非破壊 ブックスキャナー A3 OCR", "非破壊ブックスキャナーを比較する", "Compare non-destructive book scanners"],
        ["magnifier", "LED ルーペ 読書 高倍率", "細字確認用LEDルーペを探す", "Find an LED magnifier for small print"]
      ]
    },
    "old-document-kanji-highlighter": {
      placement: "post_document_detection",
      anchor: "#modernPreview",
      activation: { type: "content", selector: "#resultSummary" },
      headingJa: "古い文章を読み進めるための資料",
      headingEn: "References for reading historical text",
      noteJa: "検出後に原文をさらに読解したい場合の資料です。貼り付けた文章や検出文字はAmazonへ送りません。",
      noteEn: "References for continuing from detection into document reading. Pasted text and detected characters are never sent to Amazon.",
      offers: [
        ["kuzushiji_examples", "9784490103335 くずし字用例辞典 児玉幸多", "『くずし字用例辞典』をAmazonで見る", "Find Kuzushiji Usage Dictionary on Amazon"],
        ["komonjo_dictionary", "古文書 解読 辞典", "古文書解読辞典をAmazonで比較する", "Compare old-document reading dictionaries"],
        ["book_stand", "書見台 ブックスタンド A4", "紙資料用の書見台を探す", "Find a book stand for paper references"]
      ]
    },
    "unicode-kanji-checker": {
      placement: "post_unicode_analysis",
      anchor: "#cardSection",
      activation: { type: "content", selector: "#cardSection" },
      headingJa: "文字コード・字形をさらに調べる",
      headingEn: "Go deeper on encoding and glyphs",
      noteJa: "Unicode・UTF-8/UTF-16・日本語文字コードを深掘りする資料です。入力文字やコードポイントはAmazonへ送りません。",
      noteEn: "References for deeper Unicode and Japanese character-encoding study. Input characters and code points are never sent to Amazon.",
      offers: [
        ["charcode_guide", "9784297102913 改訂新版 プログラマのための文字コード技術入門", "『プログラマのための文字コード技術入門』をAmazonで見る", "Find the revised Character Encoding Guide on Amazon"],
        ["japanese_design", "日本語のデザイン 文字からみる視覚文化史 永原康史", "『日本語のデザイン』をAmazonで見る", "Find Japanese Typography / Visual Culture History on Amazon"],
        ["unicode_reference", "Unicode UTF-8 UTF-16 文字コード 本", "Unicode・文字コード関連書を比較する", "Compare Unicode and character-encoding books"]
      ]
    },
    "variant-kanji-compare": {
      placement: "post_variant_comparison",
      anchor: "#comparisonGrid",
      activation: { type: "content", selector: "#comparisonGrid" },
      headingJa: "異体字・字形差を資料で確認する",
      headingEn: "Reference books for variant-form differences",
      noteJa: "比較した字形をさらに確認したい場合の資料です。比較した文字そのものはAmazonへ送りません。",
      noteEn: "References for checking glyph and variant-form differences. Compared characters themselves are never sent to Amazon.",
      offers: [
        ["itaiji_world", "9784309412443 異体字の世界 最新版 小池和夫", "『異体字の世界 最新版』をAmazonで見る", "Find The World of Variant Kanji (latest ed.) on Amazon"],
        ["name_kanji_2026", "9784469032178 実例で読み解く名前の漢字辞典", "『実例で読み解く名前の漢字辞典』をAmazonで見る", "Find the 2026 Name Kanji Dictionary on Amazon"],
        ["glyph_reference", "漢字 字体 字形 辞典", "字体・字形辞典をAmazonで比較する", "Compare kanji glyph/form dictionaries"]
      ]
    },
    "place-old-kanji-checker": {
      placement: "post_place_check",
      anchor: "#resultList",
      activation: { type: "content", selector: "#resultList" },
      headingJa: "地名・歴史地名を資料で確認する",
      headingEn: "References for place names and historical geography",
      noteJa: "候補を公的表記と混同せず、地名資料で追加確認するための導線です。入力した住所・地名はAmazonへ送りません。",
      noteEn: "References for further place-name research without treating candidates as official spellings. Entered addresses and place names are never sent to Amazon.",
      offers: [
        ["kadokawa_place", "角川日本地名大辞典", "『角川日本地名大辞典』をAmazonで探す", "Find Kadokawa Japanese Place-Name Dictionary on Amazon"],
        ["historical_place", "日本歴史地名大系 平凡社", "『日本歴史地名大系』をAmazonで探す", "Find Historical Place Names of Japan on Amazon"],
        ["old_maps", "古地図 地名 辞典 日本", "古地図・歴史地名資料を比較する", "Compare old-map and historical place-name references"]
      ]
    },
    "name-old-kanji-checker": {
      placement: "post_name_check",
      anchor: "#name-result-list",
      activation: { type: "visible-content", selector: "#name-result-list" },
      headingJa: "人名漢字・異体字を資料で確認する",
      headingEn: "References for name kanji and variants",
      noteJa: "候補を戸籍上の正式字体と断定せず、追加調査するための具体的な資料です。入力した氏名はAmazonへ送りません。",
      noteEn: "Specific references for further research without treating a candidate as the official registered glyph. Entered names are never sent to Amazon.",
      offers: [
        ["name_kanji_2026", "9784469032178 実例で読み解く名前の漢字辞典", "『実例で読み解く名前の漢字辞典』をAmazonで見る", "Find the 2026 Name Kanji Dictionary on Amazon"],
        ["name_etymology", "9784490109283 人名の漢字語源辞典 新装版", "『人名の漢字語源辞典 新装版』をAmazonで見る", "Find the Name Kanji Etymology Dictionary on Amazon"],
        ["itaiji_world", "9784309412443 異体字の世界 最新版 小池和夫", "『異体字の世界 最新版』をAmazonで見る", "Find The World of Variant Kanji (latest ed.) on Amazon"]
      ]
    }
  });

  function slugFromPath() {
    const match = location.pathname.match(/\/tools\/([^/]+)\/?/);
    return match ? match[1] : "";
  }

  function buildSearchUrl(query) {
    const url = new URL(AMAZON_SEARCH_BASE);
    url.searchParams.set("k", query);
    url.searchParams.set("tag", TRACKING_ID);
    return url.toString();
  }

  function language() {
    const lang = String(document.documentElement.lang || "").toLowerCase();
    return lang.startsWith("en") ? "en" : "ja";
  }

  function isVisible(element) {
    if (!element || element.hidden) return false;
    const style = getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function isActivated(rule) {
    if (!rule || rule.type === "always") return true;
    const element = document.querySelector(rule.selector);
    if (!element) return false;
    if (rule.type === "visible") return isVisible(element);
    if (rule.type === "value") return String(element.value || "").trim().length > 0;
    if (rule.type === "content") return element.childElementCount > 0 || String(element.textContent || "").trim().length > 0;
    if (rule.type === "visible-content") return isVisible(element) && (element.childElementCount > 0 || String(element.textContent || "").trim().length > 0);
    return false;
  }

  function makePanel(config) {
    const panel = document.createElement("section");
    panel.className = "old-kanji-amazon-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Amazon related resources");
    panel.innerHTML = `
      <h2 class="old-kanji-amazon-heading"></h2>
      <p class="old-kanji-amazon-note"></p>
      <div class="old-kanji-amazon-links"></div>
      <div class="old-kanji-amazon-disclosure"></div>
    `;

    const anchor = document.querySelector(config.anchor);
    const sectionAnchor = anchor?.closest("section") || anchor;
    if (sectionAnchor) sectionAnchor.after(panel);
    else (document.querySelector("main") || document.body).append(panel);
    return panel;
  }

  function boot() {
    const slug = slugFromPath();
    const config = CATALOG[slug];
    const helper = window.NWAmazonAffiliate;
    if (!config || !helper) return;

    document.querySelectorAll(".amazon-resource-panel").forEach((oldPanel) => oldPanel.remove());

    const panel = makePanel(config);
    const heading = panel.querySelector(".old-kanji-amazon-heading");
    const note = panel.querySelector(".old-kanji-amazon-note");
    const links = panel.querySelector(".old-kanji-amazon-links");
    const disclosure = panel.querySelector(".old-kanji-amazon-disclosure");

    const targets = Object.fromEntries(config.offers.map(([key, query]) => [key, buildSearchUrl(query)]));
    helper.configure({ enabled: true, tool: slug, targets });

    let queued = false;
    function render() {
      queued = false;
      const active = isActivated(config.activation);
      panel.hidden = !active;
      if (!active) return;

      const lang = language();
      heading.textContent = lang === "en" ? config.headingEn : config.headingJa;
      note.textContent = lang === "en" ? config.noteEn : config.noteJa;
      links.replaceChildren();

      for (const [key, _query, labelJa, labelEn] of config.offers) {
        const slot = document.createElement("div");
        slot.className = "old-kanji-amazon-slot";
        links.append(slot);
        helper.mount({
          container: slot,
          target: key,
          label: lang === "en" ? labelEn : labelJa,
          placement: config.placement,
          destinationKey: key,
          affiliateId: `${slug}_${key}`,
          className: "old-kanji-amazon-link",
          language: lang
        });
      }
      helper.renderDisclosure(disclosure, { includeEnglish: lang === "en" });
    }

    function schedule() {
      if (queued) return;
      queued = true;
      queueMicrotask(render);
    }

    document.addEventListener("input", schedule, true);
    document.addEventListener("change", schedule, true);
    document.addEventListener("click", () => setTimeout(schedule, 0), true);
    new MutationObserver(schedule).observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["hidden", "class", "lang"]
    });

    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();