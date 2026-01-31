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

  const formatPreview = ({ mode, bbox, start, end, preset, area, layers, notes }, lang) => {
    const safeMode = mode || "storm";
    const safeBBox = bbox || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeStart = start || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeEnd = end || (lang === "ja" ? "（未入力）" : "(empty)");
    const safePreset = preset || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeArea = area || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeLayers = layers || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeNotes = notes || (lang === "ja" ? "（未入力）" : "(empty)");

    if (lang === "ja") {
      return [
        "[Earth Map Suite プレビュー]",
        `モード: ${safeMode}`,
        `BBox: ${safeBBox}`,
        `開始日: ${safeStart}`,
        `終了日: ${safeEnd}`,
        `プリセット: ${safePreset}`,
        `対象エリア: ${safeArea}`,
        `レイヤー: ${safeLayers}`,
        `補足メモ: ${safeNotes}`,
        "----",
        "次アクション: 共有前に地図ツールで再確認してください。"
      ].join("\n");
    }

    return [
      "[Earth Map Suite Preview]",
      `Mode: ${safeMode}`,
      `BBox: ${safeBBox}`,
      `Start: ${safeStart}`,
      `End: ${safeEnd}`,
      `Preset: ${safePreset}`,
      `Target area: ${safeArea}`,
      `Layers: ${safeLayers}`,
      `Notes: ${safeNotes}`,
      "----",
      "Next step: validate the view in your map tool before sharing."
    ].join("\n");
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    const modeSelect = document.getElementById("modeSelect");
    const bboxInput = document.getElementById("bboxInput");
    const startInput = document.getElementById("startInput");
    const endInput = document.getElementById("endInput");
    const presetInput = document.getElementById("presetInput");
    const areaInput = document.getElementById("focusArea");
    const layersInput = document.getElementById("layers");
    const notesInput = document.getElementById("notes");
    const resultOutput = document.getElementById("resultOutput");

    const exampleButtons = Array.from(document.querySelectorAll("[data-example-mode]"));

    const runButtons = [
      document.getElementById("runBtn"),
      document.getElementById("runBtnEn")
    ].filter(Boolean);

    const getDefaultMode = () => "storm";

    const readUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const bbox = params.get("bbox");
      const start = params.get("start");
      const end = params.get("end");
      const preset = params.get("preset");
      return {
        mode: mode && ["storm", "compare", "card"].includes(mode) ? mode : null,
        bbox: bbox || "",
        start: start || "",
        end: end || "",
        preset: preset || ""
      };
    };

    const updateUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const mode = modeSelect.value || getDefaultMode();
      params.set("mode", mode);

      const bbox = bboxInput.value.trim();
      const start = startInput.value;
      const end = endInput.value;
      const preset = presetInput.value.trim();

      if (bbox) {
        params.set("bbox", bbox);
      } else {
        params.delete("bbox");
      }

      if (start) {
        params.set("start", start);
      } else {
        params.delete("start");
      }

      if (end) {
        params.set("end", end);
      } else {
        params.delete("end");
      }

      if (preset) {
        params.set("preset", preset);
      } else {
        params.delete("preset");
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    };

    const examplePresets = {
      storm: {
        ja: {
          mode: "storm",
          bbox: "139.60,35.50,139.95,35.80",
          start: "2024-04-01",
          end: "2024-04-30",
          preset: "low",
          area: "関東地方・沿岸部",
          layers: "地形 / 主要道路 / 避難所",
          notes: "夜間モードでの視認性を確認"
        },
        en: {
          mode: "storm",
          bbox: "139.60,35.50,139.95,35.80",
          start: "2024-04-01",
          end: "2024-04-30",
          preset: "low",
          area: "Coastal area around Kanto",
          layers: "Terrain / main roads / shelters",
          notes: "Check readability in night mode"
        }
      },
      compare: {
        ja: {
          mode: "compare",
          bbox: "135.35,34.55,135.70,34.85",
          start: "2024-05-10",
          end: "2024-05-20",
          preset: "mid",
          area: "大阪湾周辺",
          layers: "河川 / 交通 / 標高",
          notes: "降雨量の差分で比較予定"
        },
        en: {
          mode: "compare",
          bbox: "135.35,34.55,135.70,34.85",
          start: "2024-05-10",
          end: "2024-05-20",
          preset: "mid",
          area: "Osaka Bay area",
          layers: "Rivers / transport / elevation",
          notes: "Compare rainfall differences"
        }
      },
      card: {
        ja: {
          mode: "card",
          bbox: "141.25,38.20,141.65,38.45",
          start: "2024-06-01",
          end: "2024-06-07",
          preset: "detail",
          area: "仙台湾沿岸",
          layers: "避難所 / 防潮堤 / 高低差",
          notes: "要点をカードで共有する想定"
        },
        en: {
          mode: "card",
          bbox: "141.25,38.20,141.65,38.45",
          start: "2024-06-01",
          end: "2024-06-07",
          preset: "detail",
          area: "Sendai Bay coast",
          layers: "Shelters / seawalls / elevation",
          notes: "Share highlights in card format"
        }
      }
    };

    const setExample = (mode, lang) => {
      const preset = examplePresets[mode] || examplePresets.storm;
      const copy = preset[lang] || preset.ja;
      modeSelect.value = copy.mode;
      bboxInput.value = copy.bbox;
      startInput.value = copy.start;
      endInput.value = copy.end;
      presetInput.value = copy.preset;
      areaInput.value = copy.area;
      layersInput.value = copy.layers;
      notesInput.value = copy.notes;
    };

    const render = () => {
      const lang = document.documentElement.lang || "ja";
      resultOutput.textContent = formatPreview({
        mode: modeSelect.value,
        bbox: bboxInput.value.trim(),
        start: startInput.value,
        end: endInput.value,
        preset: presetInput.value.trim(),
        area: areaInput.value.trim(),
        layers: layersInput.value.trim(),
        notes: notesInput.value.trim()
      }, lang);
    };

    const renderAndScroll = () => {
      render();
      resultOutput.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    exampleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = document.documentElement.lang || "ja";
        const mode = btn.dataset.exampleMode || modeSelect.value || getDefaultMode();
        setExample(mode, lang);
        updateUrlState();
        renderAndScroll();
      });
    });

    runButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        updateUrlState();
        renderAndScroll();
      });
    });

    const urlState = readUrlState();
    modeSelect.value = urlState.mode || getDefaultMode();
    bboxInput.value = urlState.bbox;
    startInput.value = urlState.start;
    endInput.value = urlState.end;
    presetInput.value = urlState.preset;

    const inputsToWatch = [
      modeSelect,
      bboxInput,
      startInput,
      endInput,
      presetInput,
      areaInput,
      layersInput,
      notesInput
    ];

    inputsToWatch.forEach((input) => {
      input.addEventListener("input", () => {
        updateUrlState();
        render();
      });
      input.addEventListener("change", () => {
        updateUrlState();
        render();
      });
    });

    updateUrlState();
    render();
  });
})();
