/* ================================
 * Earth Map Suite - placeholder logic
 * ================================ */

(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(lang);
  };

  const formatPreview = ({ area, layers, notes }, lang) => {
    const safeArea = area || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeLayers = layers || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeNotes = notes || (lang === "ja" ? "（未入力）" : "(empty)");

    if (lang === "ja") {
      return [
        "[Earth Map Suite プレビュー]",
        `対象エリア: ${safeArea}`,
        `レイヤー: ${safeLayers}`,
        `補足メモ: ${safeNotes}`,
        "----",
        "次アクション: 共有前に地図ツールで再確認してください。"
      ].join("\n");
    }

    return [
      "[Earth Map Suite Preview]",
      `Target area: ${safeArea}`,
      `Layers: ${safeLayers}`,
      `Notes: ${safeNotes}`,
      "----",
      "Next step: validate the view in your map tool before sharing."
    ].join("\n");
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    const areaInput = document.getElementById("focusArea");
    const layersInput = document.getElementById("layers");
    const notesInput = document.getElementById("notes");
    const resultOutput = document.getElementById("resultOutput");

    const exampleButtons = [
      document.getElementById("exampleBtn"),
      document.getElementById("exampleBtnEn")
    ].filter(Boolean);

    const runButtons = [
      document.getElementById("runBtn"),
      document.getElementById("runBtnEn")
    ].filter(Boolean);

    const setExample = (lang) => {
      if (lang === "ja") {
        areaInput.value = "関東地方・沿岸部";
        layersInput.value = "地形 / 主要道路 / 避難所";
        notesInput.value = "夜間モードでの視認性を確認";
      } else {
        areaInput.value = "Coastal area around Kanto";
        layersInput.value = "Terrain / main roads / shelters";
        notesInput.value = "Check readability in night mode";
      }
    };

    const render = () => {
      const lang = document.documentElement.lang || "ja";
      resultOutput.textContent = formatPreview({
        area: areaInput.value.trim(),
        layers: layersInput.value.trim(),
        notes: notesInput.value.trim()
      }, lang);
    };

    exampleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = document.documentElement.lang || "ja";
        setExample(lang);
        render();
      });
    });

    runButtons.forEach((btn) => {
      btn.addEventListener("click", () => render());
    });

    resultOutput.textContent = formatPreview({ area: "", layers: "", notes: "" }, document.documentElement.lang || "ja");
  });
})();
