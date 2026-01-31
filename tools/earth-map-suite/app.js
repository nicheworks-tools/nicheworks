/* ================================
 * Earth Map Suite - placeholder logic
 * ================================ */

(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));
  const TOOL_NAME = "earth-map-suite";

  const trackEvent = (name, params = {}) => {
    if (typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", name, params);
  };

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

  const LIMITS = {
    bboxMaxSpan: 5,
    dateSpanDays: 31,
    presets: ["low", "mid", "detail"],
    stormFramesMax: 48
  };

  const ERROR_CODES = {
    missing_params: "missing_params",
    limit_exceeded: "limit_exceeded",
    no_data: "no_data",
    upstream_fail: "upstream_fail",
    timeout: "timeout",
    unknown: "unknown"
  };

  const escapeHTML = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const formatPreview = ({ mode, bbox, start, end, preset, frames, area, layers, notes }, lang) => {
    const safeMode = mode || "storm";
    const safeBBox = bbox || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeStart = start || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeEnd = end || (lang === "ja" ? "（未入力）" : "(empty)");
    const safePreset = preset || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeFrames = frames || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeArea = area || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeLayers = layers || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeNotes = notes || (lang === "ja" ? "（未入力）" : "(empty)");

    if (lang === "ja") {
      const lines = [
        "[Earth Map Suite プレビュー]",
        `モード: ${safeMode}`,
        `BBox: ${safeBBox}`,
        `開始日: ${safeStart}`,
        `終了日: ${safeEnd}`,
        `プリセット: ${safePreset}`
      ];
      if (safeMode === "storm") {
        lines.push(`フレーム数: ${safeFrames}`);
      }
      lines.push(
        `対象エリア: ${safeArea}`,
        `レイヤー: ${safeLayers}`,
        `補足メモ: ${safeNotes}`,
        "----",
        "次アクション: 共有前に地図ツールで再確認してください。"
      );
      return lines.join("\n");
    }

    const lines = [
      "[Earth Map Suite Preview]",
      `Mode: ${safeMode}`,
      `BBox: ${safeBBox}`,
      `Start: ${safeStart}`,
      `End: ${safeEnd}`,
      `Preset: ${safePreset}`
    ];
    if (safeMode === "storm") {
      lines.push(`Frames: ${safeFrames}`);
    }
    lines.push(
      `Target area: ${safeArea}`,
      `Layers: ${safeLayers}`,
      `Notes: ${safeNotes}`,
      "----",
      "Next step: validate the view in your map tool before sharing."
    );
    return lines.join("\n");
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    const modeSelect = document.getElementById("modeSelect");
    const bboxInput = document.getElementById("bboxInput");
    const startInput = document.getElementById("startInput");
    const endInput = document.getElementById("endInput");
    const presetInput = document.getElementById("presetInput");
    const framesInput = document.getElementById("framesInput");
    const areaInput = document.getElementById("focusArea");
    const layersInput = document.getElementById("layers");
    const notesInput = document.getElementById("notes");
    const resultOutput = document.getElementById("resultOutput");
    const errorOutput = document.getElementById("errorOutput");

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
      const frames = params.get("frames");
      return {
        mode: mode && ["storm", "compare", "card"].includes(mode) ? mode : null,
        bbox: bbox || "",
        start: start || "",
        end: end || "",
        preset: preset || "",
        frames: frames || ""
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
      const frames = framesInput.value.trim();

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

      if (frames) {
        params.set("frames", frames);
      } else {
        params.delete("frames");
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
          frames: "24",
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
          frames: "24",
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
          frames: "",
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
          frames: "",
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
          frames: "",
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
          frames: "",
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
      framesInput.value = copy.frames || "";
      areaInput.value = copy.area;
      layersInput.value = copy.layers;
      notesInput.value = copy.notes;
    };

    const parseBBox = (value) => {
      if (!value) {
        return { error: { code: ERROR_CODES.missing_params, field: "bbox" } };
      }
      const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
      if (parts.length !== 4) {
        return { error: { code: ERROR_CODES.missing_params, field: "bbox" } };
      }
      const nums = parts.map((part) => Number(part));
      if (nums.some((num) => Number.isNaN(num))) {
        return { error: { code: ERROR_CODES.missing_params, field: "bbox" } };
      }
      const [minLon, minLat, maxLon, maxLat] = nums;
      if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90 || minLon >= maxLon || minLat >= maxLat) {
        return { error: { code: ERROR_CODES.missing_params, field: "bbox" } };
      }
      const spanLon = Math.abs(maxLon - minLon);
      const spanLat = Math.abs(maxLat - minLat);
      if (spanLon > LIMITS.bboxMaxSpan || spanLat > LIMITS.bboxMaxSpan) {
        return {
          error: {
            code: ERROR_CODES.limit_exceeded,
            field: "bbox",
            detail: { spanLon, spanLat }
          }
        };
      }
      return { value: { minLon, minLat, maxLon, maxLat, spanLon, spanLat } };
    };

    const parseDateRange = (start, end) => {
      if (!start || !end) {
        return { error: { code: ERROR_CODES.missing_params, field: "date" } };
      }
      const startDate = new Date(`${start}T00:00:00`);
      const endDate = new Date(`${end}T00:00:00`);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
        return { error: { code: ERROR_CODES.missing_params, field: "date" } };
      }
      const diffMs = endDate.getTime() - startDate.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      if (days > LIMITS.dateSpanDays) {
        return {
          error: {
            code: ERROR_CODES.limit_exceeded,
            field: "date",
            detail: { days }
          }
        };
      }
      return { value: { days } };
    };

    const getBBoxAreaBucket = (bbox) => {
      const result = parseBBox(bbox);
      if (result.error) {
        return "unknown";
      }
      const area = result.value.spanLon * result.value.spanLat;
      if (area <= 0.5) return "xs";
      if (area <= 2) return "s";
      if (area <= 5) return "m";
      if (area <= 10) return "l";
      if (area <= 25) return "xl";
      return "xxl";
    };

    const getDateSpanDays = (start, end) => {
      const result = parseDateRange(start, end);
      if (result.error) {
        return null;
      }
      return result.value.days;
    };

    const getEventContext = () => {
      const lang = document.documentElement.lang || "ja";
      const bboxValue = bboxInput.value.trim();
      const startValue = startInput.value;
      const endValue = endInput.value;
      const presetValue = presetInput.value.trim();
      const framesValue = framesInput.value.trim();

      const context = {
        tool_name: TOOL_NAME,
        tool_mode: modeSelect.value || getDefaultMode(),
        lang,
        bbox_area_bucket: getBBoxAreaBucket(bboxValue)
      };

      const dateSpanDays = getDateSpanDays(startValue, endValue);
      if (dateSpanDays !== null) {
        context.date_span_days = dateSpanDays;
      }

      if (presetValue) {
        context.preset = presetValue.toLowerCase();
      }

      if (framesValue) {
        const framesNumber = Number(framesValue);
        if (Number.isFinite(framesNumber)) {
          context.frames = framesNumber;
        }
      }

      return context;
    };

    const validateInputs = ({ mode, bbox, start, end, preset, frames }) => {
      const missingFields = [];
      if (!bbox) missingFields.push("bbox");
      if (!start) missingFields.push("start");
      if (!end) missingFields.push("end");
      if (!preset) missingFields.push("preset");
      if (mode === "storm" && !frames) missingFields.push("frames");
      if (missingFields.length) {
        return { error: { code: ERROR_CODES.missing_params, field: "missing", detail: { missingFields } } };
      }

      const bboxResult = parseBBox(bbox);
      if (bboxResult.error) return { error: bboxResult.error };

      const dateResult = parseDateRange(start, end);
      if (dateResult.error) return { error: dateResult.error };

      const normalizedPreset = preset.toLowerCase();
      if (!LIMITS.presets.includes(normalizedPreset)) {
        return {
          error: {
            code: ERROR_CODES.limit_exceeded,
            field: "preset",
            detail: { preset: normalizedPreset }
          }
        };
      }

      if (mode === "storm") {
        const frameValue = Number(frames);
        if (!Number.isFinite(frameValue) || frameValue < 1) {
          return { error: { code: ERROR_CODES.missing_params, field: "frames" } };
        }
        if (frameValue > LIMITS.stormFramesMax) {
          return {
            error: {
              code: ERROR_CODES.limit_exceeded,
              field: "frames",
              detail: { frames: frameValue }
            }
          };
        }
      }

      return { ok: true };
    };

    const buildErrorMessage = (error, lang) => {
      const usageLink = lang === "ja" ? "./usage.html" : "./usage-en.html";
      const usageLabel = lang === "ja" ? "使い方ガイドを見る" : "See usage guide";

      if (error.code === ERROR_CODES.missing_params) {
        if (error.field === "bbox") {
          return {
            title: lang === "ja" ? "BBoxが未入力または形式が不正です" : "BBox is missing or invalid",
            body: lang === "ja"
              ? "BBoxは「経度,緯度,経度,緯度」の形式で入力してください。"
              : "Enter bbox as “lon,lat,lon,lat”.",
            fix: lang === "ja" ? "対処: BBoxを正しい形式で入力してください。" : "Fix: enter a valid bbox.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "date") {
          return {
            title: lang === "ja" ? "開始日または終了日が不足しています" : "Start or end date is missing",
            body: lang === "ja"
              ? "開始日と終了日を両方入力してください。"
              : "Provide both start and end dates.",
            fix: lang === "ja" ? "対処: 日付を設定してください。" : "Fix: set both dates.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "frames") {
          return {
            title: lang === "ja" ? "stormモードのフレーム数が不足しています" : "Storm frames are missing",
            body: lang === "ja"
              ? "stormモードではフレーム数が必須です。"
              : "Frames are required in storm mode.",
            fix: lang === "ja" ? "対処: フレーム数を入力してください。" : "Fix: enter the frames count.",
            usageLink,
            usageLabel
          };
        }

        const missingFields = error.detail?.missingFields || [];
        const missingList = missingFields.length ? missingFields.join(", ") : "bbox / start / end / preset / frames";
        return {
          title: lang === "ja" ? "入力が不足しています" : "Missing required inputs",
          body: lang === "ja"
            ? `不足: ${missingList}。必須項目を入力してから実行してください。`
            : `Missing: ${missingList}. Please fill in the required inputs before running.`,
          fix: lang === "ja" ? "対処: 必須項目をすべて入力してください。" : "Fix: fill in all required fields.",
          usageLink,
          usageLabel
        };
      }

      if (error.code === ERROR_CODES.limit_exceeded) {
        if (error.field === "bbox") {
          const spanLon = error.detail?.spanLon?.toFixed(2);
          const spanLat = error.detail?.spanLat?.toFixed(2);
          return {
            title: lang === "ja" ? "BBoxが無料枠の上限を超えています" : "BBox exceeds the free limit",
            body: lang === "ja"
              ? `現在のBBoxは ${spanLon}° × ${spanLat}° です。上限は ${LIMITS.bboxMaxSpan}° × ${LIMITS.bboxMaxSpan}° です。`
              : `Your BBox spans ${spanLon}° × ${spanLat}°. The limit is ${LIMITS.bboxMaxSpan}° × ${LIMITS.bboxMaxSpan}°.`,
            fix: lang === "ja" ? "対処: BBoxを縮小するか、複数回に分割してください。" : "Fix: shrink the bbox or split into multiple runs.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "date") {
          const days = error.detail?.days;
          return {
            title: lang === "ja" ? "期間が無料枠の上限を超えています" : "Date span exceeds the free limit",
            body: lang === "ja"
              ? `現在の期間は ${days} 日です。上限は ${LIMITS.dateSpanDays} 日です。`
              : `Your date span is ${days} days. The limit is ${LIMITS.dateSpanDays} days.`,
            fix: lang === "ja" ? "対処: 期間を短くしてください。" : "Fix: shorten the period.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "preset") {
          const preset = error.detail?.preset || "";
          return {
            title: lang === "ja" ? "プリセットが無料枠の対象外です" : "Preset is not available on free ops",
            body: lang === "ja"
              ? `指定されたプリセット「${preset}」は利用できません。利用可能: ${LIMITS.presets.join(", ")}。`
              : `Preset "${preset}" is not available. Allowed: ${LIMITS.presets.join(", ")}.`,
            fix: lang === "ja" ? "対処: 範囲が広い場合は low を選択してください。" : "Fix: choose low for larger areas.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "frames") {
          const frames = error.detail?.frames;
          return {
            title: lang === "ja" ? "フレーム数が無料枠の上限を超えています" : "Storm frames exceed the free limit",
            body: lang === "ja"
              ? `現在のフレーム数は ${frames} です。上限は ${LIMITS.stormFramesMax} です。`
              : `Frames set to ${frames}. The limit is ${LIMITS.stormFramesMax}.`,
            fix: lang === "ja" ? "対処: フレーム数を減らすか、プリセットを low にしてください。" : "Fix: reduce frames or switch to the low preset.",
            usageLink,
            usageLabel
          };
        }
      }

      return {
        title: lang === "ja" ? "不明なエラーが発生しました" : "Unknown error",
        body: lang === "ja"
          ? "入力内容を確認して再度お試しください。"
          : "Please review your inputs and try again.",
        fix: lang === "ja" ? "対処: 使い方ガイドを参照してください。" : "Fix: review the usage guide.",
        usageLink,
        usageLabel
      };
    };

    const renderError = (error, lang) => {
      const errorMessage = buildErrorMessage(error, lang);
      errorOutput.innerHTML = [
        `[Error] (error_code: ${escapeHTML(error.code || ERROR_CODES.unknown)})`,
        escapeHTML(errorMessage.title),
        escapeHTML(errorMessage.body),
        escapeHTML(errorMessage.fix),
        `<a class="nw-link" href="${escapeHTML(errorMessage.usageLink)}">${escapeHTML(errorMessage.usageLabel)}</a>`
      ].join("<br />");
      errorOutput.hidden = false;
      resultOutput.textContent = "";
    };

    const clearError = () => {
      errorOutput.hidden = true;
      errorOutput.innerHTML = "";
    };

    const render = () => {
      const lang = document.documentElement.lang || "ja";
      resultOutput.textContent = formatPreview({
        mode: modeSelect.value,
        bbox: bboxInput.value.trim(),
        start: startInput.value,
        end: endInput.value,
        preset: presetInput.value.trim(),
        frames: framesInput.value.trim(),
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
        clearError();
        updateUrlState();
        renderAndScroll();
        trackEvent("tool_example_apply", {
          tool_name: TOOL_NAME,
          tool_mode: mode,
          example_mode: mode,
          lang
        });
      });
    });

    runButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        clearError();
        updateUrlState();
        trackEvent("tool_run", getEventContext());
        const lang = document.documentElement.lang || "ja";
        const validation = validateInputs({
          mode: modeSelect.value,
          bbox: bboxInput.value.trim(),
          start: startInput.value,
          end: endInput.value,
          preset: presetInput.value.trim(),
          frames: framesInput.value.trim()
        });
        if (validation.error) {
          renderError(validation.error, lang);
          trackEvent("tool_error", {
            ...getEventContext(),
            error_code: validation.error.code || ERROR_CODES.unknown,
            error_field: validation.error.field || "unknown"
          });
          errorOutput.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        renderAndScroll();
        trackEvent("tool_result", getEventContext());
      });
    });

    const urlState = readUrlState();
    modeSelect.value = urlState.mode || getDefaultMode();
    bboxInput.value = urlState.bbox;
    startInput.value = urlState.start;
    endInput.value = urlState.end;
    presetInput.value = urlState.preset;
    framesInput.value = urlState.frames;

    let previousMode = modeSelect.value || getDefaultMode();

    const inputsToWatch = [
      modeSelect,
      bboxInput,
      startInput,
      endInput,
      presetInput,
      framesInput,
      areaInput,
      layersInput,
      notesInput
    ];

    inputsToWatch.forEach((input) => {
      input.addEventListener("input", () => {
        clearError();
        updateUrlState();
        render();
      });
      input.addEventListener("change", () => {
        clearError();
        updateUrlState();
        render();
        if (input === modeSelect && previousMode !== modeSelect.value) {
          trackEvent("tool_mode_change", {
            tool_name: TOOL_NAME,
            tool_mode: modeSelect.value,
            previous_mode: previousMode,
            lang: document.documentElement.lang || "ja"
          });
          previousMode = modeSelect.value;
        }
      });
    });

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const lang = document.documentElement.lang || "ja";

      if (link.closest(".nw-other-links")) {
        trackEvent("related_tool_click", {
          tool_name: TOOL_NAME,
          lang,
          related_tool_path: href
        });
        return;
      }

      if (href.includes("usage")) {
        trackEvent("usage_open", {
          tool_name: TOOL_NAME,
          lang,
          usage_path: href
        });
        return;
      }

      if (href && !href.startsWith("#")) {
        const isExternal = (() => {
          try {
            const url = new URL(href, window.location.href);
            return url.origin !== window.location.origin;
          } catch (_) {
            return false;
          }
        })();

        if (isExternal) {
          trackEvent("outbound_click", {
            tool_name: TOOL_NAME,
            lang,
            outbound_url: href
          });
        }
      }
    });

    updateUrlState();
    render();
  });
})();
